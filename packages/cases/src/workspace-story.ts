import type { Locale } from '@fluidkit/i18n';
import { caseTranslator } from './messages';
import { StoryDefinitionSchema } from '@fluidkit/contracts';
import type { WorkspaceData } from './workspace';

export function createWorkspaceStory(data: WorkspaceData, locale: Locale = 'de') {
  const tr = caseTranslator(locale);
  if (!data.modules.some(module => module.id === 'webgpu')) throw new Error('M6 benötigt das tatsächliche Modul webgpu.');
  return StoryDefinitionSchema.parse({
    schemaVersion: 1, id: 'workspace-perspectives', flowId: 'workspace-explorer', version: '1.0.0',
    title: tr('story.title'),
    brief: tr('story.brief'),
    mode: 'guided', medium: 'interactive', dataSource: data.source, dataVersion: data.capturedAt,
    posterState: 'detail', beats: [
      { id: 'context', title: tr('story.context.title'), description: tr('story.context.description'), target: { kind: 'context' }, expectedState: 'table', expectedFields: { sort: 'name', direction: 'asc', group: 'all', query: '', selected: '' }, holdMs: 1800 },
      { id: 'order', title: tr('story.order.title'), description: tr('story.order.description'), target: { kind: 'part', nodeId: 'column-dependencies', eventType: 'sort.dependencies.asc' }, expectedState: 'table', expectedFields: { sort: 'dependencies', direction: 'asc' }, holdMs: 2300 },
      { id: 'perspective', title: tr('story.perspective.title'), description: tr('story.perspective.description'), target: { kind: 'part', nodeId: 'view-cards', eventType: 'view.cards' }, expectedState: 'cards', expectedFields: { sort: 'dependencies', direction: 'asc' }, holdMs: 2800 },
      { id: 'understand', title: tr('story.understand.title'), description: tr('story.understand.description'), target: { kind: 'part', nodeId: 'module-webgpu', eventType: 'select.webgpu' }, expectedState: 'detail', expectedFields: { selected: 'webgpu', sort: 'dependencies' }, holdMs: 3000 },
      { id: 'reset', title: tr('story.reset.title'), description: tr('story.reset.description'), target: { kind: 'studio', controlId: 'story-reset', eventType: 'reset' }, expectedState: 'table', expectedFields: { sort: 'name', direction: 'asc', group: 'all', query: '', selected: '' }, holdMs: 1600 },
    ],
  });
}
