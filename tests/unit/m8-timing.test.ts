import { describe, expect, it } from 'vitest';
import { DEFAULT_EFFECT_SETTINGS, M8_DIRECTIONS, M8_EFFECT_IDS, M8_TIMING_BUDGET, M8TimingReportSchema, summarizeM8Timings, type M8TimingReport, type M8TimingWarmup } from '@fluidkit/contracts';
import { EFFECT_LIBRARY, effectReference, resolveEffect } from '@fluidkit/effects';

function report(): M8TimingReport {
  const selectedIds = ['core', 'effects'], surface = { width: 1200, height: 1200, dpr: 1, pixelWidth: 1200, pixelHeight: 1200 };
  const warmup: M8TimingWarmup[] = [], cases: M8TimingReport['cases'] = [];
  for (const phase of ['warmup', 'measure'] as const) {
    for (const effectId of M8_EFFECT_IDS) for (const [source, target] of M8_DIRECTIONS) {
      const effect = EFFECT_LIBRARY.find(item => item.id === effectId)!;
      const index = warmup.length + cases.length, revision = index + 1;
      const plan = resolveEffect({ settings: { ...DEFAULT_EFFECT_SETTINGS, mode: 'fixed', seed: M8_TIMING_BUDGET.seed, effect: effectReference(effect), parameters: effect.recommendedParameters },
        capabilities: { backend: 'webgpu', typegpu: true, compute: false, reducedMotion: false }, eventId: `m8-timing-${phase}-${effectId}-${source}-${target}`, eventType: `view.${target}`,
        caseId: 'workspace-explorer', sourceState: source, targetState: target, sourceRevision: revision - 1, targetRevision: revision, baseDuration: 850, nodeCount: 100 });
      const base: M8TimingWarmup = { effect: effectId, source, target, plan, revision, selectedIds, inspectorOpen: true, surface, elapsedMs: 1400, startFrame: index * 100, endFrame: index * 100 + 80,
        intervalCount: 60, endpoint: { phase: 'idle', progress: 1 } };
      if (phase === 'warmup') warmup.push(base);
      else {
        const intervalsMs = Array.from({ length: 60 }, () => 16.6);
        cases.push({ ...base, intervalsMs, summary: summarizeM8Timings(intervalsMs), idle: { durationMs: 1001, startFrame: base.endFrame, endFrame: base.endFrame } });
      }
    }
  }
  return { schemaVersion: 1, milestone: 'M8', scope: 'live-core-render-scheduler-and-idle', generatedAt: '2026-11-13T00:00:00Z', buildId: 'explicit-unit-fixture', userAgent: 'explicit-unit-fixture', backend: 'webgpu',
    browser: { width: 1280, height: 900, dpr: 1 }, dataVersion: 'unit-fixture', dataSource: 'unit-fixture', dataSha256: 'a'.repeat(64), moduleIds: selectedIds, selectedIds,
    seed: M8_TIMING_BUDGET.seed, pollMs: M8_TIMING_BUDGET.pollMs, p95BudgetMs: M8_TIMING_BUDGET.p95Ms, idleBudgetMs: M8_TIMING_BUDGET.idleMs,
    warmup, cases, result: 'passed', issues: [], limitations: ['Explicit unit fixture; not browser evidence.'] };
}

describe('M8 natural timing report', () => {
  it('accepts a fully correlated bounded run and retains individual frame intervals', () => {
    const result = M8TimingReportSchema.parse(report());
    expect(result.cases).toHaveLength(18); expect(result.warmup).toHaveLength(18);
    expect(result.cases[0]?.intervalsMs).toHaveLength(60);
    expect(result.warmup[0]?.plan.seed).not.toBe(result.cases[0]?.plan.seed);
  });
  it('does not hide a long isolated stall behind a good P95', () => {
    const intervals = [...Array.from({ length: 99 }, () => 16.6), 491];
    expect(summarizeM8Timings(intervals)).toEqual({ p50Ms: 16.6, p95Ms: 16.6, maxMs: 491, longFramesOver50Ms: 1 });
  });
  it('rejects manipulated summary values, interval counts and uncorrelated plans', () => {
    for (const mutate of [
      (value: M8TimingReport) => { value.cases[0]!.summary.p95Ms = 1; },
      (value: M8TimingReport) => { value.cases[0]!.intervalCount--; },
      (value: M8TimingReport) => { value.cases[0]!.plan.eventId = 'unrelated-event'; },
      (value: M8TimingReport) => { value.cases[0]!.plan.targetRevision++; },
      (value: M8TimingReport) => { value.cases[0]!.plan.capabilities.backend = 'webgl2'; },
      (value: M8TimingReport) => { value.cases[0]!.plan.capabilities.reducedMotion = true; },
    ]) { const value = report(); mutate(value); expect(M8TimingReportSchema.safeParse(value).success).toBe(false); }
  });
  it('requires failed status when the declared P95 budget is exceeded', () => {
    const value = report(), item = value.cases[0]!;
    item.intervalsMs = item.intervalsMs.map(() => 16.8); item.summary = summarizeM8Timings(item.intervalsMs);
    expect(M8TimingReportSchema.safeParse(value).success).toBe(false);
    value.result = 'failed'; expect(M8TimingReportSchema.safeParse(value).success).toBe(true);
  });
  it('requires zero additional idle frames, the complete idle window and continuous counters', () => {
    const value = report(); value.cases[0]!.idle.endFrame++;
    expect(M8TimingReportSchema.safeParse(value).success).toBe(false);
    value.result = 'failed'; expect(M8TimingReportSchema.safeParse(value).success).toBe(true);
    value.cases[0]!.idle.startFrame--; expect(M8TimingReportSchema.safeParse(value).success).toBe(false);
    const short = report(); short.cases[0]!.idle.durationMs = 999; expect(M8TimingReportSchema.safeParse(short).success).toBe(false);
  });
  it('does not claim completed coverage after abort, missing warmup or duplicate directions', () => {
    const interrupted = report(); interrupted.cases.pop(); interrupted.issues.push('Aborted');
    expect(M8TimingReportSchema.safeParse(interrupted).success).toBe(false);
    interrupted.result = 'inconclusive'; expect(M8TimingReportSchema.safeParse(interrupted).success).toBe(true);
    const cold = report(); cold.warmup.shift(); cold.result = 'inconclusive'; expect(M8TimingReportSchema.safeParse(cold).success).toBe(false);
    const duplicate = report(); duplicate.cases[1] = duplicate.cases[0]!; expect(M8TimingReportSchema.safeParse(duplicate).success).toBe(false);
  });
  it('binds selected modules and parameters to the same warmed real data scope', () => {
    const value = report(); value.cases[0]!.selectedIds = ['core', 'unknown']; expect(M8TimingReportSchema.safeParse(value).success).toBe(false);
    const viewport = report(); viewport.cases[0]!.surface = { ...viewport.cases[0]!.surface, width: 390 }; expect(M8TimingReportSchema.safeParse(viewport).success).toBe(false);
    const parameters = report(); parameters.cases[0]!.plan.parameters.intensity += .1; expect(M8TimingReportSchema.safeParse(parameters).success).toBe(false);
  });
});
