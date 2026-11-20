import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { EffectSettingsSchema, SceneNodeSchema, VisualScenarioSchema, type SceneNode } from '@fluidkit/contracts';
import { capturePresentationCheckpoint, captureTransitionSource, createTransitionClip, EFFECT_LIBRARY, getTransitionQuality, normalizeVisualScenario, PresentationFrameSchema, resolveEffect, sampleTransitionClip } from '@fluidkit/effects';

const capabilities = { backend: 'webgpu' as const, typegpu: true, compute: true, reducedMotion: false };
const node = (id: string, componentId: string, x: number, y: number, extra: Partial<SceneNode> = {}) => SceneNodeSchema.parse({ id, kind: 'box', anatomy: { componentId, part: id, behavior: 'presentation' }, x, y, width: 180, height: 60, text: id, ...extra });
const source = [node('one', 'group-one', 20, 40), node('one-label', 'group-one', 25, 45, { kind: 'text', width: 150, height: 20 }), node('two', 'group-two', 20, 180)];
const target = source.map(item => ({ ...item, x: item.x + 200, y: item.y + 80 }));
function clip(recipe: string, width = 1000, overrides: Partial<Parameters<typeof createTransitionClip>[0]> = {}) {
  const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: recipe, version: '1.0.0' } }), capabilities, eventId: 'event-1', eventType: 'open', caseId: 'test', sourceState: 'a', targetState: 'b', sourceRevision: 0, targetRevision: 1, baseDuration: 1100, nodeCount: target.length });
  return createTransitionClip({ source, target, plan, durationMs: 1100, viewport: { width, height: 700 }, ...overrides });
}

describe('versioned effect clips', () => {
  it('keeps legacy selection defaults and preserves all six independently selectable recipes', () => {
    expect(EFFECT_LIBRARY).toHaveLength(6);
    expect(EffectSettingsSchema.parse({}).pool).toHaveLength(3);
    for (const effect of EFFECT_LIBRARY) {
      const value = clip(effect.id);
      expect(value.plan?.selected?.id).toBe(effect.id);
      expect(value.plan?.schemaVersion).toBe(['fluid-morph', 'spring-reflow', 'ripple-reveal'].includes(effect.id) ? 1 : 2);
      expect(effect.recommendedParameters.durationMs).toBeGreaterThan(0);
    }
  });
  it('resolves explicit profiles once and preserves their recorded order and quality', () => {
    const compact = clip('particle-weave', 390), desktop = clip('liquid-lens');
    expect(compact.plan?.presentation).toMatchObject({ quality: 'compact', particleBudget: 512, targetEdge: 1024 });
    expect(desktop.plan?.presentation).toMatchObject({ quality: 'standard', particleBudget: 2048, targetEdge: 2048 });
    expect(createTransitionClip({ ...compact, viewport: { width: 1200, height: 800 } }).plan).toEqual(compact.plan);
    expect(Object.isFrozen(compact)).toBe(true); expect(Object.isFrozen(compact.source[0])).toBe(true);
  });
  it('anchors a content-triggered transition at that group rather than a toolbar', () => {
    const clicked = node('detail-trigger', 'group-two', 60, 220, { onActivate: 'open' });
    const value = clip('liquid-lens', 1000, { source: [...source, clicked] });
    expect(value.plan?.presentation?.groupOrder[0]).toBe('group-two');
    expect(value.plan?.presentation?.anchor).toEqual({ x: 110, y: 210 });
  });
  it('retains source/target exact endpoints and rehydrates source-only parts after completion', () => {
    for (const effect of EFFECT_LIBRARY) {
      const value = clip(effect.id, 1000, { target: [target[0]!, node('new', 'group-new', 350, 300)] });
      const start = sampleTransitionClip(value, 0), end = sampleTransitionClip(value, 1);
      for (const item of value.source) expect(start.nodes.find(part => part.id === item.id)).toEqual(item);
      for (const item of value.target) expect(end.nodes.find(part => part.id === item.id)).toEqual(item);
      expect(end.nodes.find(part => part.id === 'two')?.opacity).toBe(0);
      expect(sampleTransitionClip(value, 0)).toEqual(start);
      expect(end.lens).toBeNull(); expect(end.particles).toEqual([]);
    }
  });
  it('samples identically regardless of arbitrary seek order', () => {
    for (const recipe of ['silk-cascade', 'liquid-lens', 'particle-weave']) {
      const value = clip(recipe);
      const expected = sampleTransitionClip(value, 0.43);
      for (const progress of [1, 0.2, 0.9, 0, 0.77, 1]) sampleTransitionClip(value, progress);
      expect(sampleTransitionClip(value, 0.43)).toEqual(expected);
    }
  });
  it('keeps component parts together and protects focused/input/control groups', () => {
    const value = clip('silk-cascade'), frame = sampleTransitionClip(value, 0.45);
    const box = frame.nodes.find(part => part.id === 'one')!, label = frame.nodes.find(part => part.id === 'one-label')!;
    expect(label.x - box.x).toBeCloseTo(5, 8); expect(label.y - box.y).toBeCloseTo(5, 8);
    const focused = sampleTransitionClip(clip('silk-cascade', 1000, { protectedNodeIds: ['one'] }), 0.45);
    expect(focused.nodes.find(part => part.id === 'one')?.text).toBe('one');
    expect(focused.nodeStates.find(part => part.id === 'one')?.shadow.opacity).toBe(0);
    expect(focused.nodeStates.find(part => part.id === 'one-label')?.protected).toBe(true);
    const particles = sampleTransitionClip(clip('particle-weave', 390, { protectedNodeIds: ['one'] }), 0.5).particles;
    expect(particles.some(item => item.componentId === 'group-one')).toBe(false);
  });
  it('does not emit particles from stationary headings or navigation buttons',()=>{
    const heading=node('heading','static-heading',20,10,{kind:'text',text:'Still here'});
    const navigation=node('navigation','static-navigation',20,60,{kind:'button',text:'Cards',onActivate:'view.cards',anatomy:{componentId:'static-navigation',part:'navigation',behavior:'button'}});
    const value=clip('particle-weave',1000,{source:[heading,navigation,...source],target:[heading,navigation,...target]});
    const frame=sampleTransitionClip(value,.5);
    expect(frame.particles.length).toBeGreaterThan(0);
    expect(frame.particles.some(particle=>['static-heading','static-navigation'].includes(particle.componentId))).toBe(false);
    expect(frame.nodes.find(part=>part.id==='heading')).toEqual(heading);
    expect(frame.nodes.find(part=>part.id==='navigation')).toEqual(navigation);
  });
  it('produces a localized lens and bounded deterministic particles on compact profiles', () => {
    const lens = sampleTransitionClip(clip('liquid-lens', 390), 0.5).lens;
    expect(lens?.strength).toBeGreaterThan(0); expect(lens?.radius).toBeGreaterThan(0);
    const value = clip('particle-weave', 390), frame = sampleTransitionClip(value, 0.5);
    expect(frame.particles.length).toBeGreaterThan(0); expect(frame.particles.length).toBeLessThanOrEqual(512);
    expect(new Set(frame.particles.map(item => item.id)).size).toBe(frame.particles.length);
    expect(frame).toEqual(sampleTransitionClip(value, 0.5));
  });
  it('expands the lens from a stable recorded anchor and leaves exact clean endpoints', () => {
    const value = clip('liquid-lens', 390, { target: source }), anchor = value.plan!.presentation!.anchor;
    const lenses = [0.05, 0.25, 0.5, 0.75, 0.95].map(progress => sampleTransitionClip(value, progress).lens!);
    for (const lens of lenses) { expect(lens.x).toBe(anchor.x); expect(lens.y).toBe(anchor.y); }
    for (let i = 1; i < lenses.length; i++) expect(lenses[i]!.radius).toBeGreaterThan(lenses[i - 1]!.radius);
    expect(sampleTransitionClip(value, 0).lens).toBeNull(); expect(sampleTransitionClip(value, 1).lens).toBeNull();
  });
  it('keeps a causally anchored lens with its moving component instead of empty source space', () => {
    const value = clip('liquid-lens', 1000, { source: [source[0]!], target: [target[0]!] });
    for (const progress of [.05,.25,.5,.75,.95]) {
      const frame=sampleTransitionClip(value,progress), node=frame.nodes[0]!;
      expect(frame.lens?.x).toBe(node.x+node.width/2);expect(frame.lens?.y).toBe(node.y+node.height/2);
    }
    expect(sampleTransitionClip(value,.95).lens?.x).toBe(target[0]!.x+target[0]!.width/2);
  });
  it('opens enough panel space for the weave while retaining source and target opacity', () => {
    const value = clip('particle-weave'), midpoint = sampleTransitionClip(value, 0.5);
    expect(midpoint.nodeStates.find(part => part.id === 'one')?.panelOpacity).toBeCloseTo(1 - 0.65 * 0.8);
    expect(sampleTransitionClip(value, 0).nodeStates.find(part => part.id === 'one')?.panelOpacity).toBe(1);
    expect(sampleTransitionClip(value, 1).nodeStates.find(part => part.id === 'one')?.panelOpacity).toBe(1);
  });
  it('satisfies finite geometry and opacity invariants across parameters and progress', () => {
    fc.assert(fc.property(fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0.2, max: 8, noNaN: true }), (progress, intensity, frequency) => {
      for (const recipe of ['silk-cascade', 'liquid-lens', 'particle-weave']) {
        const value = clip(recipe, 390); const configured = createTransitionClip({ ...value, plan: { ...value.plan!, parameters: { durationMs: 1100, intensity, frequency } } });
        expect(PresentationFrameSchema.safeParse(sampleTransitionClip(configured, progress)).success).toBe(true);
      }
    }), { numRuns: 60 });
  });
  it('renders the committed target without residual channels for reduced motion', () => {
    const value = clip('particle-weave'), frame = sampleTransitionClip(value, 0.5, { reducedMotion: true });
    expect(frame.progress).toBe(1); expect(frame.particles).toEqual([]); expect(frame.lens).toBeNull();
    for (const item of target) expect(frame.nodes.find(part => part.id === item.id)).toEqual(item);
  });
  it('uses source typography until its fade completes and preserves color endpoints', () => {
    const first = node('type', 'typography', 20, 20, { fontSize: 12, textInset: 4, textInsetY: 2, textLines: 1, foreground: '#FAAB12', color: '#AABBCC', text: 'Source' });
    const last = { ...first, x: 120, y: 80, fontSize: 26, textInset: 20, textInsetY: 10, textLines: 3, foreground: '#02EEAA', color: '#112233', text: 'Target' };
    const value = clip('silk-cascade', 1000, { source: [first], target: [last] });
    expect(sampleTransitionClip(value, 0.08).nodes[0]).toMatchObject({ fontSize: 12, textInset: 4, textInsetY: 2, textLines: 1, text: 'Source', foreground: '#FAAB12' });
    expect(sampleTransitionClip(value, 0).nodes[0]).toEqual(first);
    expect(sampleTransitionClip(value, 1).nodes[0]).toEqual(last);
    expect(sampleTransitionClip(value, 0.9).nodes[0]).toMatchObject({ fontSize: 26, text: 'Target', textInset: 20 });
  });
});

describe('flat interruptions and portable recordings', () => {
  it('does not accumulate never-visible target IDs across 100 immediate interruptions', () => {
    let value=clip('silk-cascade',1000,{source:[source[0]!],target:[node('fresh-0','fresh-group-0',300,100)]});
    for(let i=1;i<=100;i++){
      const captured=captureTransitionSource(sampleTransitionClip(value,0));
      expect(captured.source.map(node=>node.id)).toEqual(['one']);
      expect(captured.sourceCheckpoint?.nodeStates.map(state=>state.id)).toEqual(['one']);
      value=createTransitionClip({...value,...captured,target:[node(`fresh-${i}`,`fresh-group-${i}`,300,100)]});
    }
    expect(sampleTransitionClip(value,0).nodes).toHaveLength(2);
  });
  it('retains every nonzero pixel channel and invisible geometry needed by visible particles',()=>{
    const nodes=['geometry','panel','text','shadow','particle','obsolete'].map((id,index)=>node(id,`group-${id}`,index*20,20,{opacity:0}));
    const baseline=sampleTransitionClip(clip('silk-cascade',1000,{source:nodes,target:nodes}),0);
    const frame=PresentationFrameSchema.parse({...baseline,nodes:baseline.nodes.map(item=>item.id==='geometry'?{...item,opacity:1e-12}:item),nodeStates:baseline.nodeStates.map(state=>({ ...state, panelOpacity:state.id==='panel'?1e-12:0, textOpacity:state.id==='text'?1e-12:0, shadow:{...state.shadow,opacity:state.id==='shadow'?1e-12:0}})),particles:[{id:'visible-particle',componentId:'group-particle',x:0,y:0,velocityX:0,velocityY:0,size:1,rotation:0,color:'#ffffff',opacity:1e-12}]});
    const captured=captureTransitionSource(frame);
    expect(captured.source.map(item=>item.id)).toEqual(['geometry','panel','text','shadow','particle']);
    expect(captured.sourceCheckpoint?.nodeStates.map(item=>item.id)).toEqual(captured.source.map(item=>item.id));
    expect(captured.sourceCheckpoint?.particles).toEqual(frame.particles);
    expect(frame.nodes).toHaveLength(6);
  });
  it.each(['fluid-morph', 'spring-reflow', 'ripple-reveal', 'silk-cascade', 'liquid-lens', 'particle-weave'])('preserves the first interrupted frame of %s', recipe => {
    const first = clip(recipe), frame = sampleTransitionClip(first, 0.47);
    const next = clip('liquid-lens', 1000, { source: frame.nodes, sourceCheckpoint: capturePresentationCheckpoint(frame), target: source });
    const resumed = sampleTransitionClip(next, 0);
    expect(resumed.nodes).toEqual(frame.nodes);
    expect(resumed.nodeStates).toEqual(frame.nodeStates);
    expect(resumed.lens).toEqual(frame.lens); expect(resumed.particles).toEqual(frame.particles);
    expect(sampleTransitionClip(next, 0.13).particles).toEqual([]);
  });
  it('does not accumulate histories or particle layers during rapid interruption', () => {
    let value = clip('particle-weave', 390), frame = sampleTransitionClip(value, 0.5);
    for (let i = 0; i < 30; i++) {
      value = createTransitionClip({ ...value, source: frame.nodes, target: i % 2 ? source : target, sourceCheckpoint: capturePresentationCheckpoint(frame) });
      frame = sampleTransitionClip(value, 0.03);
      expect(frame.particles.length).toBeLessThanOrEqual(512);
      expect(Object.keys(value.sourceCheckpoint ?? {})).not.toContain('history');
      expect(PresentationFrameSchema.safeParse(frame).success).toBe(true);
    }
  });
  it('preserves C0 continuity across random recipe/phase interruptions', () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 5 }), fc.integer({ min: 0, max: 5 }), fc.double({ min: 0.001, max: 0.999, noNaN: true }), (a, b, progress) => {
      const first = clip(EFFECT_LIBRARY[a]!.id, 390), frame = sampleTransitionClip(first, progress);
      const second = clip(EFFECT_LIBRARY[b]!.id, 390, { source: frame.nodes, sourceCheckpoint: capturePresentationCheckpoint(frame), target: source });
      const resumed = sampleTransitionClip(second, 0);
      expect(resumed.nodes).toEqual(frame.nodes);
      expect(resumed.nodeStates).toEqual(frame.nodeStates);
      expect(resumed.lens).toEqual(frame.lens); expect(resumed.particles).toEqual(frame.particles);
      expect(resumed.nodes.map(node => node.id)).toEqual(resumed.nodeStates.map(node => node.id));
    }), { numRuns: 80 });
  });
  it('removes neutral settled checkpoints instead of delaying every new transition', () => {
    const first = clip('silk-cascade'), settled = sampleTransitionClip(first, 1);
    const next = createTransitionClip({ ...first, source: settled.nodes, target: source, sourceCheckpoint: capturePresentationCheckpoint(settled) });
    expect(next.sourceCheckpoint).toBeNull();
  });
  it('normalizes legacy v2 and roundtrips interrupted v3 without executable or GPU state', () => {
    const value = clip('particle-weave', 390), frame = sampleTransitionClip(value, 0.5);
    const legacy = { schemaVersion: 2, caseId: 'test', source, target, plan: clip('fluid-morph').plan, viewport: value.viewport, durationMs: 1100, redacted: false };
    expect(normalizeVisualScenario(legacy).sourceCheckpoint).toBeNull();
    const recorded = { ...legacy, schemaVersion: 3, source: frame.nodes, target: source, plan: value.plan, sourceCheckpoint: capturePresentationCheckpoint(frame), protectedNodeIds: ['two'] };
    const restored = normalizeVisualScenario(JSON.parse(JSON.stringify(recorded)));
    const a = createTransitionClip({ source: recorded.source, target: recorded.target, plan: recorded.plan, durationMs: recorded.durationMs, viewport: recorded.viewport, sourceCheckpoint: recorded.sourceCheckpoint, protectedNodeIds: recorded.protectedNodeIds });
    const b = createTransitionClip({ source: restored.source, target: restored.target, plan: restored.plan, durationMs: restored.durationMs, viewport: restored.viewport, sourceCheckpoint: restored.sourceCheckpoint, protectedNodeIds: restored.protectedNodeIds });
    expect(sampleTransitionClip(a, 0.06)).toEqual(sampleTransitionClip(b, 0.06));
    expect(VisualScenarioSchema.safeParse({ ...recorded, sourceCheckpoint: { ...recorded.sourceCheckpoint, history: [] } }).success).toBe(false);
    expect(VisualScenarioSchema.safeParse({ ...recorded, sourceCheckpoint: { ...recorded.sourceCheckpoint, nodeStates: [{ ...recorded.sourceCheckpoint.nodeStates[0], id: 'unknown' }] } }).success).toBe(false);
  });
  it('carries sensitivity until the source is gone, including interruption and portable export', () => {
    const privateSource = node('private', 'private-group', 20, 30, { text: 'secret-customer-note', sensitive: true });
    const publicTarget = { ...privateSource, x: 220, text: 'Public', sensitive: false };
    const first = clip('silk-cascade', 1000, { source: [privateSource], target: [publicTarget] });
    const outgoing = sampleTransitionClip(first, 0.05);
    expect(outgoing.nodes[0]).toMatchObject({ text: 'secret-customer-note', sensitive: true });
    const second = clip('liquid-lens', 1000, { source: outgoing.nodes, target: [publicTarget], sourceCheckpoint: capturePresentationCheckpoint(outgoing) });
    const interrupted = sampleTransitionClip(second, 0.02);
    expect(interrupted.nodes[0]).toMatchObject({ text: 'secret-customer-note', sensitive: true });
    const redact = (item: SceneNode) => item.sensitive ? { ...item, text: '[redacted]' } : item;
    const exported = normalizeVisualScenario({ schemaVersion: 3, caseId: 'test', source: second.source.map(redact), target: second.target.map(redact), sourceCheckpoint: second.sourceCheckpoint, plan: second.plan, durationMs: second.durationMs, viewport: second.viewport, redacted: true });
    expect(JSON.stringify(exported)).not.toContain('secret-customer-note');
    expect(sampleTransitionClip(second, 0.99).nodes[0]?.sensitive).toBe(true);
    expect(sampleTransitionClip(second, 1).nodes[0]).toEqual(publicTarget);
  });
  it('retains a standard budget for a compact interruption without dropping visible particles', () => {
    const manySource = Array.from({ length: 30 }, (_, i) => node(`node-${i}`, `group-${i}`, 20 + (i % 5) * 190, 30 + Math.floor(i / 5) * 80));
    const manyTarget = manySource.map(item => ({ ...item, x: item.x + 30, y: item.y + 25 }));
    const first = clip('particle-weave', 1000, { source: manySource, target: manyTarget });
    const frame = sampleTransitionClip(first, 0.5), checkpoint = capturePresentationCheckpoint(frame);
    expect(frame.particles.length).toBeGreaterThan(512);
    for (const plan of [clip('silk-cascade', 390).plan, clip('fluid-morph', 390).plan, null]) {
      const second = createTransitionClip({ source: frame.nodes, target: manyTarget, plan, durationMs: 1100, viewport: { width: 390, height: 700 }, sourceCheckpoint: checkpoint });
      expect(getTransitionQuality(second)).toEqual({ quality: 'standard', particleBudget: 2048, targetEdge: 2048 });
      expect(sampleTransitionClip(second, 0).particles).toEqual(frame.particles);
      expect(sampleTransitionClip(second, 0.13).particles).toHaveLength(0);
      expect(getTransitionQuality(second).quality).toBe('standard');
    }
  });
});
