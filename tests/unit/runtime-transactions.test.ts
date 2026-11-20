import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { defineFlow, type LocalCommand } from '@fluidkit/contracts';
import { createFluidRuntime, type LocalTransactionAuthority } from '@fluidkit/core';

const authority = (): LocalTransactionAuthority => ({ source: 'ai', reason: 'ai', approved: true, authorize: () => true });
const flow = () => defineFlow({ id: 'transactions', name: 'Explicit transaction fixture', initial: 'a',
  fields: [{ id: 'name', initial: 'Original' }, { id: 'secret', initial: 'private-value', sensitive: true }, { id: 'keys', type: 'keys', initial: [] }],
  collections: [{ id: 'items', field: 'keys', items: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two', disabled: true }] }],
  states: {
    a: { label: 'A', nodes: [{ id: 'input', kind: 'input', binding: 'name', label: 'Name', anatomy: { componentId: 'form', part: 'input', behavior: 'textbox' } }], on: { next: { target: 'b', aiAllowed: true, guard: 'named' }, save: { target: 'b', action: 'save' }, forbidden: { target: 'b' } } },
    b: { label: 'B', route: '/b', nodes: [], on: { next: { target: 'c', aiAllowed: true }, back: { target: 'a', aiAllowed: true } } },
    c: { label: 'C', route: '/c', nodes: [], on: { reset: { target: 'a', aiAllowed: true } } },
  },
});
const transaction = (commands: LocalCommand[]) => ({ schemaVersion: 1 as const, id: 'transaction-1', expectedRevision: 0, commands });

describe('atomic local Core transactions', () => {
  it('keeps committed receipts truthful and diagnostics bounded when observer, trace and router callbacks fail', () => {
    const failing = vi.fn(() => { throw new Error('PRIVATE callback detail'); }), healthy = vi.fn();
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => true }, actions: { save: async () => {} }, trace: { write: failing }, router: { navigate: failing } });
    r.subscribe(failing); r.subscribe(healthy); r.subscribeTrace(failing); r.subscribeVisual(failing); r.subscribeInteraction(failing);
    r.setInteraction({ hoveredId: 'input' });
    const result = r.transact(transaction([{ type: 'field', fieldId: 'name', value: 'Committed' }, { type: 'event', eventType: 'next', payload: {} }]), authority());
    expect(result).toMatchObject({ accepted: true, snapshot: { revision: 1, state: 'b', fields: { name: 'Committed' } } });
    expect(r.getSnapshot().state).toBe('b'); expect(healthy).toHaveBeenCalledTimes(1);
    const diagnostics = r.getTrace().filter(entry => entry.kind === 'error');
    for (const boundary of ['trace sink', 'trace observer', 'state observer', 'visual observer', 'interaction observer', 'router']) expect(diagnostics.some(entry => entry.detail.includes(boundary))).toBe(true);
    expect(diagnostics.length).toBeLessThan(12); expect(failing.mock.calls.length).toBeLessThan(12);
    expect(JSON.stringify(diagnostics)).not.toContain('PRIVATE'); r.dispose();
  });

  it('checks guards against staged fields and commits one snapshot/notification/final route', () => {
    const navigate = vi.fn(), listener = vi.fn(), save = vi.fn(async () => {}), guard = vi.fn(snapshot => snapshot.fields.name === 'Ready');
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: guard }, actions: { save }, router: { navigate } });
    r.subscribe(listener);
    const result = r.transact(transaction([{ type: 'field', fieldId: 'name', value: 'Ready' }, { type: 'event', eventType: 'next', payload: {} }, { type: 'event', eventType: 'next', payload: {} }]), authority());
    expect(result.accepted).toBe(true);
    expect(r.getSnapshot()).toMatchObject({ state: 'c', revision: 1, fields: { name: 'Ready' } });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/c', false);
    expect(save).not.toHaveBeenCalled();
    expect(guard.mock.calls[0]?.[0].fields.name).toBe('Ready');
    expect(r.send('reset').accepted).toBe(true); // The statechart is in the committed state.
    r.dispose();
  });

  it.each(['unknown', 'guard', 'action', 'not-ai', 'invalid-field', 'disabled-key'])('leaves the entire batch unpublished on a later %s failure', failure => {
    const save = vi.fn(async () => {}), navigate = vi.fn();
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => false }, actions: { save }, router: { navigate } });
    const before = r.getSnapshot();
    const bad: LocalCommand = failure === 'invalid-field' ? { type: 'field', fieldId: 'name', value: 3 }
      : failure === 'disabled-key' ? { type: 'collection', collectionId: 'items', keys: ['two'] }
        : { type: 'event', eventType: failure === 'guard' ? 'next' : failure === 'action' ? 'save' : failure === 'not-ai' ? 'forbidden' : 'unknown', payload: {} };
    expect(r.transact(transaction([{ type: 'field', fieldId: 'name', value: 'Uncommitted' }, bad]), authority()).accepted).toBe(false);
    expect(r.getSnapshot()).toBe(before);
    expect(save).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled(); r.dispose();
  });

  it('rechecks policy after host callbacks and rejects sensitive writes/active input', () => {
    let permitted = true;
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => true }, actions: { save: async () => {} }, beforeChange: () => { permitted = false; } });
    const before = r.getSnapshot();
    expect(r.transact(transaction([{ type: 'field', fieldId: 'name', value: 'New' }]), { ...authority(), authorize: () => permitted }).accepted).toBe(false);
    expect(r.getSnapshot()).toBe(before); r.dispose();
    const active = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => true }, actions: { save: async () => {} } });
    expect(active.transact(transaction([{ type: 'field', fieldId: 'secret', value: 'leak' }]), authority()).accepted).toBe(false);
    active.setInteraction({ focusedId: 'input', composingId: 'input' });
    expect(active.transact(transaction([{ type: 'field', fieldId: 'name', value: 'New' }]), authority()).accepted).toBe(false);
    expect(active.getSnapshot().revision).toBe(0); active.dispose();
  });

  it.each(['state', 'dispose', 'interaction'])('rechecks %s after the final authorization callback rather than trusting a stale true return', change => {
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => true }, actions: { save: async () => {} } });
    let calls = 0;
    const result = r.transact(transaction([{ type: 'field', fieldId: 'name', value: 'Transaction candidate' }]), {
      ...authority(), authorize() {
        if (++calls === 3) {
          if (change === 'state') r.send('field.change', { fieldId: 'name', value: 'Newer host value' }, 'host');
          else if (change === 'dispose') r.dispose();
          else r.setInteraction({ focusedId: 'input', composingId: 'input' });
        }
        return true;
      },
    });
    expect(result.accepted).toBe(false);
    expect(r.getSnapshot().fields.name).toBe(change === 'state' ? 'Newer host value' : 'Original');
    expect(r.getSnapshot().revision).toBe(change === 'state' ? 1 : 0);
    r.dispose();
  });

  it('honors Cancel, stale revisions, duplicate IDs and direct AI mode boundaries', () => {
    const r = createFluidRuntime({ flow: flow(), mode: 'hybrid', guards: { named: () => true }, actions: { save: async () => {} }, beforeChange: details => details.cancel() });
    const commands: LocalCommand[] = [{ type: 'field', fieldId: 'name', value: 'New' }];
    expect(r.transact(transaction(commands), authority()).accepted).toBe(false); expect(r.getSnapshot().revision).toBe(0); r.dispose();
    for (const mode of ['manual', 'hybrid', 'auto'] as const) {
      const current = createFluidRuntime({ flow: flow(), mode, guards: { named: () => true }, actions: { save: async () => {} } });
      const context = { ...authority(), approved: false };
      expect(current.transact(transaction(commands), context).accepted).toBe(mode === 'auto');
      if (mode === 'auto') expect(current.transact({ ...transaction(commands), expectedRevision: 1 }, context).accepted).toBe(false);
      expect(current.transact({ ...transaction(commands), id: 'stale', expectedRevision: 99 }, authority()).accepted).toBe(false);
      current.dispose();
    }
  });

  it('does not publish generated valid prefixes when the final command is invalid', () => {
    fc.assert(fc.property(fc.array(fc.string({ maxLength: 40 }), { minLength: 1, maxLength: 10 }), values => {
      const r = createFluidRuntime({ flow: flow(), mode: 'auto', guards: { named: () => true }, actions: { save: async () => {} } });
      const commands: LocalCommand[] = values.map(value => ({ type: 'field', fieldId: 'name', value }));
      const initial = r.getSnapshot();
      expect(r.transact(transaction([...commands, { type: 'event', eventType: 'unregistered', payload: {} }]), authority()).accepted).toBe(false);
      expect(r.getSnapshot()).toBe(initial); r.dispose();
    }), { numRuns: 50 });
  });
});
