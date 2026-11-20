import { z } from 'zod';
import { IdentifierSchema, SceneNodeSchema } from './index';
import type { SceneNode } from './index';

// Lazy references keep the public barrel safe: it exports this module before its
// own schemas finish initializing. No DOM, renderer or handler enters a definition.
const Identifier = z.lazy(() => IdentifierSchema);
const Name = z.string().trim().min(1).max(1000);
export const ComponentCapabilitiesSchema = z.strictObject({
  focus: z.boolean().default(false),
  keys: z.array(z.enum(['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape', 'Tab', 'native-input', 'typeahead'])).default([]),
  press: z.boolean().default(false),
});
export const ComponentPartSchema = z.strictObject({
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
});
export const MultipartComponentDefinitionSchema = z.strictObject({
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
});
export type MultipartComponentDefinition = z.infer<typeof MultipartComponentDefinitionSchema>;
export type ComponentPart = z.infer<typeof ComponentPartSchema>;
export type ComponentCapabilities = z.infer<typeof ComponentCapabilitiesSchema>;

// Visual and controlled state are derived from the existing scene contract. The
// component alone owns identity, behavior, semantics and activation authority.
export const ComponentLayoutSchema = z.lazy(() => SceneNodeSchema.omit({
  id: true, anatomy: true, label: true, semantics: true, binding: true,
  onActivate: true, onVisual: true, onCollection: true,
  onEscape: true, focusReturn: true,
}));
export const ComponentCommandBindingSchema = z.union([
  Identifier,
  z.strictObject({ visual: z.lazy(() => SceneNodeSchema.shape.onVisual.unwrap()) }),
  z.strictObject({ collection: z.lazy(() => SceneNodeSchema.shape.onCollection.unwrap()) }),
]);
export const MultipartComponentInstanceSchema = z.strictObject({
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
});
export type MultipartComponentInstance = z.infer<typeof MultipartComponentInstanceSchema>;
export const ComponentInstantiationSchema = MultipartComponentInstanceSchema.omit({ schemaVersion: true, definitionId: true }).extend({
  commands: z.record(Identifier, ComponentCommandBindingSchema).default({}),
  bindings: z.record(Identifier, Identifier).default({}),
  partIds: z.record(Identifier, Identifier).default({}),
  names: z.record(Identifier, Name).default({}),
  semanticParents: z.record(Identifier, Identifier).default({}),
  focusTargets: z.record(Identifier, Identifier).default({}),
  dismissals: z.array(Identifier).default([]),
});
export type ComponentInstantiation = z.input<typeof ComponentInstantiationSchema>;

export function defineMultipartComponent(input: z.input<typeof MultipartComponentDefinitionSchema>): MultipartComponentDefinition {
  return MultipartComponentDefinitionSchema.parse(input);
}

function validateInstance(definition: MultipartComponentDefinition, instance: MultipartComponentInstance) {
  if (instance.definitionId !== definition.id) throw new Error('Component definition does not match instance');
  function exactReferences(actual: Record<string, unknown>, expected: readonly string[], name: string, complete = true) {
    for (const id of Object.keys(actual)) if (!expected.includes(id)) throw new Error(`Unknown ${name}: ${id}`);
    if (complete) for (const id of expected) if (!Object.hasOwn(actual, id)) throw new Error(`Missing ${name}: ${id}`);
  }
  exactReferences(instance.commands, definition.commands, 'command binding');
  exactReferences(instance.bindings, definition.bindings, 'value binding');
  exactReferences(instance.focusTargets, definition.focusTargets, 'focus target binding');
  exactReferences(instance.layouts, definition.layouts, 'layout');
  const partIds = definition.parts.map(part => part.id);
  exactReferences(instance.partIds, partIds, 'part ID');
  exactReferences(instance.names, partIds, 'part name', false);
  exactReferences(instance.semanticParents, partIds, 'semantic parent', false);
  if (new Set(Object.values(instance.partIds)).size !== partIds.length) throw new Error('Duplicate instantiated node ID');
  if (new Set(instance.dismissals).size !== instance.dismissals.length) throw new Error('Duplicate enabled dismissal');
  for (const id of instance.dismissals) if (!definition.parts.some(part => part.id === id && part.dismissCommand)) throw new Error(`Unknown or undeclared dismissal part: ${id}`);
  for (const part of definition.parts) {
    const layout = instance.layouts[part.layout]!;
    if (part.behavior === 'checkbox' && (typeof layout.checked !== 'boolean' || !layout.collection)) throw new Error(`Checkbox ${part.id} requires controlled checked state and a collection binding`);
    if (part.behavior !== 'checkbox' && (layout.collection || layout.checked !== undefined)) throw new Error(`Only checkbox parts can bind collection state: ${part.id}`);
    if (part.semantics?.parent && Object.hasOwn(instance.semanticParents, part.id)) throw new Error(`Conflicting semantic parents: ${part.id}`);
    if (Object.hasOwn(instance.semanticParents, part.id) && !part.semantics) throw new Error(`Semantic parent requires an explicit role: ${part.id}`);
    if (instance.semanticParents[part.id] === instance.partIds[part.id]) throw new Error(`Self-referencing semantic parent: ${part.id}`);
    if (part.dismissCommand && typeof instance.commands[part.dismissCommand] !== 'string') throw new Error(`Dismissal must bind a declared host event: ${part.id}`);
  }
}

export function instantiateMultipartComponent(input: MultipartComponentDefinition, options: ComponentInstantiation): MultipartComponentInstance {
  const definition = MultipartComponentDefinitionSchema.parse(input);
  const parsed = ComponentInstantiationSchema.parse(options);
  const partIds = Object.fromEntries(definition.parts.map(part => [part.id, parsed.partIds[part.id] ?? `${parsed.id}.${part.id}`]));
  // Retain unknown caller keys for validation rather than silently dropping them.
  const instance = MultipartComponentInstanceSchema.parse({ ...parsed, schemaVersion: 1, definitionId: definition.id, partIds: { ...parsed.partIds, ...partIds } });
  validateInstance(definition, instance);
  return instance;
}

/** Produces the actual scene used by Core, rendering and the native bridge. */
export function projectMultipartComponent(input: MultipartComponentDefinition, value: MultipartComponentInstance): SceneNode[] {
  const definition = MultipartComponentDefinitionSchema.parse(input);
  const instance = MultipartComponentInstanceSchema.parse(value);
  validateInstance(definition, instance);
  return definition.parts.map(part => {
    const command = part.command ? instance.commands[part.command] : undefined;
    const activation = typeof command === 'string' ? { onActivate: command }
      : command && 'visual' in command ? { onVisual: command.visual }
      : command && 'collection' in command ? { onCollection: command.collection } : {};
    const parentId = part.semantics?.parent ? instance.partIds[part.semantics.parent] : instance.semanticParents[part.id];
    const dismissal = part.dismissCommand && instance.dismissals.includes(part.id) ? {
      onEscape: instance.commands[part.dismissCommand],
      ...(part.focusTarget ? { focusReturn: instance.focusTargets[part.focusTarget] } : {}),
    } : {};
    return SceneNodeSchema.parse({ ...instance.layouts[part.layout], id: instance.partIds[part.id],
      anatomy: { componentId: instance.id, part: part.id, behavior: part.behavior },
      ...(part.name || instance.names[part.id] ? { label: instance.names[part.id] ?? part.name } : {}),
      ...(part.binding ? { binding: instance.bindings[part.binding] } : {}),
      ...(part.semantics ? { semantics: { role: part.semantics.role, ...(parentId ? { parentId } : {}) } } : {}),
      ...activation,
      ...dismissal,
    });
  });
}
