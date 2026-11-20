import { z } from 'zod';
import { CapturedFrameSchema } from './rehearsal';
import { TextAuditSchema, VisualScenarioSchema } from './index';
import { SequenceGeometrySchema } from './sequence-geometry';

export const M7_DIRECTIONS = [['table', 'cards'], ['cards', 'table'], ['cards', 'map'], ['map', 'cards'], ['cards', 'detail'], ['detail', 'cards']] as const;
export const M7_EFFECT_IDS = ['silk-cascade', 'liquid-lens', 'particle-weave'] as const;
export const M7_PHASES = [0, .25, .5, .75, 1] as const;
export const WorkspaceQualificationCaseSchema = z.strictObject({
  effect: z.enum(M7_EFFECT_IDS), source: z.enum(['table', 'cards', 'map', 'detail']), target: z.enum(['table', 'cards', 'map', 'detail']),
  revision: z.number().int().nonnegative(), recording: z.lazy(() => VisualScenarioSchema),
  samples: z.array(z.strictObject({ frame: CapturedFrameSchema, textAudit: z.lazy(() => TextAuditSchema), geometry: SequenceGeometrySchema })).max(5),
  issues: z.array(z.string()),
});
export const WorkspaceQualificationSchema = z.strictObject({
  schemaVersion: z.literal(1), generatedAt: z.iso.datetime(), buildId: z.string().min(1), dataVersion: z.string().min(1),
  scope: z.literal('core-events-five-checkpoints'), backend: z.enum(['webgpu', 'webgl2']),
  browser: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  cases: z.array(WorkspaceQualificationCaseSchema).max(18), result: z.enum(['passed', 'failed', 'inconclusive']), issues: z.array(z.string()),
  limitations: z.array(z.string()),
}).superRefine((report, ctx) => {
  const keys = report.cases.map(item => `${item.effect}:${item.source}:${item.target}`);
  if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', message: 'Duplicate matrix case.' });
  if (report.cases.some(item => !M7_DIRECTIONS.some(([from, to]) => from === item.source && to === item.target))) ctx.addIssue({ code: 'custom', message: 'Unplanned direction.' });
  if (report.cases.some(item => item.samples.some((sample, index) => sample.frame.progress !== M7_PHASES[index] || sample.geometry.progress !== M7_PHASES[index] || sample.textAudit.progress !== M7_PHASES[index] || sample.frame.backend !== report.backend))) ctx.addIssue({ code: 'custom', message: 'Checkpoint or backend mismatch.' });
  if (report.cases.some(item => item.recording.plan?.selected?.id !== item.effect || item.recording.plan.sourceState !== item.source || item.recording.plan.targetState !== item.target || item.recording.plan.targetRevision !== item.revision || item.samples.some(sample => sample.textAudit.backend !== report.backend || Math.abs(sample.frame.viewport.width - sample.textAudit.viewport.width) > .1 || Math.abs(sample.frame.viewport.height - sample.textAudit.viewport.height) > .1))) ctx.addIssue({ code: 'custom', message: 'Recorded plan or text audit does not belong to the matrix case.' });
  if (report.result === 'passed' && (report.cases.length !== 18 || report.issues.length || report.cases.some(item => item.samples.length !== 5 || item.issues.length || item.samples.some(sample => sample.textAudit.issues.some(issue => issue.severity === 'error'))))) ctx.addIssue({ code: 'custom', message: 'Passing a matrix requires all 90 checked frames without errors.' });
  if (report.cases.reduce((sum, item) => sum + item.samples.reduce((total, sample) => total + sample.frame.image.length, 0), 0) > 64 * 1024 * 1024) ctx.addIssue({ code: 'custom', message: 'Matrix image budget exceeded.' });
});
export type WorkspaceQualification = z.infer<typeof WorkspaceQualificationSchema>;
export type WorkspaceQualificationCase = z.infer<typeof WorkspaceQualificationCaseSchema>;

export const MotionEnvironmentReportSchema = z.strictObject({
  schemaVersion: z.literal(1), buildId: z.string().min(1), scope: z.literal('observed-browser-events'),
  events: z.array(z.strictObject({ at: z.iso.datetime(), trigger: z.enum(['start', 'visibilitychange', 'media-change', 'checkpoint']),
    hidden: z.boolean(), reducedMotion: z.boolean(), progress: z.number().min(0).max(1).nullable(), frames: z.number().int().nonnegative().nullable(),
    phase: z.string().nullable(), backend: z.enum(['webgpu', 'webgl2']).nullable(), effectId: z.string().nullable(), lensPresent: z.boolean(), particles: z.number().int().nonnegative(),
  })).max(64),
});
export type MotionEnvironmentReport = z.infer<typeof MotionEnvironmentReportSchema>;
