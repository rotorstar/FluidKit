import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AgentPolicySchema, AgentRequestSchema, defineFlow } from '@fluidkit/contracts';
import { createFluidAgentBridge, createFluidRuntime, defineAgentLocalAction, defineAgentQuery } from '@fluidkit/core';

const scope = { projectId: 'callbacks', flowId: 'callback-boundaries' };
const makeFlow = () => defineFlow({ id: scope.flowId, name: 'Callback boundaries', initial: 'ready',
  fields: [{ id: 'name', initial: 'Public value' }],
  states: { ready: { label: 'Ready', nodes: [{ id: 'name', kind: 'input', binding: 'name', label: 'Name', anatomy: { componentId: 'form', part: 'name', behavior: 'textbox' } }] } },
});
const makePolicy = () => AgentPolicySchema.parse({ version: 'policy-1', read: { state: true, fields: ['name'], components: ['form'], queries: ['lookup'] },
  actions: [{ componentId: 'form', actionId: 'set-name' }], autoActions: [] });

describe('agent host callback boundaries', () => {
  it('rejects permission revoked synchronously by a registered parameter validator', async () => {
    const runtime = createFluidRuntime({ flow: makeFlow(), mode: 'hybrid' }), policy = makePolicy();
    const action = defineAgentLocalAction({ id: 'set-name', componentId: 'form',
      parameters: z.strictObject({ value: z.string() }).superRefine(() => { policy.actions = []; }),
      commands: value => [{ type: 'field', fieldId: 'name', value: value.value }],
    });
    const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'host', getPolicy: () => policy, actions: [action], now: () => 100 });
    const request = AgentRequestSchema.parse({ schemaVersion: 1, id: 'revoked-in-validator', scope, snapshotRevision: 0, policyVersion: 'policy-1', expiresAt: 1000, mode: 'atomic-local',
      steps: [{ componentId: 'form', actionId: 'set-name', parameters: { value: 'Must not apply' } }] });
    await expect(bridge.propose(request)).rejects.toThrow('policy-denied');
    expect(runtime.getSnapshot().revision).toBe(0); expect(bridge.export().reports).toHaveLength(0);
    bridge.dispose(); runtime.dispose();
  });

  it('does not invoke a query after its parameter validator revokes query permission', async () => {
    const runtime = createFluidRuntime({ flow: makeFlow() }), policy = makePolicy(), read = vi.fn(async () => 'private adapter value');
    const query = defineAgentQuery({ id: 'lookup', parameters: z.strictObject({}).superRefine(() => { policy.read.queries = []; }), result: z.string(), read, publicResult: value => value });
    const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'host', getPolicy: () => policy, queries: [query] });
    await expect(bridge.query({ schemaVersion: 1, scope, queryId: 'lookup', parameters: {}, snapshotRevision: 0, policyVersion: 'policy-1' })).rejects.toThrow('query-denied');
    expect(read).not.toHaveBeenCalled(); bridge.dispose(); runtime.dispose();
  });

  it('rejects a query whose policy reader reenters Core with a newer host value', async () => {
    const runtime = createFluidRuntime({ flow: makeFlow() }), policy = makePolicy(), read = vi.fn(async () => 'result');
    const query = defineAgentQuery({ id: 'lookup', parameters: z.strictObject({}), result: z.string(), read, publicResult: value => value });
    let reenter = true;
    const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'host', getPolicy: () => {
      if (reenter) { reenter = false; runtime.send('field.change', { fieldId: 'name', value: 'Newer host value' }, 'host'); }
      return policy;
    }, queries: [query] });
    await expect(bridge.query({ schemaVersion: 1, scope, queryId: 'lookup', parameters: {}, snapshotRevision: 0, policyVersion: 'policy-1' })).rejects.toThrow('stale-revision');
    expect(read).not.toHaveBeenCalled(); expect(runtime.getSnapshot().fields.name).toBe('Newer host value'); bridge.dispose(); runtime.dispose();
  });

  it('reports an applied local command even when a state observer throws after publication', async () => {
    const runtime = createFluidRuntime({ flow: makeFlow(), mode: 'hybrid' }), policy = makePolicy();
    const observer = vi.fn(() => { throw new Error('PRIVATE observer payload'); }), healthy = vi.fn();
    runtime.subscribe(observer); runtime.subscribe(healthy);
    const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'host', getPolicy: () => policy, now: () => 100,
      actions: [defineAgentLocalAction({ id: 'set-name', componentId: 'form', parameters: z.strictObject({ value: z.string() }), commands: value => [{ type: 'field', fieldId: 'name', value: value.value }] })] });
    await bridge.propose({ schemaVersion: 1, id: 'observer-failure', scope, snapshotRevision: 0, policyVersion: 'policy-1', expiresAt: 1000, mode: 'atomic-local',
      steps: [{ componentId: 'form', actionId: 'set-name', parameters: { value: 'Committed' } }] });
    bridge.approve('observer-failure');
    expect(await bridge.executeApproved('observer-failure')).toMatchObject({ status: 'succeeded', afterRevision: 1, steps: [{ status: 'applied' }] });
    expect(runtime.getSnapshot().fields.name).toBe('Committed'); expect(observer).toHaveBeenCalledTimes(1); expect(healthy).toHaveBeenCalledTimes(1);
    expect(runtime.getTrace().some(entry => entry.kind === 'error' && entry.detail.includes('state observer'))).toBe(true);
    expect(JSON.stringify(runtime.getTrace())).not.toContain('PRIVATE'); bridge.dispose(); runtime.dispose();
  });

  it('does not adopt a reentrant newer host revision as its own receipt or continue the ordered batch', async () => {
    const runtime = createFluidRuntime({ flow: makeFlow(), mode: 'hybrid' }), policy = makePolicy();
    let nested = false;
    runtime.subscribe(() => { if (!nested) { nested = true; runtime.send('field.change', { fieldId: 'name', value: 'Newer user work' }, 'user'); } });
    const bridge = createFluidAgentBridge({ runtime, scope, principalId: 'host', getPolicy: () => policy, now: () => 100,
      actions: [defineAgentLocalAction({ id: 'set-name', componentId: 'form', parameters: z.strictObject({ value: z.string() }), commands: value => [{ type: 'field', fieldId: 'name', value: value.value }] })] });
    await bridge.propose({ schemaVersion: 1, id: 'newer-host-event', scope, snapshotRevision: 0, policyVersion: 'policy-1', expiresAt: 1000, mode: 'ordered',
      steps: ['First agent command', 'Must not overwrite user'].map(value => ({ componentId: 'form', actionId: 'set-name', parameters: { value } })) });
    bridge.approve('newer-host-event');
    expect(await bridge.executeApproved('newer-host-event')).toMatchObject({ status: 'partial', code: 'stale-revision', afterRevision: 2, steps: [{ status: 'applied' }, { status: 'rejected' }] });
    expect(runtime.getSnapshot().fields.name).toBe('Newer user work'); bridge.dispose(); runtime.dispose();
  });
});
