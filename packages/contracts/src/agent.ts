import { z } from 'zod';
import { FieldValueSchema, IdentifierSchema, JsonSchema } from './index';

const Id = z.lazy(() => IdentifierSchema);
const Json = z.lazy(() => JsonSchema);
const Parameters = z.record(z.string(), Json);
export const AGENT_MAX_STEPS = 16;
export const AgentScopeSchema = z.strictObject({ projectId: Id, flowId: Id });
export const AgentActionRefSchema = z.strictObject({ componentId: Id, actionId: Id });
export const AgentStepSchema = AgentActionRefSchema.extend({ parameters: Parameters.default({}) });
export const AgentRequestSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().max(72).pipe(Id), scope: AgentScopeSchema,
  snapshotRevision: z.number().int().nonnegative(), policyVersion: Id,
  expiresAt: z.number().finite().positive(),
  mode: z.enum(['atomic-local', 'ordered']),
  steps: z.array(AgentStepSchema).min(1).max(AGENT_MAX_STEPS),
});
export const AgentPolicySchema = z.strictObject({
  version: Id,
  read: z.strictObject({ state: z.boolean().default(false), fields: z.array(Id).default([]), components: z.array(Id).default([]), queries: z.array(Id).default([]) })
    .default({ state: false, fields: [], components: [], queries: [] }),
  actions: z.array(AgentActionRefSchema).max(1000).default([]),
  autoActions: z.array(AgentActionRefSchema).max(1000).default([]),
});
export const LocalCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('event'), eventType: Id, payload: Parameters.default({}) }),
  z.strictObject({ type: z.literal('field'), fieldId: Id, value: z.lazy(() => FieldValueSchema) }),
  z.strictObject({ type: z.literal('collection'), collectionId: Id, keys: z.array(Id).max(10000) }),
]);
export const LocalTransactionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, expectedRevision: z.number().int().nonnegative(),
  commands: z.array(LocalCommandSchema).min(1).max(AGENT_MAX_STEPS),
});
export const AgentQueryRequestSchema = z.strictObject({
  schemaVersion: z.literal(1), scope: AgentScopeSchema, queryId: Id, parameters: Parameters.default({}),
  snapshotRevision: z.number().int().nonnegative(), policyVersion: Id,
});
export const AgentReadSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1), scope: AgentScopeSchema, revision: z.number().int().nonnegative(), policyVersion: Id,
  state: Id.optional(), fields: z.record(Id, z.lazy(() => FieldValueSchema)),
  components: z.array(z.strictObject({ id: Id, parts: z.array(z.strictObject({ id: Id, part: Id, behavior: z.string(), label: z.string().optional(), text: z.string() })) })),
});
export const AgentErrorCodeSchema = z.enum([
  'invalid-request', 'scope-denied', 'policy-denied', 'stale-revision', 'expired',
  'unknown-action', 'invalid-parameters', 'invalid-target', 'manual-mode', 'approval-required',
  'auto-denied', 'interaction-active', 'replay-denied', 'duplicate-request', 'request-limit',
  'core-rejected', 'query-denied', 'query-failed', 'aborted', 'action-failed', 'action-unknown',
]);
export const AgentStepResultSchema = AgentActionRefSchema.extend({
  index: z.number().int().nonnegative(), kind: z.enum(['local', 'external']),
  status: z.enum(['not-run', 'applied', 'completed', 'rejected', 'unknown']),
  code: AgentErrorCodeSchema.optional(), output: Json.optional(),
});
export const AgentExecutionSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id, scope: AgentScopeSchema,
  policyVersion: Id, beforeRevision: z.number().int().nonnegative(), afterRevision: z.number().int().nonnegative(),
  status: z.enum(['succeeded', 'rejected', 'partial', 'unknown']), code: AgentErrorCodeSchema.optional(),
  steps: z.array(AgentStepResultSchema).max(AGENT_MAX_STEPS),
});
export const AgentProposalSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id, scope: AgentScopeSchema,
  status: z.literal('pending'), revision: z.number().int().nonnegative(), policyVersion: Id,
  expiresAt: z.number().finite().positive(), steps: z.array(AgentActionRefSchema).max(AGENT_MAX_STEPS),
});
export type AgentScope = z.infer<typeof AgentScopeSchema>;
export type AgentActionRef = z.infer<typeof AgentActionRefSchema>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type AgentStep = z.infer<typeof AgentStepSchema>;
export type AgentPolicy = z.infer<typeof AgentPolicySchema>;
export type AgentQueryRequest = z.infer<typeof AgentQueryRequestSchema>;
export type AgentReadSnapshot = z.infer<typeof AgentReadSnapshotSchema>;
export type AgentExecution = z.infer<typeof AgentExecutionSchema>;
export type AgentProposal = z.infer<typeof AgentProposalSchema>;
export type AgentStepResult = z.infer<typeof AgentStepResultSchema>;
export type AgentErrorCode = z.infer<typeof AgentErrorCodeSchema>;
export type LocalCommand = z.infer<typeof LocalCommandSchema>;
export type LocalTransaction = z.infer<typeof LocalTransactionSchema>;
