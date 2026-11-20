'use client';
import { useDiagnosticMessages } from './diagnostic-locale';
import type { DiagnosticStatus } from '../lib/diagnostic-messages';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { DEFAULT_EFFECT_SETTINGS, M7_DIRECTIONS, M7_EFFECT_IDS, M7_PHASES, WorkspaceQualificationSchema, type WorkspaceQualification, type WorkspaceQualificationCase } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import { FluidProvider } from '@fluidkit/react';
import { endpointIssues, qualificationGeometry } from '@fluidkit/testing/workspace-qualification';
import type { BackendMode, SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { WorkspaceSurface } from './workspace-surface';
import { EffectTransport } from './effect-lab';
import { StudioSelect } from './studio-controls';
import { M7MotionEnvironment } from './m7-motion-environment';

export function M7WorkspaceQualification({ data, buildId }: { data: WorkspaceData; buildId: string }) {
  const tr = useDiagnosticMessages();
  const runtime = useMemo(() => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS, collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language), projections: { workspace: (snapshot, viewport, settings, language, context) => workspaceScene(data, snapshot, viewport, settings, language, context) } }), [data]);
  const root = useRef<HTMLElement>(null), lifetime = useRef<symbol | null>(null), abort = useRef<AbortController | null>(null);
  const [backend, setBackend] = useState<BackendMode>('webgpu-only'), [controls, setControls] = useState<SurfacePlaybackControls | null>(null), [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [busy, setBusy] = useState(false), [status, setStatus] = useState<DiagnosticStatus>(['readyMatrix']), [report, setReport] = useState<WorkspaceQualification | null>(null);
  useEffect(() => { const token = Symbol(); lifetime.current = token; return () => { abort.current?.abort(); queueMicrotask(() => { if (lifetime.current === token) runtime.dispose(); }); }; }, [runtime]);
  async function run() {
    if (!controls || busy || !metrics) return;
    const controller = new AbortController(); abort.current = controller; setBusy(true); setReport(null);
    const browser = { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio };
    const cases: WorkspaceQualificationCase[] = [], issues: string[] = [];
    let imageBytes = 0;
    const check = () => {
      controller.signal.throwIfAborted();
      if (document.hidden) throw new Error('Tab ausgeblendet: Lauf unvollständig.');
      if (window.innerWidth !== browser.width || window.innerHeight !== browser.height || window.devicePixelRatio !== browser.dpr) throw new Error('Browsergröße während der Matrix verändert; neuen Lauf starten.');
    };
    const checked = async <T,>(operation: Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try { return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Surface bestätigt den Frame nicht innerhalb von 10 Sekunden.')), 10000); })]); }
      finally { clearTimeout(timer); check(); }
    };
    const flush = async () => { await checked(controls.inspectText()); check(); };
    const send = (event: string) => { check(); const result = runtime.send(event, {}, 'host', 'programmatic'); if (!result.accepted) throw new Error(`Core hat ${event} abgelehnt.`); };
    try {
      const selected = data.modules.find(module => module.id === 'webgpu') ?? data.modules[0];
      if (!selected) throw new Error('Keine Workspace-Module verfügbar.');
      for (const id of M7_EFFECT_IDS) for (const [source, target] of M7_DIRECTIONS) {
        check(); setStatus(['matrixProgress',{n:cases.length+1,recipe:id,source,target}]);
        // Baselines are explicit real Core events; they are not counted as native input journeys.
        controls.restoreLive(); send('reset'); await flush();
        send(`select.${selected.id}`); await flush();
        if (source !== 'detail') { send(`view.${source}`); await flush(); }
        controls.restoreLive(); await flush();
        const effect = EFFECT_LIBRARY.find(item => item.id === id);
        if (!effect) throw new Error(`Unbekanntes Rezept: ${id}`);
        const before = runtime.getSnapshot();
        runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'fixed', effect: effectReference(effect), parameters: effect.recommendedParameters });
        await flush();
        if (runtime.getSnapshot() !== before) throw new Error('Effektwahl hat den Fachzustand verändert.');
        send(target === 'detail' ? `select.${selected.id}` : `view.${target}`);
        // Flush React's committed scene before seeking this run.
        await flush(); controls.seek(0); await flush();
        const recording = controls.getRecording(), snapshot = runtime.getSnapshot();
        if (!recording || recording.plan?.selected?.id !== id || snapshot.state !== target || recording.plan.sourceState !== source) throw new Error('Übergang, State und Rezept stimmen nicht überein.');
        const fingerprint = JSON.stringify(recording);
        const item: WorkspaceQualificationCase = { effect: id, source, target, revision: snapshot.revision, recording, samples: [], issues: [] };
        cases.push(item);
        for (const phase of M7_PHASES) {
          controls.seek(phase);
          const frame = await checked(controls.captureFrame()), textAudit = await checked(controls.inspectText()), presentation = controls.getPresentation();
          if (!presentation || snapshot !== runtime.getSnapshot() || fingerprint !== JSON.stringify(controls.getRecording())) throw new Error('Nutzeraktion oder neuer Run während der Matrix.');
          if ([frame.progress, textAudit.progress, presentation.progress].some(value => Math.abs(value - phase) > .0001)) throw new Error('Prüfbild ist nicht der angeforderten Phase zugeordnet.');
          imageBytes += frame.image.length;
          if (imageBytes > 64 * 1024 * 1024) throw new Error('Bildbudget erreicht. Lauf bleibt unvollständig.');
          const geometry = qualificationGeometry(presentation);
          item.samples.push({ frame, textAudit, geometry });
          item.issues.push(...textAudit.issues.filter(issue => issue.severity === 'error').map(issue => `${phase}: ${issue.kind}: ${issue.detail}`));
          if (phase === 0 || phase === 1) item.issues.push(...endpointIssues(geometry, phase === 0 ? recording.source : recording.target, `${phase}`));
        }
      }
    } catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
    finally {
      try {
      if (!controller.signal.aborted) {
        const complete = cases.length === 18 && cases.every(item => item.samples.length === 5);
        const result = WorkspaceQualificationSchema.parse({ schemaVersion: 1, generatedAt: new Date().toISOString(), buildId, dataVersion: data.capturedAt, scope: 'core-events-five-checkpoints', backend: metrics.backend, browser, cases, issues,
          result: !complete || issues.length ? 'inconclusive' : cases.some(item => item.issues.length) ? 'failed' : 'passed',
          limitations: ['Fünf Checkpoints pro Übergang, keine vollständige Bewegungssequenz.', 'Core-Ereignisse sind keine nativen Pointer-, Tastatur- oder IME-Journeys.', 'Visuelle Review der Bilder bleibt erforderlich. Resize während einer Transition wird separat geprüft.'] });
        setReport(result); setStatus(['matrixDone',{status:result.result,n:cases.length,frames:cases.reduce((sum,item)=>sum+item.samples.length,0)}]);
      } else setStatus(['aborted']);
      } catch (error) { setReport(null); setStatus(['reportDetail',{detail:error instanceof Error ? error.message : String(error)}]); }
      finally { setBusy(false); }
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report)], { type: 'application/json' })), link = document.createElement('a');
    link.href = url; link.download = `m7-workspace-${report.backend}-${report.browser.width}.json`; link.click(); URL.revokeObjectURL(url);
  }
  return <FluidProvider runtime={runtime}><section ref={root} className="m7-workspace-proof" aria-labelledby="m7-matrix-title">
    <h2 id="m7-matrix-title">{tr('matrixHeading')}</h2><p>{tr('matrixIntro')}</p>
    <div className="quality-actions"><label>{tr('matrixBackend')} <StudioSelect aria-label={tr('matrixBackend')} value={backend} disabled={busy} onChange={event => { setBackend(event.target.value as BackendMode); setReport(null); setStatus(['backendChanged']); }}><option value="webgpu-only">{tr('onlyWeb')}</option><option value="webgl2">WebGL2</option></StudioSelect></label><Button className="play-button" disabled={!controls || busy} onClick={() => { void run(); }}>{tr('viewMatrix')}</Button><Button className="outline-button" disabled={!busy} onClick={() => abort.current?.abort()}>{tr('stopMatrix')}</Button><Button className="outline-button" disabled={busy || !report} onClick={download}>{tr('getMatrix')}</Button></div>
    <p role="status">{tr(...status)}</p>{report?.issues.map((issue, index) => <p key={index} role="alert" lang="de">{issue}</p>)}{report?.cases.filter(item => item.issues.length).map(item => <p key={`${item.effect}:${item.source}:${item.target}`} role="alert">{item.effect} · {item.source} → {item.target}: <span lang="de">{item.issues.join(' ')}</span></p>)}
    <div inert={busy || undefined}><M7MotionEnvironment controls={controls} buildId={buildId}/><EffectTransport controls={controls} metrics={metrics}/><WorkspaceSurface data={data} moduleCount={data.modules.length} backendMode={backend} onControls={setControls} onMetrics={setMetrics}/></div>
  </section></FluidProvider>;
}
