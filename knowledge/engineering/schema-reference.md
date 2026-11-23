---
type: Schema Reference
title: Ausführbare Datenverträge
description: Vollständige Zod-Schemadeklarationen aus dem aktuellen Quellstand.
audience: engineering
tags:
  - reference
  - generated
status: draft
generated:
  by: process:fluidkit-knowledge-sync
  at: 2026-11-23T10:46:25.000Z
stale_after: 2026-12-02T00:00:00Z
sources:
  - id: implementation
    resource: assets/source-inventory.json
    title: SHA-gebundenes Quellinventar
---

# Schema-Referenz

Diese Deklarationen werden aus dem Code gelesen und nicht redaktionell nachgebildet. Verhalten und Invarianten erläutert [Verträge](contracts.md).[^implementation]

## SimulationRecordSchema

Quelle: `packages/cases/src/simulation.ts:13`.

```typescript
SimulationRecordSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...base, kind: z.literal('property'), district: z.string(), areaM2: z.number().positive(), rooms: z.number().positive(),
    serviceChargeMinor: MoneySchema, depositMinor: MoneySchema, energyClass: z.enum(['A','B','C','D','E','F','G','H']), features: z.array(z.string()) }),
  z.strictObject({ ...base, kind: z.literal('product'), category: z.string(), taxRate: z.number().min(0).max(1), shippingMinor: MoneySchema,
    variants: z.array(z.strictObject({ id: z.string(), label: z.string(), stock: z.number().int().nonnegative(), priceMinor: MoneySchema })).min(1) }),
  z.strictObject({ ...base, kind: z.literal('stay'), checkIn: z.iso.date(), checkOut: z.iso.date(), adults: z.number().int().positive(),
    rating: z.number().min(0).max(5), cancellation: z.string(), taxesIncluded: z.boolean(), quotedAt: z.iso.datetime(), quoteExpiresAt: z.iso.datetime() }),
])
```

## SimulationDatasetSchema

Quelle: `packages/cases/src/simulation.ts:21`.

```typescript
SimulationDatasetSchema = z.strictObject({ schemaVersion: z.literal(1), id: z.enum(['real-estate','commerce','travel']),
  source: DataSourceSchema, records: z.array(SimulationRecordSchema).min(1) }).superRefine((value, ctx) => {
    if (!value.source.simulation || value.source.mode !== 'synthetic') ctx.addIssue({ code: 'custom', message: 'Simulation fixtures require synthetic provenance' });
    if (new Set(value.records.map(item => item.id)).size !== value.records.length) ctx.addIssue({ code: 'custom', message: 'Duplicate record ID' });
    const expected = { 'real-estate': 'property', commerce: 'product', travel: 'stay' }[value.id];
    for (const record of value.records) {
      if (record.kind !== expected) ctx.addIssue({ code: 'custom', message: 'Record does not belong to case' });
      if (record.kind === 'stay' && (record.checkOut <= record.checkIn || Date.parse(record.quoteExpiresAt) <= Date.parse(record.quotedAt))) ctx.addIssue({ code: 'custom', message: 'Invalid stay or quote dates' });
    }
  })
```

## SimulationQuerySchema

Quelle: `packages/cases/src/simulation.ts:34`.

```typescript
SimulationQuerySchema = z.strictObject({ locale: LocaleSchema.default('de'), search: z.string().max(200).default(''), sort: z.enum(['price-asc','price-desc','name']).default('name'), availableOnly: z.boolean().default(false) })
```

## WorkspaceModuleSchema

Quelle: `packages/cases/src/workspace.ts:11`.

```typescript
WorkspaceModuleSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/), name: z.string().min(1), version: z.string(),
  group: z.enum(['Kernel', 'Adapter', 'Tooling']), files: z.number().int().nonnegative(),
  lines: z.number().int().nonnegative(), dependencies: z.array(z.string()), internal: z.array(z.string()),
})
```

## WorkspaceDataSchema

Quelle: `packages/cases/src/workspace.ts:16`.

```typescript
WorkspaceDataSchema = z.strictObject({
  schemaVersion: z.literal(1), name: z.string(), capturedAt: z.iso.datetime(),
  source: z.literal('Workspace package.json + src/**/*.ts(x)'), modules: z.array(WorkspaceModuleSchema).max(1000),
}).superRefine((data, ctx) => {
  if (new Set(data.modules.map(module => module.id)).size !== data.modules.length) ctx.addIssue({ code: 'custom', message: 'Duplicate module ID' });
})
```

## WorkspaceLocationSchema

Quelle: `packages/cases/src/workspace.ts:24`.

```typescript
WorkspaceLocationSchema = z.strictObject({
  view: z.enum(['table', 'cards', 'map', 'detail', 'compare', 'atlas']).default('table'),
  sort: z.enum(['name', 'files', 'dependencies']).default('name'),
  direction: z.enum(['asc', 'desc']).default('asc'),
  selected: z.string().default(''), group: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).default('all'),
  metric: z.enum(['lines', 'files']).default('lines'), atlasGroup: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).default('all'), differences: z.enum(['0', '1']).default('0'),
  cards: z.enum(['selected', 'all']).default('all'),
  picked: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).max(1000).default([]),
})
```

## AcceptanceStatusSchema

Quelle: `packages/contracts/src/acceptance.ts:3`.

```typescript
AcceptanceStatusSchema = z.enum(['verified', 'implemented', 'partial', 'open', 'external'])
```

## AcceptanceCriterionSchema

Quelle: `packages/contracts/src/acceptance.ts:4`.

```typescript
AcceptanceCriterionSchema = z.strictObject({
  id: z.string().regex(/^[A-Z0-9-]+$/), task: z.string().min(1),
  source: z.string().min(1), sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  criterion: z.string().min(1), status: AcceptanceStatusSchema, scope: z.string().min(1),
  evidence: z.array(z.strictObject({ path: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/), kind: z.enum(['source', 'test', 'artifact', 'document']) })),
  remaining: z.string(),
}).superRefine((criterion, ctx) => {
  if (criterion.status === 'verified' && !criterion.evidence.some(item => item.kind === 'artifact')) ctx.addIssue({ code: 'custom', message: 'Verified criteria require an executed evidence artifact' });
  if (criterion.status !== 'verified' && !criterion.remaining) ctx.addIssue({ code: 'custom', message: 'Open criteria need an explicit next step' });
})
```

## AcceptanceLedgerSchema

Quelle: `packages/contracts/src/acceptance.ts:14`.

```typescript
AcceptanceLedgerSchema = z.strictObject({ schemaVersion: z.literal(1), updatedAt: z.iso.date(), criteria: z.array(AcceptanceCriterionSchema) }).superRefine((ledger, ctx) => {
  if (new Set(ledger.criteria.map(item => item.id)).size !== ledger.criteria.length) ctx.addIssue({ code: 'custom', message: 'Duplicate acceptance ID' });
})
```

## AgentScopeSchema

Quelle: `packages/contracts/src/agent.ts:8`.

```typescript
AgentScopeSchema = z.strictObject({ projectId: Id, flowId: Id })
```

## AgentActionRefSchema

Quelle: `packages/contracts/src/agent.ts:9`.

```typescript
AgentActionRefSchema = z.strictObject({ componentId: Id, actionId: Id })
```

## AgentStepSchema

Quelle: `packages/contracts/src/agent.ts:10`.

```typescript
AgentStepSchema = AgentActionRefSchema.extend({ parameters: Parameters.default({}) })
```

## AgentRequestSchema

Quelle: `packages/contracts/src/agent.ts:11`.

```typescript
AgentRequestSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().max(72).pipe(Id), scope: AgentScopeSchema,
  snapshotRevision: z.number().int().nonnegative(), policyVersion: Id,
  expiresAt: z.number().finite().positive(),
  mode: z.enum(['atomic-local', 'ordered']),
  steps: z.array(AgentStepSchema).min(1).max(AGENT_MAX_STEPS),
})
```

## AgentPolicySchema

Quelle: `packages/contracts/src/agent.ts:18`.

```typescript
AgentPolicySchema = z.strictObject({
  version: Id,
  read: z.strictObject({ state: z.boolean().default(false), fields: z.array(Id).default([]), components: z.array(Id).default([]), queries: z.array(Id).default([]) })
    .default({ state: false, fields: [], components: [], queries: [] }),
  actions: z.array(AgentActionRefSchema).max(1000).default([]),
  autoActions: z.array(AgentActionRefSchema).max(1000).default([]),
})
```

## LocalCommandSchema

Quelle: `packages/contracts/src/agent.ts:25`.

```typescript
LocalCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('event'), eventType: Id, payload: Parameters.default({}) }),
  z.strictObject({ type: z.literal('field'), fieldId: Id, value: z.lazy(() => FieldValueSchema) }),
  z.strictObject({ type: z.literal('collection'), collectionId: Id, keys: z.array(Id).max(10000) }),
])
```

## LocalTransactionSchema

Quelle: `packages/contracts/src/agent.ts:30`.

```typescript
LocalTransactionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, expectedRevision: z.number().int().nonnegative(),
  commands: z.array(LocalCommandSchema).min(1).max(AGENT_MAX_STEPS),
})
```

## AgentQueryRequestSchema

Quelle: `packages/contracts/src/agent.ts:34`.

```typescript
AgentQueryRequestSchema = z.strictObject({
  schemaVersion: z.literal(1), scope: AgentScopeSchema, queryId: Id, parameters: Parameters.default({}),
  snapshotRevision: z.number().int().nonnegative(), policyVersion: Id,
})
```

## AgentReadSnapshotSchema

Quelle: `packages/contracts/src/agent.ts:38`.

```typescript
AgentReadSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1), scope: AgentScopeSchema, revision: z.number().int().nonnegative(), policyVersion: Id,
  state: Id.optional(), fields: z.record(Id, z.lazy(() => FieldValueSchema)),
  components: z.array(z.strictObject({ id: Id, parts: z.array(z.strictObject({ id: Id, part: Id, behavior: z.string(), label: z.string().optional(), text: z.string() })) })),
})
```

## AgentErrorCodeSchema

Quelle: `packages/contracts/src/agent.ts:43`.

```typescript
AgentErrorCodeSchema = z.enum([
  'invalid-request', 'scope-denied', 'policy-denied', 'stale-revision', 'expired',
  'unknown-action', 'invalid-parameters', 'invalid-target', 'manual-mode', 'approval-required',
  'auto-denied', 'interaction-active', 'replay-denied', 'duplicate-request', 'request-limit',
  'core-rejected', 'query-denied', 'query-failed', 'aborted', 'action-failed', 'action-unknown',
])
```

## AgentStepResultSchema

Quelle: `packages/contracts/src/agent.ts:49`.

```typescript
AgentStepResultSchema = AgentActionRefSchema.extend({
  index: z.number().int().nonnegative(), kind: z.enum(['local', 'external']),
  status: z.enum(['not-run', 'applied', 'completed', 'rejected', 'unknown']),
  code: AgentErrorCodeSchema.optional(), output: Json.optional(),
})
```

## AgentExecutionSchema

Quelle: `packages/contracts/src/agent.ts:54`.

```typescript
AgentExecutionSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id, scope: AgentScopeSchema,
  policyVersion: Id, beforeRevision: z.number().int().nonnegative(), afterRevision: z.number().int().nonnegative(),
  status: z.enum(['succeeded', 'rejected', 'partial', 'unknown']), code: AgentErrorCodeSchema.optional(),
  steps: z.array(AgentStepResultSchema).max(AGENT_MAX_STEPS),
})
```

## AgentProposalSchema

Quelle: `packages/contracts/src/agent.ts:60`.

```typescript
AgentProposalSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id, scope: AgentScopeSchema,
  status: z.literal('pending'), revision: z.number().int().nonnegative(), policyVersion: Id,
  expiresAt: z.number().finite().positive(), steps: z.array(AgentActionRefSchema).max(AGENT_MAX_STEPS),
})
```

## AuthoringMetricSchema

Quelle: `packages/contracts/src/authoring.ts:6`.

```typescript
AuthoringMetricSchema = z.enum(['modules', 'sources', 'dependencies'])
```

## AuthoringSectionSchema

Quelle: `packages/contracts/src/authoring.ts:10`.

```typescript
AuthoringSectionSchema = z.union([
  z.strictObject({ type: z.literal('metric-grid'), id: Id, binding: z.literal('workspace.metrics'), metrics: z.array(AuthoringMetricSchema).min(1).max(3) }),
  z.strictObject({ type: z.literal('module-explorer'), id: Id, binding: z.literal('workspace.modules'), view: z.enum(['table', 'cards', 'map']),
    commands: z.array(z.enum(['module.open', 'module.select', 'view.change', 'sort.change', 'filter.change'])).length(5) }),
  z.strictObject({ type: z.literal('project-note'), id: Id, binding: z.literal('workspace.note'), label: Title }),
])
```

## AuthoringDocumentSchema

Quelle: `packages/contracts/src/authoring.ts:17`.

```typescript
AuthoringDocumentSchema = z.strictObject({
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
})
```

## AuthoringRequestSchema

Quelle: `packages/contracts/src/authoring.ts:41`.

```typescript
AuthoringRequestSchema = z.strictObject({
  responseLocale: LocaleSchema.optional(),
  schemaVersion: z.literal(1), id: Id,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(),
  prompt: z.string().trim().min(1).max(3000), document: AuthoringDocumentSchema,
})
```

## AuthoringProvenanceSchema

Quelle: `packages/contracts/src/authoring.ts:48`.

```typescript
AuthoringProvenanceSchema = z.strictObject({
  responseLocale: LocaleSchema.optional(),
  sdk: z.literal('ai@7.0.159'), provider: z.literal('openai'), model: z.string().min(1), resolvedModel: z.string().min(1),
  responseId: z.string().min(1), policyVersion: z.string().min(1), pricingVersion: z.string().min(1),
  startedAt: z.iso.datetime(), durationMs: z.number().nonnegative(),
  inputTokens: z.number().int().nonnegative().nullable(), outputTokens: z.number().int().nonnegative().nullable(),
  reservationUsd: z.number().nonnegative(), chargedUpperEstimateUsd: z.number().nonnegative(),
  scope: z.enum(['local-process', 'local-project']), coverage: z.literal('registered-workspace-composition'),
})
```

## AuthoringResultSchema

Quelle: `packages/contracts/src/authoring.ts:57`.

```typescript
AuthoringResultSchema = z.strictObject({
  schemaVersion: z.literal(1), requestId: Id,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(),
  document: AuthoringDocumentSchema, provenance: AuthoringProvenanceSchema,
  basis: z.strictObject({ documentSha256: z.string().regex(/^[a-f0-9]{64}$/), datasetSha256: z.string().regex(/^[a-f0-9]{64}$/) }).optional(),
})
```

## AuthoringStreamEventSchema

Quelle: `packages/contracts/src/authoring.ts:64`.

```typescript
AuthoringStreamEventSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('partial'), requestId: Id, value: z.json() }),
  z.strictObject({ type: z.literal('complete'), result: AuthoringResultSchema }),
  z.strictObject({ type: z.literal('error'), requestId: Id, status: z.number().int().min(400).max(599).optional(), message: z.string().max(300) }),
])
```

## ComponentCapabilitiesSchema

Quelle: `packages/contracts/src/components.ts:9`.

```typescript
ComponentCapabilitiesSchema = z.strictObject({
  focus: z.boolean().default(false),
  keys: z.array(z.enum(['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape', 'Tab', 'native-input', 'typeahead'])).default([]),
  press: z.boolean().default(false),
})
```

## ComponentPartSchema

Quelle: `packages/contracts/src/components.ts:14`.

```typescript
ComponentPartSchema = z.strictObject({
  id: Identifier,
  layout: Identifier,
  behavior: z.lazy(() => SceneNodeSchema.shape.anatomy.shape.behavior),
  name: Name.optional(),
  capabilities: ComponentCapabilitiesSchema.default({ focus: false, keys: [], press: false }),
  command: Identifier.optional(),
  /** A declared host event command, enabled explicitly by the instance. */
  dismissCommand: Identifier.optional(),
  /** A declared focus target; the instance binds it to a concrete part ID. */
  focusTarget: Identifier.optional(),
  binding: Identifier.optional(),
  semantics: z.strictObject({
    role: z.lazy(() => SceneNodeSchema.shape.semantics.unwrap().shape.role.unwrap()),
    /** A sibling part ID, resolved to the instantiated node ID. */
    parent: Identifier.optional(),
  }).optional(),
})
```

## MultipartComponentDefinitionSchema

Quelle: `packages/contracts/src/components.ts:32`.

```typescript
MultipartComponentDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: Identifier,
  name: Name,
  commands: z.array(Identifier).default([]),
  bindings: z.array(Identifier).default([]),
  focusTargets: z.array(Identifier).default([]),
  layouts: z.array(Identifier).min(1),
  parts: z.array(ComponentPartSchema).min(1),
}).superRefine((definition, ctx) => {
  for (const name of ['commands', 'bindings', 'layouts', 'focusTargets'] as const) {
    if (new Set(definition[name]).size !== definition[name].length) ctx.addIssue({ code: 'custom', path: [name], message: `Duplicate ${name} declaration` });
  }
  const parts = new Map(definition.parts.map(part => [part.id, part]));
  if (parts.size !== definition.parts.length) ctx.addIssue({ code: 'custom', path: ['parts'], message: 'Duplicate part ID' });
  definition.parts.forEach((part, index) => {
    const issue = (message: string, field: string) => ctx.addIssue({ code: 'custom', path: ['parts', index, field], message });
    if (!definition.layouts.includes(part.layout)) issue('Unknown layout reference', 'layout');
    if (part.command && !definition.commands.includes(part.command)) issue('Unknown command reference', 'command');
    if (part.dismissCommand && !definition.commands.includes(part.dismissCommand)) issue('Unknown dismissal command reference', 'dismissCommand');
    if (part.focusTarget && !definition.focusTargets.includes(part.focusTarget)) issue('Unknown focus target reference', 'focusTarget');
    if (part.binding && !definition.bindings.includes(part.binding)) issue('Unknown value binding', 'binding');
    const interactive = ['button', 'checkbox', 'textbox'].includes(part.behavior);
    if (interactive && !part.name) issue('Interactive part requires an accessible name', 'name');
    if (part.behavior === 'progressbar' && !part.name) issue('Progressbar requires an accessible name', 'name');
    if (interactive && !part.capabilities.focus) issue('Interactive part requires focus capability', 'capabilities');
    if (part.dismissCommand && (!interactive || !part.capabilities.keys.includes('Escape'))) issue('Dismissal requires an interactive Escape capability', 'dismissCommand');
    if (part.focusTarget && !part.dismissCommand) issue('Focus return requires a declared dismissal', 'focusTarget');
    if (new Set(part.capabilities.keys).size !== part.capabilities.keys.length) issue('Duplicate keyboard capability', 'capabilities');
    if (part.behavior === 'button') {
      if (!part.command) issue('Button requires a declared command', 'command');
      if (!part.capabilities.press || !['Enter', 'Space'].every(key => part.capabilities.keys.includes(key as 'Enter' | 'Space'))) issue('Button requires press, Enter and Space capabilities', 'capabilities');
    } else if (part.command) issue('Only a button part can reference a command', 'command');
    if (part.behavior === 'checkbox' && (!part.capabilities.press || !part.capabilities.keys.includes('Space'))) issue('Checkbox requires press and Space capabilities', 'capabilities');
    if (part.behavior === 'textbox') {
      if (!part.binding) issue('Textbox requires a declared controlled value binding', 'binding');
      if (!part.capabilities.keys.includes('native-input')) issue('Textbox requires native-input keyboard capability', 'capabilities');
    } else if (part.binding) issue('Only a textbox part can reference a value binding', 'binding');
    if (!interactive && (part.capabilities.focus || part.capabilities.press || part.capabilities.keys.length)) issue('Noninteractive part cannot acquire input capabilities', 'capabilities');
    if (part.semantics?.parent && !parts.has(part.semantics.parent)) issue('Unknown semantic parent part', 'semantics');
    const parentRole = part.semantics?.parent ? parts.get(part.semantics.parent)?.semantics?.role : undefined;
    if (part.semantics?.parent && part.semantics.role === 'row' && parentRole !== 'table') issue('Row requires a table parent', 'semantics');
    if (part.semantics?.parent && ['cell', 'columnheader'].includes(part.semantics.role) && parentRole !== 'row') issue('Cell requires a row parent', 'semantics');
    const visited = new Set([part.id]);
    let parent = part.semantics?.parent;
    while (parent) {
      if (visited.has(parent)) { issue('Cyclic semantic part references', 'semantics'); break; }
      visited.add(parent); parent = parts.get(parent)?.semantics?.parent;
    }
  });
})
```

## ComponentLayoutSchema

Quelle: `packages/contracts/src/components.ts:89`.

```typescript
ComponentLayoutSchema = z.lazy(() => SceneNodeSchema.omit({
  id: true, anatomy: true, label: true, semantics: true, binding: true,
  onActivate: true, onVisual: true, onCollection: true,
  onEscape: true, focusReturn: true,
}))
```

## ComponentCommandBindingSchema

Quelle: `packages/contracts/src/components.ts:94`.

```typescript
ComponentCommandBindingSchema = z.union([
  Identifier,
  z.strictObject({ visual: z.lazy(() => SceneNodeSchema.shape.onVisual.unwrap()) }),
  z.strictObject({ collection: z.lazy(() => SceneNodeSchema.shape.onCollection.unwrap()) }),
])
```

## MultipartComponentInstanceSchema

Quelle: `packages/contracts/src/components.ts:99`.

```typescript
MultipartComponentInstanceSchema = z.strictObject({
  schemaVersion: z.literal(1),
  definitionId: Identifier,
  id: Identifier,
  commands: z.record(Identifier, ComponentCommandBindingSchema),
  bindings: z.record(Identifier, Identifier),
  layouts: z.record(Identifier, ComponentLayoutSchema),
  partIds: z.record(Identifier, Identifier),
  names: z.record(Identifier, Name),
  /** Explicit cross-component semantic parents, validated by the composed Flow. */
  semanticParents: z.record(Identifier, Identifier),
  focusTargets: z.record(Identifier, Identifier),
  /** Part IDs whose declared Escape command is active in this instance. */
  dismissals: z.array(Identifier),
})
```

## ComponentInstantiationSchema

Quelle: `packages/contracts/src/components.ts:115`.

```typescript
ComponentInstantiationSchema = MultipartComponentInstanceSchema.omit({ schemaVersion: true, definitionId: true }).extend({
  commands: z.record(Identifier, ComponentCommandBindingSchema).default({}),
  bindings: z.record(Identifier, Identifier).default({}),
  partIds: z.record(Identifier, Identifier).default({}),
  names: z.record(Identifier, Name).default({}),
  semanticParents: z.record(Identifier, Identifier).default({}),
  focusTargets: z.record(Identifier, Identifier).default({}),
  dismissals: z.array(Identifier).default([]),
})
```

## DataSourceSchema

Quelle: `packages/contracts/src/data.ts:3`.

```typescript
DataSourceSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1), version: z.string().min(1),
  mode: z.enum(['live', 'import', 'recording', 'synthetic', 'provider-sandbox']),
  provider: z.string().min(1), label: z.string().min(1),
  asOf: z.iso.datetime(), expiresAt: z.iso.datetime().optional(),
  simulation: z.boolean(),
}).superRefine((value, ctx) => {
  if (['synthetic', 'provider-sandbox'].includes(value.mode) && !value.simulation) ctx.addIssue({ code: 'custom', message: 'Synthetic and sandbox data must be marked as simulation' });
  if (value.mode === 'live' && value.simulation) ctx.addIssue({ code: 'custom', message: 'Live data cannot be labeled simulation' });
  if (value.expiresAt && Date.parse(value.expiresAt) <= Date.parse(value.asOf)) ctx.addIssue({ code: 'custom', message: 'Expiry must follow observation time' });
})
```

## ActionContextSchema

Quelle: `packages/contracts/src/data.ts:15`.

```typescript
ActionContextSchema = z.strictObject({
  principalId: z.string().min(1), projectId: z.string().min(1),
  origin: z.enum(['user', 'host', 'ai', 'prefetch', 'replay']),
})
```

## dataResultSchema

Quelle: `packages/contracts/src/data.ts:20`.

```typescript
export function dataResultSchema<T extends z.ZodType>(schema: T)
```

## DesignTokensSchema

Quelle: `packages/contracts/src/design-tokens.ts:4`.

```typescript
DesignTokensSchema = z.strictObject({
  captionPx: z.number().positive(), labelPx: z.number().positive(), bodyPx: z.number().positive(),
  minimumTargetPx: z.number().positive(), focusColor: z.string().regex(/^#[0-9a-f]{6}$/),
})
```

## DevelopmentProposalRequestSchema

Quelle: `packages/contracts/src/development-proposal.ts:10`.

```typescript
DevelopmentProposalRequestSchema = z.strictObject({
  before: AuthoringDocumentSchema, after: AuthoringDocumentSchema,
  documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(), origin: OriginSchema,
})
```

## DevelopmentTypecheckSchema

Quelle: `packages/contracts/src/development-proposal.ts:17`.

```typescript
DevelopmentTypecheckSchema = z.strictObject({
  passed: z.boolean(), compilerVersion: z.string(), noEmit: z.literal(true),
  contractsResolved: z.boolean(), diagnostics: z.array(DiagnosticSchema), inputs: z.array(SourceFingerprintSchema),
})
```

## DevelopmentCheckSchema

Quelle: `packages/contracts/src/development-proposal.ts:21`.

```typescript
DevelopmentCheckSchema = z.strictObject({ id: z.enum(['registry', 'stable-identities', 'typescript', 'conformance']), passed: z.boolean(), detail: z.string() })
```

## DevelopmentConformanceSchema

Quelle: `packages/contracts/src/development-proposal.ts:22`.

```typescript
DevelopmentConformanceSchema = z.strictObject({
  passed: z.boolean(), scope: z.literal('registered-local-runtime'), cases: z.array(z.strictObject({ width: z.number(), state: z.string(), nodes: z.number().int().nonnegative() })),
  events: z.number().int().nonnegative(), disposed: z.boolean(), pendingActionsAfterDispose: z.number().int().nonnegative(), issues: z.array(z.string()),
})
```

## DevelopmentProposalSchema

Quelle: `packages/contracts/src/development-proposal.ts:26`.

```typescript
DevelopmentProposalSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('fluid-development-proposal'),
  basis: z.strictObject({ documentRevision: z.number().int().nonnegative(), runtimeRevision: z.number().int().nonnegative(), dataSha256: HashSchema, moduleCount: z.number().int().nonnegative() }),
  origin: OriginSchema,
  documents: z.strictObject({ beforeSha256: HashSchema, afterSha256: HashSchema }),
  sources: z.strictObject({ filename: z.literal('fluid-authoring.document.ts'), before: z.string(), after: z.string(), beforeSha256: HashSchema, afterSha256: HashSchema }),
  downloadDiff: z.strictObject({ filename: z.literal('fluid-authoring.patch'), mime: z.literal('text/x-diff'), text: z.string(), sha256: HashSchema }),
  preflight: z.strictObject({ passed: z.boolean(), checks: z.array(DevelopmentCheckSchema), typecheck: DevelopmentTypecheckSchema, conformance: DevelopmentConformanceSchema,
    limitations: z.array(z.string()), application: z.literal('not-applied') }),
})
```

## EffectReferenceSchema

Quelle: `packages/contracts/src/effects.ts:5`.

```typescript
EffectReferenceSchema = z.strictObject({ id: Id, version: z.string().regex(/^\d+\.\d+\.\d+$/) })
```

## EffectParametersSchema

Quelle: `packages/contracts/src/effects.ts:8`.

```typescript
EffectParametersSchema = z.strictObject({
  intensity: z.number().min(0).max(1).default(0.65),
  frequency: z.number().min(0.2).max(8).default(2.5),
  durationMs: z.number().int().min(0).max(3000).default(1100),
})
```

## EffectRuleSchema

Quelle: `packages/contracts/src/effects.ts:13`.

```typescript
EffectRuleSchema = z.strictObject({
  mode: z.enum(['off', 'fixed', 'random']),
  effect: EffectReferenceSchema.optional(),
  pool: z.array(EffectReferenceSchema).max(32).optional(),
  parameters: z.strictObject({ intensity: z.number().min(0).max(1).optional(), frequency: z.number().min(0.2).max(8).optional(), durationMs: z.number().int().min(0).max(3000).optional() }).optional(),
}).superRefine((rule, ctx) => {
  if (rule.mode === 'fixed' && !rule.effect) ctx.addIssue({ code: 'custom', message: 'Fixed rule requires a versioned effect' });
})
```

## VisualCommandSchema

Quelle: `packages/contracts/src/effects.ts:22`.

```typescript
VisualCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('effect.select'), effect: EffectReferenceSchema }),
  z.strictObject({ type: z.literal('effect.mode'), mode: z.enum(['off', 'fixed', 'random', 'case']) }),
  z.strictObject({ type: z.literal('effect.reroll') }),
])
```

## EffectSettingsSchema

Quelle: `packages/contracts/src/effects.ts:28`.

```typescript
EffectSettingsSchema = z.strictObject({
  schemaVersion: z.literal(1).default(1),
  enabled: z.boolean().default(true),
  theme: ThemePreferencesSchema.prefault({}),
  motionPreference: z.enum(['system', 'reduced']).default('system'),
  mode: z.enum(['off', 'fixed', 'random', 'case']).default('fixed'),
  effect: EffectReferenceSchema.default({ id: 'fluid-morph', version: '1.0.0' }),
  pool: z.array(EffectReferenceSchema).max(32).default([
    { id: 'fluid-morph', version: '1.0.0' }, { id: 'spring-reflow', version: '1.0.0' }, { id: 'ripple-reveal', version: '1.0.0' },
  ]),
  seed: z.number().int().min(0).max(4294967295).default(42),
  parameters: EffectParametersSchema.prefault({}),
  caseRules: z.record(Id, EffectRuleSchema).default({}),
  transitionRules: z.record(Id, EffectRuleSchema).default({}),
})
```

## EffectDefinitionSchema

Quelle: `packages/contracts/src/effects.ts:45`.

```typescript
EffectDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), ...EffectReferenceSchema.shape,
  title: z.string().min(1), description: z.string().min(1),
  category: z.enum(['shape', 'motion', 'light']),
  engine: z.enum(['typegpu', 'cpu']),
  backends: z.array(z.enum(['webgpu', 'webgl2'])).min(1),
  requiresCompute: z.boolean().default(false),
  maxNodes: z.number().int().positive().max(100000),
  fallback: EffectReferenceSchema.optional(),
  style: z.enum(['classic', 'elegant', 'balanced', 'experimental']).default('classic'),
  frequencyLabel: z.string().min(1).max(80).default('Frequenz'),
  recommendedParameters: EffectParametersSchema.prefault({}),
})
```

## RenderCapabilitiesSchema

Quelle: `packages/contracts/src/effects.ts:59`.

```typescript
RenderCapabilitiesSchema = z.strictObject({
  backend: z.enum(['webgpu', 'webgl2', 'unavailable']),
  typegpu: z.boolean(), compute: z.boolean(), reducedMotion: z.boolean(),
})
```

## EffectPresentationSchema

Quelle: `packages/contracts/src/effects.ts:64`.

```typescript
EffectPresentationSchema = z.strictObject({
  quality: z.enum(['compact', 'standard']),
  anchor: z.strictObject({ x: z.number().finite(), y: z.number().finite() }),
  groupOrder: z.array(Id).max(10000),
  particleBudget: z.number().int().min(0).max(2048),
  targetEdge: z.number().int().positive().max(2048),
}).superRefine((presentation, ctx) => {
  if (new Set(presentation.groupOrder).size !== presentation.groupOrder.length) ctx.addIssue({ code: 'custom', message: 'Duplicate effect group' });
  if (presentation.quality === 'compact' && (presentation.particleBudget > 512 || presentation.targetEdge > 1024)) ctx.addIssue({ code: 'custom', message: 'Compact effect budget exceeded' });
})
```

## ResolvedEffectPlanSchema

Quelle: `packages/contracts/src/effects.ts:74`.

```typescript
ResolvedEffectPlanSchema = z.strictObject({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), id: Id, eventId: Id, eventType: Id, caseId: Id,
  policyVersion: z.literal(EFFECT_POLICY_VERSION),
  sourceState: Id, targetState: Id,
  sourceRevision: z.number().int().nonnegative(), targetRevision: z.number().int().positive(),
  mode: z.enum(['off', 'fixed', 'random', 'case']),
  policySource: z.enum(['project', 'case', 'transition', 'master']),
  requested: EffectReferenceSchema.nullable(), selected: EffectReferenceSchema.nullable(),
  seed: z.number().int().min(0).max(4294967295),
  parameters: EffectParametersSchema.extend({ durationMs: z.number().int().min(0).max(10000) }),
  capabilities: RenderCapabilitiesSchema,
  fallbackReason: z.string().max(1000).nullable(),
  protectedNodeIds: z.array(Id).max(10000),
  presentation: EffectPresentationSchema.optional(),
}).superRefine((plan, ctx) => {
  if (plan.schemaVersion === 1 && plan.presentation) ctx.addIssue({ code: 'custom', message: 'Legacy effect plans cannot carry a new presentation profile' });
})
```

## VisualStateSchema

Quelle: `packages/contracts/src/effects.ts:92`.

```typescript
VisualStateSchema = z.strictObject({
  revision: z.number().int().nonnegative(), settings: EffectSettingsSchema,
  capabilities: RenderCapabilitiesSchema,
  plans: z.array(ResolvedEffectPlanSchema).max(500),
  current: ResolvedEffectPlanSchema.nullable(),
})
```

## IdentifierSchema

Quelle: `packages/contracts/src/index.ts:9`.

```typescript
IdentifierSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/)
```

## JsonSchema

Quelle: `packages/contracts/src/index.ts:10`.

```typescript
JsonSchema = z.json()
```

## ModeSchema

Quelle: `packages/contracts/src/index.ts:12`.

```typescript
ModeSchema = z.enum(['manual', 'hybrid', 'auto'])
```

## BackendModeSchema

Quelle: `packages/contracts/src/index.ts:13`.

```typescript
BackendModeSchema = z.enum(['webgpu-first', 'webgpu-only', 'webgl2'])
```

## ColorSchema

Quelle: `packages/contracts/src/index.ts:16`.

```typescript
ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)
```

## NodeKindSchema

Quelle: `packages/contracts/src/index.ts:17`.

```typescript
NodeKindSchema = z.enum(['box', 'surface', 'text', 'icon', 'image', 'button', 'input', 'progress', 'card', 'select', 'checkbox', 'form', 'wizard', 'table', 'nav', 'modal', 'grid', 'flow', 'stack'])
```

## PartDefinitionSchema

Quelle: `packages/contracts/src/index.ts:18`.

```typescript
PartDefinitionSchema = z.strictObject({
  componentId: IdentifierSchema,
  part: IdentifierSchema,
  behavior: z.enum(['presentation', 'button', 'textbox', 'checkbox', 'progressbar', 'status']),
})
```

## SceneNodeSchema

Quelle: `packages/contracts/src/index.ts:24`.

```typescript
SceneNodeSchema = z.strictObject({
  id: IdentifierSchema,
  anatomy: PartDefinitionSchema,
  kind: NodeKindSchema,
  text: z.string().max(10000).default(''),
  /** Optional content language/direction for imported text and editable mixed-script values. */
  textLanguage: z.string().min(1).max(80).refine(value => { try { return Intl.getCanonicalLocales(value).length === 1; } catch { return false; } }).optional(),
  textDirection: z.enum(['auto','ltr','rtl']).optional(),
  /** Logical inline offset; absolute diagrams keep their physical x coordinate. */
  inlineStart: z.number().finite().optional(),
  binding: IdentifierSchema.optional(),
  sensitive: z.boolean().default(false),
  x: z.number().finite().default(0), y: z.number().finite().default(0),
  width: z.number().positive().max(10000).default(240), height: z.number().positive().max(10000).default(48),
  color: ColorSchema.default('#263749'), foreground: ColorSchema.default('#f3f6fa'),
  radius: z.number().nonnegative().max(1000).default(12),
  fontSize: z.number().min(8).max(100).default(16),
  textInset: z.number().nonnegative().max(100).default(16),
  textInsetY: z.number().nonnegative().max(100).optional(),
  textLines: z.number().int().min(1).max(20).optional(),
  opacity: z.number().min(0).max(1).default(1),
  /** Independent decorative opacity; glyphs and native controls retain opacity. */
  panelOpacity: z.number().min(0).max(1).optional(),
  motion: SceneMotionSchema.optional(),
  rotation: z.number().finite().default(0),
  layer: z.number().int().min(-100).max(100).default(0),
  semantics: z.strictObject({
    role: z.enum(['table', 'row', 'columnheader', 'cell', 'group', 'region', 'dialog']).optional(),
    parentId: IdentifierSchema.optional(),
    sort: z.enum(['ascending', 'descending']).optional(),
    columnIndex: z.number().int().nonnegative().optional(),
  }).optional(),
  onActivate: IdentifierSchema.optional(),
  onEscape: IdentifierSchema.optional(),
  focusReturn: IdentifierSchema.optional(),
  onVisual: VisualCommandSchema.optional(),
  onCollection: z.strictObject({ id: IdentifierSchema, operation: z.enum(['all', 'clear']) }).optional(),
  collection: z.strictObject({ id: IdentifierSchema, itemId: IdentifierSchema }).optional(),
  checked: z.boolean().optional(),
  label: z.string().max(1000).optional(),
  disabled: z.boolean().default(false),
  pressed: z.boolean().optional(),
  progress: z.number().min(0).max(1).default(0),
})
```

## FieldValueSchema

Quelle: `packages/contracts/src/index.ts:70`.

```typescript
FieldValueSchema = z.union([z.string(), z.number().finite(), z.boolean(), z.array(IdentifierSchema).max(10000)])
```

## FieldSchema

Quelle: `packages/contracts/src/index.ts:72`.

```typescript
FieldSchema = z.strictObject({
  id: IdentifierSchema,
  type: z.enum(['text', 'number', 'boolean', 'keys']).default('text'),
  initial: FieldValueSchema.default(''),
  maxLength: z.number().int().positive().max(100000).default(2000),
  sensitive: z.boolean().default(false),
})
```

## CollectionDefinitionSchema

Quelle: `packages/contracts/src/index.ts:83`.

```typescript
CollectionDefinitionSchema = z.strictObject({
  id: IdentifierSchema, field: IdentifierSchema,
  items: z.array(z.strictObject({ id: IdentifierSchema, label: z.string().min(1), disabled: z.boolean().default(false) })).max(10000),
}).superRefine((value, ctx) => {
  if (new Set(value.items.map(item => item.id)).size !== value.items.length) ctx.addIssue({ code: 'custom', message: 'Duplicate collection item' });
})
```

## TransitionSchema

Quelle: `packages/contracts/src/index.ts:89`.

```typescript
TransitionSchema = z.strictObject({
  target: IdentifierSchema,
  guard: IdentifierSchema.optional(),
  action: IdentifierSchema.optional(),
  reversible: z.boolean().default(true),
  aiAllowed: z.boolean().default(false),
  duration: z.number().nonnegative().max(10000).default(420),
  assign: z.record(IdentifierSchema, FieldValueSchema).default({}),
  effect: EffectRuleSchema.optional(),
})
```

## StateSchema

Quelle: `packages/contracts/src/index.ts:99`.

```typescript
StateSchema = z.strictObject({
  label: z.string().min(1).max(200),
  route: z.string().regex(/^\/(?!\/)[^?#]*$/).optional(),
  nodes: z.array(SceneNodeSchema).max(10000),
  projection: IdentifierSchema.optional(),
  on: z.record(IdentifierSchema, TransitionSchema).default({}),
})
```

## FlowDefinitionSchema

Quelle: `packages/contracts/src/index.ts:106`.

```typescript
FlowDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1).default(1),
  id: IdentifierSchema,
  name: z.string().min(1).max(200),
  initial: IdentifierSchema,
  fields: z.array(FieldSchema).default([]),
  collections: z.array(CollectionDefinitionSchema).default([]),
  visualEffects: EffectSettingsSchema.optional(),
  states: z.record(IdentifierSchema, StateSchema),
}).superRefine((flow, ctx) => {
  if (!flow.states[flow.initial]) ctx.addIssue({ code: 'custom', message: 'Initial state does not exist', path: ['initial'] });
  const fieldIds = new Set<string>();
  for (const field of flow.fields) {
    if (fieldIds.has(field.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate field ID', path: ['fields'] });
    fieldIds.add(field.id);
    if (!isFieldValue(field, field.initial)) ctx.addIssue({ code: 'custom', message: 'Field initial value has wrong type', path: ['fields'] });
  }
  if (new Set(flow.collections.map(collection => collection.id)).size !== flow.collections.length) ctx.addIssue({ code: 'custom', message: 'Duplicate collection ID' });
  if (new Set(flow.collections.map(collection => collection.field)).size !== flow.collections.length) ctx.addIssue({ code: 'custom', message: 'Collection field has multiple owners' });
  for (const collection of flow.collections) {
    const field = flow.fields.find(field => field.id === collection.field);
    if (field?.type !== 'keys' || !Array.isArray(field.initial) || field.initial.some(key => !collection.items.some(item => item.id === key && !item.disabled))) ctx.addIssue({ code: 'custom', message: 'Collection requires valid controlled keys' });
  }
  const routes = new Set<string>();
  for (const [id, state] of Object.entries(flow.states)) {
    if (state.route && routes.has(state.route)) ctx.addIssue({ code: 'custom', message: 'Duplicate route', path: ['states', id, 'route'] });
    if (state.route) routes.add(state.route);
    const nodes = new Set<string>();
    const parts = new Set<string>();
    for (const node of state.nodes) {
      if (nodes.has(node.id)) ctx.addIssue({ code: 'custom', message: 'Duplicate node ID', path: ['states', id, 'nodes'] });
      nodes.add(node.id);
      const key = `${node.anatomy.componentId}:${node.anatomy.part}`;
      if (parts.has(key)) ctx.addIssue({ code: 'custom', message: 'Duplicate component part', path: ['states', id, 'nodes'] });
      parts.add(key);
      if (node.binding && !fieldIds.has(node.binding)) ctx.addIssue({ code: 'custom', message: 'Unknown field binding', path: ['states', id, 'nodes'] });
      if (node.onActivate && !state.on[node.onActivate]) ctx.addIssue({ code: 'custom', message: 'Unknown activation event', path: ['states', id, 'nodes'] });
      if (node.onEscape && !state.on[node.onEscape]) ctx.addIssue({ code: 'custom', message: 'Unknown dismissal event', path: ['states', id, 'nodes'] });
      if (node.focusReturn) {
        const target = state.nodes.find(item => item.id === node.focusReturn);
        const collectionDisabled = target?.collection && flow.collections.find(collection => collection.id === target.collection?.id)?.items.find(item => item.id === target.collection?.itemId)?.disabled;
        if (!target || !['button', 'textbox', 'checkbox'].includes(target.anatomy.behavior) || target.disabled || collectionDisabled || target.opacity <= 0.05) ctx.addIssue({ code: 'custom', message: 'Focus return requires an available interactive target', path: ['states', id, 'nodes'] });
      }
      if (node.anatomy.behavior === 'button' && !node.onActivate && !node.onVisual && !node.onCollection) ctx.addIssue({ code: 'custom', message: 'Button behavior requires an activation event or visual command', path: ['states', id, 'nodes'] });
      if ([node.onActivate, node.onVisual, node.onCollection].filter(Boolean).length > 1) ctx.addIssue({ code: 'custom', message: 'A button must have one authority', path: ['states', id, 'nodes'] });
      if (node.onCollection && (node.anatomy.behavior !== 'button' || !flow.collections.some(collection => collection.id === node.onCollection?.id))) ctx.addIssue({ code: 'custom', message: 'Unknown collection command' });
      if (node.anatomy.behavior === 'checkbox') {
        const collection = flow.collections.find(collection => collection.id === node.collection?.id);
        if (!collection?.items.some(item => item.id === node.collection?.itemId) || typeof node.checked !== 'boolean') ctx.addIssue({ code: 'custom', message: 'Checkbox requires controlled collection membership' });
      } else if (node.collection || node.checked !== undefined) ctx.addIssue({ code: 'custom', message: 'Collection state requires checkbox behavior' });
      if (node.onVisual && node.anatomy.behavior !== 'button') ctx.addIssue({ code: 'custom', message: 'Visual commands require button behavior', path: ['states', id, 'nodes'] });
      if (node.onActivate && node.anatomy.behavior !== 'button') ctx.addIssue({ code: 'custom', message: 'Only button behavior can activate a transition', path: ['states', id, 'nodes'] });
      if (node.pressed !== undefined && node.anatomy.behavior !== 'button') ctx.addIssue({ code: 'custom', message: 'Pressed state requires button behavior', path: ['states', id, 'nodes'] });
      if (node.anatomy.behavior === 'textbox' && !flow.fields.some(field => field.id === node.binding && field.type === 'text')) ctx.addIssue({ code: 'custom', message: 'Textbox behavior requires a controlled text field', path: ['states', id, 'nodes'] });
      if (['button', 'textbox', 'checkbox', 'progressbar'].includes(node.anatomy.behavior) && !(node.label || node.text || node.binding)) ctx.addIssue({ code: 'custom', message: 'Interactive parts require an accessible name', path: ['states', id, 'nodes'] });
      const parentId = node.semantics?.parentId;
      const parent = state.nodes.find(item => item.id === parentId);
      if (parentId && !parent) ctx.addIssue({ code: 'custom', message: 'Unknown semantic parent', path: ['states', id, 'nodes'] });
      if (node.semantics?.sort && node.semantics.role !== 'columnheader') ctx.addIssue({ code: 'custom', message: 'Sort belongs to a column header', path: ['states', id, 'nodes'] });
      if (node.semantics?.columnIndex !== undefined && !['cell', 'columnheader'].includes(node.semantics.role ?? '')) ctx.addIssue({ code: 'custom', message: 'Column order requires a table cell' });
      if (node.semantics?.role === 'row' && parent?.semantics?.role !== 'table') ctx.addIssue({ code: 'custom', message: 'Row requires a table parent', path: ['states', id, 'nodes'] });
      if (['cell', 'columnheader'].includes(node.semantics?.role ?? '') && parent?.semantics?.role !== 'row') ctx.addIssue({ code: 'custom', message: 'Cell requires a row parent', path: ['states', id, 'nodes'] });
      const ancestors = new Set([node.id]);
      let ancestor = parent;
      while (ancestor) {
        if (ancestors.has(ancestor.id)) { ctx.addIssue({ code: 'custom', message: 'Cyclic semantic tree', path: ['states', id, 'nodes'] }); break; }
        ancestors.add(ancestor.id);
        ancestor = state.nodes.find(item => item.id === ancestor?.semantics?.parentId);
      }
    }
    for (const [event, transition] of Object.entries(state.on)) {
      if (!flow.states[transition.target]) ctx.addIssue({ code: 'custom', message: 'Unknown target state', path: ['states', id, 'on', event] });
      if (transition.aiAllowed && (!transition.reversible || transition.action)) ctx.addIssue({ code: 'custom', message: 'AI transitions must be reversible and have no external action', path: ['states', id, 'on', event] });
      for (const [fieldId, value] of Object.entries(transition.assign)) {
        const field = flow.fields.find(item => item.id === fieldId);
        if (!field || !isFieldValue(field, value)) ctx.addIssue({ code: 'custom', message: 'Invalid transition field assignment', path: ['states', id, 'on', event, 'assign'] });
      }
    }
  }
})
```

## ComponentDefinitionSchema

Quelle: `packages/contracts/src/index.ts:188`.

```typescript
ComponentDefinitionSchema = MultipartComponentDefinitionSchema
```

## RuntimeSnapshotSchema

Quelle: `packages/contracts/src/index.ts:190`.

```typescript
RuntimeSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1), flowId: IdentifierSchema, state: IdentifierSchema,
  revision: z.number().int().nonnegative(), mode: ModeSchema,
  fields: z.record(IdentifierSchema, FieldValueSchema),
})
```

## InteractionSnapshotSchema

Quelle: `packages/contracts/src/index.ts:196`.

```typescript
InteractionSnapshotSchema = z.strictObject({
  revision: z.number().int().nonnegative(),
  focusedId: IdentifierSchema.nullable(), hoveredId: IdentifierSchema.nullable(),
  pressedId: IdentifierSchema.nullable(), composingId: IdentifierSchema.nullable(),
})
```

## ChangeReasonSchema

Quelle: `packages/contracts/src/index.ts:202`.

```typescript
ChangeReasonSchema = z.enum(['pointer', 'keyboard', 'input', 'programmatic', 'ai', 'replay'])
```

## RuntimeEventSchema

Quelle: `packages/contracts/src/index.ts:204`.

```typescript
RuntimeEventSchema = z.strictObject({
  id: IdentifierSchema, type: IdentifierSchema,
  source: z.enum(['user', 'host', 'ai', 'replay', 'system']),
  timestamp: z.number().finite().nonnegative(),
  expectedRevision: z.number().int().nonnegative().optional(),
  reason: ChangeReasonSchema.optional(),
  payload: z.record(z.string(), JsonSchema).default({}),
})
```

## DecisionPlanSchema

Quelle: `packages/contracts/src/index.ts:213`.

```typescript
DecisionPlanSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, flowId: IdentifierSchema,
  snapshotRevision: z.number().int().nonnegative(), policyVersion: IdentifierSchema,
  expiresAt: z.number().finite().positive(), eventType: IdentifierSchema,
  explanation: z.string().min(1).max(1000),
})
```

## TraceEntrySchema

Quelle: `packages/contracts/src/index.ts:220`.

```typescript
TraceEntrySchema = z.strictObject({
  schemaVersion: z.literal(1), sequence: z.number().int().nonnegative(),
  timestamp: z.number().finite().nonnegative(),
  kind: z.enum(['accepted', 'rejected', 'decision', 'effect', 'error', 'interaction']),
  source: RuntimeEventSchema.shape.source.optional(),
  reason: ChangeReasonSchema.optional(),
  eventId: IdentifierSchema, eventType: IdentifierSchema,
  revision: z.number().int().nonnegative(), state: IdentifierSchema,
  detail: z.string().max(2000),
})
```

## ScenarioDefinitionSchema

Quelle: `packages/contracts/src/index.ts:231`.

```typescript
ScenarioDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1),
  flowId: IdentifierSchema, seed: z.number().int().default(1),
  events: z.array(RuntimeEventSchema).max(10000),
  expectedState: IdentifierSchema,
  expectedFields: z.record(IdentifierSchema, z.union([z.string(), z.number(), z.boolean()])).default({}),
})
```

## DatasetSchema

Quelle: `packages/contracts/src/index.ts:239`.

```typescript
DatasetSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1).max(200),
  caseId: IdentifierSchema, source: z.string().min(1).max(2000),
  capturedAt: z.iso.datetime(), records: z.array(z.record(z.string(), JsonSchema)).max(100000),
})
```

## ProjectSchema

Quelle: `packages/contracts/src/index.ts:245`.

```typescript
ProjectSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1).max(200),
  revision: z.number().int().nonnegative(), flows: z.array(FlowDefinitionSchema).min(1),
  scenarios: z.array(ScenarioDefinitionSchema).default([]),
}).superRefine((value, ctx) => {
  const ids = new Set(value.flows.map(flow => flow.id));
  if (ids.size !== value.flows.length) ctx.addIssue({ code: 'custom', message: 'Duplicate flow ID' });
  for (const scenario of value.scenarios) if (!ids.has(scenario.flowId)) ctx.addIssue({ code: 'custom', message: 'Unknown scenario flow' });
})
```

## VisualScenarioV2Schema

Quelle: `packages/contracts/src/index.ts:264`.

```typescript
VisualScenarioV2Schema = z.strictObject({ schemaVersion: z.literal(2), ...VisualScenarioFields })
```

## VisualScenarioV3Schema

Quelle: `packages/contracts/src/index.ts:265`.

```typescript
VisualScenarioV3Schema = z.strictObject({ schemaVersion: z.literal(3), ...VisualScenarioFields, sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null), protectedNodeIds: z.array(IdentifierSchema).max(10000).default([]) })
```

## VisualScenarioV4Schema

Quelle: `packages/contracts/src/index.ts:266`.

```typescript
VisualScenarioV4Schema = z.strictObject({ schemaVersion: z.literal(4), ...VisualScenarioFields,
  source: z.array(SceneNodeSchema).max(MOTION_LIMITS.presentedNodes), target: z.array(SceneNodeSchema).max(MOTION_LIMITS.sceneNodes),
  motionVersion: z.literal(2), motionPlan: MotionPlanSchema,
  sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null), protectedNodeIds: z.array(IdentifierSchema).max(MOTION_LIMITS.presentedNodes).default([]),
})
```

## RecordingLanguageProfileSchema

Quelle: `packages/contracts/src/index.ts:271`.

```typescript
RecordingLanguageProfileSchema = z.strictObject({
  context: LocaleContextSchema,
  catalogFingerprint: z.string().min(1).max(160).nullable(),
  fontFingerprints: z.array(z.string().regex(/^[a-f0-9]{64}$/)).min(1).max(32),
  buildId: z.string().min(1).max(160).nullable(),
})
```

## VisualScenarioV5Schema

Quelle: `packages/contracts/src/index.ts:278`.

```typescript
VisualScenarioV5Schema = VisualScenarioV4Schema.extend({
  schemaVersion: z.literal(5),
  languageProfile: RecordingLanguageProfileSchema,
  motionVersion: z.union([z.literal(1), z.literal(2)]),
  motionPlan: MotionPlanSchema.optional(),
}).superRefine((record, ctx) => {
  if ((record.motionVersion === 2) !== Boolean(record.motionPlan)) ctx.addIssue({code:'custom',message:'Recorded sampler and motion plan must agree.'});
})
```

## VisualScenarioSchema

Quelle: `packages/contracts/src/index.ts:286`.

```typescript
VisualScenarioSchema = z.discriminatedUnion('schemaVersion', [VisualScenarioV2Schema, VisualScenarioV3Schema, VisualScenarioV4Schema, VisualScenarioV5Schema]).superRefine((scenario, ctx) => {
  if ([...scenario.source, ...scenario.target].reduce((sum, node) => sum + node.text.length, 0) > 100000) ctx.addIssue({ code: 'custom', message: 'Scenario text budget exceeded' });
  for (const nodes of [scenario.source, scenario.target]) {
    if (new Set(nodes.map(node => node.id)).size !== nodes.length) ctx.addIssue({ code: 'custom', message: 'Duplicate scenario node' });
    if (nodes.some(node => Math.abs(node.x) > 100000 || Math.abs(node.y) > 100000)) ctx.addIssue({ code: 'custom', message: 'Scenario bounds exceed budget' });
  }
  if (scenario.schemaVersion !== 2 && scenario.sourceCheckpoint) {
    const sourceIds = new Set(scenario.source.map(node => node.id));
    const componentIds = new Set(scenario.source.map(node => node.anatomy.componentId));
    if (scenario.sourceCheckpoint.nodeStates.some(state => !sourceIds.has(state.id))) ctx.addIssue({ code: 'custom', message: 'Checkpoint refers to an unknown source node' });
    if (scenario.sourceCheckpoint.particles.some(particle => !componentIds.has(particle.componentId))) ctx.addIssue({ code: 'custom', message: 'Checkpoint refers to an unknown source component' });
    if (scenario.sourceCheckpoint.motion?.velocities.some(value => !sourceIds.has(value.id))) ctx.addIssue({ code: 'custom', message: 'Motion checkpoint refers to an unknown source node' });
  }
})
```

## TextInkBoxSchema

Quelle: `packages/contracts/src/index.ts:300`.

```typescript
TextInkBoxSchema=z.strictObject({id:IdentifierSchema,line:z.number().int().nonnegative(),x:z.number(),y:z.number(),width:z.number().nonnegative(),height:z.number().nonnegative()})
```

## TextAuditSchema

Quelle: `packages/contracts/src/index.ts:302`.

```typescript
TextAuditSchema=z.strictObject({
  scale:z.number().positive(),viewport:z.strictObject({width:z.number().positive(),height:z.number().positive()}),
  backend:z.enum(['webgpu','webgl2']),progress:z.number().min(0).max(1),checkedNodes:z.number().int().nonnegative(),hiddenDuringMotion:z.number().int().nonnegative(),
  boxes:z.array(TextInkBoxSchema),
  textStyles:z.array(z.strictObject({id:IdentifierSchema,componentId:IdentifierSchema,part:IdentifierSchema,fontSize:z.number().positive()})).default([]),
  issues:z.array(z.strictObject({kind:z.enum(['overlap','outside-node','missing-glyphs','truncated']),nodes:z.array(IdentifierSchema),detail:z.string(),severity:z.enum(['error','warning'])})),
})
```

## RestagedRecordingSchema

Quelle: `packages/contracts/src/index.ts:311`.

```typescript
RestagedRecordingSchema = z.strictObject({
  schemaVersion:z.literal(1), kind:z.literal('restaged-recording'), sourceRecordingSha256:z.string().regex(/^[a-f0-9]{64}$/),
  recording:VisualScenarioSchema.refine(record => record.schemaVersion === 5, 'A restaged run requires a language profile'),
})
```

## NativeInputContextSchema

Quelle: `packages/contracts/src/input-observation.ts:3`.

```typescript
NativeInputContextSchema = z.enum(['unspecified', 'native-dead-key', 'native-japanese-ime', 'synthetic-qa-fixture'])
```

## NativeInputObservationSchema

Quelle: `packages/contracts/src/input-observation.ts:4`.

```typescript
NativeInputObservationSchema = z.strictObject({
  type: z.enum(['compositionstart', 'compositionupdate', 'compositionend', 'input', 'select', 'focus', 'blur']),
  elapsedMs: z.number().nonnegative(), nodeId: z.string(), isTrusted: z.boolean(),
  inputType: z.string().nullable(), isComposing: z.boolean().nullable(),
  valueLength: z.number().int().nonnegative(), dataLength: z.number().int().nonnegative().nullable(),
  selectionStart: z.number().int().nonnegative().nullable(), selectionEnd: z.number().int().nonnegative().nullable(),
  selectionDirection: z.enum(['forward', 'backward', 'none']).nullable(),
  focusedId: z.string().nullable(), composingId: z.string().nullable(), revision: z.number().int().nonnegative(),
})
```

## NativeInputProtocolSchema

Quelle: `packages/contracts/src/input-observation.ts:14`.

```typescript
NativeInputProtocolSchema = z.strictObject({
  schemaVersion: z.literal(1), buildId: z.string(), createdAt: z.iso.datetime(),
  context: NativeInputContextSchema, scope: z.literal('opt-in-observed-dom-events'),
  contentPolicy: z.literal('lengths-and-selection-only-no-input-content'), truncated: z.boolean(),
  events: z.array(NativeInputObservationSchema).max(500),
})
```

## ResourceKindSchema

Quelle: `packages/contracts/src/lifecycle.ts:3`.

```typescript
ResourceKindSchema = z.enum(['surface', 'device', 'renderer', 'font', 'glyph-handle', 'geometry', 'material', 'text', 'texture', 'render-target', 'listener', 'observer', 'animation-frame', 'pending-job'])
```

## ResourceSnapshotSchema

Quelle: `packages/contracts/src/lifecycle.ts:4`.

```typescript
ResourceSnapshotSchema = z.strictObject({
  live: z.record(ResourceKindSchema, z.number().int().nonnegative()),
  peak: z.record(ResourceKindSchema, z.number().int().nonnegative()),
  owners: z.number().int().nonnegative(), disposalErrors: z.array(z.string()),
})
```

## LifecycleRunSchema

Quelle: `packages/contracts/src/lifecycle.ts:9`.

```typescript
LifecycleRunSchema = z.strictObject({
  schemaVersion: z.literal(1), startedAt: z.iso.datetime(), completedAt: z.iso.datetime(),
  buildId: z.string(), requestedCycles: z.number().int().positive(),
  backend: z.enum(['webgpu', 'webgl2']),
  samples: z.array(z.strictObject({ cycle: z.number().int().positive(), frames: z.number().int().nonnegative(), idleFrameDelta: z.number().int().nonnegative(), textBytesWhileMounted: z.number().nonnegative(), coreSubscriptionsAfterDispose:z.number().int().nonnegative(), pendingActionsAfterDispose:z.number().int().nonnegative(), domNodesAfterUnmount:z.number().int().nonnegative(), afterDispose: ResourceSnapshotSchema })),
  failures: z.array(z.string()),
  memoryScope: z.literal('Owned resource counts and Glyph-reported buffer bytes; driver and process memory not measured'),
})
```

## LoadPolicySchema

Quelle: `packages/contracts/src/load.d.ts:2`.

```typescript
LoadPolicySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    baselineMs: z.ZodNumber;
    afterMs: z.ZodNumber;
    maxGapMs: z.ZodNumber;
    maxCollectionMs: z.ZodNumber;
    minimumBaselineIdlePct: z.ZodNumber;
    maximumOtherMachineCpuPct: z.ZodNumber;
    maximumOtherSingleCoreCpuPct: z.ZodNumber;
    maximumToolingCoreCpuPct: z.ZodNumber;
    maximumCollectorCoreCpuPct: z.ZodNumber;
    maximumSwapGrowthBytes: z.ZodNumber;
    maximumSwapIoBytes: z.ZodNumber;
}, z.core.$strict>
```

## LoadProcessSchema

Quelle: `packages/contracts/src/load.d.ts:34`.

```typescript
LoadProcessSchema: z.ZodObject<{
    pid: z.ZodNumber;
    ppid: z.ZodNumber;
    startedAt: z.ZodISODateTime;
    name: z.ZodString;
    cpuTotalMs: z.ZodNumber;
    cpuCorePct: z.ZodNullable<z.ZodNumber>;
    cpuMachinePct: z.ZodNullable<z.ZodNumber>;
    group: z.ZodEnum<{
        target: "target";
        collector: "collector";
        "declared-tooling": "declared-tooling";
        "suspected-tooling": "suspected-tooling";
        other: "other";
    }>;
    basis: z.ZodEnum<{
        "explicit-pid": "explicit-pid";
        "observed-ancestry": "observed-ancestry";
        "name-hint-only": "name-hint-only";
        unclassified: "unclassified";
    }>;
}, z.core.$strict>
```

## LoadGpuSchema

Quelle: `packages/contracts/src/load.d.ts:57`.

```typescript
LoadGpuSchema: z.ZodObject<{
    source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
    attribution: z.ZodEnum<{
        unavailable: "unavailable";
        "diagnostic-only": "diagnostic-only";
    }>;
    counterUnit: z.ZodLiteral<"unknown">;
    adapters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
        rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
        tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    clients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pid: z.ZodNumber;
        api: z.ZodString;
        accumulatedRaw: z.ZodString;
        deltaRaw: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodString>;
}, z.core.$strict>
```

## LoadMemorySchema

Quelle: `packages/contracts/src/load.d.ts:80`.

```typescript
LoadMemorySchema: z.ZodObject<{
    source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
    pressure: z.ZodEnum<{
        unknown: "unknown";
        warning: "warning";
        normal: "normal";
        critical: "critical";
    }>;
    pressureRaw: z.ZodNullable<z.ZodNumber>;
    totalBytes: z.ZodNullable<z.ZodNumber>;
    freeBytes: z.ZodNullable<z.ZodNumber>;
    compressedBytes: z.ZodNullable<z.ZodNumber>;
    swapBytes: z.ZodNullable<z.ZodNumber>;
    pageSize: z.ZodNullable<z.ZodNumber>;
    swapinsPages: z.ZodNullable<z.ZodNumber>;
    swapoutsPages: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>
```

## LoadSampleSchema

Quelle: `packages/contracts/src/load.d.ts:97`.

```typescript
LoadSampleSchema: z.ZodObject<{
    index: z.ZodNumber;
    observedAt: z.ZodISODateTime;
    monotonicMs: z.ZodNumber;
    collectionDurationMs: z.ZodNumber;
    intervalStartedAt: z.ZodNullable<z.ZodISODateTime>;
    intervalMs: z.ZodNullable<z.ZodNumber>;
    cpu: z.ZodObject<{
        source: z.ZodLiteral<"top-delta+ps-cumulative">;
        idlePct: z.ZodNullable<z.ZodNumber>;
        userPct: z.ZodNullable<z.ZodNumber>;
        systemPct: z.ZodNullable<z.ZodNumber>;
        observedProcessCount: z.ZodNumber;
        activeRowsOmitted: z.ZodNumber;
        newProcessCount: z.ZodNumber;
        exitedProcessCount: z.ZodNumber;
        processes: z.ZodArray<z.ZodObject<{
            pid: z.ZodNumber;
            ppid: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            name: z.ZodString;
            cpuTotalMs: z.ZodNumber;
            cpuCorePct: z.ZodNullable<z.ZodNumber>;
            cpuMachinePct: z.ZodNullable<z.ZodNumber>;
            group: z.ZodEnum<{
                target: "target";
                collector: "collector";
                "declared-tooling": "declared-tooling";
                "suspected-tooling": "suspected-tooling";
                other: "other";
            }>;
            basis: z.ZodEnum<{
                "explicit-pid": "explicit-pid";
                "observed-ancestry": "observed-ancestry";
                "name-hint-only": "name-hint-only";
                unclassified: "unclassified";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    memory: z.ZodObject<{
        source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
        pressure: z.ZodEnum<{
            unknown: "unknown";
            warning: "warning";
            normal: "normal";
            critical: "critical";
        }>;
        pressureRaw: z.ZodNullable<z.ZodNumber>;
        totalBytes: z.ZodNullable<z.ZodNumber>;
        freeBytes: z.ZodNullable<z.ZodNumber>;
        compressedBytes: z.ZodNullable<z.ZodNumber>;
        swapBytes: z.ZodNullable<z.ZodNumber>;
        pageSize: z.ZodNullable<z.ZodNumber>;
        swapinsPages: z.ZodNullable<z.ZodNumber>;
        swapoutsPages: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    gpu: z.ZodObject<{
        source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
        attribution: z.ZodEnum<{
            unavailable: "unavailable";
            "diagnostic-only": "diagnostic-only";
        }>;
        counterUnit: z.ZodLiteral<"unknown">;
        adapters: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
            rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
            tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        clients: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            pid: z.ZodNumber;
            api: z.ZodString;
            accumulatedRaw: z.ZodString;
            deltaRaw: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        issues: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    issues: z.ZodArray<z.ZodString>;
}, z.core.$strict>
```

## LoadReportSchema

Quelle: `packages/contracts/src/load.d.ts:178`.

```typescript
LoadReportSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"local-load-observation">;
    startedAt: z.ZodISODateTime;
    endedAt: z.ZodISODateTime;
    platform: z.ZodLiteral<"darwin">;
    logicalCpus: z.ZodNumber;
    policy: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        id: z.ZodString;
        baselineMs: z.ZodNumber;
        afterMs: z.ZodNumber;
        maxGapMs: z.ZodNumber;
        maxCollectionMs: z.ZodNumber;
        minimumBaselineIdlePct: z.ZodNumber;
        maximumOtherMachineCpuPct: z.ZodNumber;
        maximumOtherSingleCoreCpuPct: z.ZodNumber;
        maximumToolingCoreCpuPct: z.ZodNumber;
        maximumCollectorCoreCpuPct: z.ZodNumber;
        maximumSwapGrowthBytes: z.ZodNumber;
        maximumSwapIoBytes: z.ZodNumber;
    }, z.core.$strict>;
    policySha256: z.ZodString;
    intervalSeconds: z.ZodNumber;
    requestedDurationSeconds: z.ZodNumber;
    targetPids: z.ZodArray<z.ZodNumber>;
    toolingPids: z.ZodArray<z.ZodNumber>;
    collectorPid: z.ZodNumber;
    status: z.ZodEnum<{
        failed: "failed";
        aborted: "aborted";
        finished: "finished";
    }>;
    samples: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        observedAt: z.ZodISODateTime;
        monotonicMs: z.ZodNumber;
        collectionDurationMs: z.ZodNumber;
        intervalStartedAt: z.ZodNullable<z.ZodISODateTime>;
        intervalMs: z.ZodNullable<z.ZodNumber>;
        cpu: z.ZodObject<{
            source: z.ZodLiteral<"top-delta+ps-cumulative">;
            idlePct: z.ZodNullable<z.ZodNumber>;
            userPct: z.ZodNullable<z.ZodNumber>;
            systemPct: z.ZodNullable<z.ZodNumber>;
            observedProcessCount: z.ZodNumber;
            activeRowsOmitted: z.ZodNumber;
            newProcessCount: z.ZodNumber;
            exitedProcessCount: z.ZodNumber;
            processes: z.ZodArray<z.ZodObject<{
                pid: z.ZodNumber;
                ppid: z.ZodNumber;
                startedAt: z.ZodISODateTime;
                name: z.ZodString;
                cpuTotalMs: z.ZodNumber;
                cpuCorePct: z.ZodNullable<z.ZodNumber>;
                cpuMachinePct: z.ZodNullable<z.ZodNumber>;
                group: z.ZodEnum<{
                    target: "target";
                    collector: "collector";
                    "declared-tooling": "declared-tooling";
                    "suspected-tooling": "suspected-tooling";
                    other: "other";
                }>;
                basis: z.ZodEnum<{
                    "explicit-pid": "explicit-pid";
                    "observed-ancestry": "observed-ancestry";
                    "name-hint-only": "name-hint-only";
                    unclassified: "unclassified";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        memory: z.ZodObject<{
            source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
            pressure: z.ZodEnum<{
                unknown: "unknown";
                warning: "warning";
                normal: "normal";
                critical: "critical";
            }>;
            pressureRaw: z.ZodNullable<z.ZodNumber>;
            totalBytes: z.ZodNullable<z.ZodNumber>;
            freeBytes: z.ZodNullable<z.ZodNumber>;
            compressedBytes: z.ZodNullable<z.ZodNumber>;
            swapBytes: z.ZodNullable<z.ZodNumber>;
            pageSize: z.ZodNullable<z.ZodNumber>;
            swapinsPages: z.ZodNullable<z.ZodNumber>;
            swapoutsPages: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        gpu: z.ZodObject<{
            source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
            attribution: z.ZodEnum<{
                unavailable: "unavailable";
                "diagnostic-only": "diagnostic-only";
            }>;
            counterUnit: z.ZodLiteral<"unknown">;
            adapters: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
                rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
                tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            clients: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                pid: z.ZodNumber;
                api: z.ZodString;
                accumulatedRaw: z.ZodString;
                deltaRaw: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            issues: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        issues: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodString>;
    gpuQualification: z.ZodLiteral<"diagnostic-only-units-and-coverage-unqualified">;
    optionalPowermetricsCapture: z.ZodNullable<z.ZodObject<{
        sha256: z.ZodString;
        bytes: z.ZodNumber;
        status: z.ZodLiteral<"hash-bound-format-not-qualified">;
    }, z.core.$strict>>;
    limitations: z.ZodArray<z.ZodString>;
}, z.core.$strict>
```

## LoadWindowSchema

Quelle: `packages/contracts/src/load.d.ts:301`.

```typescript
LoadWindowSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    startedAt: z.ZodISODateTime;
    endedAt: z.ZodISODateTime;
    source: z.ZodLiteral<"observed-benchmark-boundary">;
    timingSha256: z.ZodString;
    buildId: z.ZodString;
}, z.core.$strict>
```

## LoadAssessmentSchema

Quelle: `packages/contracts/src/load.d.ts:310`.

```typescript
LoadAssessmentSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"load-window-assessment">;
    result: z.ZodEnum<{
        inconclusive: "inconclusive";
        contaminated: "contaminated";
    }>;
    performanceValidity: z.ZodLiteral<"not-qualified">;
    performanceBudgetResult: z.ZodEnum<{
        passed: "passed";
        failed: "failed";
        inconclusive: "inconclusive";
    }>;
    window: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        startedAt: z.ZodISODateTime;
        endedAt: z.ZodISODateTime;
        source: z.ZodLiteral<"observed-benchmark-boundary">;
        timingSha256: z.ZodString;
        buildId: z.ZodString;
    }, z.core.$strict>;
    baselineSamples: z.ZodNumber;
    benchmarkSamples: z.ZodNumber;
    contamination: z.ZodArray<z.ZodString>;
    unknowns: z.ZodArray<z.ZodString>;
    metrics: z.ZodObject<{
        minimumBaselineIdlePct: z.ZodNullable<z.ZodNumber>;
        maximumOtherMachineCpuPct: z.ZodNumber;
        maximumOtherSingleCoreCpuPct: z.ZodNumber;
        maximumToolingCoreCpuPct: z.ZodNumber;
        maximumCollectorCoreCpuPct: z.ZodNumber;
        swapGrowthBytes: z.ZodNullable<z.ZodNumber>;
        swapIoBytes: z.ZodNullable<z.ZodNumber>;
        diagnosticOtherGpuActiveClients: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>
```

## LoadPolicySchema

Quelle: `packages/contracts/src/load.ts:8`.

```typescript
LoadPolicySchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1).max(80),
  baselineMs: z.number().int().min(5000).max(60000), afterMs: z.number().int().min(1000).max(30000),
  maxGapMs: z.number().int().min(1000).max(10000), maxCollectionMs: z.number().int().min(100).max(5000),
  minimumBaselineIdlePct: Percent, maximumOtherMachineCpuPct: Percent,
  maximumOtherSingleCoreCpuPct: Nonnegative, maximumToolingCoreCpuPct: Nonnegative, maximumCollectorCoreCpuPct: Nonnegative,
  maximumSwapGrowthBytes: Nonnegative, maximumSwapIoBytes: Nonnegative,
})
```

## LoadProcessSchema

Quelle: `packages/contracts/src/load.ts:22`.

```typescript
LoadProcessSchema = z.strictObject({
  pid: Pid, ppid: z.number().int().nonnegative(), startedAt: z.iso.datetime(), name: ShortName,
  cpuTotalMs: Nonnegative, cpuCorePct: Nonnegative.nullable(), cpuMachinePct: Nonnegative.nullable(),
  group: z.enum(['target', 'collector', 'declared-tooling', 'suspected-tooling', 'other']),
  basis: z.enum(['explicit-pid', 'observed-ancestry', 'name-hint-only', 'unclassified']),
})
```

## LoadGpuSchema

Quelle: `packages/contracts/src/load.ts:29`.

```typescript
LoadGpuSchema = z.strictObject({
  source: z.literal('ioreg-IOAccelerator-private'), attribution: z.enum(['diagnostic-only', 'unavailable']),
  counterUnit: z.literal('unknown'),
  adapters: z.array(z.strictObject({ id: Counter, deviceUtilizationPct: Percent.nullable(), rendererUtilizationPct: Percent.nullable(), tilerUtilizationPct: Percent.nullable() })).max(16),
  clients: z.array(z.strictObject({ id: Counter, pid: Pid, api: z.string().max(40), accumulatedRaw: Counter, deltaRaw: Counter.nullable() })).max(2048),
  issues: z.array(z.string().max(200)).max(20),
})
```

## LoadMemorySchema

Quelle: `packages/contracts/src/load.ts:37`.

```typescript
LoadMemorySchema = z.strictObject({
  source: z.literal('meminfo-csv+vm_stat+sysctl'), pressure: z.enum(['normal', 'warning', 'critical', 'unknown']), pressureRaw: z.number().int().nullable(),
  totalBytes: Nonnegative.nullable(), freeBytes: Nonnegative.nullable(), compressedBytes: Nonnegative.nullable(), swapBytes: Nonnegative.nullable(),
  pageSize: z.number().int().positive().nullable(), swapinsPages: Nonnegative.nullable(), swapoutsPages: Nonnegative.nullable(),
})
```

## LoadSampleSchema

Quelle: `packages/contracts/src/load.ts:42`.

```typescript
LoadSampleSchema = z.strictObject({
  index: z.number().int().nonnegative(), observedAt: z.iso.datetime(), monotonicMs: Nonnegative, collectionDurationMs: Nonnegative,
  intervalStartedAt: z.iso.datetime().nullable(), intervalMs: Nonnegative.nullable(),
  cpu: z.strictObject({ source: z.literal('top-delta+ps-cumulative'), idlePct: Percent.nullable(), userPct: Percent.nullable(), systemPct: Percent.nullable(),
    observedProcessCount: z.number().int().nonnegative(), activeRowsOmitted: z.number().int().nonnegative(),
    newProcessCount: z.number().int().nonnegative(), exitedProcessCount: z.number().int().nonnegative(),
    processes: z.array(LoadProcessSchema).max(256) }),
  memory: LoadMemorySchema, gpu: LoadGpuSchema, issues: z.array(z.string().max(200)).max(30),
})
```

## LoadReportSchema

Quelle: `packages/contracts/src/load.ts:52`.

```typescript
LoadReportSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('local-load-observation'), startedAt: z.iso.datetime(), endedAt: z.iso.datetime(),
  platform: z.literal('darwin'), logicalCpus: z.number().int().positive().max(1024),
  policy: LoadPolicySchema, policySha256: z.string().regex(/^[a-f0-9]{64}$/),
  intervalSeconds: z.number().min(1).max(5), requestedDurationSeconds: z.number().min(5).max(300),
  targetPids: z.array(Pid).max(32), toolingPids: z.array(Pid).max(32), collectorPid: Pid,
  status: z.enum(['finished', 'aborted', 'failed']), samples: z.array(LoadSampleSchema).max(301), issues: z.array(z.string().max(200)).max(30),
  gpuQualification: z.literal('diagnostic-only-units-and-coverage-unqualified'),
  optionalPowermetricsCapture: z.strictObject({ sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().nonnegative(), status: z.literal('hash-bound-format-not-qualified') }).nullable(),
  limitations: z.array(z.string()).min(1),
})
```

## LoadWindowSchema

Quelle: `packages/contracts/src/load.ts:64`.

```typescript
LoadWindowSchema = z.strictObject({
  schemaVersion: z.literal(1), startedAt: z.iso.datetime(), endedAt: z.iso.datetime(),
  source: z.literal('observed-benchmark-boundary'), timingSha256: z.string().regex(/^[a-f0-9]{64}$/), buildId: z.string().min(1),
}).refine(window => Date.parse(window.endedAt) > Date.parse(window.startedAt), 'Benchmark window must advance.')
```

## LoadAssessmentSchema

Quelle: `packages/contracts/src/load.ts:69`.

```typescript
LoadAssessmentSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('load-window-assessment'),
  result: z.enum(['contaminated', 'inconclusive']),
  performanceValidity: z.literal('not-qualified'), performanceBudgetResult: z.enum(['passed', 'failed', 'inconclusive']),
  window: LoadWindowSchema, baselineSamples: z.number().int().nonnegative(), benchmarkSamples: z.number().int().nonnegative(),
  contamination: z.array(z.string()), unknowns: z.array(z.string()),
  metrics: z.strictObject({ minimumBaselineIdlePct: Percent.nullable(), maximumOtherMachineCpuPct: Nonnegative,
    maximumOtherSingleCoreCpuPct: Nonnegative, maximumToolingCoreCpuPct: Nonnegative, maximumCollectorCoreCpuPct: Nonnegative,
    swapGrowthBytes: Nonnegative.nullable(), swapIoBytes: Nonnegative.nullable(), diagnosticOtherGpuActiveClients: z.number().int().nonnegative() }),
})
```

## ContentHashSchema

Quelle: `packages/contracts/src/local-project.ts:4`.

```typescript
ContentHashSchema = z.string().regex(/^[a-f0-9]{64}$/)
```

## LocalDraftInputSchema

Quelle: `packages/contracts/src/local-project.ts:5`.

```typescript
LocalDraftInputSchema = z.strictObject({
  expectedRevision: z.number().int().nonnegative(), document: AuthoringDocumentSchema,
  datasetHash: ContentHashSchema, runtimeRevision: z.number().int().nonnegative(),
  origin: z.enum(['manual', 'ai', 'restored']), ai: AuthoringResultSchema.nullable(),
}).superRefine((value, context) => {
  if ((value.origin === 'ai') !== Boolean(value.ai)) context.addIssue({ code: 'custom', message: 'AI versions require matching provenance.' });
  if (value.ai && JSON.stringify(value.ai.document) !== JSON.stringify(value.document)) context.addIssue({ code: 'custom', message: 'AI result does not match saved document.' });
})
```

## LocalDraftVersionSchema

Quelle: `packages/contracts/src/local-project.ts:13`.

```typescript
LocalDraftVersionSchema = z.strictObject({
  schemaVersion: z.literal(1), revision: z.number().int().positive(), createdAt: z.iso.datetime(),
  documentHash: ContentHashSchema, datasetHash: ContentHashSchema, runtimeRevision: z.number().int().nonnegative(),
  document: AuthoringDocumentSchema, origin: z.enum(['manual', 'ai', 'restored']), ai: AuthoringResultSchema.nullable(),
})
```

## LocalDraftListSchema

Quelle: `packages/contracts/src/local-project.ts:19`.

```typescript
LocalDraftListSchema = z.strictObject({ revision: z.number().int().nonnegative(), versions: z.array(LocalDraftVersionSchema).max(1000) })
```

## LocalBudgetSummarySchema

Quelle: `packages/contracts/src/local-project.ts:20`.

```typescript
LocalBudgetSummarySchema = z.strictObject({
  scope: z.literal('local-project'), sessionLimitUsd: z.number(), projectLimitUsd: z.number(),
  sessionChargedOrReservedUsd: z.number(), projectChargedOrReservedUsd: z.number(), activeRequests: z.number().int().nonnegative(),
})
```

## LocalReviewEvidenceSchema

Quelle: `packages/contracts/src/local-project.ts:25`.

```typescript
LocalReviewEvidenceSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('fluid-local-review-evidence'),
  assessment: AIReviewAssessmentSchema,
  frames: z.array(z.strictObject({ frame: AIReviewFrameSchema, imageSha256: ContentHashSchema })).min(1).max(3),
}).superRefine((value, context) => {
  const ids = value.frames.map(item => item.frame.id);
  if (new Set(value.frames.map(item => item.frame.buildId)).size !== 1) context.addIssue({ code: 'custom', message: 'Review evidence mixes build versions.' });
  try { validateReviewReferences(value.assessment.result.output, { frames: value.frames.map(item => item.frame) }); } catch { context.addIssue({ code: 'custom', message: 'Finding refers to an unknown frame, part or invalid image region.' }); }
  if (value.frames.some(item => item.frame.binding && item.frame.binding.imageSha256 !== item.imageSha256)) context.addIssue({ code: 'custom', message: 'Frame binding and archived image hash differ.' });
  if (new Set(ids).size !== ids.length || value.assessment.result.provenance.frameIds.length !== ids.length || value.assessment.result.provenance.frameIds.some(id => !ids.includes(id))) context.addIssue({ code: 'custom', message: 'Evidence must contain every reviewed original frame exactly once.' });
})
```

## M8QualificationSampleSchema

Quelle: `packages/contracts/src/m8-qualification.ts:13`.

```typescript
M8QualificationSampleSchema = OldSample.extend({
  selectedIds: Keys, inspectorOpen: z.literal(true), nativeTargets: NativeTargetAuditSchema,
})
```

## M8QualificationCaseSchema

Quelle: `packages/contracts/src/m8-qualification.ts:16`.

```typescript
M8QualificationCaseSchema = WorkspaceQualificationCaseSchema.extend({
  source: z.enum(['table', 'cards', 'map']), target: z.enum(['table', 'cards', 'map']),
  selectedIds: Keys, inspectorOpen: z.literal(true),
  setupEvents: z.array(z.strictObject({ type: z.string().min(1), revision: z.number().int().nonnegative(), accepted: z.literal(true) })).min(3),
  samples: z.array(M8QualificationSampleSchema).max(5),
})
```

## M8QualificationSchema

Quelle: `packages/contracts/src/m8-qualification.ts:22`.

```typescript
M8QualificationSchema = z.strictObject({
  schemaVersion: z.literal(1), milestone: z.literal('M8'), generatedAt: z.iso.datetime(),
  buildId: z.string().min(1), dataVersion: z.string().min(1), dataSource: z.string().min(1), moduleIds: z.array(z.string().min(1)).min(2),
  scope: z.literal('core-collection-five-checkpoints-native-targets'),
  backend: WorkspaceQualificationSchema.shape.backend, browser: WorkspaceQualificationSchema.shape.browser,
  surface: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }).nullable(),
  selectedIds: Keys, cases: z.array(M8QualificationCaseSchema).max(18),
  result: z.enum(['passed', 'failed', 'inconclusive']), issues: z.array(z.string()), limitations: z.array(z.string()).min(1),
}).superRefine((report, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const sameKeys = (left: string[], right: string[]) => left.length === right.length && [...left].sort().every((key, index) => key === [...right].sort()[index]);
  const keys = report.cases.map(item => `${item.effect}:${item.source}:${item.target}`);
  if (new Set(keys).size !== keys.length) fail('Duplicate matrix case.');
  const frameIds = report.cases.flatMap(item => item.samples.map(sample => sample.frame.id));
  if (new Set(frameIds).size !== frameIds.length) fail('A captured frame cannot cover two checkpoints.');
  if (new Set(report.moduleIds).size !== report.moduleIds.length || report.selectedIds.some(id => !report.moduleIds.includes(id))) fail('Selected IDs must belong to this actual dataset.');
  if (report.cases.some(item => !M8_DIRECTIONS.some(([source, target]) => source === item.source && target === item.target))) fail('Unplanned M8 direction.');
  let imageBytes = 0;
  for (const item of report.cases) {
    if (!sameKeys(item.selectedIds, report.selectedIds)) fail('Case selection differs from the prepared selection.');
    if (!['collection.change', 'inspector.open'].every(type => item.setupEvents.some(event => event.type === type)) || item.setupEvents.some(event => event.revision >= item.revision)) fail('Selection and inspector must be committed before the transition.');
    if (item.recording.plan?.selected?.id !== item.effect || item.recording.plan.sourceState !== item.source || item.recording.plan.targetState !== item.target || item.recording.plan.targetRevision !== item.revision) fail('Recorded plan does not belong to the M8 case.');
    for (const [index, sample] of item.samples.entries()) {
      const phase = M8_PHASES[index];
      if (new Set(sample.geometry.nodes.map(node => node.id)).size !== sample.geometry.nodes.length) fail('Duplicate presented node.');
      if ([sample.frame.progress, sample.textAudit.progress, sample.geometry.progress].some(value => value !== phase)) fail('Checkpoint mismatch.');
      if (sample.frame.backend !== report.backend || sample.textAudit.backend !== report.backend) fail('Backend mismatch.');
      if (!sameKeys(sample.selectedIds, report.selectedIds)) fail('Selection changed during the transition.');
      if (report.result === 'passed' && (phase === 0 || phase === 1)) {
        const expected = phase === 0 ? item.recording.source : item.recording.target;
        const actual = new Map(sample.geometry.nodes.map(node => [node.id, node]));
        const properties = ['x', 'y', 'width', 'height', 'rotation', 'opacity'] as const;
        if (expected.some(node => { const shown = actual.get(node.id); return !shown || properties.some(key => Math.abs(shown[key] - node[key]) > .01); })
          || sample.geometry.nodes.some(node => node.opacity > .01 && !expected.some(target => target.id === node.id))
          || sample.geometry.lensPresent || sample.geometry.particleCount || sample.geometry.shadowCount) fail('Passing endpoints must match the recorded state without effect residues.');
      }
      const surface = report.surface;
      if (!surface || Math.abs(sample.frame.viewport.width - surface.width) > .1 || Math.abs(sample.frame.viewport.height - surface.height) > .1 || Math.abs(sample.frame.viewport.dpr - surface.dpr) > .01 || Math.abs(sample.textAudit.viewport.width - surface.width) > .1 || Math.abs(sample.textAudit.viewport.height - surface.height) > .1) fail('Surface dimensions changed or are missing.');
      const targetControls = item.recording.target.filter(node => ['button', 'checkbox', 'textbox'].includes(node.anatomy.behavior) && sample.geometry.nodes.some(shown => shown.id === node.id));
      if (!sameKeys(sample.nativeTargets.expectedIds, targetControls.map(node => node.id))) fail('Native audit omits a presented current control.');
      for (const observation of sample.nativeTargets.observations) {
        const shown = sample.geometry.nodes.find(node => node.id === observation.id);
        const target = targetControls.find(node => node.id === observation.id);
        if (!shown || !target) { fail('Native observation has no correlated control.'); continue; }
        const width = Math.abs(Math.cos(shown.rotation)) * shown.width + Math.abs(Math.sin(shown.rotation)) * shown.height;
        const height = Math.abs(Math.sin(shown.rotation)) * shown.width + Math.abs(Math.cos(shown.rotation)) * shown.height;
        const bounds = { x: shown.x + (shown.width - width) / 2, y: shown.y + (shown.height - height) / 2, width, height };
        if ((['x', 'y', 'width', 'height'] as const).some(key => Math.abs(observation.expected[key] - bounds[key]) > .00001)) fail('Native expected bounds differ from the recorded presentation.');
        if (observation.componentId !== target.anatomy.componentId || observation.part !== target.anatomy.part || observation.expectedChecked !== (target.anatomy.behavior === 'checkbox' ? Boolean(target.checked) : null)) fail('Native observation has wrong part identity or checked expectation.');
      }
      imageBytes += sample.frame.image.length;
    }
  }
  if (imageBytes > 64 * 1024 * 1024) fail('Matrix image budget exceeded.');
  const failedCase = report.cases.some(item => item.samples.length !== 5 || item.issues.length || item.samples.some(sample =>
    sample.textAudit.issues.some(issue => issue.severity === 'error') || sample.nativeTargets.issues.length || sample.nativeTargets.observations.some(target =>
      !target.actual || target.matches !== 1 || target.actualComponentId !== target.componentId || target.actualPart !== target.part || target.maxDeviation === null || target.maxDeviation > M8_NATIVE_TOLERANCE_PX || target.actualChecked !== target.expectedChecked)));
  if (report.result === 'passed' && (report.issues.length || !report.surface || report.cases.length !== 18 || failedCase)) fail('Passing M8 requires all 90 correlated frames, stable selection and native targets within one CSS pixel.');
})
```

## M8TimingWarmupSchema

Quelle: `packages/contracts/src/m8-timing.ts:21`.

```typescript
M8TimingWarmupSchema = BaseCase
```

## M8TimingCaseSchema

Quelle: `packages/contracts/src/m8-timing.ts:22`.

```typescript
M8TimingCaseSchema = BaseCase.extend({
  intervalsMs: z.array(Interval).min(2).max(2000), summary: Summary,
  idle: z.strictObject({ durationMs: z.number().min(M8_TIMING_BUDGET.idleMs), startFrame: z.number().int().nonnegative(), endFrame: z.number().int().nonnegative() }),
})
```

## M8TimingReportSchema

Quelle: `packages/contracts/src/m8-timing.ts:26`.

```typescript
M8TimingReportSchema = z.strictObject({
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
})
```

## MotionRuleSchema

Quelle: `packages/contracts/src/motion.ts:8`.

```typescript
MotionRuleSchema = z.strictObject({
  kind: z.enum(['match', 'split', 'merge', 'enter', 'exit']),
  sources: z.array(Id).max(MOTION_LIMITS.couplingPieces).default([]),
  whenState: Id.optional(), whenPresent: z.array(Id).min(1).max(MOTION_LIMITS.couplingPieces).optional(),
  groupId: Id.optional(),
  route: Route.optional(),
}).superRefine((rule, ctx) => {
  if (new Set(rule.sources).size !== rule.sources.length) ctx.addIssue({ code: 'custom', message: 'Duplicate morph source' });
  const count = rule.sources.length;
  if ((['match', 'split'].includes(rule.kind) && count !== 1) || (rule.kind === 'merge' && count < 2) || (['enter', 'exit'].includes(rule.kind) && count !== 0)) ctx.addIssue({ code: 'custom', message: 'Morph rule has invalid cardinality' });
  if (rule.route && rule.kind !== 'match') ctx.addIssue({ code: 'custom', message: 'Axis routing requires a one-to-one match' });
})
```

## MotionPortReferenceSchema

Quelle: `packages/contracts/src/motion.ts:20`.

```typescript
MotionPortReferenceSchema = z.strictObject({ nodeId: Id, portId: Id.default('center') })
```

## SceneMotionSchema

Quelle: `packages/contracts/src/motion.ts:21`.

```typescript
SceneMotionSchema = z.strictObject({
  correspondence: z.array(MotionRuleSchema).min(1).max(32).optional(),
  label: z.enum(['stable', 'crossfade', 'context']).default('stable'),
  /** Keep a sharp part at its declared local offset from an animated shell. */
  follow: Id.optional(),
  /** Compact local content position at a declared axis-route junction. */
  lane: Point.optional(),
  ports: z.array(z.strictObject({ id: Id, x: z.number().min(0).max(1), y: z.number().min(0).max(1) })).max(32).optional(),
  connector: z.strictObject({ from: MotionPortReferenceSchema, to: MotionPortReferenceSchema }).optional(),
}).superRefine((motion, ctx) => {
  if (motion.ports && new Set(motion.ports.map(port => port.id)).size !== motion.ports.length) ctx.addIssue({ code: 'custom', message: 'Duplicate motion port' });
})
```

## MorphRelationSchema

Quelle: `packages/contracts/src/motion.ts:34`.

```typescript
MorphRelationSchema = z.strictObject({
  id: Id, kind: z.enum(['match', 'split', 'merge', 'enter', 'exit']),
  sources: z.array(Id).max(MOTION_LIMITS.couplingPieces), targets: z.array(Id).max(MOTION_LIMITS.couplingPieces),
  route: Route.optional(),
}).superRefine((relation, ctx) => {
  const a = relation.sources.length, b = relation.targets.length;
  const valid = relation.kind === 'match' ? a === 1 && b === 1 : relation.kind === 'split' ? a === 1 && b >= 2 : relation.kind === 'merge' ? a >= 2 && b === 1 : relation.kind === 'enter' ? a === 0 && b === 1 : a === 1 && b === 0;
  if (!valid || new Set(relation.sources).size !== a || new Set(relation.targets).size !== b) ctx.addIssue({ code: 'custom', message: 'Invalid morph relation cardinality' });
  if (relation.route && relation.kind !== 'match') ctx.addIssue({ code: 'custom', message: 'Axis routing requires a one-to-one match' });
})
```

## MotionPlanSchema

Quelle: `packages/contracts/src/motion.ts:44`.

```typescript
MotionPlanSchema = z.strictObject({ schemaVersion: z.literal(1), relations: z.array(MorphRelationSchema).max(MOTION_LIMITS.presentedNodes * 2) })
```

## MotionVelocitySchema

Quelle: `packages/contracts/src/motion.ts:47`.

```typescript
MotionVelocitySchema = z.strictObject({ id: Id, x: Coordinate, y: Coordinate, width: Coordinate, height: Coordinate, radius: Coordinate, rotation: Coordinate })
```

## CouplingPresentationSchema

Quelle: `packages/contracts/src/motion.ts:49`.

```typescript
CouplingPresentationSchema = z.strictObject({
  id: Id, kind: z.enum(['split', 'merge']), sourceIds: z.array(Id).max(32), targetIds: z.array(Id).max(32),
  progress: z.number().min(0).max(1), opacity: z.number().min(0).max(1), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), layer: z.number().int().min(-100).max(100),
  pieces: z.array(z.strictObject({ id: Id, ...Point.shape, width: z.number().positive().max(10000), height: z.number().positive().max(10000), radius: z.number().min(0).max(1000), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), opacity: z.number().min(0).max(1).optional() })).min(1).max(MOTION_LIMITS.couplingPieces),
  bridges: z.array(z.strictObject({ from: Point, to: Point, radius: z.number().min(0).max(1000), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), opacity: z.number().min(0).max(1).optional() })).max(MOTION_LIMITS.couplingBridges),
})
```

## MotionCheckpointSchema

Quelle: `packages/contracts/src/motion.ts:56`.

```typescript
MotionCheckpointSchema = z.strictObject({
  schemaVersion: z.literal(1), velocities: z.array(MotionVelocitySchema).max(MOTION_LIMITS.presentedNodes),
  couplings: z.array(CouplingPresentationSchema).max(MOTION_LIMITS.couplingGroups),
}).superRefine((checkpoint, ctx) => {
  if (new Set(checkpoint.velocities.map(item => item.id)).size !== checkpoint.velocities.length || new Set(checkpoint.couplings.map(item => item.id)).size !== checkpoint.couplings.length) ctx.addIssue({ code: 'custom', message: 'Duplicate motion checkpoint identity' });
})
```

## NativeTargetBoundsSchema

Quelle: `packages/contracts/src/native-targets.ts:4`.

```typescript
NativeTargetBoundsSchema = z.strictObject({ x: z.number().finite(), y: z.number().finite(), width: z.number().nonnegative(), height: z.number().nonnegative() })
```

## NativeTargetObservationSchema

Quelle: `packages/contracts/src/native-targets.ts:5`.

```typescript
NativeTargetObservationSchema = z.strictObject({
  id: z.string().min(1), componentId: z.string().min(1), part: z.string().min(1),
  matches: z.number().int().nonnegative(), actualComponentId: z.string().nullable(), actualPart: z.string().nullable(),
  expected: NativeTargetBoundsSchema, actual: NativeTargetBoundsSchema.nullable(),
  maxDeviation: z.number().nonnegative().nullable(), expectedChecked: z.boolean().nullable(), actualChecked: z.boolean().nullable(),
  inert: z.boolean().nullable(), tabIndex: z.number().int().nullable(),
})
```

## NativeTargetAuditSchema

Quelle: `packages/contracts/src/native-targets.ts:12`.

```typescript
NativeTargetAuditSchema = z.strictObject({
  method: z.literal('domrect-versus-presented-controls'), toleranceCssPx: z.literal(M8_NATIVE_TOLERANCE_PX),
  expectedIds: z.array(z.string().min(1)).min(1), observations: z.array(NativeTargetObservationSchema), issues: z.array(z.string()),
}).superRefine((audit, ctx) => {
  const ids = audit.observations.map(item => item.id);
  if (new Set(audit.expectedIds).size !== audit.expectedIds.length || new Set(ids).size !== ids.length || ids.length !== audit.expectedIds.length || ids.some(id => !audit.expectedIds.includes(id))) ctx.addIssue({ code: 'custom', message: 'Every expected native target needs exactly one observation.' });
  for (const item of audit.observations) {
    const actual = item.actual;
    const delta = actual ? Math.max(...(['x', 'y', 'width', 'height'] as const).map(key => Math.abs(actual[key] - item.expected[key]))) : null;
    if (delta === null ? item.maxDeviation !== null : item.maxDeviation === null || Math.abs(item.maxDeviation - delta) > .00001) ctx.addIssue({ code: 'custom', message: 'Native target deviation is inconsistent with measured bounds.' });
  }
})
```

## PresentedNodeStateSchema

Quelle: `packages/contracts/src/presentation.ts:6`.

```typescript
PresentedNodeStateSchema = z.strictObject({
  id: Id, textOpacity: z.number().min(0).max(1), panelOpacity: z.number().min(0).max(1),
  protected: z.boolean(),
  shadow: z.strictObject({ opacity: z.number().min(0).max(1), offsetX: Coordinate, offsetY: Coordinate, blur: z.number().min(0).max(100) }),
  shader: z.strictObject({ effectId: z.union([z.literal(0), z.literal(1), z.literal(3)]), progress: z.number().min(0).max(1), intensity: z.number().min(0).max(1), frequency: z.number().min(0.2).max(8), seed: z.number().finite() }),
})
```

## LensPresentationSchema

Quelle: `packages/contracts/src/presentation.ts:13`.

```typescript
LensPresentationSchema = z.strictObject({
  x: Coordinate, y: Coordinate, radius: z.number().min(0).max(20000),
  strength: z.number().min(0).max(1), phase: z.number().min(0).max(1),
  opacity: z.number().min(0).max(1),
})
```

## ParticlePresentationSchema

Quelle: `packages/contracts/src/presentation.ts:19`.

```typescript
ParticlePresentationSchema = z.strictObject({
  id: Id, componentId: Id, x: Coordinate, y: Coordinate,
  velocityX: z.number().finite().min(-100000).max(100000), velocityY: z.number().finite().min(-100000).max(100000),
  size: z.number().min(0).max(100), rotation: z.number().finite(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/), opacity: z.number().min(0).max(1),
})
```

## SourcePresentationCheckpointSchema

Quelle: `packages/contracts/src/presentation.ts:27`.

```typescript
SourcePresentationCheckpointSchema = z.strictObject({
  schemaVersion: z.literal(1),
  nodeStates: z.array(PresentedNodeStateSchema).max(MOTION_LIMITS.presentedNodes),
  lens: LensPresentationSchema.nullable(),
  particles: z.array(ParticlePresentationSchema).max(2048),
  motion: MotionCheckpointSchema.optional(),
}).superRefine((checkpoint, ctx) => {
  for (const list of [checkpoint.nodeStates, checkpoint.particles]) {
    if (new Set(list.map(item => item.id)).size !== list.length) ctx.addIssue({ code: 'custom', message: 'Duplicate presentation identity' });
  }
})
```

## ProofViewportSchema

Quelle: `packages/contracts/src/proof-capture.ts:9`.

```typescript
ProofViewportSchema = z.strictObject({
  browser: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  surface: z.strictObject({ x: z.number().finite(), y: z.number().finite(), width: z.number().positive(), height: z.number().positive() }),
})
```

## ProofFieldsSchema

Quelle: `packages/contracts/src/proof-capture.ts:14`.

```typescript
ProofFieldsSchema = z.strictObject({
  sort: z.enum(['name', 'files', 'dependencies']), direction: z.enum(['asc', 'desc']),
  selected: Id.or(z.literal('')), group: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']),
  selection: z.array(Id).max(1000), inspectorOpen: z.boolean(),
  cardsPickedOnly: z.boolean().optional(), workspaceTools: z.boolean().optional(),
  compareDifferences: z.boolean().optional(), atlasMetric: z.enum(['lines', 'files']).optional(), atlasGroup: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).optional(),
})
```

## NativeProofSchema

Quelle: `packages/contracts/src/proof-capture.ts:21`.

```typescript
NativeProofSchema = z.strictObject({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), kind: z.literal('fluid-native-workspace-proof'),
  id: Id, buildId: Id, capturedAt: z.iso.datetime(),
  scope: z.literal('single-bound-canvas-frame'), inputProvenance: z.literal('not-observed-by-exporter'),
  dataset: z.strictObject({ version: z.iso.datetime(), source: z.literal('Workspace package.json + src/**/*.ts(x)'), sha256: Hash, moduleIds: z.array(Id).min(1).max(1000) }),
  viewport: ProofViewportSchema, appearance: ThemePreferencesSchema.optional(),
  snapshot: z.strictObject({ flowId: Id, state: z.enum(['table', 'cards', 'map', 'detail', 'compare', 'atlas']), revision: z.number().int().nonnegative(), mode: z.enum(['manual', 'hybrid', 'auto']), fields: ProofFieldsSchema, redactedFieldIds: z.array(Id) }),
  trace: z.array(z.strictObject({ sequence: z.number().int().nonnegative(), timestamp: z.number().finite().nonnegative(), kind: z.enum(['accepted', 'rejected', 'decision', 'effect', 'error', 'interaction']), eventType: Id, revision: z.number().int().nonnegative(), state: Id, applicationReportedReason: z.enum(['pointer', 'keyboard', 'input', 'programmatic', 'ai', 'replay']).nullable() })).max(1000),
  traceCoverage: z.literal('latest-at-most-1000-no-payloads-or-details'),
  frame: CapturedFrameSchema, imageSha256: Hash,
  metrics: z.strictObject({ backend: z.enum(['webgpu', 'webgl2']), frames: z.number().int().positive(), phase: z.enum(['idle', 'paused']), progress: z.number().min(0).max(1) }),
  geometry: SequenceGeometrySchema,
  currentParts: z.array(z.strictObject({ id: Id, componentId: Id, part: Id, behavior: z.enum(['presentation', 'button', 'textbox', 'checkbox', 'progressbar', 'status']), checked: z.boolean().nullable() })).max(1000),
  nativeTargets: NativeTargetAuditSchema,
  effect: z.strictObject({ id: Id.nullable(), seed: z.number().finite().nullable(), sourceState: Id.nullable(), targetState: Id.nullable(), targetRevision: z.number().int().nonnegative().nullable() }),
  redaction: z.literal('free-input-pixels-blocked-fields-allowlisted-trace-metadata-only'),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(10),
}).superRefine((proof, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const { frame, metrics, viewport, geometry, snapshot } = proof;
  if (proof.schemaVersion === 1 && (proof.appearance !== undefined || ['compare', 'atlas'].includes(snapshot.state) || snapshot.fields.compareDifferences !== undefined || snapshot.fields.atlasMetric !== undefined || snapshot.fields.atlasGroup !== undefined)) fail('M9 presentation fields require proof version 2.');
  if (frame.backend !== metrics.backend || frame.surfaceFrame !== metrics.frames || frame.progress !== metrics.progress || frame.progress !== geometry.progress || frame.capturedAt !== proof.capturedAt) fail('Frame, metrics and presentation do not share one capture.');
  // Capture reports effective DPR = integer canvas width / CSS width. Independent
  // pixel rounding on both axes permits <1 + CSS-height/CSS-width pixels vertically.
  // This concerns image dimensions only; native-target tolerance remains 1 CSS pixel.
  const heightQuantization = 1 + frame.viewport.height / frame.viewport.width;
  if (Math.abs(frame.viewport.width - viewport.surface.width) > .01 || Math.abs(frame.viewport.height - viewport.surface.height) > .01 || Math.abs(frame.pixelWidth - frame.viewport.width * frame.viewport.dpr) > 1 || Math.abs(frame.pixelHeight - frame.viewport.height * frame.viewport.dpr) > heightQuantization) fail('Captured image and measured surface differ.');
  const moduleIds = new Set(proof.dataset.moduleIds);
  if (moduleIds.size !== proof.dataset.moduleIds.length || snapshot.fields.selection.some(id => !moduleIds.has(id)) || snapshot.fields.selected && !moduleIds.has(snapshot.fields.selected)) fail('Selection does not belong to this dataset.');
  if (proof.trace.some((entry, index) => entry.revision > snapshot.revision || index > 0 && entry.sequence <= proof.trace[index - 1]!.sequence)) fail('Trace is not ordered or belongs to a newer snapshot.');
  const nodes = new Map(geometry.nodes.map(node => [node.id, node])), parts = new Map(proof.currentParts.map(part => [part.id, part]));
  if (nodes.size !== geometry.nodes.length || parts.size !== proof.currentParts.length) fail('Duplicate presented or current part.');
  for (const part of frame.parts) if (!nodes.has(part.id) || parts.get(part.id)?.componentId !== part.componentId || parts.get(part.id)?.part !== part.part) fail('Captured part does not belong to the bound current scene.');
  const targetIds = proof.currentParts.filter(part => ['button', 'checkbox', 'textbox'].includes(part.behavior) && nodes.has(part.id)).map(part => part.id);
  if (targetIds.length !== proof.nativeTargets.expectedIds.length || targetIds.some(id => !proof.nativeTargets.expectedIds.includes(id))) fail('Native target audit omits current controls.');
  for (const observation of proof.nativeTargets.observations) {
    const node = nodes.get(observation.id), part = parts.get(observation.id);
    if (!node || !part) { fail('Native target has no bound part.'); continue; }
    const width = Math.abs(Math.cos(node.rotation)) * node.width + Math.abs(Math.sin(node.rotation)) * node.height;
    const height = Math.abs(Math.sin(node.rotation)) * node.width + Math.abs(Math.cos(node.rotation)) * node.height;
    const expected = { x: node.x + (node.width - width) / 2, y: node.y + (node.height - height) / 2, width, height };
    if ((['x', 'y', 'width', 'height'] as const).some(key => Math.abs(expected[key] - observation.expected[key]) > .00001) || observation.componentId !== part.componentId || observation.part !== part.part || observation.expectedChecked !== part.checked) fail('Native target expectation differs from captured geometry/identity.');
  }
  if (proof.effect.targetRevision !== null && (proof.effect.targetRevision !== snapshot.revision || proof.effect.targetState !== snapshot.state)) fail('Effect recording belongs to another domain snapshot.');
})
```

## QualitySourceSchema

Quelle: `packages/contracts/src/quality.ts:3`.

```typescript
QualitySourceSchema = z.enum(['static', 'dom', 'gpu', 'semantics', 'visual'])
```

## QualityFindingSchema

Quelle: `packages/contracts/src/quality.ts:4`.

```typescript
QualityFindingSchema = z.strictObject({
  rule: z.string().min(1),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string().min(1),
  target: z.strictObject({
    file: z.string().optional(), line: z.number().int().positive().optional(),
    componentId: z.string().optional(), part: z.string().optional(),
    nodes: z.array(z.string()).default([]),
  }),
})
```

## QualityCheckSchema

Quelle: `packages/contracts/src/quality.ts:14`.

```typescript
QualityCheckSchema = z.strictObject({
  id: z.string().min(1), source: QualitySourceSchema, title: z.string().min(1),
  status: z.enum(['passed', 'failed', 'not-checked', 'unsupported']),
  checked: z.number().int().nonnegative(), reason: z.string().min(1).optional(),
  findings: z.array(QualityFindingSchema),
}).superRefine((check, ctx) => {
  const errors = check.findings.some(finding => finding.severity === 'error');
  if (check.status === 'passed' && (errors || check.checked === 0)) ctx.addIssue({ code: 'custom', message: 'Passed checks need measured coverage and no errors' });
  if (check.status === 'failed' && !errors) ctx.addIssue({ code: 'custom', message: 'Failed checks need an error finding' });
  if (['not-checked', 'unsupported'].includes(check.status) && (!check.reason || check.checked > 0)) ctx.addIssue({ code: 'custom', message: 'Open checks need a reason and zero coverage' });
})
```

## QualityContextSchema

Quelle: `packages/contracts/src/quality.ts:25`.

```typescript
QualityContextSchema = z.strictObject({
  buildId: z.string().min(1), backend: z.enum(['webgpu', 'webgl2', 'not-applicable', 'unavailable']),
  viewport: z.strictObject({ width: z.number().positive(), height: z.number().positive() }).optional(),
  phase: z.number().min(0).max(1).optional(), revision: z.number().int().nonnegative().optional(),
  caseId: z.string().optional(), state: z.string().optional(),
})
```

## QualityReportSchema

Quelle: `packages/contracts/src/quality.ts:31`.

```typescript
QualityReportSchema = z.strictObject({
  schemaVersion: z.literal(1), generatedAt: z.iso.datetime(), context: QualityContextSchema,
  tools: z.record(z.string(), z.string()), checks: z.array(QualityCheckSchema).min(1),
}).superRefine((report, ctx) => {
  if (new Set(report.checks.map(check => check.id)).size !== report.checks.length) ctx.addIssue({ code: 'custom', message: 'Duplicate quality check IDs' });
})
```

## StoryDefinitionSchema

Quelle: `packages/contracts/src/rehearsal.ts:6`.

```typescript
StoryDefinitionSchema = z.strictObject({
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
})
```

## CapturedFrameSchema

Quelle: `packages/contracts/src/rehearsal.ts:27`.

```typescript
CapturedFrameSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, surfaceFrame: z.number().int().positive(),
  capturedAt: z.iso.datetime(), renderTimeMs: z.number().nonnegative(),
  backend: z.enum(['webgpu', 'webgl2']), progress: z.number().min(0).max(1),
  viewport: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  image: z.string().max(6_000_000).startsWith('data:image/png;base64,'),
  pixelWidth: z.number().int().positive().max(4096), pixelHeight: z.number().int().positive().max(4096),
  parts: z.array(z.strictObject({ id: Id, componentId: Id, part: Id })).max(1000),
  redaction: z.literal('no-sensitive-parts'), coverage: z.literal('selected-frame'),
})
```

## AIReviewFrameSchema

Quelle: `packages/contracts/src/rehearsal.ts:38`.

```typescript
AIReviewFrameSchema = CapturedFrameSchema.extend({
  buildId: Id, revision: z.number().int().nonnegative(), state: Id, beatId: Id.nullable(),
  binding: z.strictObject({ runId: Id, presentation: z.literal('live'), datasetHash: z.string().regex(/^[a-f0-9]{64}$/), imageSha256: z.string().regex(/^[a-f0-9]{64}$/), visualRevision: z.number().int().nonnegative(), traceSequence: z.number().int().nonnegative(), auditSurfaceFrame: z.number().int().nonnegative(), auditBinding: z.literal('stable-paused-presentation') }).optional(),
})
```

## AIReviewBundleSchema

Quelle: `packages/contracts/src/rehearsal.ts:43`.

```typescript
AIReviewBundleSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, storyId: Id, responseLocale: LocaleSchema.optional(),
  brief: z.string().min(1).max(2000), approved: z.literal(true),
  frames: z.array(AIReviewFrameSchema).min(1).max(3),
}).superRefine((bundle, ctx) => {
  if (new Set(bundle.frames.map(frame => frame.id)).size !== bundle.frames.length) ctx.addIssue({ code: 'custom', message: 'Duplicate frame ID' });
  if (new Set(bundle.frames.map(frame => frame.buildId)).size !== 1) ctx.addIssue({ code: 'custom', message: 'Mixed build versions' });
  if (bundle.frames.reduce((sum, frame) => sum + frame.image.length, 0) > 8_000_000) ctx.addIssue({ code: 'custom', message: 'Image budget exceeded' });
})
```

## AIReviewFindingSchema

Quelle: `packages/contracts/src/rehearsal.ts:55`.

```typescript
AIReviewFindingSchema = z.strictObject({
  frameId: Id, partId: Id.nullable(),
  region: z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), width: z.number().positive().max(1), height: z.number().positive().max(1) }).nullable(),
  category: z.enum(['hierarchy', 'density', 'typography', 'redundancy', 'brand', 'motion', 'framing']),
  severity: z.enum(['info', 'warning', 'error']),
  observation: z.string().min(1).max(1000), rationale: z.string().min(1).max(1000),
  suggestion: z.string().min(1).max(1000), uncertainty: z.enum(['low', 'medium', 'high']),
})
```

## AIReviewOutputSchema

Quelle: `packages/contracts/src/rehearsal.ts:64`.

```typescript
AIReviewOutputSchema = z.strictObject({
  summary: z.string().min(1).max(1500), findings: z.array(AIReviewFindingSchema).max(20),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(10),
})
```

## AIReviewResultSchema

Quelle: `packages/contracts/src/rehearsal.ts:69`.

```typescript
AIReviewResultSchema = z.strictObject({
  schemaVersion: z.literal(1), id: Id, output: AIReviewOutputSchema,
  provenance: z.strictObject({ responseLocale: LocaleSchema.optional(), sdk: z.string(), provider: z.string(), model: z.string(), resolvedModel: z.string().optional(), responseId: z.string().optional(), pricingVersion: z.string().optional(), policyVersion: Id, startedAt: z.iso.datetime(), durationMs: z.number().nonnegative(), frameIds: z.array(Id), coverage: z.literal('selected-frames-only') }),
  usage: z.strictObject({ inputTokens: z.number().nonnegative().nullable(), outputTokens: z.number().nonnegative().nullable() }),
  accounting: z.strictObject({ reservationUsd: z.number().nonnegative(), maxInputTokens: z.number().int().positive().optional(), inputMeasurement: z.enum(['openai-input-tokens', 'full-context-bound']).optional(), usageUpperEstimateUsd: z.number().nonnegative().nullable(), scope: z.enum(['local-process', 'local-project']), authoritativeInvoice: z.literal(false) }),
})
```

## AIReviewAssessmentSchema

Quelle: `packages/contracts/src/rehearsal.ts:76`.

```typescript
AIReviewAssessmentSchema = z.strictObject({
  schemaVersion: z.literal(1), exportedAt: z.iso.datetime(), scope: z.literal('local-review'),
  result: AIReviewResultSchema,
  assessments: z.array(z.strictObject({ findingIndex: z.number().int().nonnegative(), status: z.enum(['pending', 'confirmed', 'dismissed']), note: z.string().max(1000) })),
}).superRefine((review, context) => {
  if (review.assessments.length !== review.result.output.findings.length || new Set(review.assessments.map(item => item.findingIndex)).size !== review.assessments.length || review.assessments.some(item => item.findingIndex >= review.result.output.findings.length)) context.addIssue({ code: 'custom', message: 'Each finding needs exactly one assessment.' });
})
```

## AIReviewStatusSchema

Quelle: `packages/contracts/src/rehearsal.ts:84`.

```typescript
AIReviewStatusSchema = z.object({
  configured: z.boolean(), token: z.string().regex(/^[a-f0-9]{48}$/), provider: z.string(), model: z.string().nullable(),
  reason: z.string().optional(), reservationUsd: z.number().nonnegative().optional(), scope: z.enum(['local-process', 'local-project']),
})
```

## SequenceGeometrySchema

Quelle: `packages/contracts/src/sequence-geometry.ts:3`.

```typescript
SequenceGeometrySchema = z.strictObject({
  progress: z.number().min(0).max(1),
  nodes: z.array(z.strictObject({ id: z.string().min(1), x: z.number().finite(), y: z.number().finite(), width: z.number().nonnegative(), height: z.number().nonnegative(), rotation: z.number().finite(), opacity: z.number().min(0).max(1) })).max(20000),
  lensPresent: z.boolean(), particleCount: z.number().int().nonnegative(), shadowCount: z.number().int().nonnegative(),
})
```

## EffectRuntimeMetricsSchema

Quelle: `packages/contracts/src/sequence.ts:10`.

```typescript
EffectRuntimeMetricsSchema = z.strictObject({
  backend: z.enum(['webgpu', 'webgl2']), frames: z.number().int().nonnegative(), lastFrameMs: z.number().nonnegative(),
  phase: z.enum(['idle', 'transitioning', 'paused']), progress: z.number().min(0).max(1), textBytes: z.number().nonnegative(),
  effectResources: z.strictObject({ renderTargets: z.number().int().nonnegative(), targetBytes: z.number().nonnegative(), particles: z.number().int().nonnegative(), particleDrawCalls: z.number().int().nonnegative(), couplingGroups: z.number().int().min(0).max(8).optional(), couplingPieces: z.number().int().min(0).max(256).optional(), couplingDrawCalls: z.number().int().min(0).max(8).optional() }).optional(),
  qualityProfile: z.enum(['compact', 'standard']).optional(),
})
```

## SequenceSampleSchema

Quelle: `packages/contracts/src/sequence.ts:16`.

```typescript
SequenceSampleSchema = z.strictObject({
  index: z.number().int().min(0).max(180), logicalTimeMs: z.number().min(0).max(3000),
  frame: CapturedFrameSchema, textAudit: z.lazy(() => TextAuditSchema), geometry: SequenceGeometrySchema,
  metrics: EffectRuntimeMetricsSchema.nullable(), resources: ResourceSnapshotSchema.nullable(),
})
```

## SequenceReportSchema

Quelle: `packages/contracts/src/sequence.ts:21`.

```typescript
SequenceReportSchema = z.strictObject({
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
})
```

## EffectStressReportSchema

Quelle: `packages/contracts/src/sequence.ts:41`.

```typescript
EffectStressReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('owned-resources-on-one-surface'), requestedCycles: z.literal(100), warmupCycles: z.literal(5),
  result: z.enum(['passed', 'failed', 'inconclusive']), recording: z.lazy(() => VisualScenarioSchema).nullable(),
  samples: z.array(z.strictObject({ cycle: z.number().int().min(1).max(100), midpoint: EffectRuntimeMetricsSchema, endpoint: EffectRuntimeMetricsSchema, resources: ResourceSnapshotSchema })).max(100),
  issues: z.array(z.string()), limitations: z.array(z.string()),
})
```

## NaturalPlaybackReportSchema

Quelle: `packages/contracts/src/sequence.ts:49`.

```typescript
NaturalPlaybackReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('warmed-render-scheduler-intervals'), result: z.enum(['measured', 'inconclusive']),
  recording: z.lazy(() => VisualScenarioSchema).nullable(), backend: z.enum(['webgpu', 'webgl2']).nullable(),
  intervalsMs: z.array(z.number().positive().finite()).max(2000), p50Ms: z.number().nonnegative().nullable(), p95Ms: z.number().nonnegative().nullable(),
  maxMs: z.number().nonnegative().nullable(), longFramesOver50Ms: z.number().int().nonnegative(),
  endpointReached: z.boolean(), startupIntervalOmitted: z.literal(true), issues: z.array(z.string()), limitations: z.array(z.string()),
})
```

## VisualRetargetReportSchema

Quelle: `packages/contracts/src/sequence.ts:58`.

```typescript
VisualRetargetReportSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string(), generatedAt: z.iso.datetime(), context: SequenceReportSchema.shape.context,
  scope: z.literal('visual-only-retarget-imports'), requestedCycles: z.literal(100), warmupCycles: z.literal(12),
  result: z.enum(['passed', 'failed', 'inconclusive']), recording: z.lazy(() => VisualScenarioSchema).nullable(),
  samples: z.array(z.strictObject({ cycle: z.number().int().min(1).max(100), phase: z.union([z.literal(.25), z.literal(.5), z.literal(.75)]),
    target: z.enum(['source', 'target']), sourceNodes: z.number().int().nonnegative().max(2048), continuous: z.boolean(),
    metrics: EffectRuntimeMetricsSchema, resources: ResourceSnapshotSchema })).max(100),
  settled: EffectRuntimeMetricsSchema.nullable(), restoration: z.enum(['restored', 'skipped-newer-run', 'not-started', 'failed']),
  issues: z.array(z.string()), limitations: z.array(z.string()),
})
```

## M7SurfaceCaseSchema

Quelle: `packages/contracts/src/surface-qualification.ts:5`.

```typescript
M7SurfaceCaseSchema = z.strictObject({
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
})
```

## M7SurfaceQualificationSchema

Quelle: `packages/contracts/src/surface-qualification.ts:18`.

```typescript
M7SurfaceQualificationSchema = z.strictObject({
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
})
```

## ThemeDefinitionSchema

Quelle: `packages/contracts/src/theme.ts:4`.

```typescript
ThemeDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().regex(/^[a-z][a-z0-9-]*$/), version: z.string().min(1),
  colorSpace: z.literal('srgb'), dimensionUnit: z.literal('px'), timeUnit: z.literal('ms'),
  colors: z.strictObject({ studio: Color, paper: Color, ink: Color, muted: Color, accent: Color, focus: Color, gpu: Color, gpuInk: Color, gpuMuted: Color }),
  typography: z.strictObject({ family: z.literal('Inter'), caption: z.number().min(11), label: z.number().min(12), body: z.number().min(14) }),
  minimumTarget: z.number().min(24), spacing: z.strictObject({ small: z.number().positive(), medium: z.number().positive(), large: z.number().positive() }),
  radius: z.strictObject({ control: z.number().nonnegative(), panel: z.number().nonnegative() }),
  motion: z.strictObject({ reducedDuration: z.literal(0) }),
})
```

## ThemePresetIdSchema

Quelle: `packages/contracts/src/theme.ts:27`.

```typescript
ThemePresetIdSchema = z.enum(['blue', 'indigo', 'violet', 'cyan', 'teal', 'rose', 'amber', 'graphite'])
```

## ThemePreferencesSchema

Quelle: `packages/contracts/src/theme.ts:29`.

```typescript
ThemePreferencesSchema = z.strictObject({
  schemaVersion: z.literal(1).default(1), preset: ThemePresetIdSchema.default('blue'),
  customAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/).transform(value => value.toLowerCase()).nullable().default(null),
})
```

## WorkspaceQualificationCaseSchema

Quelle: `packages/contracts/src/workspace-qualification.ts:9`.

```typescript
WorkspaceQualificationCaseSchema = z.strictObject({
  effect: z.enum(M7_EFFECT_IDS), source: z.enum(['table', 'cards', 'map', 'detail']), target: z.enum(['table', 'cards', 'map', 'detail']),
  revision: z.number().int().nonnegative(), recording: z.lazy(() => VisualScenarioSchema),
  samples: z.array(z.strictObject({ frame: CapturedFrameSchema, textAudit: z.lazy(() => TextAuditSchema), geometry: SequenceGeometrySchema })).max(5),
  issues: z.array(z.string()),
})
```

## WorkspaceQualificationSchema

Quelle: `packages/contracts/src/workspace-qualification.ts:15`.

```typescript
WorkspaceQualificationSchema = z.strictObject({
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
})
```

## MotionEnvironmentReportSchema

Quelle: `packages/contracts/src/workspace-qualification.ts:33`.

```typescript
MotionEnvironmentReportSchema = z.strictObject({
  schemaVersion: z.literal(1), buildId: z.string().min(1), scope: z.literal('observed-browser-events'),
  events: z.array(z.strictObject({ at: z.iso.datetime(), trigger: z.enum(['start', 'visibilitychange', 'media-change', 'checkpoint']),
    hidden: z.boolean(), reducedMotion: z.boolean(), progress: z.number().min(0).max(1).nullable(), frames: z.number().int().nonnegative().nullable(),
    phase: z.string().nullable(), backend: z.enum(['webgpu', 'webgl2']).nullable(), effectId: z.string().nullable(), lensPresent: z.boolean(), particles: z.number().int().nonnegative(),
  })).max(64),
})
```

## SceneViewportSchema

Quelle: `packages/core/src/layout.ts:5`.

```typescript
SceneViewportSchema = z.strictObject({ width: z.number().finite().positive(), height: z.number().finite().positive() })
```

## TransitionClipSchema

Quelle: `packages/effects/src/presentation.ts:14`.

```typescript
TransitionClipSchema = z.strictObject({
  source: z.array(SceneNodeSchema).max(MOTION_LIMITS.presentedNodes), target: z.array(SceneNodeSchema).max(MOTION_LIMITS.sceneNodes),
  plan: ResolvedEffectPlanSchema.nullable(), durationMs: z.number().min(0).max(10000), viewport: Viewport,
  sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null),
  protectedNodeIds: z.array(z.string()).default([]),
  languageProfile: RecordingLanguageProfileSchema.optional(),
  motionVersion: z.union([z.literal(1), z.literal(2)]).default(1), motionPlan: MotionPlanSchema.optional(),
})
```

## PresentationFrameSchema

Quelle: `packages/effects/src/presentation.ts:23`.

```typescript
PresentationFrameSchema = z.strictObject({
  nodes: z.array(SceneNodeSchema).max(20000), nodeStates: z.array(PresentedNodeStateSchema).max(20000),
  lens: LensPresentationSchema.nullable(), particles: z.array(ParticlePresentationSchema).max(2048),
  progress: z.number().min(0).max(1),
  velocities: z.array(MotionVelocitySchema).max(MOTION_LIMITS.presentedNodes).optional(),
  couplings: z.array(CouplingPresentationSchema).max(MOTION_LIMITS.couplingGroups).optional(),
})
```

## LocaleSchema

Quelle: `packages/i18n/src/locale.ts:4`.

```typescript
LocaleSchema = z.enum(LOCALES)
```

## LocaleContextSchema

Quelle: `packages/i18n/src/locale.ts:8`.

```typescript
LocaleContextSchema = z.strictObject({
  language: LocaleSchema,
  formatLocale: z.string().min(2).max(80).refine(tag => {
    try { return Intl.getCanonicalLocales(tag).length === 1; } catch { return false; }
  }, 'Invalid formatting locale'),
  timeZone: z.string().min(1).max(80).refine(zone => {
    try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
  }, 'Invalid time zone'),
  direction: z.enum(['ltr', 'rtl']),
})
```

## WorkspaceIntentVisitSchema

Quelle: `packages/intelligence/src/workspace-intent.ts:10`.

```typescript
WorkspaceIntentVisitSchema = z.strictObject({ moduleId: IdentifierSchema, at: TimeSchema })
```

## WorkspaceComparisonIntentSchema

Quelle: `packages/intelligence/src/workspace-intent.ts:11`.

```typescript
WorkspaceComparisonIntentSchema = z.strictObject({
  type: z.literal('compare'),
  moduleIds: z.tuple([IdentifierSchema, IdentifierSchema]),
  score: z.number().min(0).max(1),
  evidence: z.array(WorkspaceIntentVisitSchema).max(MAX_VISITS),
})
```

## WorkspaceIntentResultSchema

Quelle: `packages/intelligence/src/workspace-intent.ts:17`.

```typescript
WorkspaceIntentResultSchema = z.strictObject({
  schemaVersion: z.literal(1),
  reason: z.enum(['ready', 'insufficient', 'ambiguous', 'dismissed']),
  suggestion: WorkspaceComparisonIntentSchema.nullable(),
  ranked: z.array(WorkspaceComparisonIntentSchema).max(5),
  visits: z.array(WorkspaceIntentVisitSchema).max(MAX_VISITS),
  expiresAt: TimeSchema.nullable(),
})
```

## AuthoringDataScopeSchema

Quelle: `packages/server/src/ai-authoring.ts:25`.

```typescript
AuthoringDataScopeSchema = z.strictObject({ moduleCount: z.number().int().nonnegative(), sourceCount: z.number().int().nonnegative(), dependencyCount: z.number().int().nonnegative(), datasetHash: z.string().regex(/^[a-f0-9]{64}$/).optional() })
```

[^implementation]: Quellinventar mit SHA-256 je Datei.
