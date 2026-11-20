import type { SceneNode } from './index';

/** Pure logical projection shared by endpoint layout and sampled frames. */
export function resolveMotionPorts(input: readonly SceneNode[]): SceneNode[] {
  const nodes = new Map(input.map(node => [node.id, node]));
  function port(reference: { nodeId: string; portId: string }) {
    const owner = nodes.get(reference.nodeId);
    if (!owner || owner.motion?.connector) throw new Error('Connector requires an existing non-connector node');
    const declared = owner.motion?.ports?.find(item => item.id === reference.portId);
    if (!declared && reference.portId !== 'center') throw new Error('Unknown connector port');
    const value = declared ?? { x: .5, y: .5 };
    const dx = (value.x - .5) * owner.width, dy = (value.y - .5) * owner.height;
    return { x: owner.x + owner.width / 2 + dx * Math.cos(owner.rotation) - dy * Math.sin(owner.rotation),
      y: owner.y + owner.height / 2 + dx * Math.sin(owner.rotation) + dy * Math.cos(owner.rotation) };
  }
  return input.map(node => {
    if (!node.motion?.connector) return node;
    const a = port(node.motion.connector.from), b = port(node.motion.connector.to);
    const width = Math.max(.001, Math.hypot(b.x - a.x, b.y - a.y));
    if (width > 10000) throw new Error('Connector exceeds scene geometry budget');
    return { ...node, width, x: (a.x + b.x - width) / 2, y: (a.y + b.y - node.height) / 2, rotation: Math.atan2(b.y - a.y, b.x - a.x) };
  });
}
