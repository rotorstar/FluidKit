import { describe, expect, it, vi } from 'vitest';
import { defineFlow, EffectSettingsSchema, type RenderCapabilities } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createTransitionClip, captureTransitionSource, sampleTransitionClip } from '@fluidkit/effects';

const capabilities: RenderCapabilities = { backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false };
const node = { id: 'query-input', kind: 'input' as const, binding: 'query', x: 10, y: 10,
  anatomy: { componentId: 'query-input', part: 'input', behavior: 'textbox' as const } };
const flow = defineFlow({ id: 'history-effects', name: 'History effects', initial: 'table', fields: [{ id: 'query', type: 'text', initial: 'Edited draft' }], states: {
  table: { label: 'Table', nodes: [node], on: { open: { target: 'detail', action: 'save' } } },
  detail: { label: 'Detail', nodes: [{ ...node, x: 300, y: 100 }], on: { close: { target: 'table' } } },
} });
const settings = (id = 'silk-cascade') => EffectSettingsSchema.parse({ effect: { id, version: '1.0.0' }, parameters: { durationMs: 900, intensity: .55, frequency: 2.5 } });
const history = (id: string, state: string) => ({ id, type: 'navigation.restore', source: 'host' as const, reason: 'programmatic' as const, timestamp: 1, payload: { state } });

describe('native history presentation follows the committed snapshot', () => {
  it.each(['silk-cascade', 'liquid-lens', 'particle-weave'])('%s resolves back/forward presentation without executing transition actions', async id => {
    for (const backend of ['webgpu', 'webgl2'] as const) {
      const save = vi.fn(async () => {}), runtime = createFluidRuntime({ flow, effectSettings: settings(id), actions: { save } });
      runtime.setRenderCapabilities({ ...capabilities, backend, compute: backend === 'webgpu' });
      runtime.send('focus.set', { nodeId: node.id });
      const source = runtime.getScene();
      expect(runtime.dispatch(history('history-back', 'detail')).accepted).toBe(true);
      const first = runtime.getVisualState().current!;
      expect(first).toMatchObject({ eventId: 'history-back', eventType: 'navigation.restore', sourceState: 'table', targetState: 'detail', sourceRevision: 0, targetRevision: 1,
        selected: { id, version: '1.0.0' }, protectedNodeIds: ['query-input'] });
      expect(runtime.getSnapshot()).toMatchObject({ state: 'detail', revision: 1, fields: { query: 'Edited draft' } });
      expect(runtime.getTransitionDuration()).toBe(900);
      const clip = createTransitionClip({ source, target: runtime.getScene(), plan: first, durationMs: runtime.getTransitionDuration(), viewport: { width: 1000, height: 700 } });
      const shown = sampleTransitionClip(clip, .75);
      expect(runtime.dispatch(history('history-forward', 'table')).accepted).toBe(true);
      const second = runtime.getVisualState().current!;
      expect(second).toMatchObject({ eventId: 'history-forward', sourceState: 'detail', targetState: 'table', sourceRevision: 1, targetRevision: 2, selected: { id } });
      expect(second.seed).not.toBe(first.seed);
      const resumed = sampleTransitionClip(createTransitionClip({ ...captureTransitionSource(shown), target: runtime.getScene(), plan: second, durationMs: runtime.getTransitionDuration(), viewport: clip.viewport }), 0);
      for (const shownNode of shown.nodes) expect(resumed.nodes.find(value => value.id === shownNode.id)).toEqual(shownNode);
      expect(resumed.lens).toEqual(shown.lens); expect(resumed.particles).toEqual(shown.particles);
      await Promise.resolve(); expect(save).not.toHaveBeenCalled();
      expect(runtime.send('open').accepted).toBe(true); await Promise.resolve(); expect(save).toHaveBeenCalledTimes(1);
      runtime.dispose();
    }
  });
  it.each(['off', 'reduced-motion'])('%s keeps history immediate with a current nonselected plan', condition => {
    const runtime = createFluidRuntime({ flow, actions: { save: async () => {} }, effectSettings: condition === 'off' ? { ...settings(), mode: 'off' } : settings() });
    runtime.setRenderCapabilities({ ...capabilities, reducedMotion: condition === 'reduced-motion' });
    expect(runtime.dispatch(history('restore-immediate', 'detail')).accepted).toBe(true);
    expect(runtime.getVisualState().current).toMatchObject({ eventId: 'restore-immediate', targetRevision: 1, selected: null, parameters: { durationMs: 0 } });
    expect(runtime.getTransitionDuration()).toBe(0); runtime.dispose();
  });
  it('reuses a recorded history decision instead of rerolling current policy', () => {
    const live = createFluidRuntime({ flow, effectSettings: settings('particle-weave'), actions: { save: async () => {} } });
    live.setRenderCapabilities(capabilities); live.dispatch(history('recorded-back', 'detail'));
    const recorded = live.getVisualState().current!;
    const replay = createFluidRuntime({ flow, replay: true, effectReplay: [recorded], effectSettings: { ...settings('liquid-lens'), seed: 999 } });
    replay.setRenderCapabilities(capabilities);
    expect(replay.dispatch(history('recorded-back', 'detail')).accepted).toBe(true);
    expect(replay.getVisualState().current).toEqual(recorded);
    expect(replay.getSnapshot().state).toBe('detail');
    live.dispose(); replay.dispose();
  });
  it('preserves historical Core replays that never recorded a history effect', () => {
    const replay = createFluidRuntime({ flow, replay: true, effectReplay: [], effectSettings: settings('particle-weave') });
    replay.setRenderCapabilities(capabilities);
    expect(replay.dispatch(history('old-back', 'detail')).accepted).toBe(true);
    expect(replay.getVisualState().current).toBeNull(); expect(replay.getTransitionDuration()).toBe(0);
    expect(replay.getSnapshot()).toMatchObject({ state: 'detail', revision: 1 }); replay.dispose();
  });
  it('rejects mismatched recorded history before changing the actor or snapshot', () => {
    const live = createFluidRuntime({ flow, effectSettings: settings(), actions: { save: async () => {} } });
    live.setRenderCapabilities(capabilities); live.dispatch(history('bad-back', 'detail'));
    const replay = createFluidRuntime({ flow, replay: true, effectReplay: [{ ...live.getVisualState().current!, sourceRevision: 8 }] });
    replay.setRenderCapabilities(capabilities); const original = replay.getSnapshot();
    expect(replay.dispatch(history('bad-back', 'detail')).accepted).toBe(false);
    expect(replay.getSnapshot()).toBe(original); expect(replay.getVisualState().current).toBeNull();
    expect(replay.dispatch({ ...history('user-back', 'detail'), source: 'user' }).accepted).toBe(false);
    expect(replay.getSnapshot()).toBe(original); live.dispose(); replay.dispose();
  });
});
