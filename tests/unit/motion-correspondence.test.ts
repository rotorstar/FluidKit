import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { EffectSettingsSchema, SceneNodeSchema, SceneMotionSchema, VisualScenarioSchema, type SceneNode } from '@fluidkit/contracts';
import { captureTransitionSource, compileMotionPlan, createTransitionClip, EFFECT_LIBRARY, normalizeVisualScenario, PresentationFrameSchema, resolveEffect, sampleTransitionClip, validateMotionPlan } from '@fluidkit/effects';

const viewport = { width: 1000, height: 800 };
const node = (id: string, x: number, extra: Partial<SceneNode> = {}) => SceneNodeSchema.parse({ id, kind: 'box', x, y: 40, width: 100, height: 80, text: '', anatomy: { componentId: id, part: 'shell', behavior: 'presentation' }, ...extra });
const motion = (value: unknown) => SceneMotionSchema.parse(value);
const make = (source: SceneNode[], target: SceneNode[], extra: Partial<Parameters<typeof createTransitionClip>[0]> = {}) => createTransitionClip({ source, target, plan: null, durationMs: 1000, viewport, motionVersion: 2, ...extra });
const at = (clip: ReturnType<typeof make>, p: number, id: string) => sampleTransitionClip(clip, p).nodes.find(item => item.id === id)!;
const shell = (id: string, x: number, kind: 'split' | 'merge', sources: string[], extra: Partial<SceneNode> = {}) => node(id, x, { motion: motion({ correspondence: [{ kind, sources }] }), ...extra });

describe('explicit correspondence compiler', () => {
  it('covers same-ID matches and real entering/exiting membership once', () => {
    const source = [node('same', 0), node('old', 20)], target = [node('same', 100), node('new', 200)];
    expect(compileMotionPlan(source, target).relations.map(item => [item.kind, item.sources, item.targets])).toEqual([
      ['match', ['same'], ['same']], ['enter', [], ['new']], ['exit', ['old'], []],
    ]);
    expect(compileMotionPlan(source, target)).toEqual(compileMotionPlan(source, target));
  });
  it('resolves explicit different-ID 1:1 and conditions without namespace heuristics', () => {
    const target = node('card', 200, { motion: motion({ correspondence: [{ kind: 'match', sources: ['row'], whenState: 'table', whenPresent: ['row'] }] }) });
    expect(compileMotionPlan([node('row', 0)], [target], 'table').relations[0]).toMatchObject({ kind: 'match', sources: ['row'], targets: ['card'] });
    expect(compileMotionPlan([], [target], 'cards').relations[0]?.kind).toBe('enter');
  });
  it('compiles declared split and merge ownership, not inferred visual proximity', () => {
    const source = [node('cluster', 0)], target = [shell('a', 200, 'split', ['cluster']), shell('b', 400, 'split', ['cluster'])];
    expect(compileMotionPlan(source, target).relations).toHaveLength(1);
    expect(compileMotionPlan(source, target).relations[0]).toMatchObject({ kind: 'split', sources: ['cluster'], targets: ['a', 'b'] });
    expect(compileMotionPlan(target, [shell('joined', 0, 'merge', ['a', 'b'])]).relations[0]?.kind).toBe('merge');
  });
  it('records axis routing only for explicit one-to-one correspondence', () => {
    const target = node('card', 200, { motion: motion({ correspondence: [{ kind: 'match', sources: ['row'], route: 'x-then-y' }] }) });
    expect(compileMotionPlan([node('row', 0)], [target]).relations[0]?.route).toBe('x-then-y');
    expect(() => motion({ correspondence: [{ kind: 'split', sources: ['row'], route: 'x-then-y' }] })).toThrow(/one-to-one/);
  });
  it('rejects missing, duplicated, ambiguous, incomplete and n:m ownership', () => {
    expect(() => make([], [shell('a', 0, 'split', ['missing']), shell('b', 0, 'split', ['missing'])])).toThrow(/Unknown/);
    const a = node('a', 0), b = node('b', 100);
    const duplicate = node('out', 0, { motion: motion({ correspondence: [{ kind: 'merge', sources: ['a', 'b'] }, { kind: 'match', sources: ['a'] }] }) });
    expect(() => make([a, b], [duplicate])).toThrow(/Ambiguous/);
    expect(() => validateMotionPlan({ schemaVersion: 1, relations: [] }, [a], [a])).toThrow(/Incomplete/);
    expect(() => validateMotionPlan({ schemaVersion: 1, relations: [{ id: 'bad', kind: 'merge', sources: ['a', 'b'], targets: ['c', 'd'] }] }, [a, b], [node('c', 0), node('d', 0)])).toThrow();
    const claim = (id: string) => node(id, 0, { motion: motion({ correspondence: [{ kind: 'match', sources: ['a'] }] }) });
    expect(() => make([a], [claim('x'), claim('y')])).toThrow(/owned/);
  });
  it('rejects coupling interactive/text shells, cycles and unknown ports before sampling', () => {
    expect(() => make([node('a', 0, { text: 'Visible information' }), node('b', 100)], [shell('joined', 0, 'merge', ['a', 'b'])])).toThrow(/decorative/);
    const follower = (id: string, follow: string) => node(id, 0, { motion: motion({ follow }) });
    expect(() => make([], [follower('a', 'b'), follower('b', 'a')])).toThrow(/cyclic/);
    expect(() => make([], [node('a', 0), node('line', 0, { motion: motion({ connector: { from: { nodeId: 'a', portId: 'missing' }, to: { nodeId: 'a' } } }) })])).toThrow(/port/);
  });
  it('enforces the explicit eight-group GPU bound', () => {
    const source = Array.from({ length: 9 }, (_, i) => node(`s${i}`, 0));
    const target = source.flatMap(item => [shell(`${item.id}-a`, 0, 'split', [item.id]), shell(`${item.id}-b`, 100, 'split', [item.id])]);
    expect(() => make(source, target)).toThrow(/budget/);
  });
});

describe('continuous versioned motion', () => {
  it('moves at the start, holds stable labels visible and preserves exact endpoints', () => {
    const source = [node('a', 0, { text: 'Stable module' })], target = [node('a', 400, { text: 'Stable module' })], clip = make(source, target);
    expect(sampleTransitionClip(clip, 0).nodes).toEqual(source); expect(sampleTransitionClip(clip, 1).nodes).toEqual(target);
    expect(at(clip, .05, 'a').x).toBeGreaterThan(0);
    for (const p of [.01, .15, .25, .5, .75, .95]) {
      const frame = sampleTransitionClip(clip, p);
      expect(frame.nodes[0]?.text).toBe('Stable module'); expect(frame.nodeStates[0]?.textOpacity).toBe(1);
    }
  });
  it('keeps changing private source content classified through interruption; only clean target declassifies', () => {
    const clip = make([node('a', 0, { sensitive: true, text: 'PRIVATE' })], [node('a', 400, { text: 'Public', sensitive: false })]);
    const halfway = sampleTransitionClip(clip, .2), captured = captureTransitionSource(halfway);
    expect(halfway.nodes[0]).toMatchObject({ text: 'PRIVATE', sensitive: true });
    const next = make(captured.source, [node('a', 800, { text: 'Other' })], { sourceCheckpoint: captured.sourceCheckpoint });
    expect(at(next, .1, 'a').sensitive).toBe(true); expect(at(next, 1, 'a').sensitive).toBe(false);
  });
  it('changes a stable label foreground continuously, including a retargeted theme color', () => {
    const source = node('a', 0, { text: 'Stable', foreground: '#ff0000' }), target = node('a', 400, { text: 'Stable', foreground: '#0000ff' });
    const clip = make([source], [target]);
    expect(at(clip, .000001, 'a').foreground).toBe(source.foreground);
    expect(at(clip, .5, 'a').foreground).not.toBe(source.foreground); expect(at(clip, .5, 'a').foreground).not.toBe(target.foreground);
    const captured = captureTransitionSource(sampleTransitionClip(clip, .43)), next = make(captured.source, [{ ...target, foreground: '#00ff00' }], { sourceCheckpoint: captured.sourceCheckpoint });
    expect(at(next, .000001, 'a').foreground).toBe(captured.source[0]!.foreground);
  });
  it('retires replaced text roles before showing incoming attributes, keeping matched labels readable', () => {
    const clip = make([node('stable', 0, { text: 'Module' }), node('old-attribute', 0, { kind: 'text', text: 'Source files' })],
      [node('stable', 200, { text: 'Module' }), node('new-attribute', 200, { kind: 'text', text: 'Comparison files' })]);
    for (const p of [.01, .1, .2, .3, .35, .5, .6, .8, .9]) {
      const frame = sampleTransitionClip(clip, p), states = new Map(frame.nodeStates.map(value => [value.id, value]));
      expect(states.get('stable')!.textOpacity).toBe(1);
      expect(states.get('old-attribute')!.textOpacity * states.get('new-attribute')!.textOpacity).toBe(0);
    }
    expect(sampleTransitionClip(clip, .3).nodeStates.find(value => value.id === 'new-attribute')!.textOpacity).toBe(0);
    expect(sampleTransitionClip(clip, .8).nodeStates.find(value => value.id === 'new-attribute')!.textOpacity).toBe(0);
    expect(sampleTransitionClip(clip, .95).nodeStates.find(value => value.id === 'new-attribute')!.textOpacity).toBeGreaterThan(.8);
  });
  it('keeps split/merge sharp content separate from unified panels', () => {
    const clip = make([node('cluster', 0)], [shell('a', 200, 'split', ['cluster']), shell('b', 400, 'split', ['cluster'])]);
    const frame = sampleTransitionClip(clip, .5);
    expect(frame.couplings).toHaveLength(1); expect(frame.couplings![0]!.pieces).toHaveLength(2); expect(frame.couplings![0]!.bridges[0]!.radius).toBeGreaterThan(0);
    expect(frame.nodeStates.every(state => state.panelOpacity === 0)).toBe(true);
    expect(sampleTransitionClip(clip, 1).couplings).toEqual([]); expect(sampleTransitionClip(clip, 1).nodeStates.every(state => state.panelOpacity === 1)).toBe(true);
    const merge = make(clip.target, [shell('result', 100, 'merge', ['a', 'b'])]);
    expect(sampleTransitionClip(merge, .5).couplings![0]!.pieces.map(item => item.id)).toEqual(['a', 'b']);
  });
  it('preserves distinct source colors and alpha in a merge instead of averaging away source paint', () => {
    const a = node('a', 0, { color: '#ff0000', opacity: .4 }), b = node('b', 300, { color: '#0000ff', opacity: .8 });
    const clip = make([a, b], [shell('joined', 100, 'merge', ['a', 'b'], { color: '#ffffff' })]);
    const start = sampleTransitionClip(clip, .000001).couplings![0]!;
    expect(start.opacity).toBe(1);
    expect(start.pieces[0]?.color).toBe(a.color); expect(start.pieces[1]?.color).toBe(b.color);
    expect(start.pieces[0]?.opacity).toBeCloseTo(a.opacity, 8); expect(start.pieces[1]?.opacity).toBeCloseTo(b.opacity, 8);
    const captured = captureTransitionSource(sampleTransitionClip(clip, .3));
    const next = make(captured.source, [node('joined', 600)], { sourceCheckpoint: captured.sourceCheckpoint });
    expect(sampleTransitionClip(next, 0).couplings).toEqual(captured.sourceCheckpoint!.motion!.couplings);
  });
  it('retargets from an exact flat checkpoint with inherited velocity and no retirement pause', () => {
    const clip = make([node('a', 0)], [node('a', 400)]), frame = sampleTransitionClip(clip, .43);
    const captured = captureTransitionSource(frame), next = make(captured.source, [node('a', 700)], { sourceCheckpoint: captured.sourceCheckpoint });
    const start = sampleTransitionClip(next, 0);
    expect(start.nodes).toEqual(frame.nodes); expect(start.nodeStates).toEqual(frame.nodeStates);
    expect(start.velocities).toEqual(frame.velocities);
    const delta = .000001, derivative = (at(next, delta, 'a').x - at(next, 0, 'a').x) / delta;
    expect(derivative).toBeCloseTo(frame.velocities![0]!.x, 2);
    expect(at(next, .01, 'a').x).toBeGreaterThan(at(next, 0, 'a').x);
  });
  it('preserves source presentation over generated reverse and repeated interruptions', () => {
    fc.assert(fc.property(fc.array(fc.record({ x: fc.integer({ min: -1000, max: 1000 }), p: fc.double({ min: .01, max: .99, noNaN: true }) }), { minLength: 2, maxLength: 12 }), steps => {
      let clip = make([node('a', 0, { text: 'Stable' })], [node('a', 100, { text: 'Stable' })]);
      for (const step of steps) {
        const frame = sampleTransitionClip(clip, step.p), captured = captureTransitionSource(frame);
        clip = make(captured.source, [node('a', step.x, { text: 'Stable' })], { sourceCheckpoint: captured.sourceCheckpoint });
        const first = sampleTransitionClip(clip, 0);
        expect(first.nodes).toEqual(frame.nodes); expect(first.nodeStates).toEqual(frame.nodeStates); expect(first.velocities).toEqual(frame.velocities);
        expect(PresentationFrameSchema.safeParse(sampleTransitionClip(clip, .2)).success).toBe(true);
      }
    }), { numRuns: 50, seed: 20261120 });
  });
  it('captures split residue and seeks deterministically after a second interruption', () => {
    const split = make([node('cluster', 0)], [shell('a', 200, 'split', ['cluster']), shell('b', 400, 'split', ['cluster'])]);
    const frame = sampleTransitionClip(split, .5), captured = captureTransitionSource(frame);
    const next = make(captured.source, [node('a', 700), node('b', 800)], { sourceCheckpoint: captured.sourceCheckpoint });
    expect(sampleTransitionClip(next, 0).couplings).toEqual(frame.couplings);
    const expected = sampleTransitionClip(next, .05);
    sampleTransitionClip(next, 1); sampleTransitionClip(next, .9); expect(sampleTransitionClip(next, .05)).toEqual(expected);
    expect(sampleTransitionClip(next, .2).couplings).toEqual([]);
    expect(PresentationFrameSchema.safeParse(expected).success).toBe(true);
  });
  it('retires consumed-shell follower references before interrupting a cluster split', () => {
    const source = [node('cluster', 0), node('cluster-label', 8, { kind: 'text', text: 'Kernel', motion: motion({ follow: 'cluster' }) })];
    const target = [shell('a', 200, 'split', ['cluster']), shell('b', 400, 'split', ['cluster'])];
    const split = make(source, target);
    for (const p of [.01, .25, .5, .75, .99]) {
      const frame = sampleTransitionClip(split, p), captured = captureTransitionSource(frame);
      expect(frame.nodes.find(item => item.id === 'cluster-label')?.motion?.follow).toBeUndefined();
      const next = make(captured.source, [node('a', 700), node('b', 800)], { sourceCheckpoint: captured.sourceCheckpoint });
      expect(sampleTransitionClip(next, 0).nodes).toEqual(frame.nodes);
      expect(() => sampleTransitionClip(next, .1)).not.toThrow();
    }
  });
  it('keeps sharp child offsets attached during layout motion and velocity retargeting', () => {
    const label = (x: number) => node('label', x + 8, { kind: 'text', text: 'Module', motion: motion({ follow: 'shell' }), width: 80, height: 20 });
    const clip = make([node('shell', 0), label(0)], [node('shell', 400), label(400)]);
    const frame = sampleTransitionClip(clip, .4), captured = captureTransitionSource(frame);
    const next = make(captured.source, [node('shell', 700), label(700)], { sourceCheckpoint: captured.sourceCheckpoint });
    for (const p of [.00001, .1, .5, .9]) expect(at(next, p, 'label').x - at(next, p, 'shell').x).toBeCloseTo(8, 6);
  });
  it('keeps an outgoing suffix attached to its moving value until it retires', () => {
    const value = node('value', 20, { kind: 'text', text: '14' });
    const suffix = node('suffix', 54, { kind: 'text', text: 'Sources', motion: motion({ follow: 'value' }) });
    const clip = make([value, suffix], [{ ...value, x: 700, y: 400 }]);
    for (const p of [.01, .1, .19]) {
      const frame = sampleTransitionClip(clip, p);
      expect(frame.nodes.find(item => item.id === 'suffix')!.x - frame.nodes.find(item => item.id === 'value')!.x).toBeCloseTo(34, 6);
      expect(frame.nodes.find(item => item.id === 'suffix')!.y).toBeCloseTo(frame.nodes.find(item => item.id === 'value')!.y, 6);
    }
  });
  it('captures a visible follower with its invisible ancestor', () => {
    const hidden = node('hidden', 0, { opacity: 0 });
    const child = node('child', 12, { kind: 'text', text: 'Visible', motion: motion({ follow: 'hidden' }) });
    const dead = node('unreachable', 600, { opacity: 0 });
    const clip = make([hidden, child, dead], [hidden, child, dead]);
    const captured = captureTransitionSource(sampleTransitionClip(clip, 0));
    expect(captured.source.map(value => value.id)).toEqual(['hidden', 'child']);
    expect(() => make(captured.source, [child, hidden])).not.toThrow();
  });
  it('retargets a last painted endpoint even when a different target was committed before the next frame', () => {
    const a = node('a', 0), b = node('b', 300);
    const label = node('label', 12, { kind: 'text', text: 'Module', motion: motion({ follow: 'a' }) });
    const joined = shell('joined', 50, 'merge', ['a', 'b']);
    const joinedLabel = { ...label, x: 62, motion: motion({ follow: 'joined' }) };
    const painted = sampleTransitionClip(make([a, b, label], [joined, joinedLabel]), 1);
    const cards = [{ ...a, motion: motion({ correspondence: [{ kind: 'split', sources: ['joined'] }] }) }, { ...b, motion: motion({ correspondence: [{ kind: 'split', sources: ['joined'] }] }) }, label];
    const pending = make(painted.nodes, cards); // committed, but not sampled/painted
    expect(pending.target.some(value => value.id === 'joined')).toBe(false);
    const captured = captureTransitionSource(painted);
    const restored = make(captured.source, [{ ...joined, motion: undefined }, joinedLabel]);
    expect(sampleTransitionClip(restored, 0).nodes).toEqual(painted.nodes);
    expect(() => sampleTransitionClip(restored, .000001)).not.toThrow();
  });
  it('preserves global label spacing when individual parents merge into one common owner', () => {
    const source = ['a', 'b', 'c'].flatMap((id, i) => [node(id, i * 300), node(`${id}-label`, i * 300 + 12, { kind: 'text', text: id, motion: motion({ follow: id }) })]);
    const target = [shell('joined', 50, 'merge', ['a', 'b', 'c']), ...['a', 'b', 'c'].map((id, i) => node(`${id}-label`, 70 + i * 140, { kind: 'text', text: id, motion: motion({ follow: 'joined' }) }))];
    const clip = make(source, target);
    for (const part of source.filter(item => item.text)) expect(at(clip, .000001, part.id).x).toBeCloseTo(part.x, 6);
    const captured = captureTransitionSource(sampleTransitionClip(clip, .4));
    const reverse = source.map(part => part.text ? part : { ...part, motion: motion({ correspondence: [{ kind: 'split', sources: ['joined'] }] }) });
    const next = make(captured.source, reverse, { sourceCheckpoint: captured.sourceCheckpoint });
    for (const part of captured.source.filter(item => item.text)) expect(at(next, .000001, part.id).x).toBeCloseTo(part.x, 2);
  });
  it('settles local content lanes before shell motion and preserves a focused checkbox', () => {
    const owner = node('shell', 0, { width: 900 });
    const count = node('files', 400, { kind: 'text', text: '10', motion: motion({ follow: 'shell' }) });
    const checkbox = node('check', 5, { kind: 'checkbox', anatomy: { componentId: 'shell', part: 'selection', behavior: 'checkbox' }, collection: { id: 'modules', itemId: 'a' }, checked: false, motion: motion({ follow: 'shell' }) });
    const target = [{ ...owner, x: 200, width: 280 }, { ...count, x: 212 }, { ...checkbox, x: 440 }];
    const clip = make([owner, count, checkbox], target), mid = sampleTransitionClip(clip, .5);
    expect(mid.nodes.find(item => item.id === 'files')!.x - mid.nodes.find(item => item.id === 'shell')!.x).toBe(12);
    expect(mid.nodeStates.find(item => item.id === 'check')!.panelOpacity).toBe(0);
    const focused = sampleTransitionClip(make([owner, count, checkbox], target, { protectedNodeIds: ['check'] }), .5);
    expect(focused.nodeStates.find(item => item.id === 'check')!.panelOpacity).toBe(1);
  });
  it('separates columns before rows and routes a metric around the identity lane in both directions', () => {
    const row = node('row', 20, { y: 300, width: 900, height: 44 });
    const card = node('card', 400, { y: 80, width: 300, height: 160, motion: motion({ correspondence: [{ kind: 'match', sources: ['row'], route: 'x-then-y' }] }) });
    const metric = node('metric', 420, { y: 300, kind: 'text', text: '14', motion: motion({ follow: 'row' }) });
    const cardMetric = { ...metric, x: 412, y: 150, motion: motion({ follow: 'card', lane: { x: 256, y: 0 } }) };
    const clip = make([row, metric], [card, cardMetric]);
    expect(at(clip, .25, 'card').x).toBeGreaterThan(row.x);
    expect(at(clip, .25, 'card').y).toBe(row.y);
    expect(at(clip, .5, 'card')).toMatchObject({ x: card.x, y: row.y, width: card.width, height: row.height });
    expect(at(clip, .625, 'metric').x - at(clip, .625, 'card').x).toBe(256);
    expect(at(clip, .75, 'metric').y - at(clip, .75, 'card').y).toBe(70);
    const reverse = make([card, cardMetric], [{ ...row, motion: motion({ correspondence: [{ kind: 'match', sources: ['card'], route: 'y-then-x' }] }) }, metric]);
    expect(at(reverse, .25, 'row').x).toBe(card.x);
    expect(at(reverse, .5, 'row')).toMatchObject({ x: card.x, y: row.y });
    expect(at(reverse, .25, 'metric').x - at(reverse, .25, 'row').x).toBe(256);
    expect(at(reverse, .25, 'metric').y - at(reverse, .25, 'row').y).toBe(70);
    const captured = captureTransitionSource(sampleTransitionClip(clip, .35));
    const retarget = make(captured.source, reverse.target, { sourceCheckpoint: captured.sourceCheckpoint });
    expect(sampleTransitionClip(retarget, 0).nodes).toEqual(captured.source);
    for (const part of captured.source) expect(at(retarget, .000001, part.id === 'card' ? 'row' : part.id).x).toBeCloseTo(part.x, 2);
  });
  it('retains a declared focal context label until child labels can take over', () => {
    const context = node('group-label', 12, { kind: 'text', text: 'Kernel', motion: motion({ follow: 'group', label: 'context' }) });
    const unrelated = node('other-label', 512, { kind: 'text', text: 'Adapter', motion: motion({ follow: 'other', label: 'context' }) });
    const clip = make([node('group', 0), context, node('other', 500), unrelated], [shell('a', 200, 'split', ['group']), shell('b', 400, 'split', ['group']), node('new-label', 212, { kind: 'text', text: 'Core' })]);
    const mid = sampleTransitionClip(clip, .5);
    expect(mid.nodes.find(item => item.id === 'group-label')?.text).toBe('Kernel');
    expect(mid.nodeStates.find(item => item.id === 'group-label')?.textOpacity).toBe(1);
    expect(mid.nodeStates.find(item => item.id === 'new-label')?.textOpacity).toBe(0);
    expect(mid.nodeStates.find(item => item.id === 'other-label')?.textOpacity).toBe(0);
    for (const p of [.75, .8, .85, .9, .95]) {
      const frame = sampleTransitionClip(clip, p), values = new Map(frame.nodeStates.map(value => [value.id, value.textOpacity]));
      expect(Math.min(values.get('group-label')!, values.get('new-label')!)).toBeLessThan(1e-12);
    }
    expect(sampleTransitionClip(clip, 1).nodes.some(item => item.id === 'group-label')).toBe(false);
    const reverse = make(clip.target, [shell('group', 0, 'merge', ['a', 'b']), context]);
    for (const p of [.05, .1, .15, .2, .25, .75, .8, .85, .9, .95]) {
      const values = new Map(sampleTransitionClip(reverse, p).nodeStates.map(value => [value.id, value.textOpacity]));
      expect(Math.min(values.get('group-label')!, values.get('new-label')!)).toBeLessThan(1e-12);
      if (p >= .3) expect(values.get('group-label')).toBeCloseTo(1, 12);
    }
  });
  it('solves connectors from sampled normalized ports instead of endpoint lines', () => {
    const edge = node('edge', 0, { height: 2, motion: motion({ connector: { from: { nodeId: 'a', portId: 'right' }, to: { nodeId: 'b' } } }) });
    const a = node('a', 0, { motion: motion({ ports: [{ id: 'right', x: 1, y: .5 }] }) }), b = node('b', 400);
    const clip = make([a, b, edge], [{ ...a, x: 200, y: 200, rotation: Math.PI / 2 }, { ...b, x: 700, y: 300 }, edge]);
    for (const p of [.1, .5, .9]) {
      const frame = sampleTransitionClip(clip, p), aa = frame.nodes.find(item => item.id === 'a')!, bb = frame.nodes.find(item => item.id === 'b')!, line = frame.nodes.find(item => item.id === 'edge')!;
      const center = { x: line.x + line.width / 2, y: line.y + line.height / 2 };
      expect(center.x - Math.cos(line.rotation) * line.width / 2).toBeCloseTo(aa.x + aa.width / 2 + Math.cos(aa.rotation) * aa.width / 2, 6);
      expect(center.y - Math.sin(line.rotation) * line.width / 2).toBeCloseTo(aa.y + aa.height / 2 + Math.sin(aa.rotation) * aa.width / 2, 6);
      expect(center.x + Math.cos(line.rotation) * line.width / 2).toBeCloseTo(bb.x + bb.width / 2, 6);
      expect(center.y + Math.sin(line.rotation) * line.width / 2).toBeCloseTo(bb.y + bb.height / 2, 6);
    }
  });
  it.each(EFFECT_LIBRARY.map(effect => effect.id))('keeps %s backward seek deterministic, reduced motion immediate', id => {
    const source = [node('a', 0, { text: 'Visible' })], target = [node('a', 400, { text: 'Visible' })];
    const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id, version: '1.0.0' } }), capabilities: { backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false }, eventId: 'fixture', eventType: 'open', caseId: 'fixture', sourceState: 'a', targetState: 'b', sourceRevision: 0, targetRevision: 1, baseDuration: 1000, nodeCount: 1 });
    const clip = make(source, target, { plan }), expected = sampleTransitionClip(clip, .42);
    for (const p of [1, .7, .2, 0]) sampleTransitionClip(clip, p);
    expect(sampleTransitionClip(clip, .42)).toEqual(expected);
    expect(sampleTransitionClip(clip, .42, { reducedMotion: true }).nodes).toEqual(target);
    expect(expected.nodes[0]!.text).toBe('Visible'); expect(expected.nodeStates[0]!.textOpacity).toBe(1);
  });
  it('keeps static headings and implicit text insets stationary during Silk Cascade', () => {
    const heading = node('heading', 20, { kind: 'text', text: 'Title', height: 32 });
    const source = [heading, node('a', 0)], target = [heading, node('a', 400)];
    const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: 'silk-cascade', version: '1.0.0' } }), capabilities: { backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false }, eventId: 'fixture', eventType: 'open', caseId: 'fixture', sourceState: 'a', targetState: 'b', sourceRevision: 0, targetRevision: 1, baseDuration: 1000, nodeCount: 2 });
    for (const p of [.01, .25, .5, .75, .99]) expect(at(make(source, target, { plan }), p, 'heading')).toEqual(heading);
  });
  it('roundtrips V4 motion and keeps V2/V3 the legacy timing rather than upgrading silently', () => {
    const source = [node('a', 0, { text: 'Module' })], target = [node('a', 400, { text: 'Module' })], clip = make(source, target);
    const recording = normalizeVisualScenario({ schemaVersion: 4, caseId: 'fixture', viewport, source, target, plan: null, durationMs: 1000, redacted: false, motionVersion: 2, motionPlan: clip.motionPlan });
    expect(recording.schemaVersion).toBe(4); expect(VisualScenarioSchema.safeParse(recording).success).toBe(true);
    if (recording.schemaVersion !== 4) throw new Error('Missing V4');
    expect(sampleTransitionClip(make(recording.source, recording.target, { motionPlan: recording.motionPlan }), .5)).toEqual(sampleTransitionClip(clip, .5));
    const old = normalizeVisualScenario({ schemaVersion: 2, caseId: 'fixture', viewport, source, target, plan: null, durationMs: 1000, redacted: false });
    expect(old.schemaVersion).toBe(3);
    const legacy = make(old.source, old.target, { motionVersion: 1 });
    expect(at(legacy, .1, 'a').x).toBe(0); expect(at(legacy, .5, 'a').text).toBe('');
    expect(at(clip, .1, 'a').x).toBeGreaterThan(0); expect(at(clip, .5, 'a').text).toBe('Module');
  });
  it('supports a 2,001-node checkpoint consistently and rejects scene/union overflow', () => {
    const source = Array.from({ length: 2001 }, (_, i) => node(`n${i}`, 0));
    const clip = make(source, source.map(item => ({ ...item, x: 1 })));
    const captured = captureTransitionSource(sampleTransitionClip(clip, .5));
    expect(captured.sourceCheckpoint?.nodeStates).toHaveLength(2001);
    expect(() => make(captured.source, clip.target, { sourceCheckpoint: captured.sourceCheckpoint })).not.toThrow();
    const tooMany = Array.from({ length: 10001 }, (_, i) => node(`n${i}`, 0));
    expect(() => make([], tooMany)).toThrow();
  });
});
