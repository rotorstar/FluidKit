import { z } from 'zod';
import { ResourceSnapshotSchema } from './lifecycle';
import { VisualScenarioSchema } from './index';

export const M7SurfaceCaseSchema = z.strictObject({
  id: z.string(), kind: z.enum(['cycle', 'init-abort', 'invalid-font', 'device-loss', 'privacy', 'public-recovery']),
  result: z.enum(['passed', 'failed', 'inconclusive']), backend: z.enum(['webgpu', 'webgl2']).nullable(),
  cycle: z.number().int().positive().nullable(), observedEffects: z.array(z.string()),
  frames: z.number().int().nonnegative(), textBytes: z.number().nonnegative(),
  progressAtDispose: z.number().min(0).max(1).nullable(),
  beforeDispose: ResourceSnapshotSchema, afterDispose: ResourceSnapshotSchema,
  detail: z.array(z.string()),
  privacyAttempts: z.array(z.strictObject({
    recipe: z.string(), stage: z.string(), capture: z.enum(['blocked', 'unexpected-success', 'public-success']),
    recordingRedacted: z.boolean(), markerAbsent: z.boolean(), recording: z.lazy(() => VisualScenarioSchema).nullable(),
  })).default([]),
});
export const M7SurfaceQualificationSchema = z.strictObject({
  schemaVersion: z.literal(1), scope: z.literal('m7-imperative-surface-qualification'),
  buildId: z.string(), startedAt: z.iso.datetime(), completedAt: z.iso.datetime(),
  browser: z.string(), requestedBackend: z.enum(['webgpu-only', 'webgl2']),
  viewport: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  requestedCycles: z.union([z.literal(3), z.literal(100)]),
  cases: z.array(M7SurfaceCaseSchema).max(110), result: z.enum(['passed', 'failed', 'inconclusive']),
  aborted: z.boolean(), limitations: z.array(z.string()),
}).superRefine((report, ctx) => {
  if (report.result !== 'passed') return;
  const faultKinds = ['init-abort', 'invalid-font', 'device-loss', 'privacy', 'public-recovery'];
  const cycles = report.cases.filter(item => item.kind === 'cycle');
  if (report.aborted || cycles.length !== report.requestedCycles || report.cases.length !== report.requestedCycles + faultKinds.length
    || faultKinds.some(kind => report.cases.filter(item => item.kind === kind).length !== 1)) ctx.addIssue({ code: 'custom', message: 'A passed qualification requires every planned case without abort.' });
  const backend = report.requestedBackend === 'webgpu-only' ? 'webgpu' : 'webgl2';
  for (const item of report.cases) {
    if (item.result !== 'passed' || item.backend !== backend || item.afterDispose.owners !== 0 || item.afterDispose.disposalErrors.length
      || Object.values(item.afterDispose.live).some(count => count !== 0)) ctx.addIssue({ code: 'custom', message: 'Passed cases require matching actual backend and complete owned-resource cleanup.' });
  }
  if (cycles.some(item => item.frames === 0 || item.progressAtDispose !== .5 || ['silk-cascade', 'liquid-lens', 'particle-weave'].some(recipe => !item.observedEffects.includes(recipe)))) ctx.addIssue({ code: 'custom', message: 'Each completed cycle must render all three recipes and dispose at the midpoint.' });
  const privacy = report.cases.find(item => item.kind === 'privacy');
  if (!privacy || privacy.privacyAttempts.length !== 13 || privacy.privacyAttempts.some(attempt => !attempt.markerAbsent || !attempt.recording
    || (attempt.stage === 'public-followup' ? attempt.capture !== 'public-success' || attempt.recordingRedacted : attempt.capture !== 'blocked' || !attempt.recordingRedacted))) ctx.addIssue({ code: 'custom', message: 'Every sensitive and public-followup probe must be confirmed.' });
});
export type M7SurfaceCase = z.infer<typeof M7SurfaceCaseSchema>;
export type M7SurfaceQualification = z.infer<typeof M7SurfaceQualificationSchema>;
