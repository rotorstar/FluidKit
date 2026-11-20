import type { SceneNode } from '@fluidkit/contracts';

/** Pure motion math; logical commits never wait for this presentation clock. */
export function motionProgress(elapsed: number, duration: number, reducedMotion = false) {
  const linear = reducedMotion || duration <= 0 ? 1 : Math.max(0, Math.min(1, elapsed / duration));
  return { linear, eased: 1 - (1 - linear) ** 3 };
}
export function interpolateBounds(from: Pick<SceneNode, 'x' | 'y' | 'width' | 'height' | 'radius' | 'rotation' | 'opacity'>, target: typeof from, t: number) {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  return { x: lerp(from.x, target.x), y: lerp(from.y, target.y), width: Math.max(1, lerp(from.width, target.width)), height: Math.max(1, lerp(from.height, target.height)), radius: Math.max(0, lerp(from.radius, target.radius)), rotation: lerp(from.rotation, target.rotation), opacity: Math.max(0, Math.min(1, lerp(from.opacity, target.opacity))) };
}
/** Text fades while stationary; geometry crosses only while its labels are hidden. */
export function transitionStages(progress:number){
  const p=Math.max(0,Math.min(1,progress));
  return {geometry:Math.max(0,Math.min(1,(p-.15)/.65)),sourceText:Math.max(0,1-p/.15),targetText:Math.max(0,Math.min(1,(p-.8)/.2))};
}
