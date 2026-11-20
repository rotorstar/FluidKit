import { z } from 'zod';
import { AuthoringDocumentSchema, AuthoringResultSchema } from './authoring';
import { AIReviewAssessmentSchema, AIReviewFrameSchema, validateReviewReferences } from './rehearsal';
export const ContentHashSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const LocalDraftInputSchema = z.strictObject({
  expectedRevision: z.number().int().nonnegative(), document: AuthoringDocumentSchema,
  datasetHash: ContentHashSchema, runtimeRevision: z.number().int().nonnegative(),
  origin: z.enum(['manual', 'ai', 'restored']), ai: AuthoringResultSchema.nullable(),
}).superRefine((value, context) => {
  if ((value.origin === 'ai') !== Boolean(value.ai)) context.addIssue({ code: 'custom', message: 'AI versions require matching provenance.' });
  if (value.ai && JSON.stringify(value.ai.document) !== JSON.stringify(value.document)) context.addIssue({ code: 'custom', message: 'AI result does not match saved document.' });
});
export const LocalDraftVersionSchema = z.strictObject({
  schemaVersion: z.literal(1), revision: z.number().int().positive(), createdAt: z.iso.datetime(),
  documentHash: ContentHashSchema, datasetHash: ContentHashSchema, runtimeRevision: z.number().int().nonnegative(),
  document: AuthoringDocumentSchema, origin: z.enum(['manual', 'ai', 'restored']), ai: AuthoringResultSchema.nullable(),
});
export type LocalDraftVersion = z.infer<typeof LocalDraftVersionSchema>;
export const LocalDraftListSchema = z.strictObject({ revision: z.number().int().nonnegative(), versions: z.array(LocalDraftVersionSchema).max(1000) });
export const LocalBudgetSummarySchema = z.strictObject({
  scope: z.literal('local-project'), sessionLimitUsd: z.number(), projectLimitUsd: z.number(),
  sessionChargedOrReservedUsd: z.number(), projectChargedOrReservedUsd: z.number(), activeRequests: z.number().int().nonnegative(),
});
export type LocalBudgetSummary = z.infer<typeof LocalBudgetSummarySchema>;
export const LocalReviewEvidenceSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('fluid-local-review-evidence'),
  assessment: AIReviewAssessmentSchema,
  frames: z.array(z.strictObject({ frame: AIReviewFrameSchema, imageSha256: ContentHashSchema })).min(1).max(3),
}).superRefine((value, context) => {
  const ids = value.frames.map(item => item.frame.id);
  if (new Set(value.frames.map(item => item.frame.buildId)).size !== 1) context.addIssue({ code: 'custom', message: 'Review evidence mixes build versions.' });
  try { validateReviewReferences(value.assessment.result.output, { frames: value.frames.map(item => item.frame) }); } catch { context.addIssue({ code: 'custom', message: 'Finding refers to an unknown frame, part or invalid image region.' }); }
  if (value.frames.some(item => item.frame.binding && item.frame.binding.imageSha256 !== item.imageSha256)) context.addIssue({ code: 'custom', message: 'Frame binding and archived image hash differ.' });
  if (new Set(ids).size !== ids.length || value.assessment.result.provenance.frameIds.length !== ids.length || value.assessment.result.provenance.frameIds.some(id => !ids.includes(id))) context.addIssue({ code: 'custom', message: 'Evidence must contain every reviewed original frame exactly once.' });
});
export type LocalReviewEvidence = z.infer<typeof LocalReviewEvidenceSchema>;
