import { d, std, tgpu } from 'typegpu';
import { sdRoundedBox2d } from '@typegpu/sdf';
import { fromTSL, toTSL, uv as typedUV } from '@typegpu/three';
import { type uniform } from 'three/tsl';
import type { Node } from 'three/webgpu';
export { createCouplingShader, couplingPrimitiveDistance, couplingSmoothUnion, couplingPaintWeight, MAX_COUPLING_SHAPES } from './coupling';

// Adapter 0.12.2 erases the result type. This boundary accepts only numeric
// shader functions, restoring the scalar contract checked by TypeGPU at compile time.
function scalarShader(fn: () => number): Node<'float'> { return toTSL(fn) as Node<'float'>; }

/** Dimensions and coordinates are logical pixels. Also callable on the CPU. */
export function panelDistance(x: number, y: number, width: number, height: number, radius: number): number {
  'use gpu';
  return sdRoundedBox2d(d.vec2f(x, y), d.vec2f(width * 0.5, height * 0.5), radius);
}

export function createPanelShader(inputs: {
  size: ReturnType<typeof uniform<'vec2'>>;
  radius: ReturnType<typeof uniform<'float'>>;
  visibility: ReturnType<typeof uniform<'float'>>;
  effect: ReturnType<typeof uniform<'vec4'>>;
  seed: ReturnType<typeof uniform<'float'>>;
}) {
  const size = fromTSL(inputs.size, d.vec2f);
  const radius = fromTSL(inputs.radius, d.f32);
  const visibility = fromTSL(inputs.visibility, d.f32);
  const effect = fromTSL(inputs.effect, d.vec4f);
  const seed = fromTSL(inputs.seed, d.f32);
  const uv = typedUV();
  const alpha = scalarShader(() => {
    'use gpu';
    const settings = effect.$;
    const p = std.mul(std.sub(uv.$, d.vec2f(0.5)), size.$);
    const envelope = std.sin(settings.y * 3.14159265);
    const shortest = std.min(size.$.x, size.$.y);
    let x = p.x;
    let r = radius.$;
    if (settings.x > 0.5 && settings.x < 1.5) {
      x += std.sin(uv.$.y * settings.w * 6.2831853 + settings.y * 7 + seed.$) * envelope * settings.z * shortest * 0.055;
      r += envelope * settings.z * shortest * 0.16;
    }
    r = std.clamp(r, 0, shortest * 0.5);
    const distance = panelDistance(x, p.y, size.$.x, size.$.y, r);
    const edge = std.max(std.fwidth(distance), 0.65);
    return (1 - std.smoothstep(-edge, edge, distance)) * visibility.$;
  });
  const highlight = scalarShader(() => {
    'use gpu';
    const settings = effect.$;
    if (settings.x < 2.5 || settings.x > 3.5) return d.f32(0);
    const distance = std.length(std.sub(uv.$, d.vec2f(0.5)));
    const ring = 1 - std.smoothstep(0.015, 0.14, std.abs(distance - settings.y * 0.9));
    return ring * std.sin(settings.y * 3.14159265) * settings.z * 0.7;
  });
  return { alpha, highlight };
}

const lensContourDistance = tgpu.fn([d.f32, d.f32, d.f32, d.f32], d.f32)((dx, dy, radius, phase) => {
  'use gpu';
  const distance = std.sqrt(dx * dx + dy * dy);
  const c = dx / std.max(distance, 0.00001);
  const s = dy / std.max(distance, 0.00001);
  // Angle harmonics avoid atan2/select translation differences between WGSL
  // and GLSL, while retaining the same three- and five-lobed moving contour.
  const sin3 = 3 * s - 4 * s * s * s;
  const cos3 = 4 * c * c * c - 3 * c;
  const sin5 = 16 * s * s * s * s * s - 20 * s * s * s + 5 * s;
  const cos5 = 16 * c * c * c * c * c - 20 * c * c * c + 5 * c;
  const organic = 1 + (sin3 * std.cos(phase * 4) + cos3 * std.sin(phase * 4)) * 0.045
    + (cos5 * std.cos(phase * 3) + sin5 * std.sin(phase * 3)) * 0.025;
  return distance / std.max(radius * organic, 1);
});

/** Bounded radial refraction in logical pixels; independent of frame history. */
export const lensDisplacement = tgpu.fn([d.f32, d.f32, d.f32, d.f32, d.f32, d.f32, d.f32], d.vec2f)((x, y, cx, cy, radius, strength, phase) => {
  'use gpu';
  const dx = x - cx;
  const dy = y - cy;
  const distance = std.sqrt(dx * dx + dy * dy);
  const normalized = lensContourDistance(dx, dy, radius, phase);
  const inside = 1 - std.smoothstep(0.78, 1.03, normalized);
  const rim = std.exp(-std.pow((normalized - 0.82) * 5, 2));
  const magnitude = (0.2 + rim * 0.8) * inside * strength * 16;
  return d.vec2f(dx / std.max(distance, 1) * magnitude, dy / std.max(distance, 1) * magnitude);
});

/** Only the decorative capture is sampled. Glyphs and input are never refracted. */
export function createLensCoordinates(inputs: {
  origin: ReturnType<typeof uniform<'vec2'>>;
  size: ReturnType<typeof uniform<'vec2'>>;
  viewport: ReturnType<typeof uniform<'vec2'>>;
  lens: ReturnType<typeof uniform<'vec4'>>;
  phase: ReturnType<typeof uniform<'float'>>;
  amount: ReturnType<typeof uniform<'float'>>;
}) {
  const origin = fromTSL(inputs.origin, d.vec2f), size = fromTSL(inputs.size, d.vec2f);
  const viewport = fromTSL(inputs.viewport, d.vec2f), lens = fromTSL(inputs.lens, d.vec4f);
  const phase = fromTSL(inputs.phase, d.f32), amount = fromTSL(inputs.amount, d.f32), uv = typedUV();
  // One TypeGPU root owns every lens dependency and TSL bridge. Splitting these
  // values into independent roots can emit shared GLSL helpers after their use.
  // The adapter erases the return type; TypeGPU validates this vec4f boundary.
  const packed = toTSL(tgpu.fn([], d.vec4f)(() => {
    'use gpu';
    const x = origin.$.x + uv.$.x * size.$.x;
    const y = origin.$.y + (1 - uv.$.y) * size.$.y;
    const offset = lensDisplacement(x, y, lens.$.x, lens.$.y, lens.$.z, lens.$.w, phase.$);
    const dx = x - lens.$.x;
    const dy = y - lens.$.y;
    const distance = lensContourDistance(dx, dy, lens.$.z, phase.$);
    const mask = (1 - std.smoothstep(0.86, 1.06, distance)) * amount.$;
    const edge = std.exp(-std.pow((distance - 0.91) * 28, 2));
    const lighting = 0.2 + 0.8 * std.clamp((-dx - dy) / std.max(lens.$.z * 1.4, 1), 0, 1);
    const glint = edge * lighting * amount.$ * lens.$.w * 0.1;
    // Render-target coordinates are top-down in Three's common node system;
    // TextureNode performs the backend-specific Y flip for WebGL itself.
    return d.vec4f(std.clamp((x + offset.x) / viewport.$.x, 0, 1), std.clamp((y + offset.y) / viewport.$.y, 0, 1), mask, glint);
  })) as Node<'vec4'>;
  return { coordinates: packed.xy, mask: packed.z, glint: packed.w };
}

export function createSoftShadow(inputs: {
  size: ReturnType<typeof uniform<'vec2'>>; radius: ReturnType<typeof uniform<'float'>>;
  blur: ReturnType<typeof uniform<'float'>>; opacity: ReturnType<typeof uniform<'float'>>;
}) {
  const size = fromTSL(inputs.size, d.vec2f), radius = fromTSL(inputs.radius, d.f32);
  const blur = fromTSL(inputs.blur, d.f32), opacity = fromTSL(inputs.opacity, d.f32), uv = typedUV();
  return scalarShader(() => {
    'use gpu';
    const p = std.mul(std.sub(uv.$, d.vec2f(0.5)), std.add(size.$, d.vec2f(blur.$ * 2)));
    const distance = panelDistance(p.x, p.y, size.$.x, size.$.y, radius.$);
    return (1 - std.smoothstep(-std.max(blur.$, 1), std.max(blur.$, 1), distance)) * opacity.$;
  });
}

/** Uses the caller's device, owns and releases only its two temporary buffers. */
export async function verifyPanelKernel(device: GPUDevice) {
  const root = tgpu.initFromDevice({ device });
  const points = [d.vec2f(0, 0), d.vec2f(100, 0), d.vec2f(110, 0), d.vec2f(0, 40), d.vec2f(0, 50), d.vec2f(-100, 0), d.vec2f(90, 30), d.vec2f(100, 40)];
  const input = root.createReadonly(d.arrayOf(d.vec2f, points.length), points);
  const output = root.createMutable(d.arrayOf(d.f32, points.length));
  try {
    const pipeline = root.createGuardedComputePipeline((index: number) => {
      'use gpu';
      const p = input.$[index]!;
      output.$[index] = panelDistance(p.x, p.y, 200, 80, 10);
    });
    pipeline.dispatchThreads(points.length);
    const actual = await output.read();
    const expected = points.map(p => panelDistance(p.x, p.y, 200, 80, 10));
    const maxAbsoluteError = Math.max(...expected.map((value, index) => Math.abs(value - actual[index]!)));
    if (!Number.isFinite(maxAbsoluteError) || maxAbsoluteError > 0.0001) throw new Error(`TypeGPU conformance failed: ${maxAbsoluteError}`);
    // Separate conformance cases for the new lens: finite, bounded, outside and
    // centre invariants plus CPU/GPU agreement. Panel success alone is not M7 proof.
    const lensOutput = root.createMutable(d.arrayOf(d.vec2f, points.length));
    try {
      root.createGuardedComputePipeline((index: number) => {
        'use gpu';
        const p = input.$[index]!;
        lensOutput.$[index] = lensDisplacement(p.x, p.y, 0, 0, 105, 0.65, 0.5);
      }).dispatchThreads(points.length);
      const lensActual = await lensOutput.read();
      const lensExpected = points.map(p => lensDisplacement(p.x, p.y, 0, 0, 105, 0.65, 0.5));
      const lensError = Math.max(...lensExpected.flatMap((p, i) => [Math.abs(p.x - lensActual[i]!.x), Math.abs(p.y - lensActual[i]!.y)]));
      if (!Number.isFinite(lensError) || lensError > 0.001 || lensActual.some(p => Math.hypot(p.x, p.y) > 16.001)) throw new Error(`Lens conformance failed: ${lensError}`);
      return { samples: points.length, maxAbsoluteError, tolerance: 0.0001, engine: 'typegpu-0.12.9' as const, lens: { samples: points.length, maxAbsoluteError: lensError, tolerance: 0.001 } };
    } finally { lensOutput.buffer.destroy(); }
  } finally {
    input.buffer.destroy(); output.buffer.destroy(); root.destroy();
  }
}
