import { M8_NATIVE_TOLERANCE_PX, NativeTargetAuditSchema, type NativeTargetAudit, type NativeTargetBounds, type SceneNode } from '@fluidkit/contracts';
import type { PresentationFrame } from '@fluidkit/effects';

/** CSS transforms rotate around the centre; DOMRect reports the resulting AABB. */
export function presentedTargetBounds(node: Pick<SceneNode, 'x' | 'y' | 'width' | 'height' | 'rotation'>): NativeTargetBounds {
  const width = Math.abs(Math.cos(node.rotation)) * node.width + Math.abs(Math.sin(node.rotation)) * node.height;
  const height = Math.abs(Math.sin(node.rotation)) * node.width + Math.abs(Math.cos(node.rotation)) * node.height;
  return { x: node.x + (node.width - width) / 2, y: node.y + (node.height - height) / 2, width, height };
}

/** Read-only local application measurement; it does not dispatch input or focus. */
export function inspectM8NativeTargets(surface: HTMLElement, frame: PresentationFrame, current: SceneNode[]): NativeTargetAudit {
  const canvas = surface.querySelector('canvas');
  if (!canvas) throw new Error('Native Zielprüfung benötigt die aktuelle Canvas-Surface.');
  const origin = canvas.getBoundingClientRect();
  if (!origin.width || !origin.height) throw new Error('Surface besitzt keine messbare Größe.');
  const shown = new Map(frame.nodes.map(node => [node.id, node]));
  const targets = current.filter(node => ['button', 'checkbox', 'textbox'].includes(node.anatomy.behavior) && shown.has(node.id));
  const nativeElements = [...surface.querySelectorAll<HTMLElement>('[data-fluid-node]')];
  const issues: string[] = [];
  const observations = targets.map(node => {
    const expected = presentedTargetBounds(shown.get(node.id)!);
    const matches = nativeElements.filter(element => element.dataset.fluidNode === node.id);
    const element = matches[0], rect = element?.getBoundingClientRect();
    const actual = rect ? { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height } : null;
    const maxDeviation = actual ? Math.max(...(['x', 'y', 'width', 'height'] as const).map(key => Math.abs(actual[key] - expected[key]))) : null;
    const expectedChecked = node.anatomy.behavior === 'checkbox' ? Boolean(node.checked) : null;
    const actualChecked = expectedChecked === null ? null : element instanceof HTMLInputElement && element.type === 'checkbox' ? element.checked : null;
    if (!element) issues.push(`${node.id}: natives Ziel fehlt.`);
    if (matches.length > 1) issues.push(`${node.id}: mehrere native Ziele besitzen dieselbe ID.`);
    if (element && (element.dataset.component !== node.anatomy.componentId || element.dataset.part !== node.anatomy.part)) issues.push(`${node.id}: native Part-Identität stimmt nicht überein.`);
    if (maxDeviation !== null && maxDeviation > M8_NATIVE_TOLERANCE_PX) issues.push(`${node.id}: native Geometrie weicht ${maxDeviation.toFixed(3)} CSS-px ab.`);
    if (actualChecked !== expectedChecked) issues.push(`${node.id}: native Auswahl stimmt nicht mit Core überein.`);
    return { id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part, matches: matches.length, actualComponentId: element?.dataset.component ?? null, actualPart: element?.dataset.part ?? null, expected, actual, maxDeviation, expectedChecked, actualChecked, inert: element?.inert ?? null, tabIndex: element?.tabIndex ?? null };
  });
  return NativeTargetAuditSchema.parse({ method: 'domrect-versus-presented-controls', toleranceCssPx: M8_NATIVE_TOLERANCE_PX, expectedIds: targets.map(node => node.id), observations, issues });
}
