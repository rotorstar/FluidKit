import { z } from 'zod';
import { SequenceGeometrySchema } from './sequence-geometry';
export * from './sequence-geometry';
import { CapturedFrameSchema } from './rehearsal';
import { TextAuditSchema, VisualScenarioSchema } from './index';
import { QualityCheckSchema } from './quality';
import { ResourceSnapshotSchema } from './lifecycle';

export const SEQUENCE_LIMITS = Object.freeze({ maximumDurationMs: 3000, sampleRate: 60, maximumSamples: 181, maximumImageBytes: 64 * 1024 * 1024 });
export const EffectRuntimeMetricsSchema = z.strictObject({
  backend: z.enum(['webgpu', 'webgl2']), frames: z.number().int().nonnegative(), lastFrameMs: z.number().nonnegative(),
  phase: z.enum(['idle', 'transitioning', 'paused']), progress: z.number().min(0).max(1), textBytes: z.number().nonnegative(),
  effectResources: z.strictObject({ renderTargets: z.number().int().nonnegative(), targetBytes: z.number().nonnegative(), particles: z.number().int().nonnegative(), particleDrawCalls: z.number().int().nonnegative(), couplingGroups: z.number().int().min(0).max(8).optional(), couplingPieces: z.number().int().min(0).max(256).optional(), couplingDrawCalls: z.number().int().min(0).max(8).optional() }).optional(),
  qualityProfile: z.enum(['compact', 'standard']).optional(),
});
export const SequenceSampleSchema = z.strictObject({
  index: z.number().int().min(0).max(180), logicalTimeMs: z.number().min(0).max(3000),
  frame: CapturedFrameSchema, textAudit: z.lazy(() => TextAuditSchema), geometry: SequenceGeometrySchema,
  metrics: EffectRuntimeMetricsSchema.nullable(), resources: ResourceSnapshotSchema.nullable(),
});
export const SequenceReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1), generatedAt: z.iso.datetime(),
  context: z.strictObject({ buildId: z.string().min(1), dataVersion: z.string().min(1), revision: z.number().int().nonnegative(), state: z.string().min(1) }),
  method: z.literal('deterministic-60hz-sampling'), coverage: z.enum(['complete', 'incomplete']), result: z.enum(['passed', 'failed', 'inconclusive']),
  recording: z.lazy(() => VisualScenarioSchema).nullable(),
  expectedTimesMs: z.array(z.number().min(0).max(3000)).max(181), samples: z.array(SequenceSampleSchema).max(181),
  imageBytes: z.number().int().nonnegative().max(SEQUENCE_LIMITS.maximumImageBytes),
  checks: z.array(QualityCheckSchema), issues: z.array(z.string().min(1)),
  openChecks: z.array(z.enum(['native-frame-pacing', 'temporal-pixel-detection', 'independent-human-review', 'retargeting-journey', 'cross-device-qualification'])),
}).superRefine((report, ctx) => {
  if (report.result === 'passed' && (report.coverage !== 'complete' || report.issues.length || report.checks.some(check => check.status !== 'passed'))) ctx.addIssue({ code: 'custom', message: 'Passed deterministic reports require complete measured checks.' });
  if (report.coverage === 'complete' && (!report.expectedTimesMs.length || report.samples.length !== report.expectedTimesMs.length)) ctx.addIssue({ code: 'custom', message: 'Complete coverage requires every scheduled sample.' });
  if (new Set(report.samples.map(sample => sample.frame.id)).size !== report.samples.length) ctx.addIssue({ code: 'custom', message: 'Duplicate captured frame IDs.' });
  if (report.samples.some((sample, index) => sample.index !== index || Math.abs(sample.logicalTimeMs - (report.expectedTimesMs[index] ?? -1)) > 0.0001)) ctx.addIssue({ code: 'custom', message: 'Sequence contains an index/time gap.' });
  if (report.samples.reduce((sum, sample) => sum + sample.frame.image.length, 0) !== report.imageBytes) ctx.addIssue({ code: 'custom', message: 'Sequence image accounting mismatch.' });
});

export type SequenceSample = z.infer<typeof SequenceSampleSchema>;
export type SequenceReport = z.infer<typeof SequenceReportSchema>;
export type EffectRuntimeMetrics = z.infer<typeof EffectRuntimeMetricsSchema>;
export const EffectStressReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('owned-resources-on-one-surface'), requestedCycles: z.literal(100), warmupCycles: z.literal(5),
  result: z.enum(['passed', 'failed', 'inconclusive']), recording: z.lazy(() => VisualScenarioSchema).nullable(),
  samples: z.array(z.strictObject({ cycle: z.number().int().min(1).max(100), midpoint: EffectRuntimeMetricsSchema, endpoint: EffectRuntimeMetricsSchema, resources: ResourceSnapshotSchema })).max(100),
  issues: z.array(z.string()), limitations: z.array(z.string()),
});
export type EffectStressReport = z.infer<typeof EffectStressReportSchema>;
export const NaturalPlaybackReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('warmed-render-scheduler-intervals'), result: z.enum(['measured', 'inconclusive']),
  recording: z.lazy(() => VisualScenarioSchema).nullable(), backend: z.enum(['webgpu', 'webgl2']).nullable(),
  intervalsMs: z.array(z.number().positive().finite()).max(2000), p50Ms: z.number().nonnegative().nullable(), p95Ms: z.number().nonnegative().nullable(),
  maxMs: z.number().nonnegative().nullable(), longFramesOver50Ms: z.number().int().nonnegative(),
  endpointReached: z.boolean(), startupIntervalOmitted: z.literal(true), issues: z.array(z.string()), limitations: z.array(z.string()),
});
export type NaturalPlaybackReport = z.infer<typeof NaturalPlaybackReportSchema>;
export const VisualRetargetReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('visual-only-retarget-imports'), requestedCycles: z.literal(100), warmupCycles: z.literal(12),
  result: z.enum(['passed', 'failed', 'inconclusive']), recording: z.lazy(() => VisualScenarioSchema).nullable(),
  samples: z.array(z.strictObject({ cycle: z.number().int().min(1).max(100), phase: z.union([z.literal(.25), z.literal(.5), z.literal(.75)]),
    target: z.enum(['source', 'target']), sourceNodes: z.number().int().nonnegative().max(2048), continuous: z.boolean(),
    metrics: EffectRuntimeMetricsSchema, resources: ResourceSnapshotSchema })).max(100),
  settled: EffectRuntimeMetricsSchema.nullable(), restoration: z.enum(['restored', 'skipped-newer-run', 'not-started', 'failed']),
  issues: z.array(z.string()), limitations: z.array(z.string()),
});
export type VisualRetargetReport = z.infer<typeof VisualRetargetReportSchema>;
