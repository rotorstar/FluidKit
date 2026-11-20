import { describe, expect, it, vi } from 'vitest';
import { Mesh, PlaneGeometry, Scene } from 'three/webgpu';
import { SceneNodeSchema, type SceneNode } from '@fluidkit/contracts';
import { createFocusRing, resolveFocusRing } from '../../packages/webgpu/src/focus-ring';
import { createResourceLedger, createResourceScope } from '../../packages/webgpu/src/resources';
import type { PresentedHitTarget } from '../../packages/webgpu/src/hit-testing';

const viewport = { width: 390, height: 700 };
function target(id: string, patch: Partial<SceneNode> = {}, state: Partial<PresentedHitTarget> = {}): PresentedHitTarget {
  const node = SceneNodeSchema.parse({ id, anatomy: { componentId: id, part: 'control', behavior: 'button' }, kind: 'button',
    onActivate: 'activate', label: id, text: id, x: 30, y: 40, width: 100, height: 50, radius: 10, ...patch });
  return { presented: node, target: node, panelOpacity: 1, textOpacity: 1, exiting: false, renderOrder: 200 + node.layer * 2, ...state };
}

describe('sampled GPU focus-ring geometry', () => {
  it('follows presentation bounds/rotation while retaining committed target authority', () => {
    const original = target('focus');
    const item = { ...original, presented: { ...original.presented, x: 120, y: 80, width: 70, height: 24, radius: 7, rotation: .3 } };
    const ring = resolveFocusRing('focus', [item], viewport);
    expect(ring).toEqual({ id: 'focus', x: 155, y: 92, width: 82, height: 36, radius: 13, rotation: .3, renderOrder: 201.5 });
    expect(item.target.x).toBe(30);
  });

  it.each(['disabled', 'exiting', 'transparent', 'hidden-label', 'noninteractive'] as const)('never draws a ring on a %s part', condition => {
    let item = target('focus');
    if (condition === 'disabled') item = { ...item, target: { ...item.target, disabled: true } };
    if (condition === 'exiting') item = { ...item, exiting: true };
    if (condition === 'transparent') item = { ...item, presented: { ...item.presented, opacity: 0 } };
    if (condition === 'hidden-label') item = { ...item, textOpacity: 0 };
    if (condition === 'noninteractive') item = { ...item, target: { ...item.target, anatomy: { ...item.target.anatomy, behavior: 'presentation' }, onActivate: undefined } };
    expect(resolveFocusRing('focus', [item], viewport)).toBeNull();
  });

  it('supports checkbox/input focus and a missing or explicitly cleared focus ID', () => {
    const checkbox = target('check', { kind: 'checkbox', text: '', onActivate: undefined, checked: false,
      anatomy: { componentId: 'check', part: 'selection', behavior: 'checkbox' }, collection: { id: 'list', itemId: 'one' } });
    const input = target('input', { kind: 'input', text: '', onActivate: undefined, anatomy: { componentId: 'input', part: 'field', behavior: 'textbox' } });
    expect(resolveFocusRing('check', [checkbox], viewport)).not.toBeNull();
    expect(resolveFocusRing('input', [input], viewport)).not.toBeNull();
    expect(resolveFocusRing('missing', [input], viewport)).toBeNull();
    expect(resolveFocusRing(null, [input], viewport)).toBeNull();
  });

  it('uses shared occlusion rules and remains below a higher foreground surface', () => {
    const button = target('focus');
    const cover = target('cover', { kind: 'box', text: '', onActivate: undefined, layer: 1, anatomy: { componentId: 'cover', part: 'panel', behavior: 'presentation' } });
    expect(resolveFocusRing('focus', [button, cover], viewport)).toBeNull();
    // A panel over only the stroke edge should cover that stroke in draw order,
    // while the still reachable control retains its focus indication elsewhere.
    const partial = { ...cover, presented: { ...cover.presented, x: 125, width: 20 } };
    const ring = resolveFocusRing('focus', [button, partial], viewport);
    expect(ring).not.toBeNull(); expect(ring!.renderOrder).toBeLessThan(cover.renderOrder);
  });

  it('uses Surface clipping without moving the target; fully clipped centres are ineligible', () => {
    const partial = target('focus', { x: -2, y: 0, radius: 100 });
    const ring = resolveFocusRing('focus', [partial], viewport);
    expect(ring!.x - ring!.width / 2).toBe(-8);
    expect(ring!.radius).toBe(31); // same rounded-radius clamp as the drawn panel.
    expect(resolveFocusRing('focus', [target('focus', { x: 390 })], viewport)).toBeNull();
    expect(resolveFocusRing('focus', [target('focus')], { width: 0, height: 700 })).toBeNull();
  });
});

describe('bounded focus-ring resource ownership', () => {
  it('reuses one mesh/material across updates, borrows geometry and disposes exactly once', () => {
    const ledger = createResourceLedger(), scope = createResourceScope(ledger), scene = new Scene(), geometry = new PlaneGeometry(1, 1);
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const ring = createFocusRing(scope, scene, geometry);
    const mesh = scene.children[0] as Mesh<PlaneGeometry>;
    const material = Array.isArray(mesh.material) ? mesh.material[0]! : mesh.material;
    const materialDispose = vi.spyOn(material, 'dispose');
    expect(mesh).toBeInstanceOf(Mesh); expect(mesh.visible).toBe(false);
    for (let i = 0; i < 100; i++) {
      const value = resolveFocusRing('focus', [target('focus', { x: 10 + i, rotation: .2 })], viewport);
      ring.update(value);
      expect(scene.children).toEqual([mesh]);
      expect(mesh.position.x).toBe(value!.x); expect(mesh.position.y).toBe(-value!.y);
      expect(mesh.rotation.z).toBe(-.2); expect(mesh.scale.x).toBe(value!.width);
      expect(ledger.snapshot().live.material).toBe(1);
      expect(ledger.snapshot().live.geometry).toBe(0);
    }
    ring.update(null); expect(mesh.visible).toBe(false);
    ring.dispose(); ring.dispose(); scope.dispose();
    expect(materialDispose).toHaveBeenCalledTimes(1); expect(geometryDispose).not.toHaveBeenCalled();
    expect(scene.children).toEqual([]); expect(ledger.snapshot().owners).toBe(0);
    expect(Object.values(ledger.snapshot().live).every(value => value === 0)).toBe(true);
    ring.update(resolveFocusRing('focus', [target('focus')], viewport)); expect(scene.children).toEqual([]);
    geometry.dispose();
  });

  it('lets the Surface scope own cleanup without an explicit helper disposal', () => {
    const ledger = createResourceLedger(), scope = createResourceScope(ledger), scene = new Scene(), geometry = new PlaneGeometry(1, 1);
    const ring = createFocusRing(scope, scene, geometry);
    ring.update(resolveFocusRing('focus', [target('focus')], viewport));
    scope.dispose();
    expect(scene.children).toEqual([]); expect(ledger.snapshot().live.material).toBe(0);
    geometry.dispose();
  });
});
