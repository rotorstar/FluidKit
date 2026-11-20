import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AgentPolicySchema, AgentRequestSchema, defineFlow, type AgentRequest } from '@fluidkit/contracts';
import { createFluidAgentBridge, createFluidRuntime, defineAgentExternalAction, defineAgentLocalAction, defineAgentQuery, type AgentExternalAction, type AgentQuery } from '@fluidkit/core';
import { defineActionAdapter } from '@fluidkit/core/data';

const scope = { projectId: 'project', flowId: 'agent-fixture' };
const flow = () => defineFlow({ id: scope.flowId, name: 'Explicit agent fixture', initial: 'ready',
  fields: [{ id: 'name', initial: 'Public' }, { id: 'secret', initial: 'PRIVATE-CONTENT', sensitive: true }],
  states: {
    ready: { label: 'Ready', nodes: [
      { id: 'name', kind: 'input', label: 'Name', binding: 'name', anatomy: { componentId: 'form', part: 'name', behavior: 'textbox' } },
      { id: 'secret', kind: 'input', label: 'Secret', binding: 'secret', anatomy: { componentId: 'form', part: 'secret', behavior: 'textbox' } },
    ], on: { open: { target: 'detail', aiAllowed: true, guard: 'allowed' } } },
    detail: { label: 'Detail', route: '/detail', nodes: [], on: { close: { target: 'ready', aiAllowed: true } } },
  },
});
const local = [
  defineAgentLocalAction({ id: 'set-name', componentId: 'form', parameters: z.strictObject({ value: z.string().max(100) }), commands: value => [{ type: 'field', fieldId: 'name', value: value.value }] }),
  defineAgentLocalAction({ id: 'open', componentId: 'navigation', parameters: z.strictObject({}), commands: () => [{ type: 'event', eventType: 'open', payload: {} }] }),
  defineAgentLocalAction({ id: 'unknown-event', componentId: 'navigation', parameters: z.strictObject({}), commands: () => [{ type: 'event', eventType: 'unknown', payload: {} }] }),
];
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; }
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function setup(options: { mode?: 'manual' | 'hybrid' | 'auto'; external?: AgentExternalAction[]; queries?: AgentQuery[]; replay?: boolean; allowed?: () => boolean } = {}) {
  const actions = [...local, ...options.external ?? []];
  const control = { policy: AgentPolicySchema.parse({ version: 'policy-1', read: { state: true, fields: ['name', 'secret'], components: ['form'], queries: options.queries?.map(query => query.id) ?? [] },
    actions: actions.map(action => ({ componentId: action.componentId, actionId: action.id })), autoActions: local.map(action => ({ componentId: action.componentId, actionId: action.id })) }), time: 100 };
  const navigate = vi.fn();
  const runtime = createFluidRuntime({ flow: flow(), mode: options.mode ?? 'hybrid', replay: options.replay, router: { navigate }, guards: { allowed: options.allowed ?? (() => true) } });
  const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'trusted-session-user', getPolicy: () => control.policy, actions, queries: options.queries, now: () => control.time });
  const request = (steps: AgentRequest['steps'], mode: AgentRequest['mode'] = 'atomic-local', id = 'request-1') => AgentRequestSchema.parse({ schemaVersion: 1, id, scope,
    snapshotRevision: runtime.getSnapshot().revision, policyVersion: 'policy-1', expiresAt: 1000, mode, steps });
  const dispose = () => { bridge.dispose(); runtime.dispose(); };
  return { runtime, bridge, control, navigate, request, dispose };
}
const name = (value = 'Changed') => ({ componentId: 'form', actionId: 'set-name', parameters: { value } });
const open = () => ({ componentId: 'navigation', actionId: 'open', parameters: {} });
const externalStep = (id = 'publish') => ({ componentId: 'publisher', actionId: id, parameters: { title: 'Document' } });
function external(execute = vi.fn(async () => ({ id: 'host-transaction-1', private: 'HOST-SECRET' })), authorize: () => boolean | Promise<boolean> = () => true, id = 'publish') {
  return defineAgentExternalAction({ id, componentId: 'publisher', adapter: defineActionAdapter({ id, version: '1', input: z.strictObject({ title: z.string() }), output: z.strictObject({ id: z.string(), private: z.string() }), authorize, execute }), publicResult: value => ({ id: value.id }) });
}

describe('default-deny Fluid agent bridge', () => {
  it('keeps an unconfigured bridge closed, validates target/parameter/scope and refuses forged authority fields', async () => {
    const state = setup(), closed = createFluidAgentBridge({ runtime: state.runtime, scope, principalId: 'host', now: () => 100 });
    expect(() => closed.snapshot()).toThrow('policy-denied');
    await expect(closed.propose(state.request([name()]))).rejects.toThrow('policy-denied');
    for (const patch of [{ scope: { ...scope, projectId: 'other' } }, { steps: [{ ...name(), componentId: 'unknown' }] }, { steps: [{ ...name(), parameters: { value: 12 } }] }, { approved: true }, { source: 'user' }, { principalId: 'admin' }]) {
      await expect(state.bridge.propose({ ...state.request([name()]), ...patch })).rejects.toThrow();
    }
    state.control.policy.actions = [];
    await expect(state.bridge.propose(state.request([name()]))).rejects.toThrow('policy-denied');
    expect(state.runtime.getSnapshot().revision).toBe(0); closed.dispose(); state.dispose();
  });

  it('returns only permitted nonsensitive context without any focus, history, trace or domain write', () => {
    const s = setup(); s.runtime.setInteraction({ focusedId: 'name' });
    const before = s.runtime.getSnapshot(), interaction = s.runtime.getInteraction(), traces = s.runtime.getTrace();
    const snapshot = s.bridge.snapshot();
    expect(snapshot).toMatchObject({ scope, revision: 0, state: 'ready', fields: { name: 'Public' } });
    expect(Object.keys(snapshot.fields)).toEqual(['name']);
    expect(snapshot.components[0]?.parts.map(part => part.id)).toEqual(['name']);
    expect(JSON.stringify(snapshot)).not.toContain('PRIVATE-CONTENT');
    expect(s.runtime.getSnapshot()).toBe(before); expect(s.runtime.getInteraction()).toBe(interaction); expect(s.runtime.getTrace()).toEqual(traces); expect(s.navigate).not.toHaveBeenCalled();
    s.control.policy.read = { state: false, fields: [], components: [], queries: [] };
    expect(s.bridge.snapshot()).toMatchObject({ fields: {}, components: [] }); expect(s.bridge.snapshot().state).toBeUndefined(); s.dispose();
  });

  it('requires separate host approval in Hybrid, commits an atomic batch once and invokes the existing Guard', async () => {
    const allowed = vi.fn(() => true), s = setup({ allowed });
    expect(await s.bridge.propose(s.request([name(), open()]))).toMatchObject({ status: 'pending', revision: 0 });
    expect(s.runtime.getSnapshot().revision).toBe(0);
    await expect(s.bridge.executeApproved('request-1')).rejects.toThrow('approval-required');
    s.bridge.approve('request-1');
    const result = await s.bridge.executeApproved('request-1');
    expect(result).toMatchObject({ status: 'succeeded', beforeRevision: 0, afterRevision: 1 });
    expect(result.steps.map(step => step.status)).toEqual(['applied', 'applied']);
    expect(s.runtime.getSnapshot()).toMatchObject({ state: 'detail', fields: { name: 'Changed' } });
    expect(allowed).toHaveBeenCalledTimes(1); expect(s.navigate).toHaveBeenCalledExactlyOnceWith('/detail', false);
    expect(s.runtime.getTrace().find(entry => entry.kind === 'accepted')?.reason).toBe('ai');
    await expect(s.bridge.executeApproved('request-1')).resolves.toEqual(result); expect(s.runtime.getSnapshot().revision).toBe(1); s.dispose();
  });

  it('does not commit an atomic prefix if a later action fails, and reports an ordered prefix honestly', async () => {
    for (const mode of ['atomic-local', 'ordered'] as const) {
      const s = setup();
      await s.bridge.propose(s.request([name(), { componentId: 'navigation', actionId: 'unknown-event', parameters: {} }], mode));
      s.bridge.approve('request-1'); const result = await s.bridge.executeApproved('request-1');
      expect(result.status).toBe(mode === 'atomic-local' ? 'rejected' : 'partial');
      expect(s.runtime.getSnapshot().revision).toBe(mode === 'atomic-local' ? 0 : 1);
      expect(s.runtime.getSnapshot().fields.name).toBe(mode === 'atomic-local' ? 'Public' : 'Changed'); s.dispose();
    }
  });

  it.each(['revision', 'policy-version', 'permission', 'expiry', 'input'])('rejects %s changed after approval without a commit', async change => {
    const s = setup(); await s.bridge.propose(s.request([name()])); s.bridge.approve('request-1');
    if (change === 'revision') s.runtime.send('field.change', { fieldId: 'name', value: 'User update' });
    else if (change === 'policy-version') s.control.policy.version = 'policy-2';
    else if (change === 'permission') s.control.policy.actions = [];
    else if (change === 'expiry') s.control.time = 1001;
    else s.runtime.setInteraction({ focusedId: 'name', composingId: 'name' });
    const before = s.runtime.getSnapshot();
    expect((await s.bridge.executeApproved('request-1')).status).toBe('rejected'); expect(s.runtime.getSnapshot()).toBe(before); s.dispose();
  });

  it('preserves Manual and Auto rules and prevents external mutations in Auto or replay', async () => {
    const manual = setup({ mode: 'manual' }); await expect(manual.bridge.propose(manual.request([name()]))).rejects.toThrow('manual-mode'); manual.dispose();
    const auto = setup({ mode: 'auto', external: [external()] });
    expect((await auto.bridge.propose(auto.request([name()]))).status).toBe('succeeded');
    await expect(auto.bridge.propose(auto.request([externalStep()], 'ordered', 'external'))).rejects.toThrow('auto-denied');
    auto.control.policy.autoActions = [];
    await expect(auto.bridge.propose(auto.request([name()], 'atomic-local', 'denied'))).rejects.toThrow('auto-denied'); auto.dispose();
    const replay = setup({ replay: true, external: [external()] });
    await expect(replay.bridge.propose(replay.request([externalStep()], 'ordered'))).rejects.toThrow('replay-denied'); replay.dispose();
  });
});

describe('read-only asynchronous agent queries', () => {
  function query(pending: Promise<unknown>) {
    return defineAgentQuery({ id: 'lookup', parameters: z.strictObject({}), result: z.strictObject({ title: z.string(), secret: z.string() }),
      read: async (_input, context) => { expect(JSON.stringify(context.snapshot)).not.toContain('PRIVATE-CONTENT'); return pending; }, publicResult: value => ({ title: value.title }) });
  }
  it('projects public results and rechecks scope, permissions and revisions after await', async () => {
    for (const changed of ['none', 'permission', 'revision', 'version']) {
      const pending = deferred<unknown>(), s = setup({ queries: [query(pending.promise)] });
      const request = { schemaVersion: 1, scope, queryId: 'lookup', parameters: {}, snapshotRevision: 0, policyVersion: 'policy-1' };
      const before = s.runtime.getSnapshot(), answer = s.bridge.query(request);
      if (changed === 'permission') s.control.policy.read.queries = [];
      if (changed === 'version') s.control.policy.version = 'policy-2';
      if (changed === 'revision') s.runtime.send('field.change', { fieldId: 'name', value: 'New' });
      pending.resolve({ title: 'Allowed result', secret: 'QUERY-SECRET' });
      if (changed === 'none') {
        const result = await answer;
        expect(result).toMatchObject({ revision: 0, data: { title: 'Allowed result' } });
        expect(JSON.stringify(result)).not.toContain('SECRET'); expect(s.runtime.getSnapshot()).toBe(before); expect(s.runtime.getTrace()).toHaveLength(0); expect(s.navigate).not.toHaveBeenCalled();
      } else await expect(answer).rejects.toThrow();
      s.dispose();
    }
  });
  it('honors abort even when the query ignores its signal and bounds host error text', async () => {
    const pending = deferred<unknown>(), s = setup({ queries: [query(pending.promise)] }), controller = new AbortController();
    const request = { schemaVersion: 1, scope, queryId: 'lookup', parameters: {}, snapshotRevision: 0, policyVersion: 'policy-1' };
    const answer = s.bridge.query(request, controller.signal); controller.abort();
    await expect(answer).rejects.toThrow('aborted'); pending.resolve({ title: 'Late', secret: 'PRIVATE' });
    s.dispose();
    const failing = setup({ queries: [defineAgentQuery({ id: 'lookup', parameters: z.strictObject({}), result: z.string(), read: async () => { throw new Error('API-KEY: PRIVATE'); }, publicResult: value => value })] });
    await expect(failing.bridge.query(request)).rejects.toThrow(/^query-failed$/); failing.dispose();
  });
});

describe('explicit external action boundary', () => {
  it('reports real results, deduplicates execution, preserves AI provenance and strips exported payloads', async () => {
    const execute = vi.fn(async () => ({ id: 'confirmed-host-id', private: 'HOST-SECRET' })), s = setup({ external: [external(execute)] });
    await s.bridge.propose(s.request([externalStep()], 'ordered')); s.bridge.approve('request-1');
    const [first, second] = await Promise.all([s.bridge.executeApproved('request-1'), s.bridge.executeApproved('request-1')]);
    expect(first).toEqual(second); expect(first.steps[0]).toMatchObject({ status: 'completed', output: { id: 'confirmed-host-id' } });
    expect(execute).toHaveBeenCalledTimes(1);
    const exported = s.bridge.export(); expect(exported).toMatchObject({ origin: 'ai-proposals', executable: false });
    expect(JSON.stringify(exported)).not.toContain('Document'); expect(JSON.stringify(exported)).not.toContain('SECRET'); expect(exported.reports[0]?.steps[0]).not.toHaveProperty('output');
    s.control.policy.actions = [];
    expect((await s.bridge.executeApproved('request-1')).steps[0]).not.toHaveProperty('output'); expect(execute).toHaveBeenCalledTimes(1); s.dispose();
  });

  it.each(['permission', 'revision', 'abort'])('rechecks %s after asynchronous host authorization before any external execution', async changed => {
    const allowed = deferred<boolean>(), execute = vi.fn(async () => ({ id: 'must-not-run', private: '' }));
    const s = setup({ external: [external(execute, () => allowed.promise)] }), controller = new AbortController();
    await s.bridge.propose(s.request([externalStep()], 'ordered')); s.bridge.approve('request-1');
    const pending = s.bridge.executeApproved('request-1', controller.signal);
    await flush();
    if (changed === 'permission') s.control.policy.actions = [];
    else if (changed === 'revision') s.runtime.send('field.change', { fieldId: 'name', value: 'New' });
    else controller.abort();
    allowed.resolve(true);
    expect((await pending).status).toBe('rejected'); expect(execute).not.toHaveBeenCalled(); s.dispose();
  });

  it('returns promptly on abort while host authorization is unresolved, and never executes after late authorization', async () => {
    const allowed = deferred<boolean>(), execute = vi.fn(async () => ({ id: 'must-not-run', private: '' }));
    const s = setup({ external: [external(execute, () => allowed.promise)] }), controller = new AbortController();
    await s.bridge.propose(s.request([externalStep()], 'ordered')); s.bridge.approve('request-1');
    const pending = s.bridge.executeApproved('request-1', controller.signal); await flush(); controller.abort();
    expect((await pending).status).toBe('rejected'); expect(execute).not.toHaveBeenCalled();
    allowed.resolve(true); await flush(); expect(execute).not.toHaveBeenCalled(); s.dispose();
  });

  it('reports completed prefixes and an unknown in-flight external outcome after cancellation without rollback or retry', async () => {
    const outcome = deferred<{ id: string; private: string }>(), execute = vi.fn(() => outcome.promise);
    const s = setup({ external: [external(execute)] }), controller = new AbortController();
    await s.bridge.propose(s.request([name('Committed locally'), externalStep(), open()], 'ordered')); s.bridge.approve('request-1');
    const pending = s.bridge.executeApproved('request-1', controller.signal); await flush();
    expect(execute).toHaveBeenCalledTimes(1); controller.abort();
    const result = await pending;
    expect(result.status).toBe('unknown'); expect(result.steps.map(step => step.status)).toEqual(['applied', 'unknown', 'not-run']);
    expect(s.runtime.getSnapshot()).toMatchObject({ state: 'ready', fields: { name: 'Committed locally' } });
    outcome.resolve({ id: 'host-completed-later', private: 'PRIVATE' }); await flush();
    expect(await s.bridge.executeApproved('request-1')).toEqual(result); expect(execute).toHaveBeenCalledTimes(1); s.dispose();
  });

  it('stops after a denied external step and does not misreport earlier local work as rolled back', async () => {
    const execute = vi.fn(async () => ({ id: 'no', private: '' })), s = setup({ external: [external(execute, () => false)] });
    await s.bridge.propose(s.request([name(), externalStep(), open()], 'ordered')); s.bridge.approve('request-1');
    const result = await s.bridge.executeApproved('request-1');
    expect(result.status).toBe('partial'); expect(result.steps.map(step => step.status)).toEqual(['applied', 'rejected', 'not-run']);
    expect(s.runtime.getSnapshot().fields.name).toBe('Changed'); expect(execute).not.toHaveBeenCalled(); expect(JSON.stringify(result)).not.toContain('Error:'); s.dispose();
  });
});
