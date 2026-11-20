import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { lensDisplacement } from '@fluidkit/gpu-kernels';

describe('portable lens kernel', () => {
  it('keeps the center, outside region and disabled lens unchanged', () => {
    for (const [x, y, strength] of [[10, 20, .8], [400, 300, .8], [40, 60, 0]]) {
      const offset = lensDisplacement(x!, y!, 10, 20, 100, strength!, .5);
      expect(offset.x).toBe(0); expect(offset.y).toBe(0);
    }
  });

  it('matches the intended angular contour without atan2 in GPU code', () => {
    fc.assert(fc.property(
      fc.double({ min: -400, max: 400, noNaN: true }),
      fc.double({ min: -400, max: 400, noNaN: true }),
      fc.double({ min: 0, max: 1, noNaN: true }),
      (x, y, phase) => {
        const offset = lensDisplacement(x, y, 0, 0, 120, .7, phase);
        const distance = Math.hypot(x, y);
        expect(Number.isFinite(offset.x) && Number.isFinite(offset.y)).toBe(true);
        expect(Math.hypot(offset.x, offset.y)).toBeLessThanOrEqual(16 * .7 + 1e-6);
        if (distance < .00001) return;
        const angle = Math.atan2(y, x);
        const organic = 1 + Math.sin(angle * 3 + phase * 4) * .045 + Math.cos(angle * 5 - phase * 3) * .025;
        const normalized = distance / (120 * organic);
        const t = Math.max(0, Math.min(1, (normalized - .78) / (.25)));
        const magnitude = (.2 + Math.exp(-Math.pow((normalized - .82) * 5, 2)) * .8) * (1 - t * t * (3 - 2 * t)) * .7 * 16;
        expect(offset.x).toBeCloseTo(x / Math.max(distance, 1) * magnitude, 5);
        expect(offset.y).toBeCloseTo(y / Math.max(distance, 1) * magnitude, 5);
      }), { numRuns: 200 });
  });

  it('resolves dependency-ordered typed functions for both shader languages', () => {
    const code = execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `
      import install from 'unplugin-typegpu/node';
      import { tgpu } from 'typegpu';
      import { glOptions } from '@typegpu/gl';
      import GLSLNodeBuilder from 'three/src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js';
      import { Mesh, PlaneGeometry, MeshBasicNodeMaterial } from 'three/webgpu';
      import { uniform, vec2, vec4 } from 'three/tsl';
      install();
      const { lensDisplacement, createLensCoordinates, createPanelShader } = await import('./packages/gpu-kernels/src/index.ts');
      // Compile the real TSL bridge graph without a GPU/context. This checks
      // emission order, not driver compilation or rendered output.
      const renderer = { debug: { diagnostics: false }, backend: { isWebGLBackend: true }, getRenderTarget: () => null };
      const builder = new GLSLNodeBuilder(new Mesh(new PlaneGeometry(), new MeshBasicNodeMaterial()), renderer);
      const size = uniform(vec2(100, 100));
      const lens = createLensCoordinates({ origin: uniform(vec2(10, 10)), size, viewport: uniform(vec2(1000, 1000)), lens: uniform(vec4(60, 60, 40, .6)), phase: uniform(.5), amount: uniform(1) });
      const panel = createPanelShader({ size, radius: uniform(12), visibility: uniform(1), effect: uniform(vec4(0, .5, .65, 2.5)), seed: uniform(42) });
      const node = lens.coordinates.add(lens.mask).add(lens.glint).add(panel.alpha).add(panel.highlight);
      for (const stage of ['setup', 'analyze', 'generate']) {
        builder.setBuildStage(stage); builder.setShaderStage('fragment');
        if (stage === 'generate') builder.flowNode(node); else node.build(builder);
      }
      console.log(JSON.stringify({
        wgsl: tgpu.resolveWithContext([lensDisplacement], { names: 'strict' }).code,
        glsl: tgpu.resolveWithContext([lensDisplacement], { names: 'strict', ...glOptions() }).code,
        bridge: builder.codes.fragment.map(entry => entry.code).join('\u005cn'),
      }));
    `], { cwd: process.cwd(), encoding: 'utf8' });
    const shaders = JSON.parse(code) as { wgsl: string; glsl: string; bridge: string };
    for (const source of Object.values(shaders)) {
      expect(source.indexOf('lensContourDistance')).toBeLessThan(source.indexOf('lensDisplacement'));
      expect(source).not.toMatch(/\b(?:atan2|select)\s*\(/);
    }
    expect(shaders.glsl).toContain('vec2 lensDisplacement(');
    expect(shaders.wgsl).toContain(') -> vec2f');
    expect(shaders.bridge).toMatch(/vec4 \w+\(\)/);
    for (const match of shaders.bridge.matchAll(/\bvar_\d+\b/g)) {
      const declaration = `vec2 ${match[0]};`;
      expect(shaders.bridge.indexOf(declaration)).toBeGreaterThanOrEqual(0);
      expect(shaders.bridge.indexOf(declaration)).toBeLessThanOrEqual(match.index);
    }
  });
});
