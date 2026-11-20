import { Color, Mesh, MeshBasicNodeMaterial, PlaneGeometry, Vector4, type Scene } from 'three/webgpu';
import type { CouplingPresentation } from '@fluidkit/contracts';
import { createCouplingShader, MAX_COUPLING_SHAPES } from '@fluidkit/gpu-kernels';
import type { createResourceScope } from './resources';

type Scope = ReturnType<typeof createResourceScope>;

/** Conservative local paint bounds, including capsule endpoints and smooth-union padding. */
export function couplingBounds(group: CouplingPresentation) {
  const bounds = group.pieces.map(piece => ({ left: piece.x, top: piece.y, right: piece.x + piece.width, bottom: piece.y + piece.height }));
  for (const bridge of group.bridges) bounds.push({ left: Math.min(bridge.from.x, bridge.to.x) - bridge.radius, top: Math.min(bridge.from.y, bridge.to.y) - bridge.radius,
    right: Math.max(bridge.from.x, bridge.to.x) + bridge.radius, bottom: Math.max(bridge.from.y, bridge.to.y) + bridge.radius });
  if (!bounds.length) return null;
  const blend = Math.min(18, Math.max(0, ...group.bridges.map(bridge => bridge.radius * 0.7)));
  const padding = blend + 3;
  const x = Math.min(...bounds.map(rect => rect.left)) - padding, y = Math.min(...bounds.map(rect => rect.top)) - padding;
  return { x, y, width: Math.max(...bounds.map(rect => rect.right)) + padding - x, height: Math.max(...bounds.map(rect => rect.bottom)) + padding - y, blend };
}

/** Pure decoration: one bounded quad per declared group, no events or animation loop. */
export function createCouplingLayer(scope: Scope, scene: Scene) {
  const groups = new Map<string, ReturnType<typeof createGroup>>();
  let disposed = false;
  function createGroup() {
    const geometry = new PlaneGeometry(1, 1), shader = createCouplingShader();
    const shapes = Array.from({ length: MAX_COUPLING_SHAPES }, () => new Vector4());
    const details = Array.from({ length: MAX_COUPLING_SHAPES }, () => new Vector4());
    const paints = Array.from({ length: MAX_COUPLING_SHAPES }, () => new Vector4());
    shader.shapes.array = shapes; shader.details.array = details; shader.paints.array = paints;
    const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, depthTest: false });
    const color = new Color();
    material.colorNode = shader.packed.rgb;
    material.opacityNode = shader.packed.a;
    const mesh = new Mesh(geometry, material); mesh.frustumCulled = false;
    const releaseGeometry = scope.track('geometry', () => geometry.dispose()), releaseMaterial = scope.track('material', () => material.dispose());
    scene.add(mesh);
    return { mesh, shader, shapes, details, paints, color, pieces: 0, dispose() { scene.remove(mesh); releaseMaterial(); releaseGeometry(); } };
  }
  return {
    update(input: readonly CouplingPresentation[]) {
      if (disposed) return;
      if (input.length > 8) throw new Error('Coupling group budget exceeded');
      const active = new Set<string>();
      for (const group of input) {
        if (active.has(group.id)) throw new Error(`Duplicate coupling group: ${group.id}`);
        if (group.pieces.length > 32 || group.bridges.length > 31 || group.pieces.length + group.bridges.length > MAX_COUPLING_SHAPES) throw new Error('Coupling primitive budget exceeded');
        const bounds = couplingBounds(group);
        if (!bounds || group.opacity <= 0) continue;
        active.add(group.id);
        let item = groups.get(group.id);
        if (!item) { item = createGroup(); groups.set(group.id, item); }
        item.mesh.position.set(bounds.x + bounds.width / 2, -bounds.y - bounds.height / 2, 0);
        item.mesh.scale.set(bounds.width, bounds.height, 1);
        item.mesh.renderOrder = group.layer * 2 + 199.75;
        item.shader.size.value.set(bounds.width, bounds.height); item.shader.opacity.value = group.opacity; item.shader.blend.value = bounds.blend;
        item.shader.sheen.value = Math.sin(Math.PI * group.progress);
        let index = 0;
        for (const piece of group.pieces) {
          item.shapes[index]!.set(piece.x + piece.width / 2 - bounds.x, piece.y + piece.height / 2 - bounds.y, piece.width, piece.height);
          item.color.set(piece.color ?? group.color);
          item.paints[index]!.set(item.color.r, item.color.g, item.color.b, piece.opacity ?? 1);
          item.details[index++]!.set(piece.radius, 0, 0, 0);
        }
        for (const bridge of group.bridges) {
          item.shapes[index]!.set(bridge.from.x - bounds.x, bridge.from.y - bounds.y, bridge.to.x - bounds.x, bridge.to.y - bounds.y);
          item.color.set(bridge.color ?? group.color);
          item.paints[index]!.set(item.color.r, item.color.g, item.color.b, bridge.opacity ?? 1);
          item.details[index++]!.set(bridge.radius, 1, 0, 0);
        }
        item.shader.count.value = index; item.pieces = group.pieces.length;
      }
      for (const [id, item] of groups) if (!active.has(id)) { item.dispose(); groups.delete(id); }
    },
    metrics() { return { couplingGroups: groups.size, couplingPieces: [...groups.values()].reduce((sum, group) => sum + group.pieces, 0), couplingDrawCalls: groups.size }; },
    dispose() { if (disposed) return; disposed = true; for (const item of groups.values()) item.dispose(); groups.clear(); },
  };
}
