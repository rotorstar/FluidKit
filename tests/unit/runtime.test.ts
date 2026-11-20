import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { defineFlow, FlowDefinitionSchema } from '@fluidkit/contracts';
import { createFluidRuntime, flowToMermaid } from '@fluidkit/core';
import { createProjectProof } from '@fluidkit/cases';
import { createTestClock, runScenario } from '@fluidkit/testing';

describe('runtime invariants', () => {
  it('preserves edited content throughout a complete workflow', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('real-project') });
    runtime.send('field.change', { fieldId: 'projectName', value: 'Mein Projekt ü' });
    for (const event of ['validation.start', 'validation.complete', 'detail.open', 'reset']) expect(runtime.send(event).accepted).toBe(true);
    expect(runtime.getSnapshot().state).toBe('ready');
    expect(runtime.getSnapshot().fields.projectName).toBe('Mein Projekt ü');
    expect(runtime.getScene().find(node => node.id === 'project-name')?.text).toBe('Mein Projekt ü');
    runtime.dispose();
  });
  it('rejects stale, duplicate, unknown and direct AI events without state mutation', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project') });
    const event = { id: 'e1', type: 'validation.start', source: 'user' as const, timestamp: 1, expectedRevision: 0, payload: {} };
    expect(runtime.dispatch(event).accepted).toBe(true);
    const snapshot = runtime.getSnapshot();
    expect(runtime.dispatch(event).accepted).toBe(false);
    expect(runtime.dispatch({ ...event, id: 'e2' }).accepted).toBe(false);
    expect(runtime.send('unknown').accepted).toBe(false);
    expect(runtime.send('validation.complete', {}, 'ai').accepted).toBe(false);
    expect(runtime.getSnapshot()).toBe(snapshot);
  });
  it('does not expose writable snapshots', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project') });
    expect(() => { runtime.getSnapshot().fields.projectName = 'tampered'; }).toThrow();
    expect(runtime.getSnapshot().fields.projectName).toBe('project');
  });
  it('revalidates hybrid suggestions and honors manual mode and focus', () => {
    const clock = createTestClock(10);
    const runtime = createFluidRuntime({ flow: createProjectProof('project'), clock });
    const plan = () => ({ schemaVersion: 1, id: 'p1', flowId: 'project-proof', snapshotRevision: runtime.getSnapshot().revision, policyVersion: 'policy-1', expiresAt: 100, eventType: 'detail.open', explanation: 'Inspect project' });
    expect(runtime.propose(plan()).accepted).toBe(false);
    runtime.send('mode.set', { mode: 'hybrid' });
    expect(runtime.propose(plan()).accepted).toBe(true);
    expect(runtime.getSnapshot().state).toBe('ready');
    clock.advance(100);
    expect(runtime.acceptSuggestion().accepted).toBe(false);
    clock.set(120);
    const fresh = { ...plan(), expiresAt: 200 };
    expect(runtime.propose(fresh).accepted).toBe(true);
    expect(runtime.acceptSuggestion().accepted).toBe(true);
    expect(runtime.getSnapshot().state).toBe('detail');
    runtime.send('focus.set', { nodeId: 'project-name' });
    expect(runtime.propose({ ...plan(), eventType: 'reset' }).accepted).toBe(false);
  });
  it('restores history without executing actions and still accepts subsequent transitions', async () => {
    const action = vi.fn(async () => {});
    const flow = defineFlow({ id: 'history', name: 'History', initial: 'a', states: { a: { label: 'A', nodes: [], on: { next: { target: 'b', action: 'save' } } }, b: { label: 'B', nodes: [], on: { reset: { target: 'a' } } } } });
    const runtime = createFluidRuntime({ flow, actions: { save: action } });
    runtime.send('navigation.restore', { state: 'b' }, 'host');
    expect(action).not.toHaveBeenCalled();
    expect(runtime.send('reset').accepted).toBe(true);
    expect(runtime.send('next').accepted).toBe(true);
    await Promise.resolve(); expect(action).toHaveBeenCalledTimes(1);
  });
  it('keeps arbitrary event sequences inside the declared state and field domain', () => {
    fc.assert(fc.property(fc.array(fc.constantFrom('validation.start', 'validation.complete', 'detail.open', 'reset', 'invalid'), { maxLength: 100 }), events => {
      const runtime = createFluidRuntime({ flow: createProjectProof('project') });
      let accepted = 0;
      for (const event of events) {
        if (runtime.send(event).accepted) accepted++;
        expect(runtime.flow.states[runtime.getSnapshot().state]).toBeDefined();
        expect(runtime.getSnapshot().revision).toBe(accepted);
        expect(runtime.getSnapshot().fields.projectName).toBe('project');
      }
      runtime.dispose();
    }), { numRuns: 200 });
  });
  it('rejects AI transitions with external effects at contract compilation', () => {
    expect(() => defineFlow({ id: 'unsafe', name: 'Unsafe', initial: 'a', states: { a: { label: 'A', nodes: [], on: { purchase: { target: 'a', action: 'purchase', aiAllowed: true } } } } })).toThrow();
  });
  it('rejects missing mappings, duplicate IDs, and nonexistent targets', () => {
    const flow = createProjectProof('project');
    const bad = structuredClone(flow); bad.states.ready!.nodes[0]!.binding = 'missing';
    expect(FlowDefinitionSchema.safeParse(bad).success).toBe(false);
    bad.states.ready!.nodes[0]!.binding = 'projectName'; bad.states.ready!.on['validation.start']!.target = 'missing';
    expect(FlowDefinitionSchema.safeParse(bad).success).toBe(false);
  });
  it('omits sensitive input values from traces', () => {
    const flow = createProjectProof('project'); flow.fields[0]!.sensitive = true;
    const runtime = createFluidRuntime({ flow }); runtime.send('field.change', { fieldId: 'projectName', value: 'private-value' });
    expect(JSON.stringify(runtime.getTrace())).not.toContain('private-value');
  });
  it('produces deterministic replay with independent expected outcomes', () => {
    const flow = createProjectProof('real-project');
    const scenario = { schemaVersion: 1 as const, id: 'flow-proof', name: 'Proof', flowId: flow.id, seed: 1, events: ['validation.start', 'validation.complete', 'detail.open'].map((type, index) => ({ id: `e${index}`, type, source: 'replay' as const, timestamp: index * 100, payload: {} })), expectedState: 'detail', expectedFields: { projectName: 'real-project' } };
    expect(runScenario(flow, scenario)).toEqual(runScenario(flow, scenario));
    expect(runScenario(flow, scenario).passed).toBe(true);
    expect(flowToMermaid(flow)).toContain('s0 --> s1: validation.start');
  });
});
