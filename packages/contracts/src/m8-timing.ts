import { z } from 'zod';
import { ResolvedEffectPlanSchema } from './effects';
import { M8_DIRECTIONS, M8_EFFECT_IDS } from './m8-qualification';

export const M8_TIMING_BUDGET = Object.freeze({ p95Ms: 16.7, idleMs: 1000, pollMs: 25, seed: 20261113 });
const Size = z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() });
const SurfaceSize = Size.extend({ pixelWidth: z.number().int().positive(), pixelHeight: z.number().int().positive() });
const Interval = z.number().positive().finite();
export function summarizeM8Timings(intervals: readonly number[]) {
  const sorted = [...intervals].sort((a, b) => a - b);
  const percentile = (fraction: number) => sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? null;
  return { p50Ms: percentile(.5), p95Ms: percentile(.95), maxMs: sorted.at(-1) ?? null, longFramesOver50Ms: intervals.filter(interval => interval > 50).length };
}
const Summary = z.strictObject({ p50Ms: Interval.nullable(), p95Ms: Interval.nullable(), maxMs: Interval.nullable(), longFramesOver50Ms: z.number().int().nonnegative() });
const BaseCase = z.strictObject({
  effect: z.enum(M8_EFFECT_IDS), source: z.enum(['table', 'cards', 'map']), target: z.enum(['table', 'cards', 'map']),
  plan: ResolvedEffectPlanSchema, revision: z.number().int().positive(), selectedIds: z.array(z.string()).min(2).max(2), inspectorOpen: z.literal(true),
  surface: SurfaceSize, elapsedMs: z.number().nonnegative(), startFrame: z.number().int().nonnegative(), endFrame: z.number().int().positive(),
  intervalCount: z.number().int().min(2).max(2000), endpoint: z.strictObject({ progress: z.literal(1), phase: z.literal('idle') }),
});
export const M8TimingWarmupSchema = BaseCase;
export const M8TimingCaseSchema = BaseCase.extend({
  intervalsMs: z.array(Interval).min(2).max(2000), summary: Summary,
  idle: z.strictObject({ durationMs: z.number().min(M8_TIMING_BUDGET.idleMs), startFrame: z.number().int().nonnegative(), endFrame: z.number().int().nonnegative() }),
});
export const M8TimingReportSchema = z.strictObject({
  schemaVersion: z.literal(1), milestone: z.literal('M8'), scope: z.literal('live-core-render-scheduler-and-idle'),
  generatedAt: z.iso.datetime(), buildId: z.string().min(1), userAgent: z.string().min(1),
  backend: z.enum(['webgpu', 'webgl2']), browser: Size, dataVersion: z.string().min(1), dataSource: z.string().min(1),
  dataSha256: z.string().regex(/^[a-f0-9]{64}$/), moduleIds: z.array(z.string()).min(2), selectedIds: z.array(z.string()).length(2),
  seed: z.literal(M8_TIMING_BUDGET.seed), pollMs: z.literal(M8_TIMING_BUDGET.pollMs), p95BudgetMs: z.literal(M8_TIMING_BUDGET.p95Ms), idleBudgetMs: z.literal(M8_TIMING_BUDGET.idleMs),
  warmup: z.array(M8TimingWarmupSchema).max(18), cases: z.array(M8TimingCaseSchema).max(18),
  result: z.enum(['passed', 'failed', 'inconclusive']), issues: z.array(z.string()), limitations: z.array(z.string()).min(1),
}).superRefine((report, context) => {
  const fail = (message: string) => context.addIssue({ code: 'custom', message });
  const key = (item: { effect: string; source: string; target: string }) => `${item.effect}:${item.source}:${item.target}`;
  if (new Set(report.moduleIds).size !== report.moduleIds.length || new Set(report.selectedIds).size !== 2 || report.selectedIds.some(id => !report.moduleIds.includes(id))) fail('Invalid dataset or selected module IDs.');
  for (const [phase, cases] of [['warmup', report.warmup], ['measure', report.cases]] as const) {
    if (new Set(cases.map(key)).size !== cases.length) fail('Duplicate timing direction.');
    for (const item of cases) {
      if (!M8_DIRECTIONS.some(([source, target]) => source === item.source && target === item.target)) fail('Unplanned timing direction.');
      if (item.plan.eventId !== `m8-timing-${phase}-${item.effect}-${item.source}-${item.target}` || item.plan.sourceState !== item.source || item.plan.targetState !== item.target || item.plan.targetRevision !== item.revision || item.plan.sourceRevision + 1 !== item.revision) fail('Timing plan is not correlated with its live Core event.');
      if (item.plan.selected?.id !== item.effect || item.plan.capabilities.backend !== report.backend || item.plan.capabilities.reducedMotion || item.plan.mode !== 'fixed' || item.plan.parameters.durationMs === 0) fail('Timing must measure the selected recipe on its actual non-reduced backend.');
      if (JSON.stringify([...item.selectedIds].sort()) !== JSON.stringify([...report.selectedIds].sort())) fail('Timing selection changed.');
      if (item.endFrame <= item.startFrame) fail('A transition must render new frames.');
      if (item.intervalCount > item.endFrame - item.startFrame) fail('More timing intervals than rendered frames.');
      if (Math.abs(item.surface.width * item.surface.dpr - item.surface.pixelWidth) > 1 || Math.abs(item.surface.height * item.surface.dpr - item.surface.pixelHeight) > 1) fail('Actual backbuffer dimensions do not match the reported render DPR.');
    }
  }
  for (const item of report.cases) {
    const warmup = report.warmup.find(warm => key(warm) === key(item));
    if (!warmup) fail('Measured direction was not warmed.');
    else if (JSON.stringify(warmup.surface) !== JSON.stringify(item.surface) || JSON.stringify(warmup.plan.parameters) !== JSON.stringify(item.plan.parameters) || JSON.stringify(warmup.plan.selected) !== JSON.stringify(item.plan.selected)) fail('Warmup and measured recipe differ in viewport, parameters or version.');
    if (item.intervalCount !== item.intervalsMs.length || JSON.stringify(item.summary) !== JSON.stringify(summarizeM8Timings(item.intervalsMs))) fail('Timing statistics do not match the raw intervals.');
    if (item.intervalsMs.reduce((sum, value) => sum + value, 0) > item.elapsedMs + 1) fail('Render intervals exceed the measured wall-clock window.');
    if (item.idle.startFrame !== item.endFrame || item.idle.endFrame < item.idle.startFrame) fail('Idle counters are not continuous with the transition.');
  }
  const complete = report.warmup.length === 18 && report.cases.length === 18 && report.issues.length === 0;
  const budgetFailure = report.cases.some(item => item.summary.p95Ms === null || item.summary.p95Ms > report.p95BudgetMs || item.idle.endFrame !== item.idle.startFrame);
  const expected = complete ? budgetFailure ? 'failed' : 'passed' : 'inconclusive';
  if (report.result !== expected) fail('Timing result must follow completeness and the declared budgets.');
});
export type M8TimingReport = z.infer<typeof M8TimingReportSchema>;
export type M8TimingCase = z.infer<typeof M8TimingCaseSchema>;
export type M8TimingWarmup = z.infer<typeof M8TimingWarmupSchema>;
