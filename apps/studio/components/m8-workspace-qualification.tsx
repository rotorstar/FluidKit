'use client';
import { useDiagnosticMessages } from './diagnostic-locale';
import type { DiagnosticStatus } from '../lib/diagnostic-messages';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { DEFAULT_EFFECT_SETTINGS, M8_DIRECTIONS, M8_EFFECT_IDS, M8_PHASES, M8QualificationSchema, type M8Qualification, type M8QualificationCase, type RuntimeEvent } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceScene, workspaceSelection, type WorkspaceData } from '@fluidkit/cases';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import { FluidProvider } from '@fluidkit/react';
import { endpointIssues, qualificationGeometry } from '@fluidkit/testing/workspace-qualification';
import type { BackendMode, SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { inspectM8NativeTargets } from '../lib/m8-native-targets';
import { WorkspaceSurface } from './workspace-surface';
import { EffectTransport } from './effect-lab';
import { StudioSelect } from './studio-controls';
import { M8TimingQualification } from './m8-timing';

export function M8WorkspaceQualification({ data, buildId }: { data: WorkspaceData; buildId: string }) {
  const tr = useDiagnosticMessages();
  const runtime = useMemo(() => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
    collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language),
    projections: { workspace: (snapshot, viewport, settings, language, context) => workspaceScene(data, snapshot, viewport, settings, language, context) },
  }), [data]);
  const root = useRef<HTMLElement>(null), lifetime = useRef<{ runtime: typeof runtime; token: symbol } | null>(null), abort = useRef<AbortController | null>(null);
  const [backend, setBackend] = useState<BackendMode>('webgpu-only'), [controls, setControls] = useState<SurfacePlaybackControls | null>(null), [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [busy, setBusy] = useState(false), [status, setStatus] = useState<DiagnosticStatus>(['readyM8']), [report, setReport] = useState<M8Qualification | null>(null);
  useEffect(() => { const token = Symbol(); lifetime.current = { runtime, token }; return () => { abort.current?.abort(); queueMicrotask(() => { if (lifetime.current?.runtime !== runtime || lifetime.current.token === token) runtime.dispose(); }); }; }, [runtime]);

  async function run() {
    if (!controls || busy || !metrics) return;
    const selectedIds = data.modules.slice(0, 2).map(module => module.id).sort();
    if (selectedIds.length < 2) { setStatus(['needTwo']); return; }
    const controller = new AbortController(); abort.current = controller; setBusy(true); setReport(null);
    const browser = { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio };
    const cases: M8QualificationCase[] = [], issues: string[] = [];
    let imageBytes = 0, surfaceSize: M8Qualification['surface'] = null;
    const measuredBackend = metrics.backend;
    const check = () => {
      controller.signal.throwIfAborted();
      if (document.hidden) throw new Error('Tab ausgeblendet: Lauf unvollständig.');
      if (window.innerWidth !== browser.width || window.innerHeight !== browser.height || window.devicePixelRatio !== browser.dpr) throw new Error('Browsergröße während des Laufs verändert.');
      if (controls.getMetrics()?.backend !== measuredBackend) throw new Error('Backend während des Laufs verändert oder nicht bereit.');
    };
    const checked = async <T,>(operation: Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try { return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Surface bestätigt den Frame nicht innerhalb von 10 Sekunden.')), 10000); })]); }
      finally { clearTimeout(timer); check(); }
    };
    const flush = async () => { await checked(controls.inspectText()); };
    const sameSelection = () => JSON.stringify([...workspaceSelection(runtime.getSnapshot())].sort()) === JSON.stringify(selectedIds);
    try {
      if (measuredBackend !== (backend === 'webgl2' ? 'webgl2' : 'webgpu')) throw new Error('Tatsächliches Backend entspricht nicht der gewählten Prüfung.');
      for (const effectId of M8_EFFECT_IDS) for (const [source, target] of M8_DIRECTIONS) {
        check(); setStatus(['matrixProgress',{n:cases.length+1,recipe:effectId,source,target}]);
        const setupEvents: M8QualificationCase['setupEvents'] = [];
        const send = (type: string, payload: RuntimeEvent['payload'] = {}, setup = true) => {
          check(); const result = runtime.send(type, payload, 'host', 'programmatic');
          if (!result.accepted) throw new Error(`Core hat ${type} abgelehnt: ${result.reason}`);
          if (setup) setupEvents.push({ type, revision: result.snapshot.revision, accepted: true });
        };
        // These explicit Core operations are intentionally not native-input evidence.
        controls.restoreLive(); send('reset'); await flush();
        send('collection.change', { collectionId: 'modules', keys: selectedIds }); await flush();
        send('inspector.open'); await flush();
        send(`view.${source}`); await flush();
        controls.restoreLive(); await flush(); await flush();
        if (!sameSelection() || runtime.getSnapshot().fields.inspectorOpen !== true) throw new Error('Auswahl und Inspector sind nicht als Baseline bestätigt.');
        const effect = EFFECT_LIBRARY.find(item => item.id === effectId);
        if (!effect) throw new Error(`Unbekanntes Rezept: ${effectId}`);
        const before = runtime.getSnapshot();
        runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'fixed', effect: effectReference(effect), parameters: effect.recommendedParameters });
        await flush();
        if (runtime.getSnapshot() !== before) throw new Error('Effektwahl hat den Fachzustand verändert.');
        send(`view.${target}`, {}, false); await flush(); controls.seek(0); await flush();
        const recording = controls.getRecording(), snapshot = runtime.getSnapshot();
        if (!recording || recording.plan?.selected?.id !== effectId || snapshot.state !== target || recording.plan.sourceState !== source) throw new Error('Übergang, State und Rezept stimmen nicht überein.');
        const fingerprint = JSON.stringify(recording);
        const item: M8QualificationCase = { effect: effectId, source, target, revision: snapshot.revision, recording, selectedIds, inspectorOpen: true, setupEvents, samples: [], issues: [] };
        cases.push(item);
        for (const phase of M8_PHASES) {
          controls.seek(phase);
          const frame = await checked(controls.captureFrame()), textAudit = await checked(controls.inspectText()), presentation = controls.getPresentation();
          if (!presentation || snapshot !== runtime.getSnapshot() || fingerprint !== JSON.stringify(controls.getRecording())) throw new Error('Neue Revision oder neuer Run während der Matrix.');
          if (!sameSelection() || snapshot.fields.inspectorOpen !== true) throw new Error('Auswahl oder Inspector während der Matrix verändert.');
          if ([frame.progress, textAudit.progress, presentation.progress].some(value => Math.abs(value - phase) > .0001)) throw new Error('Frame und Prüfphase stimmen nicht überein.');
          surfaceSize ??= { ...frame.viewport };
          if (Math.abs(surfaceSize.width - frame.viewport.width) > .1 || Math.abs(surfaceSize.height - frame.viewport.height) > .1 || Math.abs(surfaceSize.dpr - frame.viewport.dpr) > .01) throw new Error('Surfacegröße während der Matrix verändert.');
          imageBytes += frame.image.length;
          if (imageBytes > 64 * 1024 * 1024) throw new Error('Bildbudget erreicht. Lauf bleibt unvollständig.');
          const surface = root.current?.querySelector<HTMLElement>('[data-testid="fluid-surface"]');
          if (!surface) throw new Error('Native Surface nicht verfügbar.');
          const geometry = qualificationGeometry(presentation);
          const nativeTargets = inspectM8NativeTargets(surface, presentation, runtime.getScene(frame.viewport));
          item.samples.push({ frame, textAudit, geometry, nativeTargets, selectedIds: [...workspaceSelection(snapshot)], inspectorOpen: true });
          item.issues.push(...textAudit.issues.filter(issue => issue.severity === 'error').map(issue => `${phase}: ${issue.kind}: ${issue.detail}`), ...nativeTargets.issues.map(issue => `${phase}: ${issue}`));
          if (phase === 0 || phase === 1) item.issues.push(...endpointIssues(geometry, phase === 0 ? recording.source : recording.target, `${phase}`));
        }
      }
    } catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
    finally {
      try {
        if (!controller.signal.aborted) {
          const complete = cases.length === 18 && cases.every(item => item.samples.length === 5);
          const result = M8QualificationSchema.parse({ schemaVersion: 1, milestone: 'M8', generatedAt: new Date().toISOString(), buildId,
            dataVersion: data.capturedAt, dataSource: data.source, moduleIds: data.modules.map(module => module.id), selectedIds,
            scope: 'core-collection-five-checkpoints-native-targets', backend: measuredBackend, browser, surface: surfaceSize, cases, issues,
            result: !complete || issues.length ? 'inconclusive' : cases.some(item => item.issues.length) ? 'failed' : 'passed',
            limitations: ['Fünf Checkpoints sind keine vollständige Bewegungsaufnahme.', 'Programmatische Core-Ereignisse und lesende DOM-Messungen sind keine nativen Pointer-, Tastatur- oder IME-Journeys.', 'Die Ein-Pixel-Grenze betrifft CSS-Zielgeometrie, keinen Bildvergleich.', 'Visuelle Review, Echtzeitmessung und weitere Browser-/Geräteprofile bleiben gesonderte Prüfungen.'] });
          setReport(result); setStatus(['matrixDone',{status:result.result,n:cases.length,frames:cases.reduce((sum,item)=>sum+item.samples.length,0)}]);
        } else setStatus(['aborted']);
      } catch (error) { setReport(null); setStatus(['reportDetail',{detail:error instanceof Error ? error.message : String(error)}]); }
      finally { setBusy(false); }
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report)], { type: 'application/json' })), link = document.createElement('a');
    link.href = url; link.download = `m8-workspace-${report.backend}-${report.browser.width}.json`; link.click(); URL.revokeObjectURL(url);
  }
  const maxDeviation = report ? Math.max(0, ...report.cases.flatMap(item => item.samples.flatMap(sample => sample.nativeTargets.observations.map(target => target.maxDeviation ?? 0)))) : null;
  return <><FluidProvider runtime={runtime}><section ref={root} className="m7-workspace-proof" aria-labelledby="m8-matrix-title">
    <h2 id="m8-matrix-title">{tr('selectionHeading')}</h2>
    <p>{tr('m8Intro')}</p>
    <div className="quality-actions"><label>{tr('matrixBackend')} <StudioSelect aria-label={tr('matrixM8Backend')} value={backend} disabled={busy} onChange={event => { setBackend(event.target.value as BackendMode); setMetrics(null); setReport(null); setStatus(['backendChanged']); }}><option value="webgpu-only">{tr('onlyWeb')}</option><option value="webgl2">WebGL2</option></StudioSelect></label>
      <Button className="play-button" disabled={!controls || !metrics || busy} onClick={() => { void run(); }}>{tr('matrixM8')}</Button>
      <Button className="outline-button" disabled={!busy} onClick={() => abort.current?.abort()}>{tr('stopMatrix')}</Button>
      <Button className="outline-button" disabled={busy || !report} onClick={download}>{tr('getM8')}</Button></div>
    <p role="status">{tr(...status)}</p><p>{metrics ? tr('gpuActive',{backend:metrics.backend === 'webgpu' ? 'WebGPU' : 'WebGL2'}) : tr('initializing')} · Build {buildId}</p>
    {report && <p>{report.browser.width} × {report.browser.height} Browser-CSS-px · Surface {report.surface?.width} × {report.surface?.height} CSS-px · Auswahl: {report.selectedIds.join(', ')} · maximale native Abweichung: {maxDeviation?.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} CSS-px</p>}
    {report?.issues.map((issue, index) => <p key={index} role="alert" lang="de">{issue}</p>)}
    {report?.cases.filter(item => item.issues.length).map(item => <details key={`${item.effect}:${item.source}:${item.target}`}><summary>{item.effect} · {item.source} → {item.target}: {tr('findingsCount',{n:item.issues.length})}</summary><ul>{item.issues.map((issue, index) => <li key={index} lang="de">{issue}</li>)}</ul></details>)}
    <p>{tr('m8Scope')}</p>
    <div inert={busy || undefined}><EffectTransport controls={controls} metrics={metrics}/><WorkspaceSurface data={data} moduleCount={data.modules.length} backendMode={backend} onControls={setControls} onMetrics={setMetrics}/></div>
  </section></FluidProvider><M8TimingQualification data={data} buildId={buildId}/></>;
}
