'use client';
import { useStudioLocale } from './studio-locale';
import { useDiagnosticMessages } from './diagnostic-locale';
import type { DiagnosticStatus } from '../lib/diagnostic-messages';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { DEFAULT_EFFECT_SETTINGS, M8_DIRECTIONS, M8_EFFECT_IDS, M8_TIMING_BUDGET, M8TimingReportSchema, summarizeM8Timings,
  type M8TimingCase, type M8TimingReport, type M8TimingWarmup } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceScene, workspaceSelection, type WorkspaceData } from '@fluidkit/cases';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import { FluidProvider } from '@fluidkit/react';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { WorkspaceSurface } from './workspace-surface';
import { StudioSelect } from './studio-controls';

type Job = { id: number; backend: 'webgpu-only' | 'webgl2'; controller: AbortController };
type Ports = { controls: SurfacePlaybackControls | null; error: string | null };
const sameKeys = (left: readonly string[], right: readonly string[]) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());

async function measure({ data, buildId, runtime, job, ports, surface, onProgress }: {
  data: WorkspaceData; buildId: string; runtime: ReturnType<typeof createFluidRuntime>; job: Job; ports: { current: Ports };
  surface: { current: HTMLDivElement | null }; onProgress(message: DiagnosticStatus): void;
}): Promise<M8TimingReport> {
  const { signal } = job.controller, backend = job.backend === 'webgl2' ? 'webgl2' : 'webgpu';
  const browser = { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio };
  const selectedIds = data.modules.slice(0, 2).map(module => module.id).sort();
  const warmup: M8TimingWarmup[] = [], cases: M8TimingCase[] = [], issues: string[] = [];
  const dataHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
  const dataSha256 = [...new Uint8Array(dataHash)].map(value => value.toString(16).padStart(2, '0')).join('');
  let controls: SurfacePlaybackControls | null = null, expectedSnapshot = runtime.getSnapshot();
  let expectedSurface: M8TimingWarmup['surface'] | null = null;
  const size = () => {
    const canvas = surface.current?.querySelector('canvas'), rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect || !rect.width || !rect.height || !canvas.width || !canvas.height) throw new Error('Surface hat keine messbare Größe.');
    return { width: rect.width, height: rect.height, dpr: canvas.width / rect.width, pixelWidth: canvas.width, pixelHeight: canvas.height };
  };
  const check = () => {
    signal.throwIfAborted();
    if (document.hidden) throw new Error('Tab ausgeblendet: Echtzeitlauf unvollständig.');
    if (window.innerWidth !== browser.width || window.innerHeight !== browser.height || window.devicePixelRatio !== browser.dpr) throw new Error('Browsergröße oder DPR während der Messung verändert.');
    if (ports.current.error) throw new Error(ports.current.error);
    if (controls && ports.current.controls !== controls) throw new Error('Surface wurde ersetzt oder verlor ihr Gerät.');
    if (controls && controls.getMetrics()?.backend !== backend) throw new Error('Tatsächliches Backend stimmt nicht mehr überein.');
    if (runtime.getSnapshot() !== expectedSnapshot) throw new Error('Ein fremdes Ereignis änderte die Runtime während des Laufs.');
    if (runtime.getVisualState().capabilities.reducedMotion) throw new Error('Reduced Motion aktiv: keine vollständige Bewegung messbar.');
    if (expectedSurface && JSON.stringify(size()) !== JSON.stringify(expectedSurface)) throw new Error('Surfacegröße während der Messmatrix verändert.');
  };
  const tick = async () => {
    await new Promise<void>((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(signal.reason ?? new Error('Abgebrochen')); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, M8_TIMING_BUDGET.pollMs);
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
    });
    check();
  };
  const wait = async (predicate: () => boolean, timeout: number, message: string) => {
    const started = performance.now();
    for (;;) { check(); if (predicate()) return; if (performance.now() - started >= timeout) throw new Error(message); await tick(); }
  };
  try {
    if (selectedIds.length !== 2) throw new Error('Mindestens zwei echte Workspace-Module sind erforderlich.');
    await wait(() => Boolean(ports.current.controls?.getMetrics()), 15000, 'GPU-Initialisierung nicht rechtzeitig bestätigt.');
    controls = ports.current.controls;
    if (!controls) throw new Error('Surface-Steuerung fehlt.');
    const active = controls;
    const flush = async () => {
      let finished = false, failure: unknown;
      // The inspection is only used before timing, never inside a measured transition.
      void active.inspectText().then(() => { finished = true; }, error => { failure = error; finished = true; });
      await wait(() => finished, 5000, 'Vorbereitender Frame nicht bestätigt.');
      if (failure) throw failure;
    };
    const setup = async (source: string) => {
      expectedSurface = null;
      active.restoreLive(); runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'off' });
      for (const [type, payload] of [['reset', {}], ['collection.change', { collectionId: 'modules', keys: selectedIds }], ['inspector.open', {}], [`view.${source}`, {}]] as const) {
        const result = runtime.send(type, payload, 'host', 'programmatic');
        if (!result.accepted) throw new Error(`Vorbereitung abgelehnt: ${type}`);
        expectedSnapshot = result.snapshot;
      }
      await flush(); await flush();
      if (!sameKeys(workspaceSelection(expectedSnapshot), selectedIds) || expectedSnapshot.fields.inspectorOpen !== true || expectedSnapshot.state !== source) throw new Error('Auswahl, Inspector oder Ausgangszustand fehlen.');
      expectedSurface = size(); check();
    };
    for (const phase of ['warmup', 'measure'] as const) {
      for (const effectId of M8_EFFECT_IDS) for (const [source, target] of M8_DIRECTIONS) {
        onProgress(['timingProgress',{phase,n:phase === 'warmup' ? warmup.length+1 : cases.length+1,recipe:effectId,source,target}]);
        await setup(source);
        const effect = EFFECT_LIBRARY.find(item => item.id === effectId);
        if (!effect) throw new Error('Effekt nicht registriert.');
        runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'fixed', seed: M8_TIMING_BUDGET.seed, effect: effectReference(effect), parameters: effect.recommendedParameters });
        await flush();
        const eventId = `m8-timing-${phase}-${effectId}-${source}-${target}`;
        const startFrame = active.getMetrics()?.frames ?? 0, started = performance.now();
        const result = runtime.dispatch({ id: eventId, type: `view.${target}`, source: 'host', reason: 'programmatic', timestamp: started, expectedRevision: expectedSnapshot.revision, payload: {} });
        if (!result.accepted) throw new Error(`Messereignis abgelehnt: ${result.reason}`);
        expectedSnapshot = result.snapshot;
        await wait(() => {
          const metrics = active.getMetrics();
          return Boolean(metrics && metrics.frames > startFrame && metrics.phase === 'idle' && metrics.progress === 1 && metrics.effectId === effectId);
        }, effect.recommendedParameters.durationMs + 6000, 'Natürliches Übergangsende nicht bestätigt.');
        const elapsedMs = performance.now() - started;
        const recording = active.getRecording(), metrics = active.getMetrics(), intervalsMs = active.getFrameTimings();
        if (!recording?.plan || !metrics || recording.plan.eventId !== eventId || recording.plan.targetRevision !== expectedSnapshot.revision) throw new Error('Messreihe gehört nicht zum erwarteten Core-Ereignis.');
        if (intervalsMs.length < 2 || intervalsMs.length > 2000 || intervalsMs.some(interval => !Number.isFinite(interval) || interval <= 0)) throw new Error('Keine vollständige gültige Intervallserie.');
        if (!sameKeys(workspaceSelection(expectedSnapshot), selectedIds) || expectedSnapshot.fields.inspectorOpen !== true) throw new Error('Auswahl während der Messung verändert.');
        const base: M8TimingWarmup = { effect: effectId, source, target, plan: recording.plan, revision: expectedSnapshot.revision,
          selectedIds, inspectorOpen: true, surface: size(), elapsedMs, startFrame, endFrame: metrics.frames,
          intervalCount: intervalsMs.length, endpoint: { progress: 1, phase: 'idle' } };
        if (phase === 'warmup') warmup.push(base);
        else {
          const idleStart = performance.now();
          await wait(() => performance.now() - idleStart >= M8_TIMING_BUDGET.idleMs, M8_TIMING_BUDGET.idleMs + 3000, 'Idle-Fenster nicht abgeschlossen.');
          const afterIdle = active.getMetrics();
          if (!afterIdle || afterIdle.phase !== 'idle' || afterIdle.progress !== 1) throw new Error('Surface hat den Ruhezustand verlassen.');
          cases.push({ ...base, intervalsMs, summary: summarizeM8Timings(intervalsMs), idle: { durationMs: performance.now() - idleStart, startFrame: base.endFrame, endFrame: afterIdle.frames } });
        }
      }
    }
  } catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
  const complete = warmup.length === 18 && cases.length === 18 && !issues.length;
  return M8TimingReportSchema.parse({ schemaVersion: 1, milestone: 'M8', scope: 'live-core-render-scheduler-and-idle',
    generatedAt: new Date().toISOString(), buildId, userAgent: navigator.userAgent, backend, browser,
    dataVersion: data.capturedAt, dataSource: data.source, dataSha256, moduleIds: data.modules.map(module => module.id), selectedIds,
    seed: M8_TIMING_BUDGET.seed, pollMs: M8_TIMING_BUDGET.pollMs, p95BudgetMs: M8_TIMING_BUDGET.p95Ms, idleBudgetMs: M8_TIMING_BUDGET.idleMs,
    warmup, cases, issues, result: !complete ? 'inconclusive' : cases.some(item => item.summary.p95Ms === null || item.summary.p95Ms > M8_TIMING_BUDGET.p95Ms || item.idle.startFrame !== item.idle.endFrame) ? 'failed' : 'passed',
    limitations: ['Ein lokales Browser-/Geräteprofil; keine GPU-Timestamps und keine pauschale FPS-Aussage.',
      '25-ms-Steuerpolling und native Bridge bleiben aktiv; kein Screenshot-Readback während der Messung.',
      'Aufwärm- und Messereignisse besitzen getrennte deterministische IDs/Seeds; dieselbe Messphase ist zwischen Backends vergleichbar.',
      'Die Intervallserie beginnt beim ersten Rendercallback; die Wall-Clock-Dauer enthält zusätzlich den Startpfad.',
      'Keine native Eingabe-Journey und keine visuelle beziehungsweise Accessibility-Freigabe.',
      'Der Ergebnisstatus bewertet ausschließlich das Frame-/Idle-Budget. CPU-/GPU-Konkurrenz und Messaufwand benötigen eine separat zeit- und hashgebundene Lastbeobachtung; dieser Browserbericht erteilt keine Performancefreigabe.'],
  });
}

function TimingSurface({ data, buildId, job, onProgress, onComplete }: {
  data: WorkspaceData; buildId: string; job: Job; onProgress(message: DiagnosticStatus): void; onComplete(report: M8TimingReport | null, error?: string): void;
}) {
  const runtime = useMemo(() => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
    projections: { workspace: (snapshot, viewport, settings, language, context) => workspaceScene(data, snapshot, viewport, settings, language, context) },
    collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language),
  }), [data]);
  const ports = useRef<Ports>({ controls: null, error: null }), surface = useRef<HTMLDivElement>(null);
  const lifecycle = useRef<symbol | null>(null), started = useRef(false);
  const setControls = useCallback((controls: SurfacePlaybackControls | null) => { ports.current.controls = controls; }, []);
  const setError = useCallback((error: Error) => { ports.current.error = error.message; }, []);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  useEffect(() => {
    const token = Symbol(); lifecycle.current = token;
    if (!started.current) {
      started.current = true;
      void measure({ data, buildId, runtime, job, ports, surface, onProgress }).then(report => onComplete(report), error => onComplete(null, error instanceof Error ? error.message : String(error)));
    }
    return () => { queueMicrotask(() => { if (lifecycle.current === token) { job.controller.abort(); runtime.dispose(); } }); };
  }, [buildId, data, job, onComplete, onProgress, runtime]);
  return <FluidProvider runtime={runtime}><p>{metrics ? `${metrics.backend === 'webgpu' ? 'WebGPU' : 'WebGL2'} aktiv · Frame ${metrics.frames}` : 'GPU wird initialisiert'}</p>
    <div ref={surface} inert><WorkspaceSurface data={data} moduleCount={data.modules.length} backendMode={job.backend} onControls={setControls} onMetrics={setMetrics} onError={setError}/></div>
  </FluidProvider>;
}

export function M8TimingQualification({ data, buildId }: { data: WorkspaceData; buildId: string }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale();
  const milliseconds = new Intl.NumberFormat(locale, {minimumFractionDigits:2,maximumFractionDigits:2});
  const [backend, setBackend] = useState<'webgpu-only' | 'webgl2'>('webgpu-only'), [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false), [report, setReport] = useState<M8TimingReport | null>(null), [status, setStatus] = useState<DiagnosticStatus>(['readyTime']);
  const jobRef = useRef<Job | null>(null);
  const complete = useCallback((result: M8TimingReport | null, error?: string) => {
    setBusy(false); setReport(result); setStatus(result ? ['timingDone',{result:result.result,n:result.cases.length}] : error ? ['reportDetail',{detail:error}] : ['incomplete']);
  }, []);
  const start = () => {
    if (busy || data.modules.length < 2) return;
    jobRef.current?.controller.abort();
    const next = { id: (jobRef.current?.id ?? 0) + 1, backend, controller: new AbortController() }; jobRef.current = next;
    setReport(null); setBusy(true); setStatus(['freshGPU']); setJob(next);
  };
  const download = () => {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })), link = document.createElement('a');
    link.href = url; link.download = `m8-timing-${report.backend}-${report.browser.width}.json`; link.click(); URL.revokeObjectURL(url);
  };
  const worst = report?.cases.length ? Math.max(...report.cases.map(item => item.summary.p95Ms ?? 0)) : null;
  return <section className="m7-workspace-proof" aria-labelledby="m8-timing-title">
    <h2 id="m8-timing-title">{tr('timingHeading')}</h2>
    <p>{tr('timingIntro')}</p>
    <p>{tr('loadHint')}</p>
    <div className="quality-actions"><label>{tr('timerBackend')} <StudioSelect aria-label={tr('timerM8')} value={backend} disabled={busy} onChange={event => setBackend(event.target.value as 'webgpu-only' | 'webgl2')}><option value="webgpu-only">{tr('onlyWeb')}</option><option value="webgl2">WebGL2</option></StudioSelect></label>
      <Button className="play-button" disabled={busy || data.modules.length < 2} onClick={start}>{tr('timerStart')}</Button>
      <Button className="outline-button" disabled={!busy} onClick={() => jobRef.current?.controller.abort()}>{tr('timerStop')}</Button>
      <Button className="outline-button" disabled={busy || !report} onClick={download}>{tr('timerDownload')}</Button></div>
    <p role="status">{tr(...status)}</p><p>Build {buildId} · {tr('timingSeed',{seed:M8_TIMING_BUDGET.seed})}</p>
    {report && <p>{report.backend} · {report.browser.width} × {report.browser.height} CSS-px · {tr('timingResult',{worst:worst===null?'—':milliseconds.format(worst),peak:milliseconds.format(Math.max(0,...report.cases.map(item=>item.summary.maxMs??0))),long:report.cases.reduce((sum,item)=>sum+item.summary.longFramesOver50Ms,0),idle:report.cases.filter(item=>item.idle.startFrame!==item.idle.endFrame).length})}</p>}
    {report?.issues.map((issue, index) => <p role="alert" key={index} lang="de">{issue}</p>)}
    <p>{tr('timingHint')}</p>
    {job && <TimingSurface key={job.id} data={data} buildId={buildId} job={job} onProgress={setStatus} onComplete={complete}/>}
  </section>;
}
