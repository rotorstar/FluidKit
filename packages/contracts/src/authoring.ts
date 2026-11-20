import { LocaleSchema } from '@fluidkit/i18n/locale';
import { z } from 'zod';

const Id = z.string().regex(/^[a-zA-Z][a-zA-Z0-9._-]{0,79}$/);
const Title = z.string().trim().min(1).max(80);
export const AuthoringMetricSchema = z.enum(['modules', 'sources', 'dependencies']);
// Distinct literal tags keep these branches disjoint. A regular union exports
// `anyOf`, which the provider supports; Zod 4.6's discriminatedUnion exports
// unsupported `oneOf`. Runtime validation still uses this same source schema.
export const AuthoringSectionSchema = z.union([
  z.strictObject({ type: z.literal('metric-grid'), id: Id, binding: z.literal('workspace.metrics'), metrics: z.array(AuthoringMetricSchema).min(1).max(3) }),
  z.strictObject({ type: z.literal('module-explorer'), id: Id, binding: z.literal('workspace.modules'), view: z.enum(['table', 'cards', 'map']),
    commands: z.array(z.enum(['module.open', 'module.select', 'view.change', 'sort.change', 'filter.change'])).length(5) }),
  z.strictObject({ type: z.literal('project-note'), id: Id, binding: z.literal('workspace.note'), label: Title }),
]);
export const AUTHORING_REGISTRY_VERSION = 'workspace-authoring-1' as const;
export const AuthoringDocumentSchema = z.strictObject({
  schemaVersion: z.literal(1), registryVersion: z.literal(AUTHORING_REGISTRY_VERSION),
  title: Title, accent: z.enum(['forest', 'indigo', 'amber']),
  sections: z.array(AuthoringSectionSchema).min(1).max(3),
}).superRefine((doc, ctx) => {
  const problem = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (new Set(doc.sections.map(section => section.id)).size !== doc.sections.length) problem('Duplicate component ID');
  if (new Set(doc.sections.map(section => section.type)).size !== doc.sections.length) problem('A registered component may occur only once');
  if (doc.sections.filter(section => section.type === 'module-explorer').length !== 1) problem('Exactly one module explorer is required');
  for (const section of doc.sections) {
    if (section.type === 'metric-grid' && new Set(section.metrics).size !== section.metrics.length) problem('Duplicate metric binding');
    if (section.type === 'module-explorer' && new Set(section.commands).size !== section.commands.length) problem('Missing or duplicated explorer command binding');
  }
});
export type AuthoringDocument = z.infer<typeof AuthoringDocumentSchema>;
export type AuthoringSection = z.infer<typeof AuthoringSectionSchema>;
export const DEFAULT_AUTHORING_DOCUMENT = AuthoringDocumentSchema.parse({
  schemaVersion: 1, registryVersion: AUTHORING_REGISTRY_VERSION, title: 'Ein Workspace. Dein Blick darauf.', accent: 'forest',
  sections: [
    { type: 'metric-grid', id: 'overview', binding: 'workspace.metrics', metrics: ['modules', 'sources', 'dependencies'] },
    { type: 'module-explorer', id: 'explorer', binding: 'workspace.modules', view: 'cards', commands: ['module.open', 'module.select', 'view.change', 'sort.change', 'filter.change'] },
    { type: 'project-note', id: 'notes', binding: 'workspace.note', label: 'Projektnotiz' },
  ],
});
export const AuthoringRequestSchema = z.strictObject({
  responseLocale: LocaleSchema.optional(),
  schemaVersion: z.literal(1), id: Id,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(),
  prompt: z.string().trim().min(1).max(3000), document: AuthoringDocumentSchema,
});
export type AuthoringRequest = z.infer<typeof AuthoringRequestSchema>;
export const AuthoringProvenanceSchema = z.strictObject({
  responseLocale: LocaleSchema.optional(),
  sdk: z.literal('ai@7.0.159'), provider: z.literal('openai'), model: z.string().min(1), resolvedModel: z.string().min(1),
  responseId: z.string().min(1), policyVersion: z.string().min(1), pricingVersion: z.string().min(1),
  startedAt: z.iso.datetime(), durationMs: z.number().nonnegative(),
  inputTokens: z.number().int().nonnegative().nullable(), outputTokens: z.number().int().nonnegative().nullable(),
  reservationUsd: z.number().nonnegative(), chargedUpperEstimateUsd: z.number().nonnegative(),
  scope: z.enum(['local-process', 'local-project']), coverage: z.literal('registered-workspace-composition'),
});
export const AuthoringResultSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(),
  document: AuthoringDocumentSchema, provenance: AuthoringProvenanceSchema,
  basis: z.strictObject({ documentSha256: z.string().regex(/^[a-f0-9]{64}$/), datasetSha256: z.string().regex(/^[a-f0-9]{64}$/) }).optional(),
});
export type AuthoringResult = z.infer<typeof AuthoringResultSchema>;
export const AuthoringStreamEventSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('partial'), requestId: Id, value: z.json() }),
  z.strictObject({ type: z.literal('complete'), result: AuthoringResultSchema }),
  z.strictObject({ type: z.literal('error'), requestId: Id, status: z.number().int().min(400).max(599).optional(), message: z.string().max(300) }),
]);
export type AuthoringStreamEvent = z.infer<typeof AuthoringStreamEventSchema>;

/** Model context is an explicit registry contract; it contains no runtime fields. */
export const AUTHORING_PALETTE = Object.freeze({
  version: AUTHORING_REGISTRY_VERSION,
  components: ['metric-grid: workspace.metrics; unique modules/sources/dependencies',
    'module-explorer: workspace.modules; one required; table/cards/map; all five registered commands',
    'project-note: workspace.note; optional; label only, never a note value'],
  commands: ['module.open', 'module.select', 'view.change', 'sort.change', 'filter.change'],
  constraints: ['One component per type; unique stable IDs; preserve existing IDs.', 'Order sections intentionally. No code, URLs, handlers, imports or new bindings.'],
});
