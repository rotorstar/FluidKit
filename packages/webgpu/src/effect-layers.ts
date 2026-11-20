import { Color, DataTexture, InstancedBufferAttribute, InstancedMesh, MeshBasicNodeMaterial, Object3D, PlaneGeometry, RenderTarget, Scene, type OrthographicCamera, type Renderer } from 'three/webgpu';
import { attribute, float, smoothstep, texture, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { LensPresentation, ParticlePresentation, SceneNode } from '@fluidkit/contracts';
import type { createResourceScope } from './resources';

type Scope = ReturnType<typeof createResourceScope>;

/** Owns only decorative resources. No clock, device or event handlers. */
export function createEffectLayers(scope: Scope, scene: Scene) {
  const background = new Scene(); background.background = new Color('#0b1520');
  const empty = new DataTexture(new Uint8Array([11, 21, 32, 255]), 1, 1); empty.needsUpdate = true;
  scope.track('texture', () => empty.dispose());
  const backdrop = texture(empty);
  const viewport = uniform(vec2(1000, 620));
  const lens = uniform(vec4(0, 0, 1, 0));
  const lensPhase = uniform(0), lensOpacity = uniform(0);
  let target: RenderTarget | null = null, releaseTarget: (() => void) | null = null;
  const batches = new Map<number, { mesh: InstancedMesh; opacity: InstancedBufferAttribute; color: InstancedBufferAttribute; release: () => void }>();
  const transform = new Object3D(), color = new Color();
  let allocatedTargetBytes = 0;
  function retireTarget() {
    backdrop.value = empty;
    releaseTarget?.(); releaseTarget = null; target = null; allocatedTargetBytes = 0;
  }
  function makeBatch(layer: number, count: number) {
    const geometry = new PlaneGeometry(1, 1);
    const releaseGeometry = scope.track('geometry', () => geometry.dispose());
    const opacity = new InstancedBufferAttribute(new Float32Array(count), 1);
    const colors = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
    geometry.setAttribute('weaveOpacity', opacity); geometry.setAttribute('weaveColor', colors);
    const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, depthTest: false });
    const releaseMaterial = scope.track('material', () => material.dispose());
    material.colorNode = attribute('weaveColor', 'vec3');
    const edge = uv().sub(.5).abs();
    material.opacityNode = attribute('weaveOpacity', 'float').mul(float(1).sub(smoothstep(.24, .5, edge.y))).mul(float(1).sub(smoothstep(.32, .5, edge.x)));
    const mesh = new InstancedMesh(geometry, material, count);
    mesh.renderOrder = layer * 2 + 200.5; mesh.frustumCulled = false;
    const releaseInstances = scope.track('geometry', () => mesh.dispose());
    scene.add(mesh);
    return { mesh, opacity, color: colors, release() { scene.remove(mesh); releaseInstances(); releaseMaterial(); releaseGeometry(); } };
  }
  return {
    background, backdrop, viewport, lens, lensPhase, lensOpacity,
    update(input: { lens: LensPresentation | null; particles: readonly ParticlePresentation[]; nodes: readonly SceneNode[]; width: number; height: number; targetEdge: number }) {
      viewport.value.set(Math.max(1, input.width), Math.max(1, input.height));
      if (input.lens && input.lens.opacity > 0 && input.lens.strength > 0) {
        lens.value.set(input.lens.x, input.lens.y, Math.max(1, input.lens.radius), input.lens.strength);
        lensPhase.value = input.lens.phase; lensOpacity.value = input.lens.opacity;
        const scale = Math.min(1, input.targetEdge / Math.max(input.width, input.height));
        const width = Math.max(1, Math.ceil(input.width * scale)), height = Math.max(1, Math.ceil(input.height * scale));
        if (!target) {
          target = new RenderTarget(width, height, { depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
          const owned = target; releaseTarget = scope.track('render-target', () => owned.dispose());
          backdrop.value = target.texture;
        } else if (target.width !== width || target.height !== height) target.setSize(width, height);
        allocatedTargetBytes = width * height * 4;
      } else { lensOpacity.value = 0; retireTarget(); }
      const componentLayer = new Map<string, number>();
      for (const node of input.nodes) if (node.kind !== 'text') componentLayer.set(node.anatomy.componentId, Math.min(componentLayer.get(node.anatomy.componentId) ?? node.layer, node.layer));
      const groups = new Map<number, ParticlePresentation[]>();
      for (const particle of input.particles) if (particle.opacity > .001) {
        const layer = componentLayer.get(particle.componentId) ?? 1;
        const group = groups.get(layer) ?? []; group.push(particle); groups.set(layer, group);
      }
      for (const [layer, batch] of batches) if (!groups.has(layer)) { batch.release(); batches.delete(layer); }
      for (const [layer, particles] of groups) {
        let batch = batches.get(layer);
        if (!batch || batch.mesh.instanceMatrix.count < particles.length) {
          batch?.release(); batch = makeBatch(layer, particles.length); batches.set(layer, batch);
        }
        batch.mesh.count = particles.length;
        particles.forEach((particle, index) => {
          transform.position.set(particle.x, -particle.y, 0);
          transform.rotation.z = -particle.rotation;
          transform.scale.set(Math.max(.1, particle.size * 2.8), Math.max(.1, particle.size * .6), 1);
          transform.updateMatrix(); batch!.mesh.setMatrixAt(index, transform.matrix);
          color.set(particle.color).multiplyScalar(5);
          batch!.color.setXYZ(index, color.r, color.g, color.b); batch!.opacity.setX(index, particle.opacity);
        });
        batch.mesh.instanceMatrix.needsUpdate = true; batch.color.needsUpdate = true; batch.opacity.needsUpdate = true;
      }
    },
    renderBackground(renderer: Renderer, camera: OrthographicCamera) {
      if (!target) return;
      const previous = renderer.getRenderTarget();
      try { renderer.setRenderTarget(target); renderer.render(background, camera); }
      finally { renderer.setRenderTarget(previous); }
    },
    metrics() { return { renderTargets: target ? 1 : 0, targetBytes: allocatedTargetBytes, particles: [...batches.values()].reduce((sum, batch) => sum + batch.mesh.count, 0), particleDrawCalls: batches.size }; },
    clear() { retireTarget(); for (const batch of batches.values()) batch.release(); batches.clear(); },
  };
}
