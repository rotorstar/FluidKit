import { describe, expect, it } from 'vitest';
import { Scene } from 'three/webgpu';
import { CouplingPresentationSchema } from '@fluidkit/contracts';
import { couplingBounds, createCouplingLayer } from '../../packages/webgpu/src/coupling-layer';
import { createResourceLedger, createResourceScope } from '../../packages/webgpu/src/resources';

const group = CouplingPresentationSchema.parse({ id: 'test-merge', kind: 'merge', sourceIds: ['a', 'b'], targetIds: ['c'], progress: .5, opacity: 1, color: '#243c65', layer: 1,
  pieces: [{ id: 'a', x: 10, y: 20, width: 80, height: 50, radius: 10 }, { id: 'b', x: 150, y: 30, width: 100, height: 60, radius: 15 }],
  bridges: [{ from: { x: 70, y: 45 }, to: { x: 170, y: 55 }, radius: 9 }],
});
describe('coupling paint ownership', () => {
  it('bounds all local pieces and connecting capsules with finite smoothing padding', () => {
    const bounds = couplingBounds(group)!;
    expect(bounds.x).toBeLessThan(10); expect(bounds.y).toBeLessThan(20);
    expect(bounds.x + bounds.width).toBeGreaterThan(250); expect(bounds.y + bounds.height).toBeGreaterThan(90);
    expect(bounds.blend).toBeGreaterThan(0);
  });
  it('reuses one group mesh and retires every owned object at the endpoint and on disposal', () => {
    const ledger = createResourceLedger(), scope = createResourceScope(ledger), scene = new Scene(), layer = createCouplingLayer(scope, scene);
    layer.update([group]); const mesh = scene.children[0];
    for (let i = 0; i < 100; i++) layer.update([{ ...group, progress: i / 100 }]);
    expect(scene.children).toEqual([mesh]);
    expect(layer.metrics()).toEqual({ couplingGroups: 1, couplingPieces: 2, couplingDrawCalls: 1 });
    expect(ledger.snapshot().live.geometry).toBe(1); expect(ledger.snapshot().live.material).toBe(1);
    layer.update([]); expect(scene.children).toHaveLength(0);
    expect(ledger.snapshot().live.geometry).toBe(0); expect(ledger.snapshot().live.material).toBe(0);
    layer.update([group]); layer.dispose(); layer.dispose(); scope.dispose();
    expect(scene.children).toHaveLength(0); expect(ledger.snapshot().owners).toBe(0);
    expect(Object.values(ledger.snapshot().live).every(value => value === 0)).toBe(true);
  });
  it('rejects excessive groups before allocating any GPU objects', () => {
    const ledger = createResourceLedger(), scope = createResourceScope(ledger), scene = new Scene(), layer = createCouplingLayer(scope, scene);
    expect(() => layer.update(Array.from({ length: 9 }, (_, index) => ({ ...group, id: `g-${index}` })))).toThrow('budget');
    expect(scene.children).toHaveLength(0); layer.dispose(); scope.dispose();
  });
});
