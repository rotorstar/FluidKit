import { M7_PHASES, type SceneNode, type SequenceGeometry } from '@fluidkit/contracts';
import type { PresentationFrame } from '@fluidkit/effects';

export function qualificationGeometry(frame: PresentationFrame): SequenceGeometry {
  return { progress: frame.progress, nodes: frame.nodes.map(({ id, x, y, width, height, rotation, opacity }) => ({ id, x, y, width, height, rotation, opacity })), lensPresent: frame.lens !== null, particleCount: frame.particles.length, shadowCount: frame.nodeStates.filter(node => node.shadow.opacity > .0001).length };
}
/** Compare the renderer's presentation against independently committed scene descriptions. */
export function endpointIssues(geometry: SequenceGeometry, expected: SceneNode[], label: string): string[] {
  const issues: string[] = [], actual = new Map(geometry.nodes.map(node => [node.id, node])), ids = new Set(expected.map(node => node.id));
  for (const node of expected) {
    const shown = actual.get(node.id);
    if (!shown || (['x', 'y', 'width', 'height', 'rotation', 'opacity'] as const).some(key => Math.abs(shown[key] - node[key]) > .01)) issues.push(`${label}: ${node.id} differs from committed geometry.`);
  }
  if (geometry.nodes.some(node => !ids.has(node.id) && node.opacity > .01)) issues.push(`${label}: unexpected visible node.`);
  if (geometry.lensPresent || geometry.particleCount || geometry.shadowCount) issues.push(`${label}: effect residue at endpoint.`);
  return issues;
}
export function checkpointComplete(progress: number[]) { return progress.length === M7_PHASES.length && progress.every((value, index) => value === M7_PHASES[index]); }
