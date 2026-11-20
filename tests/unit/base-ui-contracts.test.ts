import { describe, expect, it, vi } from 'vitest';
import { FlowDefinitionSchema, defineFlow } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createProjectProof } from '@fluidkit/cases';

describe('Base UI informed contracts', () => {
  it('defines anatomy independently of the visual recipe', () => {
    const flow = createProjectProof('project');
    const trigger = flow.states.ready!.nodes.find(node => node.id === 'morph')!;
    trigger.kind = 'card';
    const parsed = FlowDefinitionSchema.parse(flow);
    expect(parsed.states.ready!.nodes.find(node => node.id === 'morph')!.anatomy).toEqual({ componentId: 'validation', part: 'trigger', behavior: 'button' });
  });
  it('rejects undefined behavior instead of guessing it from a shape', () => {
    const flow = createProjectProof('project');
    const data: unknown = { ...flow, states: { ...flow.states, ready: { ...flow.states.ready, nodes: [{ id: 'looks-like-button', kind: 'button' }] } } };
    expect(FlowDefinitionSchema.safeParse(data).success).toBe(false);
  });
  it('rejects missing activations, duplicate parts and non-text textbox bindings', () => {
    const flow = createProjectProof('project');
    const trigger = flow.states.ready!.nodes.find(node => node.id === 'morph')!;
    delete trigger.onActivate;
    expect(FlowDefinitionSchema.safeParse(flow).success).toBe(false);
    trigger.onActivate = 'validation.start';
    flow.states.ready!.nodes.push({ ...trigger, id: 'other-node' });
    expect(FlowDefinitionSchema.safeParse(flow).success).toBe(false);
    const input = createProjectProof('project'); input.fields[0]!.type = 'number'; input.fields[0]!.initial = 42;
    expect(FlowDefinitionSchema.safeParse(input).success).toBe(false);
  });
  it('keeps transient interactions outside domain revisions and value ownership', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project') });
    const domain = runtime.getSnapshot();
    const changed = vi.fn(); runtime.subscribeInteraction(changed);
    runtime.setInteraction({ hoveredId: 'morph', pressedId: 'morph' });
    runtime.setInteraction({ pressedId: null, focusedId: 'project-name', composingId: 'project-name' });
    expect(runtime.getSnapshot()).toBe(domain);
    expect(runtime.getInteraction().revision).toBe(2);
    expect(changed).toHaveBeenCalledTimes(2);
    runtime.setInteraction({ composingId: 'project-name' });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(() => runtime.setInteraction({ focusedId: 'heading' })).toThrow();
    runtime.send('field.change', { fieldId: 'projectName', value: 'controlled' }, 'user', 'input');
    expect(runtime.getSnapshot().fields.projectName).toBe('controlled');
    expect(runtime.getInteraction().focusedId).toBe('project-name');
  });
  it('never steals active focus or IME composition for an AI plan', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project'), mode: 'auto' });
    const plan = { schemaVersion: 1, id: 'p1', flowId: runtime.flow.id, snapshotRevision: 0, policyVersion: 'policy-1', expiresAt: Date.now() + 10000, eventType: 'detail.open', explanation: 'Inspect' };
    runtime.setInteraction({ composingId: 'project-name' });
    expect(runtime.propose(plan).accepted).toBe(false);
    runtime.setInteraction({ composingId: null, pressedId: 'morph' });
    expect(runtime.propose(plan).accepted).toBe(false);
    runtime.setInteraction({ pressedId: null, hoveredId: 'morph' });
    expect(runtime.propose(plan).accepted).toBe(true);
    expect(runtime.getSnapshot().state).toBe('detail');
  });
  it('cancels a change before actor commit, navigation or external effects', async () => {
    const effect = vi.fn(async () => {}), navigate = vi.fn();
    const flow = defineFlow({ id: 'cancel', name: 'Cancellation', initial: 'a', states: { a: { label: 'A', nodes: [], on: { save: { target: 'b', action: 'write', duration: 700 } } }, b: { label: 'B', route: '/b', nodes: [] } } });
    const reasons: string[] = [];
    let allow = false;
    const runtime = createFluidRuntime({ flow, actions: { write: effect }, router: { navigate }, beforeChange(details) { reasons.push(details.reason); if (!allow) details.cancel(); } });
    expect(runtime.send('save', {}, 'user', 'keyboard').accepted).toBe(false);
    expect(runtime.getSnapshot().state).toBe('a');
    expect(runtime.getSnapshot().revision).toBe(0);
    expect(navigate).not.toHaveBeenCalled(); expect(effect).not.toHaveBeenCalled();
    allow = true;
    expect(runtime.send('save', {}, 'user', 'pointer').accepted).toBe(true);
    expect(runtime.getSnapshot().state).toBe('b'); expect(runtime.getTransitionDuration()).toBe(700);
    await Promise.resolve(); expect(effect).toHaveBeenCalledTimes(1);
    expect(reasons).toEqual(['keyboard', 'pointer']);
    expect(runtime.getTrace().map(entry => entry.reason)).toContain('keyboard');
  });
  it('keeps canceled input controlled by the original value', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project'), beforeChange: details => details.cancel() });
    expect(runtime.send('field.change', { fieldId: 'projectName', value: 'rejected' }, 'user', 'input').accepted).toBe(false);
    expect(runtime.getSnapshot().fields.projectName).toBe('project');
  });
  it('publishes rejected events and suggestions independently of domain snapshots', () => {
    const runtime = createFluidRuntime({ flow: createProjectProof('project'), mode: 'hybrid' });
    const changed = vi.fn(); runtime.subscribeTrace(changed);
    const domain = runtime.getSnapshot(); const before = runtime.getTraceSnapshot();
    runtime.send('not-allowed');
    expect(runtime.getSnapshot()).toBe(domain);
    expect(runtime.getTraceSnapshot()).not.toBe(before); expect(changed).toHaveBeenCalledTimes(1);
    expect(runtime.propose({ schemaVersion: 1, id: 'p1', flowId: runtime.flow.id, snapshotRevision: domain.revision, policyVersion: 'policy-1', expiresAt: Date.now() + 10000, eventType: 'detail.open', explanation: 'Inspect' }).accepted).toBe(true);
    expect(runtime.getSuggestion()?.eventType).toBe('detail.open');
    runtime.rejectSuggestion(); expect(runtime.getSuggestion()).toBeNull();
  });
  it('uses XState as the state authority for names containing dots', () => {
    const flow = defineFlow({ id: 'flow', name: 'Literal state names', initial: 'a.one', states: { 'a.one': { label: 'First', nodes: [], on: { next: { target: 'b.two' } } }, 'b.two': { label: 'Second', nodes: [] } } });
    const runtime = createFluidRuntime({ flow });
    expect(runtime.send('next').accepted).toBe(true); expect(runtime.getSnapshot().state).toBe('b.two');
  });
});
