import { z } from 'zod';
import { DEFAULT_EFFECT_SETTINGS, ResolvedEffectPlanSchema, summarizeM8Timings } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';

const DIRECTIONS = [
  { id: 'row-card', setup: ['view.table'], event: 'view.cards' },
  { id: 'card-row', setup: ['view.cards'], event: 'view.table' },
  { id: 'card-compare', setup: ['view.cards'], event: 'view.compare' },
  { id: 'compare-card', setup: ['view.compare'], event: 'view.cards' },
  { id: 'atlas-split', setup: ['view.atlas', 'atlas.group.all'], event: 'atlas.group.Kernel' },
  { id: 'atlas-merge', setup: ['view.atlas', 'atlas.group.Kernel'], event: 'atlas.group.all' },
] as const;
const CaseSchema = z.object({ id: z.string(), plan: ResolvedEffectPlanSchema, startedAt: z.iso.datetime(), endedAt: z.iso.datetime(),
  intervalsMs: z.array(z.number().positive()).min(2).max(2000), elapsedMs: z.number().positive(),
  startFrame: z.number().int().nonnegative(), endFrame: z.number().int().positive(), idleEndFrame: z.number().int().positive(),
  idleDurationMs: z.number().min(1000), selectedIds: z.array(z.string()),
  size: z.object({ width: z.number().positive(), height: z.number().positive(), pixelWidth: z.number().int().positive(), pixelHeight: z.number().int().positive() }),
});
export const HostTimingReportSchema = z.object({ schemaVersion: z.literal(1), scope: z.literal('r6-independent-host-structural-scheduler'),
  hostId: z.string(), startedAt: z.iso.datetime(), endedAt: z.iso.datetime(), userAgent: z.string(), backend: z.enum(['webgpu', 'webgl2']),
  viewport: z.object({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  dataSha256: z.string().regex(/^[a-f0-9]{64}$/), pollMs: z.literal(25), p95BudgetMs: z.literal(16.7), idleBudgetMs: z.literal(1000),
  warmup: z.array(CaseSchema).max(6), cases: z.array(CaseSchema).max(6), issues: z.array(z.string()), result: z.enum(['passed', 'failed', 'inconclusive']),
  limitations: z.array(z.string()).min(1),
}).superRefine((report, context) => {
  for (const [phase, items] of [['warmup', report.warmup], ['measure', report.cases]] as const) {
    if (new Set(items.map(item => item.id)).size !== items.length) context.addIssue({ code: 'custom', message: 'Duplicate measured direction' });
    for (const item of items) if (!DIRECTIONS.some(direction => direction.id === item.id) || item.plan.eventId !== `r6-${phase}-${item.id}` || item.endFrame <= item.startFrame || item.idleEndFrame < item.endFrame || item.plan.capabilities.backend !== report.backend || item.plan.capabilities.reducedMotion || item.intervalsMs.length > item.endFrame - item.startFrame) context.addIssue({ code: 'custom', message: 'Timing plan/frame identity mismatch' });
  }
  const complete = report.warmup.length === 6 && report.cases.length === 6 && !report.issues.length;
  const failed = report.cases.some(item => summarizeM8Timings(item.intervalsMs).p95Ms! > report.p95BudgetMs || item.idleEndFrame !== item.endFrame);
  if (report.result !== (complete ? failed ? 'failed' : 'passed' : 'inconclusive')) context.addIssue({ code: 'custom', message: 'Incorrect timing assessment' });
});
export type HostTimingReport = z.infer<typeof HostTimingReportSchema>;

/** Local QA driver. It never introduces a render loop, captures images in the
 * measurement window, or treats observed timing as a qualified load benchmark. */
export async function measureHost(options: {
  runtime: FluidRuntime; controls: SurfacePlaybackControls; canvas: HTMLCanvasElement; signal: AbortSignal;
  hostId: string; dataSha256: string; onProgress(message: string): void;
}): Promise<HostTimingReport> {
  const { runtime, controls, canvas, signal } = options;
  const startedAt = new Date().toISOString(), begin = performance.now();
  const backend = controls.getMetrics()!.backend, viewport = { width: innerWidth, height: innerHeight, dpr: devicePixelRatio };
  let expected = runtime.getSnapshot();
  const warmup: z.infer<typeof CaseSchema>[] = [], cases: z.infer<typeof CaseSchema>[] = [], issues: string[] = [];
  const check = () => {
    signal.throwIfAborted();
    if (performance.now() - begin > 90000) throw new Error('90-second diagnostic deadline exceeded');
    if (document.hidden || innerWidth !== viewport.width || innerHeight !== viewport.height || devicePixelRatio !== viewport.dpr) throw new Error('Visibility/viewport changed');
    if (runtime.getSnapshot() !== expected || controls.getMetrics()?.backend !== backend || controls.getPresentationMode() !== 'live') throw new Error('Runtime/surface ownership changed');
    if (runtime.getVisualState().capabilities.reducedMotion) throw new Error('Reduced Motion is active');
  };
  const wait = async (done: () => boolean, timeoutMs: number) => {
    const start = performance.now();
    while (!done()) { check(); if (performance.now() - start > timeoutMs) throw new Error('Diagnostic checkpoint timeout'); await new Promise(resolve => setTimeout(resolve, 25)); }
    check();
  };
  const send = (type: string) => {
    const result = runtime.send(type, {}, 'host', 'programmatic');
    if (!result.accepted) throw new Error(`Rejected setup: ${type}`);
    expected = result.snapshot;
  };
  try {
    for (const phase of ['warmup', 'measure'] as const) for (const direction of DIRECTIONS) {
      check(); options.onProgress(`${phase === 'warmup' ? 'Aufwärmen' : 'Messen'}: ${direction.id}`);
      runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'off' }); controls.restoreLive();
      send('reset'); send('compare.suggest');
      for (const event of direction.setup) send(event);
      // Explicitly outside the measured window; flush pending React projection.
      await controls.inspectText(); await controls.inspectText(); check();
      runtime.configureEffects({ ...DEFAULT_EFFECT_SETTINGS, mode: 'fixed', seed: 20261120 });
      await controls.inspectText(); check();
      const startFrame = controls.getMetrics()!.frames, start = performance.now(), caseStartedAt = new Date().toISOString();
      const eventId = `r6-${phase}-${direction.id}`;
      const result = runtime.dispatch({ id: eventId, type: direction.event, source: 'host', reason: 'programmatic', timestamp: start, expectedRevision: expected.revision, payload: {} });
      if (!result.accepted) throw new Error(`Rejected measured event: ${result.reason}`);
      expected = result.snapshot;
      await wait(() => { const value = controls.getMetrics(); return Boolean(value && value.frames > startFrame && value.phase === 'idle' && value.progress === 1 && controls.getRecording()?.plan?.eventId === eventId); }, 8000);
      const elapsedMs = performance.now() - start, metrics = controls.getMetrics()!, recording = controls.getRecording(), intervalsMs = controls.getFrameTimings();
      if (recording?.plan?.eventId !== eventId || recording.plan.targetRevision !== expected.revision) throw new Error('Measured plan changed');
      const rect = canvas.getBoundingClientRect(), idleStart = performance.now();
      await wait(() => performance.now() - idleStart >= 1000, 4000);
      const item = CaseSchema.parse({ id: direction.id, plan: recording.plan, startedAt: caseStartedAt, endedAt: new Date().toISOString(), intervalsMs, elapsedMs,
        startFrame, endFrame: metrics.frames, idleEndFrame: controls.getMetrics()!.frames, idleDurationMs: performance.now() - idleStart,
        selectedIds: expected.fields.selection, size: { width: rect.width, height: rect.height, pixelWidth: canvas.width, pixelHeight: canvas.height } });
      (phase === 'warmup' ? warmup : cases).push(item);
    }
  } catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
  const complete = warmup.length === 6 && cases.length === 6 && !issues.length;
  return HostTimingReportSchema.parse({ schemaVersion: 1, scope: 'r6-independent-host-structural-scheduler', hostId: options.hostId, dataSha256: options.dataSha256,
    startedAt, endedAt: new Date().toISOString(), userAgent: navigator.userAgent, backend, viewport, warmup, cases, issues, pollMs: 25, p95BudgetMs: 16.7, idleBudgetMs: 1000,
    result: !complete ? 'inconclusive' : cases.some(item => summarizeM8Timings(item.intervalsMs).p95Ms! > 16.7 || item.endFrame !== item.idleEndFrame) ? 'failed' : 'passed',
    limitations: ['Single local Chrome/macOS device; rAF render intervals, not GPU timestamps.', 'One warmup and one measured sequence per structural direction; no screenshot readback inside timing.',
      '25-ms control polling and React/native bridge remain active; observer cost and concurrent CPU/GPU work require separate UTC-bound load diagnostics.',
      'A passed scheduler budget does not establish environment-qualified performance. Shared browser processes cannot identify individual task ownership.'] });
}
