import { LocaleSchema } from '@fluidkit/i18n/locale';
import { z } from 'zod';

const Id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/);
const Fields = z.record(Id, z.union([z.string().max(1000), z.number().finite(), z.boolean()]));
export const StoryDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, flowId: Id, version: Id,
  title: z.string().min(1).max(160), brief: z.string().min(1).max(2000),
  mode: z.enum(['guided', 'illustration']), medium: z.enum(['interactive', 'still', 'animation']),
  dataSource: z.string().min(1).max(300), dataVersion: z.string().min(1).max(160),
  posterState: Id,
  beats: z.array(z.strictObject({
    id: Id, title: z.string().min(1).max(160), description: z.string().min(1).max(500),
    target: z.discriminatedUnion('kind', [
      z.strictObject({ kind: z.literal('part'), nodeId: Id, eventType: Id }),
      z.strictObject({ kind: z.literal('studio'), controlId: Id, eventType: Id }),
      z.strictObject({ kind: z.literal('context') }),
    ]),
    expectedState: Id, expectedFields: Fields, holdMs: z.number().int().min(0).max(10000),
  })).min(3).max(5),
}).superRefine((story, ctx) => {
  if (new Set(story.beats.map(beat => beat.id)).size !== story.beats.length) ctx.addIssue({ code: 'custom', message: 'Duplicate beat ID' });
  if (story.mode === 'guided' && story.medium !== 'interactive') ctx.addIssue({ code: 'custom', message: 'Guided stories require an interactive medium' });
});
export type StoryDefinition = z.infer<typeof StoryDefinitionSchema>;

export const CapturedFrameSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, surfaceFrame: z.number().int().positive(),
  capturedAt: z.iso.datetime(), renderTimeMs: z.number().nonnegative(),
  backend: z.enum(['webgpu', 'webgl2']), progress: z.number().min(0).max(1),
  viewport: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  image: z.string().max(6_000_000).startsWith('data:image/png;base64,'),
  pixelWidth: z.number().int().positive().max(4096), pixelHeight: z.number().int().positive().max(4096),
  parts: z.array(z.strictObject({ id: Id, componentId: Id, part: Id })).max(1000),
  redaction: z.literal('no-sensitive-parts'), coverage: z.literal('selected-frame'),
});
export type CapturedFrame = z.infer<typeof CapturedFrameSchema>;
export const AIReviewFrameSchema = CapturedFrameSchema.extend({
  buildId: Id, revision: z.number().int().nonnegative(), state: Id, beatId: Id.nullable(),
  binding: z.strictObject({ runId: Id, presentation: z.literal('live'), datasetHash: z.string().regex(/^[a-f0-9]{64}$/), imageSha256: z.string().regex(/^[a-f0-9]{64}$/), visualRevision: z.number().int().nonnegative(), traceSequence: z.number().int().nonnegative(), auditSurfaceFrame: z.number().int().nonnegative(), auditBinding: z.literal('stable-paused-presentation') }).optional(),
});
export type AIReviewFrame = z.infer<typeof AIReviewFrameSchema>;
export const AIReviewBundleSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, storyId: Id, responseLocale: LocaleSchema.optional(),
  brief: z.string().min(1).max(2000), approved: z.literal(true),
  frames: z.array(AIReviewFrameSchema).min(1).max(3),
}).superRefine((bundle, ctx) => {
  if (new Set(bundle.frames.map(frame => frame.id)).size !== bundle.frames.length) ctx.addIssue({ code: 'custom', message: 'Duplicate frame ID' });
  if (new Set(bundle.frames.map(frame => frame.buildId)).size !== 1) ctx.addIssue({ code: 'custom', message: 'Mixed build versions' });
  if (bundle.frames.reduce((sum, frame) => sum + frame.image.length, 0) > 8_000_000) ctx.addIssue({ code: 'custom', message: 'Image budget exceeded' });
});
export type AIReviewBundle = z.infer<typeof AIReviewBundleSchema>;

// Model output contains observations only. There is deliberately no executable action or gate status.
export const AIReviewFindingSchema = z.strictObject({
  frameId: Id, partId: Id.nullable(),
  region: z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), width: z.number().positive().max(1), height: z.number().positive().max(1) }).nullable(),
  category: z.enum(['hierarchy', 'density', 'typography', 'redundancy', 'brand', 'motion', 'framing']),
  severity: z.enum(['info', 'warning', 'error']),
  observation: z.string().min(1).max(1000), rationale: z.string().min(1).max(1000),
  suggestion: z.string().min(1).max(1000), uncertainty: z.enum(['low', 'medium', 'high']),
});
export type AIReviewFinding = z.infer<typeof AIReviewFindingSchema>;
export const AIReviewOutputSchema = z.strictObject({
  summary: z.string().min(1).max(1500), findings: z.array(AIReviewFindingSchema).max(20),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(10),
});
export type AIReviewOutput = z.infer<typeof AIReviewOutputSchema>;
export const AIReviewResultSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, output: AIReviewOutputSchema,
  provenance: z.strictObject({ responseLocale: LocaleSchema.optional(), sdk: z.string(), provider: z.string(), model: z.string(), resolvedModel: z.string().optional(), responseId: z.string().optional(), pricingVersion: z.string().optional(), policyVersion: Id, startedAt: z.iso.datetime(), durationMs: z.number().nonnegative(), frameIds: z.array(Id), coverage: z.literal('selected-frames-only') }),
  usage: z.strictObject({ inputTokens: z.number().nonnegative().nullable(), outputTokens: z.number().nonnegative().nullable() }),
  accounting: z.strictObject({ reservationUsd: z.number().nonnegative(), maxInputTokens: z.number().int().positive().optional(), inputMeasurement: z.enum(['openai-input-tokens', 'full-context-bound']).optional(), usageUpperEstimateUsd: z.number().nonnegative().nullable(), scope: z.enum(['local-process', 'local-project']), authoritativeInvoice: z.literal(false) }),
});
export type AIReviewResult = z.infer<typeof AIReviewResultSchema>;
export const AIReviewAssessmentSchema = z.strictObject({
  schemaVersion: z.literal(1), exportedAt: z.iso.datetime(), scope: z.literal('local-review'),
  result: AIReviewResultSchema,
  assessments: z.array(z.strictObject({ findingIndex: z.number().int().nonnegative(), status: z.enum(['pending', 'confirmed', 'dismissed']), note: z.string().max(1000) })),
}).superRefine((review, context) => {
  if (review.assessments.length !== review.result.output.findings.length || new Set(review.assessments.map(item => item.findingIndex)).size !== review.assessments.length || review.assessments.some(item => item.findingIndex >= review.result.output.findings.length)) context.addIssue({ code: 'custom', message: 'Each finding needs exactly one assessment.' });
});
export type AIReviewAssessment = z.infer<typeof AIReviewAssessmentSchema>;
export const AIReviewStatusSchema = z.object({
  configured: z.boolean(), token: z.string().regex(/^[a-f0-9]{48}$/), provider: z.string(), model: z.string().nullable(),
  reason: z.string().optional(), reservationUsd: z.number().nonnegative().optional(), scope: z.enum(['local-process', 'local-project']),
});
export type AIReviewStatus = z.infer<typeof AIReviewStatusSchema>;

export function validateReviewReferences(input: unknown, bundle: Pick<AIReviewBundle, 'frames'>): AIReviewOutput {
  const output = AIReviewOutputSchema.parse(input);
  for (const finding of output.findings) {
    const frame = bundle.frames.find(frame => frame.id === finding.frameId);
    if (!frame) throw new Error('AI review referenced an unknown frame');
    if (finding.partId && !frame.parts.some(part => part.id === finding.partId)) throw new Error('AI review referenced an unknown part');
    if (!finding.partId && !finding.region) throw new Error('AI review finding needs a part or image region');
    if (finding.region && (finding.region.x + finding.region.width > 1 || finding.region.y + finding.region.height > 1)) throw new Error('AI review region exceeds image');
  }
  return output;
}
