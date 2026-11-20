import type { Locale, LocaleContext } from '@fluidkit/i18n';
import { workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import type { RuntimeSnapshot } from '@fluidkit/contracts';

const header = new Set(['eyebrow', 'title', 'subtitle']);
const tools = new Set(['workspace-search', 'workspace-filters', 'workspace-selection-toolbar']);

export function workspaceStage(
  data: WorkspaceData,
  snapshot: RuntimeSnapshot,
  viewport: { width: number; height: number },
  comparison = false,
  locale: Locale = 'de',
  context: Locale | LocaleContext = locale,
) {
  const scene = workspaceScene(data, snapshot, viewport, undefined, locale, context).filter(node => !header.has(node.id));
  const expanded = snapshot.fields.workspaceTools === true || snapshot.fields.inspectorOpen === true;
  if (expanded) return scene.map(node => ({ ...node, y: (node.y ?? 0) - 112 }));

  const navigation = scene.filter(node => node.anatomy.componentId === 'workspace-navigation');
  const visible = scene.filter(node => !tools.has(node.anatomy.componentId)
    && node.anatomy.componentId !== 'workspace-navigation'
    && node.id !== 'result-count'
    && !/^atlas-(eyebrow|metric-|group-|total)/.test(node.id)
    && !['compare-eyebrow', 'compare-differences'].includes(node.id));
  // The compact stage and its semantic overlay share the very same vertical origin.
  const first = Math.min(...visible.map(node => node.y ?? 0));
  const controls = comparison ? [] : navigation.map(node => ({ ...node, y: (node.y ?? 0) - 112 }));
  const top = controls.reduce((end, node) => Math.max(end, node.y + (node.height ?? 0) + 16), 16);
  return [...controls, ...visible.map(node => ({ ...node, y: (node.y ?? 0) - first + top }))];
}
