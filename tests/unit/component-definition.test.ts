import { describe, expect, it } from 'vitest';
import { defineFlow } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import {
  defineMultipartComponent, instantiateMultipartComponent, projectMultipartComponent,
  MultipartComponentDefinitionSchema, MultipartComponentInstanceSchema,
} from '../../packages/contracts/src/components';

// Contract fixtures only; the real Workspace binds its imported module IDs/data.
const moduleDefinition = () => defineMultipartComponent({
  schemaVersion: 1, id: 'workspace-module', name: 'Workspace module',
  commands: ['open'], layouts: ['control', 'selection', 'summary'],
  parts: [
    { id: 'control', layout: 'control', behavior: 'button', name: 'Modul öffnen', command: 'open', capabilities: { focus: true, keys: ['Enter', 'Space'], press: true } },
    { id: 'selection', layout: 'selection', behavior: 'checkbox', name: 'Modul auswählen', capabilities: { focus: true, keys: ['Space'], press: true } },
    { id: 'summary', layout: 'summary', behavior: 'presentation' },
  ],
});
const instance = (view: 'cards' | 'map', checked = false) => instantiateMultipartComponent(moduleDefinition(), {
  id: 'module-core', commands: { open: 'select.core' },
  layouts: {
    control: { kind: 'card', x: view === 'cards' ? 100 : 300, width: view === 'cards' ? 220 : 132, text: 'core' },
    selection: { kind: 'checkbox', x: 105, width: 28, height: 28, checked, collection: { id: 'modules', itemId: 'core' } },
    summary: { kind: 'text', text: 'Kernel · 2 TS' },
  },
  partIds: { control: 'module-core', selection: 'module-core-selection', summary: 'module-core-summary' },
  names: { control: 'Modul core öffnen', selection: 'Modul core auswählen' },
});

describe('versioned multipart component definitions', () => {
  it('projects the same stable parts and commands through different visual layouts and controlled selection', () => {
    const definition = moduleDefinition();
    const cards = projectMultipartComponent(definition, instance('cards'));
    const map = projectMultipartComponent(definition, instance('map', true));
    expect(cards.map(node => node.id)).toEqual(map.map(node => node.id));
    expect(cards.map(node => node.anatomy)).toEqual(map.map(node => node.anatomy));
    expect(cards[0]).toMatchObject({ id: 'module-core', onActivate: 'select.core', label: 'Modul core öffnen', width: 220, anatomy: { componentId: 'module-core', part: 'control', behavior: 'button' } });
    expect(map[0]).toMatchObject({ width: 132, x: 300, onActivate: 'select.core' });
    expect(cards[1]).toMatchObject({ checked: false, collection: { id: 'modules', itemId: 'core' } });
    expect(map[1]?.checked).toBe(true);
    expect(map[1]?.onActivate).toBeUndefined();
    expect(map[2]?.anatomy.behavior).toBe('presentation');
  });
  it('roundtrips definitions and instances as JSON without embedding code or runtime objects', () => {
    const definition = moduleDefinition(), value = instance('cards');
    const restoredDefinition = MultipartComponentDefinitionSchema.parse(JSON.parse(JSON.stringify(definition)));
    const restoredInstance = MultipartComponentInstanceSchema.parse(JSON.parse(JSON.stringify(value)));
    expect(projectMultipartComponent(restoredDefinition, restoredInstance)).toEqual(projectMultipartComponent(definition, value));
    expect(() => projectMultipartComponent(definition, { ...value, layouts: { ...value.layouts, control: { ...value.layouts.control!, onActivate: 'unregistered.action' } } } as never)).toThrow(/onActivate/);
    for (const injected of [{ onEscape: 'unregistered.action' }, { focusReturn: 'unregistered.target' }]) {
      expect(() => projectMultipartComponent(definition, { ...value, layouts: { ...value.layouts, selection: { ...value.layouts.selection!, ...injected } } } as never)).toThrow();
    }
  });

  it('only enables explicitly declared dismissal commands and focus bindings', () => {
    const definition = defineMultipartComponent({ ...moduleDefinition(), commands: ['open', 'dismiss'], focusTargets: ['trigger'], parts: moduleDefinition().parts.map(part => part.id === 'selection' ? {
      ...part, dismissCommand: 'dismiss', focusTarget: 'trigger', capabilities: { ...part.capabilities, keys: ['Space', 'Escape'] },
    } : part) });
    const base = instance('cards');
    const options = { ...base, commands: { open: 'select.core', dismiss: 'inspector.close' }, focusTargets: { trigger: 'selection-inspect' }, dismissals: ['selection'] };
    const enabled = instantiateMultipartComponent(definition, { id: options.id, layouts: options.layouts, partIds: options.partIds, commands: options.commands, focusTargets: options.focusTargets, dismissals: options.dismissals });
    expect(projectMultipartComponent(definition, enabled)[1]).toMatchObject({ onEscape: 'inspector.close', focusReturn: 'selection-inspect' });
    const disabled = { ...enabled, dismissals: [] };
    expect(projectMultipartComponent(definition, disabled)[1]?.onEscape).toBeUndefined();
    expect(projectMultipartComponent(definition, disabled)[1]?.focusReturn).toBeUndefined();
    expect(() => projectMultipartComponent(definition, { ...enabled, dismissals: ['summary'] })).toThrow('undeclared dismissal');
    expect(() => projectMultipartComponent(definition, { ...enabled, dismissals: ['selection', 'selection'] })).toThrow('Duplicate enabled');
    expect(() => projectMultipartComponent(definition, { ...enabled, focusTargets: { trigger: 'selection-inspect', unregistered: 'other' } })).toThrow('Unknown focus');
    expect(() => projectMultipartComponent(definition, { ...enabled, focusTargets: {} })).toThrow('Missing focus');
    expect(() => projectMultipartComponent(definition, { ...enabled, commands: { ...enabled.commands, dismiss: { collection: { id: 'modules', operation: 'clear' } } } })).toThrow('host event');
    expect(() => defineMultipartComponent({ ...definition, focusTargets: [] })).toThrow('Unknown focus');
    expect(() => defineMultipartComponent({ ...definition, commands: ['open'] })).toThrow('Unknown dismissal');
    expect(() => defineMultipartComponent({ ...definition, parts: definition.parts.map(part => part.id === 'selection' ? { ...part, capabilities: { ...part.capabilities, keys: ['Space'] } } : part) })).toThrow('Escape');
  });

  it('rejects unknown, decorative, hidden or disabled focus-return targets at the composed Flow boundary', () => {
    const valid = () => ({ id: 'focus-return', name: 'Focus return', initial: 'ready', states: { ready: { label: 'Ready', nodes: [
      { id: 'trigger', kind: 'button' as const, text: 'Open', onActivate: 'open', anatomy: { componentId: 'inspector', part: 'trigger', behavior: 'button' as const } },
      { id: 'close', kind: 'button' as const, text: 'Close', onActivate: 'close', onEscape: 'close', focusReturn: 'trigger', anatomy: { componentId: 'inspector', part: 'close', behavior: 'button' as const } },
    ], on: { open: { target: 'ready' }, close: { target: 'ready' } } } } });
    expect(defineFlow(valid()).states.ready!.nodes[1]?.focusReturn).toBe('trigger');
    const missing = valid(); missing.states.ready.nodes[1]!.focusReturn = 'missing';
    expect(() => defineFlow(missing)).toThrow('available interactive target');
    for (const patch of [{ disabled: true }, { opacity: 0 }, { onActivate: undefined, anatomy: { componentId: 'inspector', part: 'trigger', behavior: 'presentation' as const } }]) {
      const definition = valid();
      expect(() => defineFlow({ ...definition, states: { ready: { ...definition.states.ready, nodes: [{ ...definition.states.ready.nodes[0]!, ...patch }, definition.states.ready.nodes[1]!] } } })).toThrow('available interactive target');
    }
  });

  it('projects disabled collection membership from its authoritative item and rejects focus or activation', () => {
    const definition = moduleDefinition();
    const projected = projectMultipartComponent(definition, instance('cards'));
    const flow = defineFlow({ id: 'disabled-item', name: 'Disabled member', initial: 'ready', fields: [{ id: 'selection', type: 'keys', initial: [] }],
      collections: [{ id: 'modules', field: 'selection', items: [{ id: 'core', label: 'Core', disabled: true }] }],
      states: { ready: { label: 'Ready', nodes: projected, on: { 'select.core': { target: 'ready' } } } },
    });
    const runtime = createFluidRuntime({ flow });
    try {
      expect(projected[1]?.disabled).toBe(false);
      expect(runtime.getScene().find(node => node.id === 'module-core-selection')?.disabled).toBe(true);
      expect(() => runtime.setInteraction({ focusedId: 'module-core-selection' })).toThrow('disabled');
      expect(runtime.activatePart('module-core-selection', 'pointer')).toBe(false);
      expect(runtime.getSnapshot().revision).toBe(0);
      expect(() => defineFlow({ ...flow, states: { ready: { ...flow.states.ready!, nodes: flow.states.ready!.nodes.map(node => node.id === 'module-core' ? { ...node, focusReturn: 'module-core-selection' } : node) } } })).toThrow('available interactive target');
    } finally { runtime.dispose(); }
  });
  it('validates the projected activation against the actual host flow, not merely a component command string', () => {
    const nodes = projectMultipartComponent(moduleDefinition(), instance('cards'));
    const host = { id: 'host', name: 'Host', initial: 'ready', fields: [{ id: 'selection', type: 'keys' as const, initial: [] }], collections: [{ id: 'modules', field: 'selection', items: [{ id: 'core', label: 'Core' }] }] };
    expect(defineFlow({ ...host, states: { ready: { label: 'Ready', nodes, on: { 'select.core': { target: 'detail' } } }, detail: { label: 'Detail', nodes: [] } } }).states.ready!.nodes).toEqual(nodes);
    // A component command is a declared reference, not permission to invent a host action.
    expect(() => defineFlow({ ...host, states: { ready: { label: 'Ready', nodes } } })).toThrow(/Unknown activation event/);
  });
  it.each([
    ['duplicate part', (d: ReturnType<typeof moduleDefinition>) => { d.parts.push({ ...d.parts[0]! }); }],
    ['duplicate declaration', (d: ReturnType<typeof moduleDefinition>) => { d.commands.push('open'); }],
    ['unknown layout', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.layout = 'unknown'; }],
    ['unknown command', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.command = 'delete'; }],
    ['missing accessible name', (d: ReturnType<typeof moduleDefinition>) => { delete d.parts[0]!.name; }],
    ['blank accessible name', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.name = '   '; }],
    ['missing focus', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.capabilities.focus = false; }],
    ['missing keyboard', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.capabilities.keys = ['Enter']; }],
    ['missing press', (d: ReturnType<typeof moduleDefinition>) => { d.parts[0]!.capabilities.press = false; }],
    ['decorative activation', (d: ReturnType<typeof moduleDefinition>) => { d.parts[2]!.command = 'open'; }],
    ['decorative focus', (d: ReturnType<typeof moduleDefinition>) => { d.parts[2]!.capabilities.focus = true; }],
    ['checkbox without Space', (d: ReturnType<typeof moduleDefinition>) => { d.parts[1]!.capabilities.keys = ['Enter']; }],
  ])('rejects %s before projection', (_name, mutate) => {
    const definition = moduleDefinition(); mutate(definition);
    expect(MultipartComponentDefinitionSchema.safeParse(definition).success).toBe(false);
  });
  it('rejects unknown or missing instance bindings and duplicate stable node IDs', () => {
    const definition = moduleDefinition(), original = instance('cards');
    expect(() => projectMultipartComponent(definition, { ...original, definitionId: 'other' })).toThrow('does not match');
    expect(() => projectMultipartComponent(definition, { ...original, commands: {} })).toThrow('Missing command');
    expect(() => projectMultipartComponent(definition, { ...original, commands: { open: 'select.core', delete: 'delete.core' } })).toThrow('Unknown command');
    expect(() => projectMultipartComponent(definition, { ...original, names: { unknown: 'Unregistered' } })).toThrow('Unknown part name');
    expect(() => projectMultipartComponent(definition, { ...original, partIds: { ...original.partIds, summary: original.partIds.control! } })).toThrow('Duplicate instantiated');
    expect(() => projectMultipartComponent(definition, { ...original, layouts: { ...original.layouts, selection: { ...original.layouts.selection!, checked: undefined } } })).toThrow('controlled checked');
    expect(() => projectMultipartComponent(definition, { ...original, layouts: { ...original.layouts, selection: { ...original.layouts.selection!, collection: undefined } } })).toThrow('collection binding');
  });
  it('resolves internal semantic parts and allows explicitly composed external parents', () => {
    const definition = defineMultipartComponent({ schemaVersion: 1, id: 'table-row', name: 'Table row', layouts: ['row', 'cell'], parts: [
      { id: 'root', behavior: 'presentation', layout: 'row', semantics: { role: 'row' } },
      { id: 'label', behavior: 'presentation', layout: 'cell', semantics: { role: 'cell', parent: 'root' } },
    ] });
    const value = instantiateMultipartComponent(definition, { id: 'row-core', layouts: { row: { kind: 'box' }, cell: { kind: 'text', text: 'core' } }, semanticParents: { root: 'module-table' } });
    const nodes = projectMultipartComponent(definition, value);
    expect(nodes[0]).toMatchObject({ id: 'row-core.root', semantics: { role: 'row', parentId: 'module-table' } });
    expect(nodes[1]).toMatchObject({ id: 'row-core.label', semantics: { role: 'cell', parentId: 'row-core.root' } });
    expect(() => projectMultipartComponent(definition, { ...value, semanticParents: { label: 'other' } })).toThrow('Conflicting semantic');
    const bad = structuredClone(definition); bad.parts[0]!.semantics!.parent = 'missing';
    expect(MultipartComponentDefinitionSchema.safeParse(bad).success).toBe(false);
    bad.parts[0]!.semantics!.parent = 'label';
    expect(MultipartComponentDefinitionSchema.safeParse(bad).success).toBe(false);
  });
  it('requires an explicit native-input policy and controlled field mapping for text parts', () => {
    const definition = defineMultipartComponent({ schemaVersion: 1, id: 'query', name: 'Search', layouts: ['input'], bindings: ['value'], parts: [
      { id: 'control', layout: 'input', behavior: 'textbox', name: 'Suche', binding: 'value', capabilities: { focus: true, keys: ['native-input'], press: false } },
    ] });
    const value = instantiateMultipartComponent(definition, { id: 'search', bindings: { value: 'query' }, layouts: { input: { kind: 'input' } } });
    expect(projectMultipartComponent(definition, value)[0]?.binding).toBe('query');
    expect(() => projectMultipartComponent(definition, { ...value, bindings: {} })).toThrow('Missing value binding');
  });
  it('binds a declared bulk-selection command without adding a second activation authority', () => {
    const definition = defineMultipartComponent({ schemaVersion: 1, id: 'clear', name: 'Clear selection', commands: ['clear'], layouts: ['control'], parts: [
      { id: 'control', layout: 'control', behavior: 'button', name: 'Auswahl löschen', command: 'clear', capabilities: { focus: true, keys: ['Enter', 'Space'], press: true } },
    ] });
    const value = instantiateMultipartComponent(definition, { id: 'clear-selection', commands: { clear: { collection: { id: 'modules', operation: 'clear' } } }, layouts: { control: { kind: 'button' } } });
    expect(projectMultipartComponent(definition, value)[0]).toMatchObject({ onCollection: { id: 'modules', operation: 'clear' } });
    expect(projectMultipartComponent(definition, value)[0]?.onActivate).toBeUndefined();
  });
});
