import Yoga, { Direction, Edge, PositionType } from 'yoga-layout';
import { z } from 'zod';
import { resolveMotionPorts, type SceneNode } from '@fluidkit/contracts';

export const SceneViewportSchema = z.strictObject({ width: z.number().finite().positive(), height: z.number().finite().positive() });
export type SceneViewport = z.infer<typeof SceneViewportSchema>;

// Mark only outputs of this resolver. Core freezes them before handing them to
// renderer/semantics; mutable caller arrays are always resolved afresh.
const resolvedViewports = new WeakMap<readonly SceneNode[], SceneViewport>();

/** Resolve absolute scene boxes once before the GPU and native-semantic adapters.
 * Keeps the existing surface's Yoga rounding and 16px right-edge constraint.
 * Rotated geometry (e.g. map edges) retains its full declared width.
 */
export function resolveSceneLayout(nodes: readonly SceneNode[], viewport: SceneViewport): SceneNode[] {
  const { width, height } = SceneViewportSchema.parse(viewport);
  const previous = resolvedViewports.get(nodes);
  if (previous?.width === width && previous.height === height && Object.isFrozen(nodes) && nodes.every(Object.isFrozen)) return [...nodes];
  const root = Yoga.Node.create();
  try {
    root.setWidth(width); root.setHeight(height);
    const children = nodes.map(node => {
      const child = Yoga.Node.create();
      // Attach before configuration so the root owns cleanup on every failure.
      root.insertChild(child, root.getChildCount());
      child.setPositionType(PositionType.Absolute);
      if (node.inlineStart === undefined) child.setPosition(Edge.Left, node.x);
      else {
        child.setDirection(node.textDirection === 'rtl' ? Direction.RTL : Direction.LTR);
        // Absolute Yoga positions resolve against the containing block’s axis.
        child.setPosition(node.textDirection === 'rtl' ? Edge.Right : Edge.Left, node.inlineStart);
      }
      child.setPosition(Edge.Top, node.y);
      child.setWidth(node.rotation ? node.width : Math.min(node.width, Math.max(1, width - (node.inlineStart ?? node.x) - 16)));
      child.setHeight(node.height);
      return child;
    });
    root.calculateLayout(width, height, Direction.LTR);
    const resolved = resolveMotionPorts(nodes.map((node, index) => {
      const layout = children[index]!.getComputedLayout();
      return { ...node, x: layout.left, y: layout.top, width: layout.width, height: layout.height };
    }));
    resolvedViewports.set(resolved, { width, height });
    return resolved;
  } finally { root.freeRecursive(); }
}
