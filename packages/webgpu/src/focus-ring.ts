import { Color, Mesh, MeshBasicNodeMaterial, type PlaneGeometry, type Scene } from 'three/webgpu';
import { float, mix, smoothstep, uniform, uv, vec2 } from 'three/tsl';
import { hitTestPresentation, type PresentedHitTarget } from './hit-testing';
import type { createResourceScope } from './resources';

const GAP = 2;
const STROKE = 4;
const OUTSET = GAP + STROKE;

/** One focus indicator, using the same presented geometry and eligibility as input. */
export function resolveFocusRing(id: string | null, items: readonly PresentedHitTarget[], viewport: { width: number; height: number }) {
  if (!id || !(viewport.width > 0 && viewport.height > 0)) return null;
  const item = items.find(candidate => candidate.target.id === id);
  if (!item || item.exiting || item.target.disabled || item.target.opacity <= .05) return null;
  const node = item.presented, x = node.x + node.width / 2, y = node.y + node.height / 2;
  // A clipped centre is also ineligible in the native bridge. Partial outer
  // strokes are clipped by the Surface viewport, not drawn into the host UI.
  if (x < 0 || y < 0 || x >= viewport.width || y >= viewport.height || hitTestPresentation(items, x, y)?.id !== id) return null;
  return {
    id, x, y, width: node.width + OUTSET * 2, height: node.height + OUTSET * 2,
    radius: Math.min(node.radius, node.width / 2, node.height / 2) + OUTSET,
    rotation: node.rotation, renderOrder: item.renderOrder + 1.5,
  };
}

export type FocusRingGeometry = NonNullable<ReturnType<typeof resolveFocusRing>>;

/** Borrows the Surface plane. Owns one material/mesh, reused for every frame. */
export function createFocusRing(scope: ReturnType<typeof createResourceScope>, scene: Scene, geometry: PlaneGeometry) {
  const material = new MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
  let mesh: Mesh<PlaneGeometry, MeshBasicNodeMaterial> | null = null;
  let disposed = false;
  const release = scope.track('material', () => {
    disposed = true;
    if (mesh) scene.remove(mesh);
    material.dispose();
  });
  const size = uniform(vec2(1, 1)), radius = uniform(0), ink = uniform(new Color('#bcd4ff'));
  // Rounded-box signed distance in logical pixels. The inner 3px are light;
  // the outer dark edge keeps a distinct boundary on light and selected fills.
  const corner = uv().sub(.5).mul(size).abs().sub(size.mul(.5).sub(radius));
  const distance = corner.max(0).length().add(corner.x.max(corner.y).min(0)).sub(radius);
  const outside = float(1).sub(smoothstep(-.5, .5, distance));
  const hole = float(1).sub(smoothstep(-STROKE - .5, -STROKE + .5, distance));
  material.opacityNode = outside.sub(hole).max(0);
  material.colorNode = mix(ink, uniform(new Color('#07151c')), smoothstep(-1.25, -.75, distance));
  mesh = new Mesh(geometry, material); mesh.visible = false; mesh.frustumCulled = false;
  scene.add(mesh);
  return {
    update(value: FocusRingGeometry | null, color = '#bcd4ff') {
      if (disposed || !mesh) return;
      mesh.visible = value !== null;
      if (!value) return;
      ink.value.set(color); size.value.set(value.width, value.height); radius.value = value.radius;
      mesh.scale.set(value.width, value.height, 1);
      mesh.position.set(value.x, -value.y, 0);
      mesh.rotation.z = -value.rotation;
      mesh.renderOrder = value.renderOrder;
    },
    dispose: release,
  };
}
