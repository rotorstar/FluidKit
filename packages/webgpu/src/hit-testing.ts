import type { SceneNode } from '@fluidkit/contracts';

/** Geometry/content are sampled; handlers and permissions belong to the committed target. */
export type PresentedHitTarget = Readonly<{
  presented: SceneNode;
  target: SceneNode;
  panelOpacity: number;
  textOpacity: number;
  renderOrder: number;
  exiting: boolean;
}>;

const VISIBLE_ALPHA = 0.05;
const OCCLUDING_ALPHA = 0.95;

function containsPoint(node: SceneNode, x: number, y: number): boolean {
  const dx = x - node.x - node.width / 2;
  const dy = y - node.y - node.height / 2;
  // Scene rotations are clockwise in the screen's downward-positive y axis.
  const cosine = Math.cos(node.rotation), sine = Math.sin(node.rotation);
  const localX = Math.abs(dx * cosine + dy * sine);
  const localY = Math.abs(-dx * sine + dy * cosine);
  const halfWidth = node.width / 2, halfHeight = node.height / 2;
  if (localX > halfWidth || localY > halfHeight) return false;
  const radius = Math.min(node.radius, halfWidth, halfHeight);
  if (!radius) return true;
  const cornerX = Math.max(0, localX - halfWidth + radius);
  const cornerY = Math.max(0, localY - halfHeight + radius);
  return cornerX * cornerX + cornerY * cornerY <= radius * radius;
}

function hasControlSemantics(node: SceneNode) {
  return node.anatomy.behavior === 'button' || node.anatomy.behavior === 'textbox' || node.anatomy.behavior === 'checkbox';
}

/**
 * Tests scene parts only. Decorative effect meshes are intentionally not inputs.
 * A disabled/exiting control still intercepts pointers while its panel is visible;
 * it must not expose an unrelated control beneath it. Presentation-only labels
 * may sit above their own component's control without intercepting that control.
 */
export function hitTestPresentation(items: readonly PresentedHitTarget[], x: number, y: number): SceneNode | undefined {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  const occluders: PresentedHitTarget[] = [];
  // Equal-order objects draw in insertion order; the last one is visually above.
  const ordered = items.map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.renderOrder - a.item.renderOrder || b.index - a.index);
  for (const { item } of ordered) {
    const { presented, target, panelOpacity, textOpacity } = item;
    if (presented.kind === 'text' || presented.opacity <= VISIBLE_ALPHA || !containsPoint(presented, x, y)) continue;
    const panelVisible = panelOpacity > VISIBLE_ALPHA;
    if (!panelVisible && textOpacity <= VISIBLE_ALPHA) continue;
    const control = hasControlSemantics(target);
    const authorized = control && (Boolean(target.onActivate || target.onVisual || target.onCollection || target.collection) || target.anatomy.behavior === 'textbox');
    const labelVisible = !target.text || (Boolean(presented.text) && textOpacity > VISIBLE_ALPHA);
    const eligible = authorized && !target.disabled && !item.exiting && labelVisible;
    if (eligible) {
      const blocked = occluders.some(cover =>
        hasControlSemantics(cover.target) || cover.presented.anatomy.componentId !== presented.anatomy.componentId);
      if (!blocked) return target;
    }
    if (panelOpacity >= OCCLUDING_ALPHA || (control && panelVisible)) occluders.push(item);
  }
  return undefined;
}
