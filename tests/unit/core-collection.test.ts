import { describe, expect, it } from 'vitest';
import { defineFlow, type SceneNodeInput } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';

const nodes: SceneNodeInput[] = ['a', 'b', 'c'].map((id, index) => ({
  id: `pick-${id}`, anatomy: { componentId: id, part: 'selection', behavior: 'checkbox' },
  kind: 'checkbox', label: `Select ${id}`, checked: false, collection: { id: 'items', itemId: id },
  x: 10, y: index * 50, width: 32, height: 32,
}));
function flow() {
  return defineFlow({ id: 'collection-proof', name: 'Collection test fixture', initial: 'table',
    fields: [{ id: 'selection', type: 'keys', initial: [] }],
    collections: [{ id: 'items', field: 'selection', items: ['a', 'b', 'c'].map(id => ({ id, label: id })) }],
    states: { table: { label: 'Table', nodes, on: { cards: { target: 'cards' } } }, cards: { label: 'Cards', nodes, on: { table: { target: 'table' } } } },
  });
}

describe('one authoritative collection across input adapters', () => {
  it('commits once and derives checked state from domain keys across projections', () => {
    const runtime = createFluidRuntime({ flow: flow() });
    expect(runtime.activatePart('pick-a', 'pointer')).toBe(true);
    expect(runtime.getSnapshot().revision).toBe(1);
    expect(runtime.getSnapshot().fields.selection).toEqual(['a']);
    expect(runtime.getScene().find(node => node.id === 'pick-a')?.checked).toBe(true);
    runtime.send('cards');
    expect(runtime.getScene().find(node => node.id === 'pick-a')?.checked).toBe(true);
    runtime.activatePart('pick-b', 'keyboard', { shiftKey: true, from: 'a' });
    expect(runtime.getSnapshot().fields.selection).toEqual(['a', 'b']);
    expect(runtime.getTrace().filter(entry => entry.eventType === 'collection.change' && entry.kind === 'accepted')).toHaveLength(2);
    runtime.dispose();
  });
  it('rejects unknown, duplicate and disabled keys without changing domain or SDK anchor', () => {
    const definition = flow(); definition.collections[0]!.items[2]!.disabled = true;
    const runtime = createFluidRuntime({ flow: definition });
    const before = runtime.getSnapshot();
    for (const keys of [['missing'], ['a', 'a'], ['c']]) {
      expect(runtime.send('collection.change', { collectionId: 'items', keys }).accepted).toBe(false);
      expect(runtime.getSnapshot()).toBe(before);
    }
    expect(runtime.collection('items').toggle('c')).toBe(false);
    expect(runtime.collection('items').getAnchor()).toBeNull();
    runtime.dispose();
  });
  it('honors synchronous host cancellation, stale revisions, and the AI authority gate', () => {
    const runtime = createFluidRuntime({ flow: flow(), beforeChange: details => details.cancel() });
    expect(runtime.activatePart('pick-a', 'pointer')).toBe(false);
    expect(runtime.collection('items').getAnchor()).toBeNull();
    expect(runtime.getSnapshot().revision).toBe(0);
    expect(runtime.send('collection.change', { collectionId: 'items', keys: ['a'] }, 'ai').accepted).toBe(false);
    expect(runtime.dispatch({ id: 'stale', type: 'collection.change', source: 'user', timestamp: 1, expectedRevision: 1, payload: { collectionId: 'items', keys: ['a'] } }).accepted).toBe(false);
    runtime.dispose();
  });
  it('shares resolved bounds with render-independent consumers', () => {
    const definition = flow(); definition.states.table!.nodes[0]!.x = 900; definition.states.table!.nodes[0]!.width = 240;
    const runtime = createFluidRuntime({ flow: definition });
    expect(runtime.getScene({ width: 1000, height: 700 })[0]?.width).toBe(84);
    expect(definition.states.table!.nodes[0]!.width).toBe(240);
    runtime.dispose();
  });
  it('validates restored array fields and supports read-only replay state without actions', () => {
    const runtime = createFluidRuntime({ flow: flow() });
    expect(runtime.send('navigation.restore', { state: 'cards', fields: { selection: ['b'] } }, 'host').accepted).toBe(true);
    expect(runtime.getScene().find(node => node.id === 'pick-b')?.checked).toBe(true);
    const before = runtime.getSnapshot();
    expect(runtime.send('navigation.restore', { state: 'table', fields: { selection: ['unknown'] } }, 'host').accepted).toBe(false);
    expect(runtime.getSnapshot()).toBe(before);
    runtime.dispose();
  });
});
