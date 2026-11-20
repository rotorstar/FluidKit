import { describe, expect, it } from 'vitest';
import { SceneNodeSchema } from '@fluidkit/contracts';
import { resolveSceneLayout } from '../../packages/core/src/layout';

const node = (values: Record<string, unknown> = {}) => SceneNodeSchema.parse({ id: 'control', kind: 'button', anatomy: { componentId: 'control', part: 'trigger', behavior: 'button' }, label: 'Open', onActivate: 'open', x: 900, y: 24, width: 240, height: 48, ...values });

describe('shared scene layout resolution', () => {
  it('resolves the exact right-edge discrepancy once for both projections', () => {
    const source = node(), original = structuredClone(source);
    const [resolved] = resolveSceneLayout([source], { width: 1000, height: 700 });
    expect(resolved).toMatchObject({ x: 900, y: 24, width: 84, height: 48 });
    expect(source).toEqual(original);
    expect(resolved).not.toBe(source);
    expect(resolved?.anatomy).toEqual(source.anatomy);
    expect(resolved?.onActivate).toBe('open');
    expect(resolved?.label).toBe('Open');
  });
  it('restores authored width on a wider viewport rather than progressively clamping old output', () => {
    const source = [node()];
    expect(resolveSceneLayout(source, { width: 1000, height: 700 })[0]?.width).toBe(84);
    expect(resolveSceneLayout(source, { width: 1280, height: 700 })[0]?.width).toBe(240);
  });
  it('preserves rotated map-edge geometry and clamps only unrotated boxes', () => {
    const [edge, box] = resolveSceneLayout([node({ id: 'edge', kind: 'box', rotation: .5 }), node()], { width: 1000, height: 700 });
    expect(edge?.width).toBe(240); expect(edge?.rotation).toBe(.5);
    expect(box?.width).toBe(84);
  });
  it('keeps the existing one-pixel minimum beyond the right edge without changing identity or layer', () => {
    const [resolved] = resolveSceneLayout([node({ x: 1200, layer: 7, opacity: .25 })], { width: 1000, height: 700 });
    expect(resolved).toMatchObject({ id: 'control', x: 1200, width: 1, layer: 7, opacity: .25 });
  });
  it('applies Yoga rounding identically and remains stable under repeated calls', () => {
    const source = [node({ x: 10.25, y: 20.75, width: 130.2, height: 40.4 })];
    const resolved = resolveSceneLayout(source, { width: 500, height: 700 });
    expect(resolved[0]).toMatchObject({ x: 10, y: 21, width: 130, height: 40 });
    for (let i = 0; i < 100; i++) expect(resolveSceneLayout(source, { width: 500, height: 700 })).toEqual(resolved);
    expect(resolveSceneLayout(resolved, { width: 500, height: 700 })).toEqual(resolved);
  });
  it('accepts an empty scene and rejects invalid viewport dimensions before allocation', () => {
    expect(resolveSceneLayout([], { width: 320, height: 700 })).toEqual([]);
    for (const width of [0, -1, NaN, Infinity]) expect(() => resolveSceneLayout([node()], { width, height: 700 })).toThrow();
    expect(() => resolveSceneLayout([node()], { width: 320, height: 0 })).toThrow();
  });
  it('resolves connector endpoints from final rounded/clamped ports and preserves replay projection', () => {
    const a = node({ id: 'a', x: 10.25, y: 20.75, width: 130.2, height: 40.4, rotation: Math.PI / 4, motion: { ports: [{ id: 'right', x: 1, y: .5 }] } });
    const b = node({ id: 'b', x: 450.25, y: 210.75 });
    const edge = node({ id: 'edge', kind: 'box', x: 0, y: 0, width: 1, height: 2, anatomy: { componentId: 'edge', part: 'line', behavior: 'presentation' }, motion: { connector: { from: { nodeId: 'a', portId: 'right' }, to: { nodeId: 'b' } } } });
    const resolved = resolveSceneLayout([a, b, edge], { width: 500, height: 700 });
    const [first, second, line] = resolved;
    const cx = line!.x + line!.width / 2, cy = line!.y + line!.height / 2;
    expect(cx - Math.cos(line!.rotation) * line!.width / 2).toBeCloseTo(first!.x + first!.width / 2 + Math.cos(first!.rotation) * first!.width / 2, 8);
    expect(cy - Math.sin(line!.rotation) * line!.width / 2).toBeCloseTo(first!.y + first!.height / 2 + Math.sin(first!.rotation) * first!.width / 2, 8);
    expect(cx + Math.cos(line!.rotation) * line!.width / 2).toBeCloseTo(second!.x + second!.width / 2, 8);
    expect(cy + Math.sin(line!.rotation) * line!.width / 2).toBeCloseTo(second!.y + second!.height / 2, 8);
    for (const item of resolved) Object.freeze(item); Object.freeze(resolved);
    expect(resolveSceneLayout(resolved, { width: 500, height: 700 })).toEqual(resolved);
  });
});
