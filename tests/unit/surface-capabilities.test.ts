import { describe, expect, it, vi } from 'vitest';
import { defineFlow, EffectSettingsSchema, type RenderCapabilities } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { observeSurfaceCapabilities } from '../../packages/webgpu/src/capabilities';
import { createResourceLedger, createResourceScope } from '../../packages/webgpu/src/resources';

class MotionPreference extends EventTarget {
  constructor(public matches: boolean) { super(); }
  change(value: boolean) { this.matches = value; this.dispatchEvent(new Event('change')); }
}
const flow = defineFlow({ id: 'motion-capability-test', name: 'Motion preferences', initial: 'a', states: {
  a: { label: 'A', nodes: [], on: { next: { target: 'b' } } },
  b: { label: 'B', nodes: [], on: { previous: { target: 'a' } } },
} });

describe('Surface capability changes reach future Core plans', () => {
  it('combines app and system reduction without weakening either preference or mutating domain state', () => {
    const motion = new MotionPreference(false);
    const runtime = createFluidRuntime({ flow, effectSettings: EffectSettingsSchema.parse({ effect: { id: 'particle-weave', version: '1.0.0' } }) });
    const observer = observeSurfaceCapabilities({ backend: 'webgpu', motion, onChange: capabilities => runtime.setRenderCapabilities(capabilities), onError: error => { throw error; } });
    try {
      const initial = runtime.getSnapshot();
      runtime.configureEffects({ ...runtime.getVisualState().settings, motionPreference: 'reduced' });
      observer.setMotionPreference('reduced');
      expect(runtime.getSnapshot()).toBe(initial);
      expect(observer.getCapabilities().reducedMotion).toBe(true);
      expect(runtime.send('next').accepted).toBe(true);
      expect(runtime.getTransitionDuration()).toBe(0);
      expect(runtime.getVisualState().current?.selected).toBeNull();
      motion.change(true); observer.setMotionPreference('system');
      expect(observer.getCapabilities().reducedMotion).toBe(true);
      motion.change(false);
      expect(observer.getCapabilities().reducedMotion).toBe(false);
      expect(runtime.getSnapshot().state).toBe('b');
      observer.dispose(); observer.setMotionPreference('reduced');
      expect(runtime.getVisualState().capabilities.reducedMotion).toBe(false);
    } finally { observer.dispose(); runtime.dispose(); }
  });
  it.each([false, true])('propagates initial %s and both later directions without creating a frame loop', initial => {
    for (const backend of ['webgpu', 'webgl2'] as const) {
      const motion = new MotionPreference(initial), frame = vi.fn();
      const runtime = createFluidRuntime({ flow, effectSettings: EffectSettingsSchema.parse({ effect: { id: 'silk-cascade', version: '1.0.0' }, parameters: { durationMs: 900 } }) });
      vi.stubGlobal('requestAnimationFrame', frame);
      const listener = vi.fn((capabilities: RenderCapabilities, _initial: boolean) => runtime.setRenderCapabilities(capabilities));
      const observer = observeSurfaceCapabilities({ backend, motion, onChange: listener, onError: error => { throw error; } });
      try {
        expect(listener).toHaveBeenCalledTimes(1); expect(listener.mock.calls[0]![1]).toBe(true);
        for (const value of [initial, !initial, initial]) {
          if (motion.matches !== value) motion.change(value);
          expect(runtime.getVisualState().capabilities).toEqual({ backend, typegpu: true, compute: backend === 'webgpu', reducedMotion: value });
          expect(runtime.send(runtime.getSnapshot().state === 'a' ? 'next' : 'previous').accepted).toBe(true);
          const plan = runtime.getVisualState().current!;
          expect(plan.capabilities.reducedMotion).toBe(value);
          expect(plan.selected?.id ?? null).toBe(value ? null : 'silk-cascade');
          expect(runtime.getTransitionDuration()).toBe(value ? 0 : 900);
        }
        expect(frame).not.toHaveBeenCalled();
        const count = listener.mock.calls.length; observer.dispose(); observer.dispose(); motion.change(!initial);
        expect(listener).toHaveBeenCalledTimes(count);
      } finally { observer.dispose(); runtime.dispose(); vi.unstubAllGlobals(); }
    }
  });
  it('rolls back the subscription when the initial host callback throws', () => {
    const motion = new MotionPreference(true), remove = vi.spyOn(motion, 'removeEventListener'), callback = vi.fn(() => { throw new Error('Initial callback failed'); });
    expect(() => observeSurfaceCapabilities({ backend: 'webgpu', motion, onChange: callback, onError: () => {} })).toThrow('Initial callback failed');
    expect(remove).toHaveBeenCalledTimes(1); motion.change(false); expect(callback).toHaveBeenCalledTimes(1);
  });
  it('routes a dynamic callback failure through the owning cleanup boundary', () => {
    const motion = new MotionPreference(false), ledger = createResourceLedger(), scope = createResourceScope(ledger), failure = vi.fn();
    const callback = vi.fn((_capabilities: RenderCapabilities, initial: boolean) => { if (!initial) throw new Error('Dynamic callback failed'); });
    const observer = observeSurfaceCapabilities({ backend: 'webgl2', motion, onChange: callback, onError: error => { failure(error); scope.dispose(); } });
    scope.track('listener', observer.dispose); motion.change(true);
    expect(failure).toHaveBeenCalledWith(expect.objectContaining({ message: 'Dynamic callback failed' }));
    expect(ledger.snapshot().owners).toBe(0); expect(ledger.snapshot().live.listener).toBe(0);
    motion.change(false); expect(callback).toHaveBeenCalledTimes(2);
  });
});
