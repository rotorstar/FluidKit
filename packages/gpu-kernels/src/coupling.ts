import { d, std, tgpu } from 'typegpu';
import { fromTSL, toTSL, uv as typedUV } from '@typegpu/three';
import { uniform, uniformArray, vec2 } from 'three/tsl';
import type { Node } from 'three/webgpu';

/** 32 panel pieces and 31 links fit the shared WebGPU/WebGL2 uniform path. */
export const MAX_COUPLING_SHAPES = 63;

/** kind=0: rounded rectangle (center/size), kind=1: capsule (two endpoints).
 * Coordinates and radii are CSS pixels in the group's local rectangle.
 */
export const couplingPrimitiveDistance = tgpu.fn([d.vec2f, d.vec4f, d.vec4f], d.f32)((p, shape, details) => {
  'use gpu';
  if (details.y > 0.5) {
    const dx = shape.z - shape.x;
    const dy = shape.w - shape.y;
    const length2 = dx * dx + dy * dy;
    const t = std.clamp(((p.x - shape.x) * dx + (p.y - shape.y) * dy) / std.max(length2, 0.0001), 0, 1);
    const x = p.x - shape.x - t * dx;
    const y = p.y - shape.y - t * dy;
    return std.sqrt(x * x + y * y) - details.x;
  }
  const radius = std.clamp(details.x, 0, std.min(shape.z, shape.w) * 0.5);
  const qx = std.abs(p.x - shape.x) - shape.z * 0.5 + radius;
  const qy = std.abs(p.y - shape.y) - shape.w * 0.5 + radius;
  const x = std.max(qx, 0);
  const y = std.max(qy, 0);
  return std.sqrt(x * x + y * y) + std.min(std.max(qx, qy), 0) - radius;
});

/** Exact hard-union branch avoids the stock smooth-union k=0 division. */
export const couplingSmoothUnion = tgpu.fn([d.f32, d.f32, d.f32], d.f32)((a, b, radius) => {
  'use gpu';
  if (radius <= 0.0001) return std.min(a, b);
  const h = std.max(radius - std.abs(a - b), 0) / radius;
  return std.min(a, b) - h * h * radius * 0.25;
});

/** Same polynomial-union weights as the geometry; equal-distance materials
 * blend continuously instead of snapping to whichever panel was visited last. */
export const couplingPaintWeight = tgpu.fn([d.f32, d.f32, d.f32], d.f32)((a, b, radius) => {
  'use gpu';
  if (radius <= 0.0001) {
    if (a <= b) return 0;
    return 1;
  }
  return std.clamp(0.5 + 0.5 * (a - b) / radius, 0, 1);
});

/** One typed fragment root, no compute/storage buffers or texture feedback. */
export function createCouplingShader() {
  // The pinned t3.uniformArray helper omits Three's explicit element type;
  // TypeGPU vectors are not Three.Vector4 instances and cannot infer that type.
  const shapes = fromTSL(uniformArray(Array.from({ length: MAX_COUPLING_SHAPES }, () => d.vec4f()), 'vec4'), d.arrayOf(d.vec4f));
  const details = fromTSL(uniformArray(Array.from({ length: MAX_COUPLING_SHAPES }, () => d.vec4f()), 'vec4'), d.arrayOf(d.vec4f));
  const paints = fromTSL(uniformArray(Array.from({ length: MAX_COUPLING_SHAPES }, () => d.vec4f()), 'vec4'), d.arrayOf(d.vec4f));
  const count = uniform(0, 'int'), size = uniform(vec2(1, 1)), opacity = uniform(0), blend = uniform(0), sheen = uniform(0);
  const countValue = fromTSL(count, d.i32), dimensions = fromTSL(size, d.vec2f);
  const visibility = fromTSL(opacity, d.f32), smoothing = fromTSL(blend, d.f32), uv = typedUV();
  const shimmer = fromTSL(sheen, d.f32);
  const packed = toTSL(() => {
    'use gpu';
    const p = d.vec2f(uv.$.x * dimensions.$.x, (1 - uv.$.y) * dimensions.$.y);
    let distance = d.f32(100000);
    let nearest = d.f32(100000);
    let coverage = d.f32(1);
    let paint = d.vec4f(0);
    for (let index = 0; index < std.min(countValue.$, MAX_COUPLING_SHAPES); index++) {
      const detail = details.$[index]!;
      const shapeDistance = couplingPrimitiveDistance(p, shapes.$[index]!, detail);
      // A zero-radius link has zero area. Without subpixel coverage the usual
      // SDF edge AA would still leave a half-opaque hairline between panels.
      if (shapeDistance < nearest) {
        nearest = shapeDistance;
        coverage = 1;
        if (detail.y > 0.5) coverage = std.clamp(detail.x / 0.65, 0, 1);
      }
      paint = std.mix(paint, paints.$[index]!, couplingPaintWeight(distance, shapeDistance, smoothing.$));
      distance = couplingSmoothUnion(distance, shapeDistance, smoothing.$);
    }
    const edge = std.max(std.fwidth(distance), 0.65);
    const alpha = (1 - std.smoothstep(-edge, edge, distance)) * visibility.$ * coverage;
    const rim = (1 - std.smoothstep(0, 2.5, std.abs(distance))) * 0.12 * shimmer.$;
    return d.vec4f(paint.x * (1 + rim), paint.y * (1 + rim), paint.z * (1 + rim), alpha * paint.w);
  }) as Node<'vec4'>;
  return { packed, shapes: shapes.node, details: details.node, paints: paints.node, count, size, opacity, blend, sheen };
}
