import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { d } from 'typegpu';
import { couplingPrimitiveDistance, couplingSmoothUnion, couplingPaintWeight } from '@fluidkit/gpu-kernels';

describe('coupled implicit surfaces', () => {
  it('draws a real continuous neck between separated panels rather than two warped rectangles', () => {
    const left = d.vec4f(20, 20, 40, 40), right = d.vec4f(120, 20, 40, 40), rectangle = d.vec4f(10, 0, 0, 0);
    const neck = d.vec4f(30, 20, 110, 20), capsule = d.vec4f(7, 1, 0, 0);
    const point = d.vec2f(70, 20);
    expect(Math.min(couplingPrimitiveDistance(point, left, rectangle), couplingPrimitiveDistance(point, right, rectangle))).toBeGreaterThan(0);
    for (let x = 20; x <= 120; x++) {
      const p = d.vec2f(x, 20);
      const panels = couplingSmoothUnion(couplingPrimitiveDistance(p, left, rectangle), couplingPrimitiveDistance(p, right, rectangle), 4);
      expect(couplingSmoothUnion(panels, couplingPrimitiveDistance(p, neck, capsule), 4)).toBeLessThan(0);
    }
    expect(couplingPrimitiveDistance(d.vec2f(70, 29), neck, capsule)).toBeGreaterThan(0);
  });

  it('keeps zero blend, zero length links, small rectangles and endpoints finite', () => {
    expect(couplingSmoothUnion(-3, 7, 0)).toBe(-3);
    for (const radius of [0, .00001, 2, 100]) for (const value of [-1000, 0, 1000]) {
      expect(Number.isFinite(couplingSmoothUnion(value, -value, radius))).toBe(true);
      expect(Number.isFinite(couplingPrimitiveDistance(d.vec2f(value, value), d.vec4f(1, 1, 1, 1), d.vec4f(radius, 1, 0, 0)))).toBe(true);
      expect(Number.isFinite(couplingPrimitiveDistance(d.vec2f(value, value), d.vec4f(1, 1, .01, .01), d.vec4f(radius, 0, 0, 0)))).toBe(true);
    }
    expect(couplingPrimitiveDistance(d.vec2f(0, 0), d.vec4f(0, 0, 40, 20), d.vec4f(5, 0, 0, 0))).toBe(-10);
  });

  it('uses continuous polynomial-union material weights with exact hard endpoints', () => {
    expect(couplingPaintWeight(-20, 0, 4)).toBe(0);
    expect(couplingPaintWeight(0, -20, 4)).toBe(1);
    expect(couplingPaintWeight(0, 0, 4)).toBe(.5);
    expect(couplingPaintWeight(0, -1, 0)).toBe(1);
    for (let x = -4; x <= 4; x += .125) {
      const a = couplingPaintWeight(x, 0, 4), b = couplingPaintWeight(0, x, 4);
      expect(a + b).toBeCloseTo(1, 10);
      expect(a).toBeGreaterThanOrEqual(0); expect(a).toBeLessThanOrEqual(1);
    }
  });

  it('resolves the actual fixed uniform-array graph for GLSL and both scalar kernels for WGSL', () => {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
      import install from 'unplugin-typegpu/node';
      import { tgpu } from 'typegpu';
      import { glOptions } from '@typegpu/gl';
      import GLSLNodeBuilder from 'three/src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js';
      import { Mesh, PlaneGeometry, MeshBasicNodeMaterial } from 'three/webgpu';
      install();
      const { createCouplingShader, couplingPrimitiveDistance, couplingSmoothUnion } = await import('./packages/gpu-kernels/src/coupling.ts');
      const renderer = { debug: { diagnostics: false }, backend: { isWebGLBackend: true }, getRenderTarget: () => null };
      const builder = new GLSLNodeBuilder(new Mesh(new PlaneGeometry(), new MeshBasicNodeMaterial()), renderer);
      const shader = createCouplingShader();
      for (const stage of ['setup', 'analyze', 'generate']) {
        builder.setBuildStage(stage); builder.setShaderStage('fragment');
        if (stage === 'generate') builder.flowNode(shader.packed); else shader.packed.build(builder);
      }
      console.log(JSON.stringify({
        wgsl: tgpu.resolveWithContext([couplingPrimitiveDistance, couplingSmoothUnion], { names: 'strict' }).code,
        glsl: tgpu.resolveWithContext([couplingPrimitiveDistance, couplingSmoothUnion], { names: 'strict', ...glOptions() }).code,
        bridge: builder.codes.fragment.map(entry => entry.code).join('\\n'),
      }));
    `], { cwd: process.cwd(), encoding: 'utf8' });
    const code = JSON.parse(output) as Record<string, string>;
    for (const shader of Object.values(code)) {
      expect(shader).toContain('couplingPrimitiveDistance'); expect(shader).toContain('couplingSmoothUnion');
      expect(shader).not.toMatch(/\b(?:atan2|select)\s*\(/);
    }
    expect(code.bridge).toContain('63');
  });
});
