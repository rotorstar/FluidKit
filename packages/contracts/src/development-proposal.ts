import { z } from 'zod';
import { AuthoringDocumentSchema, AuthoringProvenanceSchema } from './authoring';

const HashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const OriginSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('manual') }),
  z.strictObject({ kind: z.literal('ai'), requestId: z.string().min(1).max(80), provenance: AuthoringProvenanceSchema }),
]);
/** Host data is deliberately not accepted from the HTTP client. */
export const DevelopmentProposalRequestSchema = z.strictObject({
  before: AuthoringDocumentSchema, after: AuthoringDocumentSchema,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(), origin: OriginSchema,
});
export type DevelopmentProposalRequest = z.infer<typeof DevelopmentProposalRequestSchema>;
const DiagnosticSchema = z.strictObject({ code: z.number().int(), file: z.string().nullable(), line: z.number().int().positive().nullable(), message: z.string() });
const SourceFingerprintSchema = z.strictObject({ path: z.string(), sha256: HashSchema });
export const DevelopmentTypecheckSchema = z.strictObject({
  passed: z.boolean(), compilerVersion: z.string(), noEmit: z.literal(true),
  contractsResolved: z.boolean(), diagnostics: z.array(DiagnosticSchema), inputs: z.array(SourceFingerprintSchema),
});
export const DevelopmentCheckSchema = z.strictObject({ id: z.enum(['registry', 'stable-identities', 'typescript', 'conformance']), passed: z.boolean(), detail: z.string() });
export const DevelopmentConformanceSchema = z.strictObject({
  passed: z.boolean(), scope: z.literal('registered-local-runtime'), cases: z.array(z.strictObject({ width: z.number(), state: z.string(), nodes: z.number().int().nonnegative() })),
  events: z.number().int().nonnegative(), disposed: z.boolean(), pendingActionsAfterDispose: z.number().int().nonnegative(), issues: z.array(z.string()),
});
export const DevelopmentProposalSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('fluid-development-proposal'),
  basis: z.strictObject({ documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(), dataSha256: HashSchema, moduleCount: z.number().int().nonnegative() }),
  origin: OriginSchema,
  documents: z.strictObject({ beforeSha256: HashSchema, afterSha256: HashSchema }),
  sources: z.strictObject({ filename: z.literal('fluid-authoring.document.ts'), before: z.string(), after: z.string(), beforeSha256: HashSchema, afterSha256: HashSchema }),
  downloadDiff: z.strictObject({ filename: z.literal('fluid-authoring.patch'), mime: z.literal('text/x-diff'), text: z.string(), sha256: HashSchema }),
  preflight: z.strictObject({ passed: z.boolean(), checks: z.array(DevelopmentCheckSchema), typecheck: DevelopmentTypecheckSchema, conformance: DevelopmentConformanceSchema,
    limitations: z.array(z.string()), application: z.literal('not-applied') }),
});
export type DevelopmentProposal = z.infer<typeof DevelopmentProposalSchema>;
