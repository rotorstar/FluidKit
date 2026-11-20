import { formatNumber, getCollator, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseTranslator, searchText, compareIds } from './messages';
import { DESIGN_TOKENS, FLUID_THEME, GPU_PALETTE as P, DEFAULT_EFFECT_SETTINGS } from '@fluidkit/contracts';
import { z } from 'zod';
import { defineFlow, defineMultipartComponent, instantiateMultipartComponent, projectMultipartComponent, type ComponentInstantiation, type EffectSettings, type RuntimeSnapshot, type SceneNodeInput } from '@fluidkit/contracts';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import { workspaceLayout } from './workspace-layout';
import { workspaceCompareScene, workspaceSuggestedComparison, WORKSPACE_GROUP_COLORS } from './workspace-compare';
import { workspaceAtlasScene } from './workspace-atlas';

export const WorkspaceModuleSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/), name: z.string().min(1), version: z.string(),
  group: z.enum(['Kernel', 'Adapter', 'Tooling']), files: z.number().int().nonnegative(),
  lines: z.number().int().nonnegative(), dependencies: z.array(z.string()), internal: z.array(z.string()),
});
export const WorkspaceDataSchema = z.strictObject({
  schemaVersion: z.literal(1), name: z.string(), capturedAt: z.iso.datetime(),
  source: z.literal('Workspace package.json + src/**/*.ts(x)'), modules: z.array(WorkspaceModuleSchema).max(1000),
}).superRefine((data, ctx) => {
  if (new Set(data.modules.map(module => module.id)).size !== data.modules.length) ctx.addIssue({ code: 'custom', message: 'Duplicate module ID' });
});
export type WorkspaceData = z.infer<typeof WorkspaceDataSchema>;
export type WorkspaceModule = z.infer<typeof WorkspaceModuleSchema>;
export const WorkspaceLocationSchema = z.strictObject({
  view: z.enum(['table', 'cards', 'map', 'detail', 'compare', 'atlas']).default('table'),
  sort: z.enum(['name', 'files', 'dependencies']).default('name'),
  direction: z.enum(['asc', 'desc']).default('asc'),
  selected: z.string().default(''), group: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).default('all'),
  metric: z.enum(['lines', 'files']).default('lines'), atlasGroup: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).default('all'), differences: z.enum(['0', '1']).default('0'),
  cards: z.enum(['selected', 'all']).default('all'),
  picked: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).max(1000).default([]),
});
export function readWorkspaceLocation(search: string, data: WorkspaceData) {
  const query = new URLSearchParams(search);
  const location = WorkspaceLocationSchema.parse({ ...Object.fromEntries(['view', 'sort', 'direction', 'selected', 'group', 'metric', 'atlasGroup', 'differences', 'cards'].flatMap(key => query.has(key) ? [[key, query.get(key)]] : [])), picked: query.getAll('picked') });
  if (location.selected && !data.modules.some(module => module.id === location.selected)) throw new Error('Das referenzierte Modul existiert nicht.');
  if (location.view === 'detail' && !location.selected) throw new Error('Die Detailansicht benötigt eine Modul-ID.');
  if (new Set(location.picked).size !== location.picked.length || location.picked.some(id => !data.modules.some(module => module.id === id))) throw new Error('Die Auswahl enthält doppelte oder nicht vorhandene Modul-IDs.');
  return { state: location.view, fields: { cardsPickedOnly: location.cards === 'selected', sort: location.sort, direction: location.direction, selected: location.selected, group: location.group, selection: [...location.picked].sort(), compareDifferences: location.differences === '1', atlasMetric: location.metric, atlasGroup: location.atlasGroup } };
}
export function workspaceSearch(snapshot: RuntimeSnapshot) {
  const query = new URLSearchParams({ view: snapshot.state, sort: String(snapshot.fields.sort), direction: String(snapshot.fields.direction), selected: String(snapshot.fields.selected), group: String(snapshot.fields.group) });
  if (snapshot.fields.atlasMetric === 'files') query.set('metric', 'files');
  if (snapshot.fields.atlasGroup && snapshot.fields.atlasGroup !== 'all') query.set('atlasGroup', String(snapshot.fields.atlasGroup));
  if (snapshot.fields.compareDifferences === true) query.set('differences', '1');
  if (snapshot.fields.cardsPickedOnly === true) query.set('cards', 'selected');
  for (const key of [...workspaceSelection(snapshot)].sort()) query.append('picked', key);
  return `?${query}`;
}
export function workspaceSelection(snapshot: RuntimeSnapshot): string[] {
  const value = snapshot.fields.selection;
  return Array.isArray(value) ? value : [];
}
export function workspaceRows(data: WorkspaceData, snapshot: RuntimeSnapshot, locale: Locale = 'de') {
  const query = searchText(String(snapshot.fields.query ?? ''), locale);
  const tr = caseTranslator(locale);
  const collator = getCollator(locale, { numeric: true, sensitivity: 'base' });
  const group = snapshot.fields.group;
  const direction = snapshot.fields.direction === 'desc' ? -1 : 1;
  const sort = snapshot.fields.sort;
  const picked = snapshot.state === 'cards' && snapshot.fields.cardsPickedOnly === true ? new Set(workspaceSelection(snapshot)) : null;
  return data.modules.filter(module => (!picked || picked.has(module.id)) && (snapshot.state !== 'atlas' || snapshot.fields.atlasGroup === 'all' || !snapshot.fields.atlasGroup || module.group === snapshot.fields.atlasGroup) && (group === 'all' || module.group === group) && searchText(`${module.name} ${tr(`group.${module.group}`)}`, locale).includes(query)).sort((a, b) => {
    const value = sort === 'files' ? a.files - b.files : sort === 'dependencies' ? a.dependencies.length - b.dependencies.length : collator.compare(a.id, b.id);
    return direction * value || compareIds(a.id, b.id);
  });
}
/** Selection operates on presented items, not on a different query result.
 * Compare intentionally shows the complete selection irrespective of filters.
 */
export function workspaceCollectionOrder(data: WorkspaceData, snapshot: RuntimeSnapshot, locale: Locale = 'de'): string[] {
  if (snapshot.state === 'atlas' && snapshot.fields.atlasGroup === 'all') return [];
  if (snapshot.state === 'compare') {
    const selected = new Set(workspaceSelection(snapshot));
    return data.modules.filter(module => selected.has(module.id)).map(module => module.id).sort((a, b) => getCollator(locale, { numeric: true }).compare(a,b) || compareIds(a,b));
  }
  return workspaceRows(data, snapshot, locale).map(module => module.id);
}
const VIEWS = ['table','cards','map','detail','compare','atlas'] as const;
export function createWorkspaceFlow(data: WorkspaceData, locale: Locale = 'de') {
  const views = VIEWS;
  const transitions = (current: string) => ({
    ...Object.fromEntries(views.filter(view => view !== 'detail').map(view => [`view.${view}`, { target: view, duration: 850 }])),
    ...Object.fromEntries(data.modules.map(module => [`select.${module.id}`, { target: 'detail', assign: { selected: module.id }, duration: 900 }])),
    ...Object.fromEntries(['name', 'files', 'dependencies'].flatMap(sort => ['asc', 'desc'].map(direction => [`sort.${sort}.${direction}`, { target: current, assign: { sort, direction }, duration: 650 }]))),
    ...Object.fromEntries(['all', 'Kernel', 'Adapter', 'Tooling'].map(group => [`filter.${group}`, { target: current, assign: { group }, duration: 500 }])),
    'compare.suggest': { target: current, assign: { selection: workspaceSuggestedComparison(data) }, duration: 400 },
    ...Object.fromEntries(['on', 'off'].map(value => [`compare.differences.${value}`, { target: current, assign: { compareDifferences: value === 'on' }, duration: 400 }])),
    ...Object.fromEntries(['lines', 'files'].map(value => [`atlas.metric.${value}`, { target: current, assign: { atlasMetric: value }, duration: 600 }])),
    ...Object.fromEntries(['all', 'Kernel', 'Adapter', 'Tooling'].map(value => [`atlas.group.${value}`, { target: current, assign: { atlasGroup: value }, duration: 650 }])),
    'cards.scope.all': { target: current, assign: { cardsPickedOnly: false }, duration: 450 },
    'tools.open': { target: current, assign: { workspaceTools: true }, duration: 0 },
    'tools.close': { target: current, assign: { workspaceTools: false, inspectorOpen: false }, duration: 0 },
    'inspector.open': { target: current, assign: { inspectorOpen: true }, duration: 400 },
    'inspector.close': { target: current, assign: { inspectorOpen: false }, duration: 400 },
    reset: { target: 'table', assign: { cardsPickedOnly: false, workspaceTools: false, query: '', group: 'all', sort: 'name', direction: 'asc', selected: '', selection: [], inspectorOpen: false, compareDifferences: false, atlasMetric: 'lines', atlasGroup: 'all' }, duration: 650 },
  });
  return defineFlow({ id: 'workspace-explorer', name: 'Adaptive Workspace', initial: 'table',
    fields: [{ id: 'cardsPickedOnly', type: 'boolean', initial: false }, { id: 'workspaceTools', type: 'boolean', initial: false }, { id: 'query', initial: '', maxLength: 100 }, { id: 'sort', initial: 'name' }, { id: 'direction', initial: 'asc' }, { id: 'selected', initial: '' }, { id: 'group', initial: 'all' }, { id: 'selection', type: 'keys', initial: [] }, { id: 'inspectorOpen', type: 'boolean', initial: false }, { id: 'compareDifferences', type: 'boolean', initial: false }, { id: 'atlasMetric', initial: 'lines' }, { id: 'atlasGroup', initial: 'all' }],
    // Typeahead follows the visible control label, not the package namespace
    // (@fluidkit/…) that every entry shares in its manifest metadata.
    collections: [{ id: 'modules', field: 'selection', items: data.modules.map(module => ({ id: module.id, label: module.id })) }],
    states: Object.fromEntries(views.map(view => [view, { label: caseTranslator(locale)(`view.${view}`), nodes: [], projection: 'workspace', on: transitions(view) }])),
  });
}
const colors = WORKSPACE_GROUP_COLORS;

/** Behavior and stable part identity are independent of table/card/map geometry. */
export const WORKSPACE_MODULE_DEFINITION = defineMultipartComponent({
  schemaVersion: 1, id: 'workspace-module', name: 'Workspace-Modul', commands: ['open', 'dismissInspector'], layouts: ['control', 'selection', 'summary'], focusTargets: ['inspectorTrigger'],
  parts: [
    { id: 'control', layout: 'control', behavior: 'button', name: 'Modul öffnen', command: 'open', capabilities: { focus: true, keys: ['Enter', 'Space'], press: true } },
    { id: 'selection', layout: 'selection', behavior: 'checkbox', name: 'Modul auswählen', dismissCommand: 'dismissInspector', focusTarget: 'inspectorTrigger', capabilities: { focus: true, keys: ['Space', 'Escape', 'typeahead'], press: true } },
    { id: 'summary', layout: 'summary', behavior: 'presentation' },
  ],
});

/** One projection, one dataset: IDs survive sorting and changes of representation. */
export function workspaceScene(data: WorkspaceData, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, effects?: EffectSettings, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[] {
  const tr = caseTranslator(context);
  const number = (value: number) => formatNumber(context, value);
  const nodes: SceneNodeInput[] = [];
  const inspectorOpen = snapshot.fields.inspectorOpen === true;
  const width = viewport.width, layout = workspaceLayout(width, data.modules.length, effects ? EFFECT_LIBRARY.length : 0, inspectorOpen), pad = layout.padding, inner = layout.innerWidth;
  const rows = workspaceRows(data, snapshot, locale);
  const selectedIds = new Set(workspaceSelection(snapshot));
  const selectedModules = data.modules.filter(module => selectedIds.has(module.id));
  const moduleOwners = data.modules.map(module => `module-${module.id}`).sort((a,b) => b.length-a.length);
  const rowOwners = new Map(data.modules.map(module => [`row-${module.id}`, `module-${module.id}`]));
  function componentOwner(id: string) {
    if (id === 'search' || id === 'search-hint') return 'workspace-search';
    if (id.startsWith('view-')) return 'workspace-navigation';
    if (id === 'header-row' || id.startsWith('column-')) return 'workspace-table-header';
    if (id === 'module-table') return 'workspace-table';
    if (id.startsWith('group-')) return 'workspace-filters';
    if (id.startsWith('selection-')) return 'workspace-selection-toolbar';
    if (id.startsWith('inspector-')) return 'workspace-inspector';
    return rowOwners.get(id) ?? moduleOwners.find(owner => id === owner || id.startsWith(`${owner}-`)) ?? `workspace-${id}`;
  }
  const offsetY = (y: number, componentId: string) => y + (y >= 188 ? layout.navigationOffset : 0)
    + (effects && y >= layout.dockTop && componentId !== 'effect-dock' ? layout.contentOffset : 0)
    + (y >= layout.collectionTop && !['effect-dock', 'workspace-selection-toolbar', 'workspace-inspector'].includes(componentId) ? layout.collectionOffset : 0);
  const node = (id: string, value: Omit<SceneNodeInput, 'id' | 'anatomy'> & { behavior?: 'presentation' | 'button' | 'textbox' | 'checkbox' | 'status'; componentId?: string }) => {
    const { behavior = 'presentation', componentId = componentOwner(id), ...rest } = value;
    nodes.push({ id, anatomy: { componentId, part: id, behavior }, color: FLUID_THEME.colors.gpu, foreground: P.foreground, radius: 10, textInset: 12, ...rest,fontSize:Math.max(DESIGN_TOKENS.captionPx,rest.fontSize??DESIGN_TOKENS.bodyPx), y: offsetY(rest.y ?? 0, componentId) });
  };
  const moduleParts = (module: WorkspaceModule, layouts: ComponentInstantiation['layouts'], rowId?: string, applyOffsets = true) => {
    const id = `module-${module.id}`;
    const instance = instantiateMultipartComponent(WORKSPACE_MODULE_DEFINITION, { id, commands: { open: `select.${module.id}`, dismissInspector: 'inspector.close' },
      focusTargets: { inspectorTrigger: 'selection-inspect' }, dismissals: inspectorOpen ? ['selection'] : [],
      layouts: { ...layouts, selection: { ...layouts.selection, kind: 'checkbox', checked: selectedIds.has(module.id), collection: { id: 'modules', itemId: module.id },
        text: selectedIds.has(module.id) ? '•' : '', textInset: 6, textInsetY: 3, fontSize: 14, radius: 7,
        foreground: P.accent, color: selectedIds.has(module.id) ? P.selected : P.surfaceRaised, layer: 5 } },
      partIds: { control: id, selection: `${id}-selection`, summary: `${id}-summary` },
      names: { control: tr('module.open', {name: module.id}), selection: tr('module.select', {name: module.id}) },
    });
    return projectMultipartComponent(WORKSPACE_MODULE_DEFINITION, instance).map(part => ({ ...part,
      ...(part.anatomy.part === 'control' ? { panelOpacity: 0 } : {}),
      y: applyOffsets ? offsetY(part.y, part.anatomy.componentId) : part.y,
      fontSize: Math.max(DESIGN_TOKENS.captionPx, part.fontSize),
      ...(rowId ? { semantics: { role: 'cell' as const, parentId: rowId, columnIndex: part.anatomy.part === 'selection' ? 0 : part.anatomy.part === 'control' ? 1 : 4 } } : {}),
    }));
  };
  const text = (id: string, value: string, x: number, y: number, w: number, fontSize = 14, foreground = FLUID_THEME.colors.gpuMuted, layer = 2, lines=1) => node(id, { kind: 'text', text: value, x, y, width: Math.max(1,w), height: Math.max(fontSize,DESIGN_TOKENS.captionPx) * 1.4 * lines, textLines:lines,textInsetY:0, fontSize, foreground, opacity: 1, color: FLUID_THEME.colors.gpu, textInset: 0, layer });
  const button = (id: string, value: string, event: string, x: number, y: number, w: number, active?: boolean) => node(id, { kind: 'button', behavior: 'button', text: value, onActivate: event, pressed: active, x, y, width: w, height: 38, color: active ? P.selected : P.surface, foreground: active ? P.accent : P.muted, fontSize: width<550?12:13, textInset:width<550?4:12, layer: 4 });
  text('eyebrow', width < 360 ? tr('workspace.eyebrow.short') : tr('workspace.eyebrow'), pad, 18, inner, 10, P.accent);
  text('title', width<550 ? snapshot.state==='detail'?tr('title.detail.short'):tr('title.data.short') : snapshot.state === 'detail' ? tr('title.detail') : tr('title.data'), pad, 43, inner, width < 550 ? 21 : 29, FLUID_THEME.colors.gpuInk);
  text('subtitle', tr(width < 550 ? 'subtitle.short' : 'subtitle', {count: data.modules.length}), pad, 88, inner, 13);
  const viewWidth = Math.min(150, (inner - (layout.navigationColumns - 1) * 8) / layout.navigationColumns);
  ([['table','view.table'],['cards','view.cards'],['map','view.map.short'],['compare','view.compare'],['atlas','view.atlas.short']] as const).forEach(([view,label], i) => button(`view-${view}`,tr(label),`view.${view}`,pad + (i % layout.navigationColumns) * (viewWidth + 8),132 + Math.floor(i / layout.navigationColumns) * 46,viewWidth,snapshot.state === view));
  if (effects) {
    node('effect-dock', { kind:'box', componentId:'effect-dock', x:pad, y:layout.dockTop, width:inner, height:layout.dockHeight, radius:18, color:P.surface, layer:7 });
    node('effect-dock-label', { kind:'text', componentId:'effect-dock', text:width<550?tr('effect.heading'):tr('effect.seedHeading', {seed: effects.seed}), x:pad+12, y:199, width:inner-24, height:22, fontSize:10, textInset:0, foreground:P.accent, layer:8 });
    const selected = effects.mode === 'case' ? effects.caseRules[snapshot.flowId]?.effect?.id ?? effects.effect.id : effects.effect.id;
    EFFECT_LIBRARY.forEach((effect,i) => node(`effect-preset-${effect.id}`, { kind:'button', componentId:'effect-dock', behavior:'button', text:effect.title, label:tr('effect.choose', {name: effect.title}), onVisual:{type:'effect.select',effect:effectReference(effect)}, pressed:selected===effect.id, x:pad+layout.dockInset+(i%layout.columns)*(layout.presetWidth+layout.gap), y:layout.presetsTop+Math.floor(i/layout.columns)*(layout.presetHeight+layout.gap), width:layout.presetWidth, height:layout.presetHeight, fontSize:width<550?12:13, textLines:2,textInsetY:6, textInset:8, color:selected===effect.id?P.selected:P.surfaceRaised, foreground:selected===effect.id?P.accent:P.muted, layer:8 }));
    (['off','fixed','random','case'] as const).forEach((mode,i) => node(`effect-mode-${mode}`, { kind:'button', componentId:'effect-dock', behavior:'button', text:tr(`effect.mode.${mode}`), label:tr('effect.modeLabel', {mode: locale === 'de' ? mode : tr(`effect.mode.${mode}`)}), onVisual:{type:'effect.mode',mode}, pressed:effects.mode===mode, x:pad+layout.dockInset+(i%layout.modeColumns)*(layout.modeWidth+layout.gap), y:layout.modesTop+Math.floor(i/layout.modeColumns)*(layout.modeHeight+layout.gap), width:layout.modeWidth, height:layout.modeHeight, fontSize:12, textInset:3, color:effects.mode===mode?P.selected:P.surface, foreground:effects.mode===mode?P.accent:P.muted, layer:8 }));
    node('effect-seed', {kind:'button', componentId:'effect-dock', behavior:'button', text:tr('effect.seed'), label:tr('effect.reroll', {seed: effects.seed}), onVisual:{type:'effect.reroll'}, x:pad+layout.dockInset+(4%layout.modeColumns)*(layout.modeWidth+layout.gap),y:layout.modesTop+Math.floor(4/layout.modeColumns)*(layout.modeHeight+layout.gap),width:layout.modeWidth,height:layout.modeHeight,fontSize:12,textInset:3,color:P.surface,foreground:P.muted,layer:8});
  }
  node('search', { kind: 'input', behavior: 'textbox', binding: 'query', label: tr('search'), x: pad, y: 188, width: Math.min(310,inner), height: 40, color: P.surface, foreground: P.foreground, fontSize: 14, layer: 5 });
  if (!snapshot.fields.query) text('search-hint', tr('search.hint'), pad + 12, 192, Math.min(280,inner - 24), 13, P.muted, 6);
  const groupWidth = (inner - 18) / 4;
  (['all','Kernel','Adapter','Tooling'] as const).forEach((group,i) => button(`group-${group}`,tr(group === 'all' && width < 550 ? 'group.all.short' : `group.${group}`),`filter.${group}`,pad + i*(groupWidth+6),244,groupWidth,snapshot.fields.group === group));
  const hiddenSelected = snapshot.state === 'compare' ? 0 : selectedModules.filter(module => !rows.some(row => row.id === module.id)).length;
  const compactToolbar = width < 550;
  const toolbarButtonWidth = compactToolbar ? (inner - 12) / 3 : Math.min(112, (inner - 150 - 24) / 3);
  const toolbarButtonX = compactToolbar ? pad : pad + inner - toolbarButtonWidth * 3 - 12;
  const toolbarButtonY = layout.collectionTop + (compactToolbar ? 30 : 0);
  text('selection-count', tr(hiddenSelected ? 'selection.hidden' : 'selection.count', {count:selectedModules.length, hidden:hiddenSelected}), pad, layout.collectionTop + (compactToolbar ? 0 : 9), compactToolbar ? inner : inner - toolbarButtonWidth * 3 - 24, 11, P.accent);
  [
    { id: 'selection-all', label: tr('selection.all'), text: tr('selection.visible'), operation: 'all' as const },
    { id: 'selection-clear', label: tr('selection.clear'), text: tr('selection.clear.short'), operation: 'clear' as const },
  ].forEach((control, index) => node(control.id, { kind: 'button', behavior: 'button', text: control.text, label: control.label,
    onCollection: { id: 'modules', operation: control.operation }, x: toolbarButtonX + index * (toolbarButtonWidth + 6), y: toolbarButtonY,
    width: toolbarButtonWidth, height: 36, textInset: 4, fontSize: 12, color: P.surface, foreground: P.muted, layer: 4,
    ...(inspectorOpen ? { onEscape: 'inspector.close', focusReturn: 'selection-inspect' } : {}) }));
  node('selection-inspect', { kind: 'button', behavior: 'button', text: tr('selection.details'), label: tr('selection.inspect'), onActivate: inspectorOpen ? 'inspector.close' : 'inspector.open', pressed: inspectorOpen,
    ...(inspectorOpen ? { onEscape: 'inspector.close', focusReturn: 'selection-inspect' } : {}), x: toolbarButtonX + 2 * (toolbarButtonWidth + 6), y: toolbarButtonY, width: toolbarButtonWidth, height: 36,
    textInset: 4, fontSize: 12, color: inspectorOpen ? P.selected : P.surface, foreground: P.accent, layer: 4 });
  if (inspectorOpen) {
    const top = layout.inspectorTop, inset = 14, bodyWidth = inner - inset * 2;
    node('inspector-region', { kind: 'box', label: tr('inspector.region'), x: pad, y: top, width: inner, height: layout.inspectorHeight,
      color: P.surface, radius: 16, semantics: { role: 'region' }, layer: 0 });
    node('inspector-heading', { kind: 'text', text: tr('inspector.title'), x: pad + inset, y: top + 14, width: bodyWidth - 40, height: 20,
      textInset: 0, textInsetY: 0, fontSize: 11, foreground: P.accent, semantics: { parentId: 'inspector-region' }, layer: 2 });
    node('inspector-close', { kind: 'button', behavior: 'button', label: tr('inspector.close'), text: '×', onActivate: 'inspector.close', onEscape: 'inspector.close', focusReturn: 'selection-inspect',
      x: pad + inner - 42, y: top + 8, width: 30, height: 30, textInset: 8, textInsetY: 3, fontSize: 16, color: P.selected, semantics: { parentId: 'inspector-region' }, layer: 4 });
    const files = selectedModules.reduce((sum, module) => sum + module.files, 0);
    const lines = selectedModules.reduce((sum, module) => sum + module.lines, 0);
    const dependencyCount = new Set(selectedModules.flatMap(module => module.dependencies)).size;
    const stats = tr('inspector.metrics', {count:selectedModules.length, files, lines, deps:dependencyCount, sep:compactToolbar ? '\n' : ' · '});
    node('inspector-metrics', { kind: 'text', text: stats, x: pad + inset, y: top + 48, width: bodyWidth, height: compactToolbar ? 44 : 24,
      textInset: 0, textInsetY: 0, textLines: compactToolbar ? 2 : 1, fontSize: compactToolbar ? 13 : 15, foreground: P.foreground, semantics: { parentId: 'inspector-region' }, layer: 2 });
    // A deliberately bounded summary, with an explicit remainder instead of
    // pretending that a clipped list contains the entire collection.
    const shownNames = selectedModules.slice(0, compactToolbar ? 2 : 4).map(module => module.id);
    const remaining = selectedModules.length - shownNames.length;
    const summary = selectedModules.length ? (remaining ? tr('inspector.more', {names: shownNames.join(' · '), count:remaining}) : shownNames.join(' · ')) : tr('selection.empty');
    node('inspector-names', { kind: 'text', text: summary, x: pad + inset, y: top + (compactToolbar ? 104 : 88), width: bodyWidth, height: 42,
      textInset: 0, textInsetY: 0, textLines: 2, fontSize: 12, foreground: P.muted, semantics: { parentId: 'inspector-region' }, layer: 2 });
    node('inspector-hint', { kind: 'text', text: hiddenSelected ? tr('inspector.filtered', {count:hiddenSelected}) : tr('inspector.retained'),
      x: pad + inset, y: top + (compactToolbar ? 166 : 138), width: bodyWidth, height: 40, textInset: 0, textInsetY: 0, textLines: 2,
      fontSize: 11, foreground: P.muted, semantics: { parentId: 'inspector-region' }, layer: 2 });
  }
  text('result-count', snapshot.state === 'compare' ? tr('result.compare', {count:selectedModules.length}) : tr('result.count', {count:rows.length,total:data.modules.length,view:tr(`view.${WorkspaceLocationSchema.shape.view.parse(snapshot.state)}`)}),pad,301,inner,10,P.muted);
  if (!rows.length && !['detail', 'compare', 'atlas'].includes(snapshot.state)) {
    text('empty',tr('search.empty'),pad,380,inner,23,P.foreground,2,2);
    button('reset-empty',tr('search.reset'),'reset',pad,450,190);
    return nodes;
  }
  if (snapshot.state === 'compare' || snapshot.state === 'atlas') {
    const project = (module: WorkspaceModule, layouts: ComponentInstantiation['layouts']) => moduleParts(module, layouts, undefined, false);
    const content = snapshot.state === 'compare' ? workspaceCompareScene(data, snapshot, width, project, locale, context) : workspaceAtlasScene(rows, snapshot, width, project, context);
    nodes.push(...content.map(part => ({ ...part, y: offsetY(part.y ?? 0, part.anatomy.componentId) })));
  } else if (snapshot.state === 'table') {
    node('module-table',{kind:'box',text:'',label:tr('table.label'),x:pad,y:338,width:inner,height:Math.max(1,rows.length*49+43),opacity:0,semantics:{role:'table'}});
    node('header-row',{kind:'box',x:pad,y:338,width:inner,height:38,color:P.surface,semantics:{role:'row',parentId:'module-table'}});
    // Headers and body use the same column geometry. The active sort arrow
    // keeps room at 320 px without shrinking below the caption token.
    const selectionWidth = 32, tableWidth = inner - selectionWidth, tableX = pad + selectionWidth;
    node('column-selection', { kind: 'text', text: '', label: tr('selection.heading'), x: pad, y: 338, width: selectionWidth, height: 38, semantics: { role: 'columnheader', parentId: 'header-row', columnIndex: 0 } });
    const wideDependencyLabel = locale === 'fr' && width < 700;
    const nameWidth = wideDependencyLabel ? .30 : .40;
    const filesWidth = wideDependencyLabel ? .14 : .18;
    const layerStart = wideDependencyLabel ? .78 : .77;
    const columns = [
      {id:'name',label:tr('table.module'),x:0,w:nameWidth,index:1},
      {id:'files',label:width<550?'TS':tr('table.files'),x:nameWidth,w:filesWidth,index:2},
      {id:'dependencies',label:width>=700 || wideDependencyLabel ? tr('table.deps') : tr('table.deps.short'),x:nameWidth+filesWidth,w:layerStart-nameWidth-filesWidth,index:3},
      {id:'group',label:tr('table.layer'),x:layerStart,w:1-layerStart,index:4},
    ] as const;
    for (const column of columns) {
      const active = snapshot.fields.sort === column.id;
      const ascending = snapshot.fields.direction === 'asc';
      if (column.id === 'group') {
        node('column-group',{kind:'text',text:column.label,x:tableX+tableWidth*column.x,y:338,width:tableWidth*column.w,height:38,color:P.surface,fontSize:12,textInset:6,textLines:1,foreground:P.muted,layer:2,semantics:{role:'columnheader',parentId:'header-row',columnIndex:column.index}});
      } else {
        node(`column-${column.id}`,{kind:'button',behavior:'button',text:`${column.label}${active ? ascending ? ' ↑' : ' ↓' : ''}`,label:tr('table.sort', {column: column.id === 'dependencies' ? tr('table.deps') : column.label}),onActivate:`sort.${column.id}.${active && ascending ? 'desc' : 'asc'}`,x:tableX+tableWidth*column.x,y:338,width:tableWidth*column.w,height:38,color:P.surface,fontSize:width<550?11:12,textInset:width<360?1:3,textLines:1,foreground:active?P.accent:P.muted,layer:2,semantics:{role:'columnheader',parentId:'header-row',columnIndex:column.index,...(active ? {sort:ascending?'ascending' as const:'descending' as const}:{})}});
      }
    }
    rows.forEach((module,i) => {
      const y=387+i*49, color=i%2?P.background:P.surface;
      node(`row-${module.id}`,{kind:'box',x:pad,y,width:inner,height:44,color,semantics:{role:'row',parentId:'module-table'}, motion: { ports: [{ id: 'center', x: .5, y: .5 }], correspondence: [
        { kind: 'match', sources: [`module-shell-${module.id}`], whenState: 'cards', whenPresent: [`module-shell-${module.id}`], route: 'y-then-x' },
        { kind: 'match', sources: [`module-shell-${module.id}`], whenState: 'map', whenPresent: [`module-shell-${module.id}`] },
      ] }});
      const values={name:module.id,files:number(module.files),dependencies:number(module.dependencies.length),group:module.group};
      const parts = moduleParts(module, {
        control: { kind: 'button', text: values.name, x: tableX, y, width: tableWidth * nameWidth, height: 44, color, foreground: P.foreground, fontSize: width < 550 ? 12 : 14, textInset: width < 550 ? 3 : 12, textLines: 1, layer: 2 },
        selection: { kind: 'checkbox', x: pad + 3, y: y + 8, width: 26, height: 28 },
        summary: { kind: 'text', text: tr(`group.${module.group}`), x: tableX + tableWidth * layerStart, y, width: tableWidth * (1-layerStart), height: 44, color, foreground: colors[module.group], fontSize: width < 550 ? 11 : 12, textInset: width < 360 ? 1 : 6, textLines: 1, layer: 2, motion: { label: 'crossfade' } },
      }, `row-${module.id}`);
      // DOM and GPU share this semantic column order, even though component
      // definitions keep a representation-independent part order of their own.
      nodes.push(parts.find(part => part.anatomy.part === 'selection')!);
      for(const column of columns) {
        if (column.id === 'name' || column.id === 'group') nodes.push(parts.find(part => part.anatomy.part === (column.id === 'name' ? 'control' : 'summary'))!);
        else node(`module-${module.id}-${column.id}`,{kind:'text',text:values[column.id],x:tableX+tableWidth*column.x,y,width:tableWidth*column.w,height:44,color,foreground:P.muted,fontSize:width<550?11:12,textInset:width<360?3:6,textLines:1,layer:2,semantics:{role:'cell',parentId:`row-${module.id}`,columnIndex:column.index}});
      }
    });
  } else if (snapshot.state === 'cards') {
    const columns=width>700?3:2, gap=14, w=(inner-gap*(columns-1))/columns;
    rows.forEach((module,i) => {
      const x=pad+(i%columns)*(w+gap), y=346+Math.floor(i/columns)*layout.cardStride;
      node(`module-shell-${module.id}`, { kind: 'box', componentId: `module-${module.id}`, x, y, width: w, height: layout.cardHeight, radius: 18, color: P.surface, layer: 0,
        motion: { ports: [{ id: 'center', x: .5, y: .5 }], correspondence: [
          { kind: 'match', sources: [`row-${module.id}`], whenState: 'table', whenPresent: [`row-${module.id}`], route: 'x-then-y' },
          ...(selectedIds.has(module.id) && selectedIds.size >= 2 && selectedIds.size <= 4 ? [{ kind: 'split' as const, sources: ['compare-surface'], groupId: 'workspace-comparison', whenState: 'compare', whenPresent: ['compare-surface'] }] : []),
        ] } });
      nodes.push(...moduleParts(module, {
        control: {kind:'card',text:module.id,x,y,width:w,height:layout.cardHeight,radius:18,color:P.surface,foreground:colors[module.group],fontSize:width<320?14:width<550?15:19,textInset:12,textLines:1,layer:1,motion:{lane:{x:0,y:0}}},
        selection: { kind: 'checkbox', x: x + w - 40, y: y + 39, width: 28, height: 28 },
        summary: {kind:'text',text:tr(`group.${module.group}`),x:x+12,y:y+44,width:w-54,height:20,fontSize:11,color:P.surface,foreground:colors[module.group],textInset:0,textInsetY:0,textLines:1,layer:2,motion:{label:'crossfade'}},
      }));
      node(`module-${module.id}-files`,{kind:'text',text:number(module.files),x:x+12,y:y+70,width:32,height:22,fontSize:14,color:P.surface,foreground:P.foreground,textInset:0,textInsetY:0,textLines:1,layer:2,motion:{lane:{x:w-44,y:0}}});
      node(`module-${module.id}-files-unit`,{kind:'text',text:tr('table.files'),x:x+46,y:y+72,width:w-58,height:20,fontSize:11,color:P.surface,foreground:P.muted,textInset:0,textInsetY:0,textLines:1,layer:2,motion:{follow:`module-${module.id}-files`}});
      node(`module-${module.id}-dependencies`,{kind:'text',text:tr(width<550 ? 'cards.deps.short' : 'cards.deps', {deps:module.dependencies.length, lines:module.lines, break:'\n'}),x:x+12,y:y+100,width:w-24,height:34,fontSize:width<550?10:11,color:P.surface,foreground:P.muted,textInset:0,textInsetY:0,textLines:width<550?2:1,layer:2});
    });
  } else if (snapshot.state === 'map') {
    const cy=560,cx=width/2,rx=Math.max(70,(inner-180)/2),ry=185;
    const compact=width<800 || rows.length>12;
    const mapNodeWidth=compact?Math.min(132,(inner-12)/2):132;
    const compactBottom=380+Math.floor(Math.max(0,rows.length-1)/2)*93+34;
    const positions=new Map(rows.map((module,i)=>{const angle=i/rows.length*Math.PI*2-Math.PI/2;return[module.id,compact?{x:i%2?width-pad-mapNodeWidth/2:pad+mapNodeWidth/2,y:380+Math.floor(i/2)*93}:{x:cx+Math.cos(angle)*rx,y:cy+Math.sin(angle)*ry}];}));
    for(const module of rows) for(const dependency of module.internal){const a=positions.get(module.id),b=positions.get(dependency);if(!a||!b)continue;const length=Math.hypot(b.x-a.x,b.y-a.y);node(`edge-${module.id}-${dependency}`,{kind:'box',x:(a.x+b.x)/2-length/2,y:(a.y+b.y)/2-.75,width:Math.max(1,length),height:1.5,rotation:Math.atan2(b.y-a.y,b.x-a.x),radius:0,color:P.border,layer:-2,motion:{connector:{from:{nodeId:`module-shell-${module.id}`,portId:'center'},to:{nodeId:`module-shell-${dependency}`,portId:'center'}}}});}
    text('map-count',tr('map.edges', {count:rows.reduce((sum,module)=>sum+module.internal.filter(id=>positions.has(id)).length,0)}),compact?pad:cx-65,compact?compactBottom+18:cy-12,130,12,P.accent,-1);
    for(const module of rows){const p=positions.get(module.id)!,x=p.x-mapNodeWidth/2,y=p.y-34;
      node(`module-shell-${module.id}`, { kind: 'box', componentId: `module-${module.id}`, x, y, width: mapNodeWidth, height: 68, radius: 20, color: P.surface, layer: 0, motion: { ports: [{ id: 'center', x: .5, y: .5 }] } });
      nodes.push(...moduleParts(module, {
      control: {kind:'card',text:module.id,x,y,width:mapNodeWidth,height:68,radius:20,color:P.surfaceRaised,foreground:colors[module.group],fontSize:14,textInset:12,textInsetY:10,textLines:1,layer:2},
      selection: {kind:'checkbox',x:x+mapNodeWidth-34,y:y+35,width:26,height:26},
      summary: {kind:'text',text:tr(`group.${module.group}`),x:x+12,y:y+40,width:mapNodeWidth-50,height:18,textInset:0,textInsetY:0,textLines:1,fontSize:11,color:P.surfaceRaised,foreground:colors[module.group],layer:3},
    }));}
    text('map-caption',tr('map.caption'),pad,compact?compactBottom+60:802,inner,11,FLUID_THEME.colors.gpuMuted,2,2);
  } else {
    const module=data.modules.find(item=>item.id===snapshot.fields.selected);
    if(!module)throw new Error('Unknown selected module');
    node(`module-${module.id}`,{kind:'card',text:tr('detail.version', {name: module.name, break:'\n', group:tr(`group.${module.group}`), version:module.version}),x:pad,y:346,width:inner,height:143,radius:26,color:P.surface,foreground:colors[module.group],fontSize:width<550?21:28,layer:1});
    const statWidth=(inner-16)/3;
    [number(module.files)+'\n'+tr('table.files'),number(module.lines)+'\n'+tr('unit.lines'),number(module.dependencies.length)+'\n'+tr('unit.refs')].forEach((value,i)=>node(`detail-stat-${i}`,{kind:'card',text:value,x:pad+i*(statWidth+8),y:506,width:statWidth,height:65,color:P.surface,fontSize:width<550?14:16,textInset:8,textInsetY:8,textLines:2,layer:1}));
    text('detail-caption',tr('detail.caption'),pad,598,inner,10,P.accent);
    node('detail-deps',{kind:'text',text:module.dependencies.join('\n')||tr('detail.none'),x:pad,y:631,width:inner,height:170,fontSize:14,textInset:0,foreground:P.foreground,layer:2});
  }
  // Decorative ownership is explicit. Labels/controls retain their stable IDs,
  // but follow the currently presented shell instead of floating at the target.
  const available = new Set(nodes.map(part => part.id));
  return nodes.map(part => {
    const module = data.modules.find(item => `module-${item.id}` === part.anatomy.componentId);
    if (!module) return part;
    const leader = snapshot.state === 'table' ? `row-${module.id}` : snapshot.state === 'compare' ? 'compare-surface' : `module-shell-${module.id}`;
    return part.id !== leader && available.has(leader) ? { ...part, motion: { ...part.motion, follow: part.motion?.follow ?? leader } } : part;
  });
}

/** The host measures the exact same projection instead of guessing content height. */
export function workspaceSurfaceHeight(data: WorkspaceData, snapshot: RuntimeSnapshot, width: number, effectCount = EFFECT_LIBRARY.length, locale: Locale = 'de', context: Locale | LocaleContext = locale) {
  const scene = workspaceScene(data, snapshot, { width, height: 1 }, effectCount ? DEFAULT_EFFECT_SETTINGS : undefined, locale, context);
  return Math.ceil(Math.max(400, ...scene.map(node => (node.y ?? 0) + (node.height ?? 0))) + 32);
}
