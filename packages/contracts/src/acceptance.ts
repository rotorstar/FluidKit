import { z } from 'zod';

export const AcceptanceStatusSchema = z.enum(['verified', 'implemented', 'partial', 'open', 'external']);
export const AcceptanceCriterionSchema = z.strictObject({
  id: z.string().regex(/^[A-Z0-9-]+$/), task: z.string().min(1),
  source: z.string().min(1), sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  criterion: z.string().min(1), status: AcceptanceStatusSchema, scope: z.string().min(1),
  evidence: z.array(z.strictObject({ path: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/), kind: z.enum(['source', 'test', 'artifact', 'document']) })),
  remaining: z.string(),
}).superRefine((criterion, ctx) => {
  if (criterion.status === 'verified' && !criterion.evidence.some(item => item.kind === 'artifact')) ctx.addIssue({ code: 'custom', message: 'Verified criteria require an executed evidence artifact' });
  if (criterion.status !== 'verified' && !criterion.remaining) ctx.addIssue({ code: 'custom', message: 'Open criteria need an explicit next step' });
});
export const AcceptanceLedgerSchema = z.strictObject({ schemaVersion: z.literal(1), updatedAt: z.iso.date(), criteria: z.array(AcceptanceCriterionSchema) }).superRefine((ledger, ctx) => {
  if (new Set(ledger.criteria.map(item => item.id)).size !== ledger.criteria.length) ctx.addIssue({ code: 'custom', message: 'Duplicate acceptance ID' });
});
export type AcceptanceCriterion = z.infer<typeof AcceptanceCriterionSchema>;
export type AcceptanceLedger = z.infer<typeof AcceptanceLedgerSchema>;
