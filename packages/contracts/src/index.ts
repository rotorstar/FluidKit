import { LocaleContextSchema } from '@fluidkit/i18n/locale';
import { z } from 'zod';
import { EffectRuleSchema, EffectSettingsSchema, ResolvedEffectPlanSchema, VisualCommandSchema } from './effects';
import { SourcePresentationCheckpointSchema } from './presentation';
import { MultipartComponentDefinitionSchema } from './components';
import { MOTION_LIMITS, MotionPlanSchema, SceneMotionSchema } from './motion';

export const SCHEMA_VERSION = 1;
export const IdentifierSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
export const JsonSchema = z.json();
export type Json = z.infer<typeof JsonSchema>;
export const ModeSchema = z.enum(['manual', 'hybrid', 'auto']);
export const BackendModeSchema = z.enum(['webgpu-first', 'webgpu-only', 'webgl2']);
export type BackendMode = z.infer<typeof BackendModeSchema>;
export type ControlMode = z.infer<typeof ModeSchema>;
export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const NodeKindSchema = z.enum(['box', 'surface', 'text', 'icon', 'image', 'button', 'input', 'progress', 'card', 'select', 'checkbox', 'form', 'wizard', 'table', 'nav', 'modal', 'grid', 'flow', 'stack']);
export const PartDefinitionSchema = z.strictObject({
  componentId: IdentifierSchema,
  part: IdentifierSchema,
  behavior: z.enum(['presentation', 'button', 'textbox', 'checkbox', 'progressbar', 'status']),
});
export type PartDefinition = z.infer<typeof PartDefinitionSchema>;
export const SceneNodeSchema = z.strictObject({
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
});
export type SceneNode = z.infer<typeof SceneNodeSchema>;
export type SceneNodeInput = z.input<typeof SceneNodeSchema>;
export const FieldValueSchema = z.union([z.string(), z.number().finite(), z.boolean(), z.array(IdentifierSchema).max(10000)]);
export type FieldValue = z.infer<typeof FieldValueSchema>;
export const FieldSchema = z.strictObject({
  id: IdentifierSchema,
  type: z.enum(['text', 'number', 'boolean', 'keys']).default('text'),
  initial: FieldValueSchema.default(''),
  maxLength: z.number().int().positive().max(100000).default(2000),
  sensitive: z.boolean().default(false),
});
export function isFieldValue(field: z.infer<typeof FieldSchema>, value: unknown): value is FieldValue {
  if (field.type === 'keys') return Array.isArray(value) && value.length <= field.maxLength && new Set(value).size === value.length && value.every(key => IdentifierSchema.safeParse(key).success);
  return typeof value === (field.type === 'text' ? 'string' : field.type) && (typeof value !== 'number' || Number.isFinite(value)) && (typeof value !== 'string' || value.length <= field.maxLength);
}
export const CollectionDefinitionSchema = z.strictObject({
  id: IdentifierSchema, field: IdentifierSchema,
  items: z.array(z.strictObject({ id: IdentifierSchema, label: z.string().min(1), disabled: z.boolean().default(false) })).max(10000),
}).superRefine((value, ctx) => {
  if (new Set(value.items.map(item => item.id)).size !== value.items.length) ctx.addIssue({ code: 'custom', message: 'Duplicate collection item' });
});
export const TransitionSchema = z.strictObject({
  target: IdentifierSchema,
  guard: IdentifierSchema.optional(),
  action: IdentifierSchema.optional(),
  reversible: z.boolean().default(true),
  aiAllowed: z.boolean().default(false),
  duration: z.number().nonnegative().max(10000).default(420),
  assign: z.record(IdentifierSchema, FieldValueSchema).default({}),
  effect: EffectRuleSchema.optional(),
});
export const StateSchema = z.strictObject({
  label: z.string().min(1).max(200),
  route: z.string().regex(/^\/(?!\/)[^?#]*$/).optional(),
  nodes: z.array(SceneNodeSchema).max(10000),
  projection: IdentifierSchema.optional(),
  on: z.record(IdentifierSchema, TransitionSchema).default({}),
});
export const FlowDefinitionSchema = z.strictObject({
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
});
export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;
/** Canonical component contract: a reusable anatomy/behavior definition, not a scene node. */
export const ComponentDefinitionSchema = MultipartComponentDefinitionSchema;
export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;
export const RuntimeSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1), flowId: IdentifierSchema, state: IdentifierSchema,
  revision: z.number().int().nonnegative(), mode: ModeSchema,
  fields: z.record(IdentifierSchema, FieldValueSchema),
});
export type RuntimeSnapshot = z.infer<typeof RuntimeSnapshotSchema>;
export const InteractionSnapshotSchema = z.strictObject({
  revision: z.number().int().nonnegative(),
  focusedId: IdentifierSchema.nullable(), hoveredId: IdentifierSchema.nullable(),
  pressedId: IdentifierSchema.nullable(), composingId: IdentifierSchema.nullable(),
});
export type InteractionSnapshot = z.infer<typeof InteractionSnapshotSchema>;
export const ChangeReasonSchema = z.enum(['pointer', 'keyboard', 'input', 'programmatic', 'ai', 'replay']);
export type ChangeReason = z.infer<typeof ChangeReasonSchema>;
export const RuntimeEventSchema = z.strictObject({
  id: IdentifierSchema, type: IdentifierSchema,
  source: z.enum(['user', 'host', 'ai', 'replay', 'system']),
  timestamp: z.number().finite().nonnegative(),
  expectedRevision: z.number().int().nonnegative().optional(),
  reason: ChangeReasonSchema.optional(),
  payload: z.record(z.string(), JsonSchema).default({}),
});
export type RuntimeEvent = z.infer<typeof RuntimeEventSchema>;
export const DecisionPlanSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, flowId: IdentifierSchema,
  snapshotRevision: z.number().int().nonnegative(), policyVersion: IdentifierSchema,
  expiresAt: z.number().finite().positive(), eventType: IdentifierSchema,
  explanation: z.string().min(1).max(1000),
});
export type DecisionPlan = z.infer<typeof DecisionPlanSchema>;
export const TraceEntrySchema = z.strictObject({
  schemaVersion: z.literal(1), sequence: z.number().int().nonnegative(),
  timestamp: z.number().finite().nonnegative(),
  kind: z.enum(['accepted', 'rejected', 'decision', 'effect', 'error', 'interaction']),
  source: RuntimeEventSchema.shape.source.optional(),
  reason: ChangeReasonSchema.optional(),
  eventId: IdentifierSchema, eventType: IdentifierSchema,
  revision: z.number().int().nonnegative(), state: IdentifierSchema,
  detail: z.string().max(2000),
});
export type TraceEntry = z.infer<typeof TraceEntrySchema>;
export const ScenarioDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1),
  flowId: IdentifierSchema, seed: z.number().int().default(1),
  events: z.array(RuntimeEventSchema).max(10000),
  expectedState: IdentifierSchema,
  expectedFields: z.record(IdentifierSchema, z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type ScenarioDefinition = z.infer<typeof ScenarioDefinitionSchema>;
export const DatasetSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1).max(200),
  caseId: IdentifierSchema, source: z.string().min(1).max(2000),
  capturedAt: z.iso.datetime(), records: z.array(z.record(z.string(), JsonSchema)).max(100000),
});
export type Dataset = z.infer<typeof DatasetSchema>;
export const ProjectSchema = z.strictObject({
  schemaVersion: z.literal(1), id: IdentifierSchema, name: z.string().min(1).max(200),
  revision: z.number().int().nonnegative(), flows: z.array(FlowDefinitionSchema).min(1),
  scenarios: z.array(ScenarioDefinitionSchema).default([]),
}).superRefine((value, ctx) => {
  const ids = new Set(value.flows.map(flow => flow.id));
  if (ids.size !== value.flows.length) ctx.addIssue({ code: 'custom', message: 'Duplicate flow ID' });
  for (const scenario of value.scenarios) if (!ids.has(scenario.flowId)) ctx.addIssue({ code: 'custom', message: 'Unknown scenario flow' });
});
export type FluidProject = z.infer<typeof ProjectSchema>;
export function defineFlow(input: z.input<typeof FlowDefinitionSchema>): FlowDefinition { return FlowDefinitionSchema.parse(input); }
export function defineComponent(input: z.input<typeof ComponentDefinitionSchema>): ComponentDefinition { return ComponentDefinitionSchema.parse(input); }
const VisualScenarioFields = {
  caseId: IdentifierSchema,
  viewport: z.strictObject({ width:z.number().positive().max(10000), height:z.number().positive().max(10000) }),
  source: z.array(SceneNodeSchema).max(1000), target: z.array(SceneNodeSchema).max(1000),
  plan: ResolvedEffectPlanSchema.nullable(), durationMs: z.number().min(0).max(10000),
  redacted: z.boolean(),
};
export const VisualScenarioV2Schema = z.strictObject({ schemaVersion: z.literal(2), ...VisualScenarioFields });
export const VisualScenarioV3Schema = z.strictObject({ schemaVersion: z.literal(3), ...VisualScenarioFields, sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null), protectedNodeIds: z.array(IdentifierSchema).max(10000).default([]) });
export const VisualScenarioV4Schema = z.strictObject({ schemaVersion: z.literal(4), ...VisualScenarioFields,
  source: z.array(SceneNodeSchema).max(MOTION_LIMITS.presentedNodes), target: z.array(SceneNodeSchema).max(MOTION_LIMITS.sceneNodes),
  motionVersion: z.literal(2), motionPlan: MotionPlanSchema,
  sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null), protectedNodeIds: z.array(IdentifierSchema).max(MOTION_LIMITS.presentedNodes).default([]),
});
export const RecordingLanguageProfileSchema = z.strictObject({
  context: LocaleContextSchema,
  catalogFingerprint: z.string().min(1).max(160).nullable(),
  fontFingerprints: z.array(z.string().regex(/^[a-f0-9]{64}$/)).min(1).max(32),
  buildId: z.string().min(1).max(160).nullable(),
});
export type RecordingLanguageProfile = z.infer<typeof RecordingLanguageProfileSchema>;
export const VisualScenarioV5Schema = VisualScenarioV4Schema.extend({
  schemaVersion: z.literal(5),
  languageProfile: RecordingLanguageProfileSchema,
  motionVersion: z.union([z.literal(1), z.literal(2)]),
  motionPlan: MotionPlanSchema.optional(),
}).superRefine((record, ctx) => {
  if ((record.motionVersion === 2) !== Boolean(record.motionPlan)) ctx.addIssue({code:'custom',message:'Recorded sampler and motion plan must agree.'});
});
export const VisualScenarioSchema = z.discriminatedUnion('schemaVersion', [VisualScenarioV2Schema, VisualScenarioV3Schema, VisualScenarioV4Schema, VisualScenarioV5Schema]).superRefine((scenario, ctx) => {
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
});
export const TextInkBoxSchema=z.strictObject({id:IdentifierSchema,line:z.number().int().nonnegative(),x:z.number(),y:z.number(),width:z.number().nonnegative(),height:z.number().nonnegative()});
export type TextInkBox=z.infer<typeof TextInkBoxSchema>;
export const TextAuditSchema=z.strictObject({
  scale:z.number().positive(),viewport:z.strictObject({width:z.number().positive(),height:z.number().positive()}),
  backend:z.enum(['webgpu','webgl2']),progress:z.number().min(0).max(1),checkedNodes:z.number().int().nonnegative(),hiddenDuringMotion:z.number().int().nonnegative(),
  boxes:z.array(TextInkBoxSchema),
  textStyles:z.array(z.strictObject({id:IdentifierSchema,componentId:IdentifierSchema,part:IdentifierSchema,fontSize:z.number().positive()})).default([]),
  issues:z.array(z.strictObject({kind:z.enum(['overlap','outside-node','missing-glyphs','truncated']),nodes:z.array(IdentifierSchema),detail:z.string(),severity:z.enum(['error','warning'])})),
});
export type TextAudit=z.infer<typeof TextAuditSchema>;
export type VisualScenario = z.infer<typeof VisualScenarioSchema>;
export const RestagedRecordingSchema = z.strictObject({
  schemaVersion:z.literal(1), kind:z.literal('restaged-recording'), sourceRecordingSha256:z.string().regex(/^[a-f0-9]{64}$/),
  recording:VisualScenarioSchema.refine(record => record.schemaVersion === 5, 'A restaged run requires a language profile'),
});
export type RestagedRecording = z.infer<typeof RestagedRecordingSchema>;
export * from './effects';
export * from './presentation';
export * from './motion';
export * from './motion-geometry';
export * from './text-geometry';
export * from './quality';
export * from './design-tokens';
export * from './acceptance';
export * from './lifecycle';
export * from './data';
export * from './rehearsal';
export * from './theme';
export * from './sequence';
export * from './surface-qualification';

export * from './workspace-qualification';
export * from './input-observation';
export * from './components';
export * from './agent';
export * from './m8-qualification';
export * from './authoring';

export * from './development-proposal';
export * from './m8-timing';
export * from './load';
export * from './proof-capture';
export * from './local-project';
