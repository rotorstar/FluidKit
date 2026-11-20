import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { EffectSettingsSchema, VisualScenarioSchema, defineFlow } from '@fluidkit/contracts';
import { EFFECT_LIBRARY, resolveEffect, validateEffectReplay } from '@fluidkit/effects';
import { createFluidRuntime } from '@fluidkit/core';
import { createPresentationTimeline, interpolateBounds } from '@fluidkit/webgpu';
import { panelDistance } from '@fluidkit/gpu-kernels';
import { createTestClock } from '@fluidkit/testing';

const capabilities = { backend: 'webgpu' as const, typegpu: true, compute: true, reducedMotion: false };
const settings = EffectSettingsSchema.parse({});
const input = { settings, capabilities, eventId: 'event-1', eventType: 'open', caseId: 'case-1', sourceState: 'a', targetState: 'b', sourceRevision: 0, targetRevision: 1, baseDuration: 500, nodeCount: 20 };
const ref = (id: string) => ({ id, version: '1.0.0' });

describe('effect policies and recorded decisions', () => {
  it('resolves fixed, off, case and transition overrides with explicit provenance', () => {
    expect(resolveEffect(input).selected?.id).toBe('fluid-morph');
    const caseSettings = EffectSettingsSchema.parse({ mode: 'case', caseRules: { 'case-1': { mode: 'fixed', effect: ref('ripple-reveal') } } });
    expect(resolveEffect({ ...input, settings: caseSettings }).policySource).toBe('case');
    expect(resolveEffect({ ...input, settings: caseSettings, transitionRule: { mode: 'fixed', effect: ref('spring-reflow') } }).selected?.id).toBe('spring-reflow');
    const off = resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ mode: 'off' }), transitionRule: { mode: 'fixed', effect: ref('spring-reflow') } });
    expect(off.selected).toBeNull(); expect(off.policySource).toBe('master'); expect(off.parameters.durationMs).toBe(500);
  });
  it('makes random selections deterministic while allowing variation per transition', () => {
    const random = EffectSettingsSchema.parse({ mode: 'random', seed: 12345 });
    const selections = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const request = { ...input, settings: random, eventId: `e-${i}` };
      const first = resolveEffect(request), second = resolveEffect(request);
      expect(first).toEqual(second); selections.add(first.selected!.id);
    }
    expect(selections.size).toBe(3);
  });
  it('filters incompatible pools and records an honest fallback for fixed recipes', () => {
    const noKernel = { ...capabilities, backend: 'webgl2' as const, typegpu: false, compute: false };
    const fallback = resolveEffect({ ...input, capabilities: noKernel });
    expect(fallback.requested?.id).toBe('fluid-morph'); expect(fallback.selected?.id).toBe('spring-reflow'); expect(fallback.fallbackReason).toContain('TypeGPU');
    expect(resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ mode: 'random', pool: [] }) }).selected).toBeNull();
    expect(resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ effect: { id: 'fluid-morph', version: '99.0.0' } }) }).fallbackReason).toContain('Rezeptversion');
  });
  it('allows an explicitly expanded pool without changing legacy random settings', () => {
    const expanded = EffectSettingsSchema.parse({ mode: 'random', pool: EFFECT_LIBRARY.map(effect => ({ id: effect.id, version: effect.version })) });
    const selections = new Set(Array.from({ length: 120 }, (_, i) => resolveEffect({ ...input, settings: expanded, eventId: `expanded-${i}` }).selected?.id));
    expect(selections.size).toBe(6);
    expect(settings.pool.map(effect => effect.id)).toEqual(['fluid-morph', 'spring-reflow', 'ripple-reveal']);
    for (const id of ['liquid-lens', 'particle-weave']) {
      const plan = resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ effect: ref(id) }), capabilities: { ...capabilities, typegpu: false } });
      expect(plan.selected?.id).toBe('spring-reflow'); expect(plan.requested?.id).toBe(id); expect(plan.fallbackReason).toContain('TypeGPU');
    }
  });
  it('honors reduced motion and captures protected input identities', () => {
    const plan = resolveEffect({ ...input, capabilities: { ...capabilities, reducedMotion: true }, protectedNodeIds: ['input'] });
    expect(plan.selected).toBeNull(); expect(plan.parameters.durationMs).toBe(0); expect(plan.protectedNodeIds).toEqual(['input']);
  });
  it('uses recorded versions and selections without re-running a policy', () => {
    const plan = resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ mode: 'random' }) });
    expect(validateEffectReplay(plan, capabilities)).toEqual(plan);
    expect(() => validateEffectReplay({ ...plan, selected: { id: 'missing', version: '1.0.0' } }, capabilities)).toThrow();
    expect(() => validateEffectReplay(plan, { ...capabilities, backend: 'unavailable' })).toThrow();
  });
  it('does not mutate the library and rejects unsupported settings', () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 4294967295 }), seed => {
      const result = resolveEffect({ ...input, settings: EffectSettingsSchema.parse({ mode: 'random', seed }) });
      expect(EFFECT_LIBRARY.some(effect => effect.id === result.selected?.id)).toBe(true);
    }), { numRuns: 150 });
    expect(EffectSettingsSchema.safeParse({ parameters: { intensity: 2 } }).success).toBe(false);
    expect(EffectSettingsSchema.safeParse({ seed: -1 }).success).toBe(false);
  });
});

describe('domain/presentation separation', () => {
  const flow = () => defineFlow({ id: 'case-1', name: 'Effects', initial: 'a', states: { a: { label: 'A', nodes: [], on: { open: { target: 'b', duration: 500 } } }, b: { label: 'B', nodes: [], on: { close: { target: 'a' } } } } });
  it('records a plan per accepted transition without delaying the atomic commit', () => {
    const runtime = createFluidRuntime({ flow: flow(), effectSettings: settings }); runtime.setRenderCapabilities(capabilities);
    const before = runtime.getSnapshot(); runtime.configureEffects(EffectSettingsSchema.parse({ mode: 'random' })); expect(runtime.getSnapshot()).toBe(before);
    expect(runtime.send('open').accepted).toBe(true); expect(runtime.getSnapshot().state).toBe('b'); expect(runtime.getSnapshot().revision).toBe(1);
    expect(runtime.getVisualState().current?.targetRevision).toBe(1); expect(runtime.getVisualState().plans).toHaveLength(1);
    const current = runtime.getVisualState(); runtime.send('invalid'); expect(runtime.getVisualState()).toBe(current); runtime.dispose();
  });
  it('rejects a missing recorded effect before mutating a replay actor', () => {
    const replay = createFluidRuntime({ flow: flow(), replay: true, effectReplay: [] }); replay.setRenderCapabilities(capabilities);
    expect(replay.send('open', {}, 'replay').accepted).toBe(false); expect(replay.getSnapshot().state).toBe('a'); expect(replay.getSnapshot().revision).toBe(0); replay.dispose();
  });
  it('changes showcase policy without committing domain state or replacing an in-flight plan', () => {
    const runtime=createFluidRuntime({flow:flow(),effectSettings:settings});runtime.setRenderCapabilities(capabilities);
    runtime.send('open');const snapshot=runtime.getSnapshot(), plan=runtime.getVisualState().current;
    expect(runtime.send('visual.command',{command:{type:'effect.mode',mode:'case'}}).accepted).toBe(true);
    expect(runtime.send('visual.command',{command:{type:'effect.select',effect:ref('ripple-reveal')}}).accepted).toBe(true);
    expect(runtime.getVisualState().settings.caseRules['case-1']?.effect?.id).toBe('ripple-reveal');
    expect(runtime.getSnapshot()).toBe(snapshot);expect(runtime.getVisualState().current).toBe(plan);
    expect(runtime.send('visual.command',{command:{type:'effect.select',effect:ref('missing')}}).accepted).toBe(false);
    runtime.send('close');expect(runtime.getVisualState().current?.selected?.id).toBe('ripple-reveal');runtime.dispose();
  });
  it('rolls back an invalid presentation projection without changing policy or domain', () => {
    const definition=flow();definition.states.a!.projection='test';
    const runtime=createFluidRuntime({flow:definition,effectSettings:settings,projections:{test:(_s,_v,settings)=>settings.mode==='random'?[{id:'bad',kind:'button',anatomy:{componentId:'bad',part:'trigger',behavior:'button'}}]:[]}});
    const snapshot=runtime.getSnapshot(),visual=runtime.getVisualState();
    expect(runtime.send('visual.command',{command:{type:'effect.mode',mode:'random'}}).accepted).toBe(false);
    expect(runtime.getSnapshot()).toBe(snapshot);expect(runtime.getVisualState()).toBe(visual);runtime.dispose();
  });
  it('rejects duplicated IDs and excessive geometry in imported recordings', () => {
    const node = { id: 'n', anatomy: { componentId: 'c', part: 'root', behavior: 'presentation' }, kind: 'box' };
    const run = { schemaVersion: 2, viewport:{width:1000,height:1200}, caseId: 'c', source: [node, node], target: [], plan: null, durationMs: 500, redacted: false };
    expect(VisualScenarioSchema.safeParse(run).success).toBe(false);
    expect(VisualScenarioSchema.safeParse({ ...run, source: [{ ...node, x: 1e20 }] }).success).toBe(false);
  });
});

describe('presentation clock and independent shape invariants', () => {
  it('pauses and scrubs without losing continuation time', () => {
    const clock = createTestClock(); const timeline = createPresentationTimeline(clock.now); timeline.start(1000); clock.advance(300); timeline.pause(); clock.advance(500);
    expect(timeline.sample().progress).toBe(0.3); timeline.seek(0.7); timeline.play(); clock.advance(100); expect(timeline.sample().progress).toBe(0.8); clock.advance(200); expect(timeline.sample().phase).toBe('idle');
  });
  it('keeps SDF sign, known boundaries and symmetry independently of its implementation', () => {
    expect(panelDistance(0, 0, 200, 80, 10)).toBe(-40); expect(panelDistance(100, 0, 200, 80, 10)).toBe(0); expect(panelDistance(110, 0, 200, 80, 10)).toBe(10);
    expect(panelDistance(100, 40, 200, 80, 10)).toBeCloseTo(Math.sqrt(200) - 10, 6);
    fc.assert(fc.property(fc.double({ min: -300, max: 300, noNaN: true }), fc.double({ min: -300, max: 300, noNaN: true }), (x, y) => { expect(panelDistance(x, y, 200, 80, 10)).toBeCloseTo(panelDistance(-x, -y, 200, 80, 10), 6); }), { numRuns: 100 });
  });
  it('keeps valid dimensions and opacity under overshooting motion', () => {
    const a = { x: 0, y: 0, width: 1000, height: 800, radius: 20, rotation: 0, opacity: 1 }, b = { ...a, width: 10, height: 10, opacity: 0 };
    const result = interpolateBounds(a, b, 1.2); expect(result.width).toBeGreaterThan(0); expect(result.height).toBeGreaterThan(0); expect(result.opacity).toBeGreaterThanOrEqual(0);
  });
});
