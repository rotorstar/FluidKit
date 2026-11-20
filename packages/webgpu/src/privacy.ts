import type { SceneNode } from '@fluidkit/contracts';

/** A sensitive part's accessible label can contain the same value as its pixels. */
export function redactSceneNode(node: SceneNode): SceneNode {
  return node.sensitive ? { ...node, text: '[redacted]', ...(node.label === undefined ? {} : { label: '[redacted]' }) } : node;
}
