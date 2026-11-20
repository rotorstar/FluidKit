import { formatNumber, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseTranslator } from './messages';
import { GPU_PALETTE as P, type RuntimeSnapshot, type SceneNodeInput } from '@fluidkit/contracts';
import type { WorkspaceModule } from './workspace';
import { WORKSPACE_GROUP_COLORS, workspaceViewNode, workspaceViewText, type WorkspaceModuleProjector } from './workspace-compare';

export type AtlasRect = { x: number; y: number; width: number; height: number };
export type AtlasCell = AtlasRect & { id: string; weight: number };
/** Deterministic binary treemap. Zero values deliberately have no invented area. */
export function workspaceTreemap(items: readonly { id: string; weight: number }[], bounds: AtlasRect): AtlasCell[] {
  if (![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) || bounds.width < 0 || bounds.height < 0) throw new Error('Invalid treemap bounds');
  if (new Set(items.map(item => item.id)).size !== items.length || items.some(item => !Number.isFinite(item.weight) || item.weight < 0)) throw new Error('Invalid treemap items');
  const positive = items.filter(item => item.weight > 0).map(item => ({ ...item })).sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id, 'en'));
  const cells: AtlasCell[] = [];
  const visit = (list: typeof positive, rect: AtlasRect) => {
    if (!list.length) return;
    if (list.length === 1) { cells.push({ ...list[0]!, ...rect }); return; }
    const total = list.reduce((sum, item) => sum + item.weight, 0);
    let prefix = 0, split = 1, best = Infinity;
    for (let index = 1; index < list.length; index++) {
      prefix += list[index - 1]!.weight; const distance = Math.abs(total / 2 - prefix);
      if (distance < best) { split = index; best = distance; }
    }
    const first = list.slice(0, split), second = list.slice(split), ratio = first.reduce((sum, item) => sum + item.weight, 0) / total;
    if (rect.width >= rect.height) {
      const size = rect.width * ratio;
      visit(first, { ...rect, width: size }); visit(second, { ...rect, x: rect.x + size, width: rect.width - size });
    } else {
      const size = rect.height * ratio;
      visit(first, { ...rect, height: size }); visit(second, { ...rect, y: rect.y + size, height: rect.height - size });
    }
  };
  visit(positive, { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }); return cells;
}
export function workspaceAtlasCells(modules: readonly WorkspaceModule[], metric: 'files' | 'lines', bounds: AtlasRect) {
  const groups = (['Kernel', 'Adapter', 'Tooling'] as const).map(id => ({ id, weight: modules.filter(module => module.group === id).reduce((sum, module) => sum + module[metric], 0) }));
  const groupCells = workspaceTreemap(groups, bounds);
  const cells = groupCells.flatMap(group => workspaceTreemap(modules.filter(module => module.group === group.id).map(module => ({ id: module.id, weight: module[metric] })), group));
  return { groups: groupCells, cells, zero: modules.filter(module => module[metric] === 0).map(module => module.id) };
}

export function workspaceAtlasScene(rows: WorkspaceModule[], snapshot: RuntimeSnapshot, width: number, project: WorkspaceModuleProjector, locale: Locale | LocaleContext = 'de'): SceneNodeInput[] {
  const tr = caseTranslator(locale);
  const pad = width < 550 ? 18 : 30, inner = width - pad * 2, top = 346;
  const metric = snapshot.fields.atlasMetric === 'files' ? 'files' : 'lines', unit = metric === 'files' ? tr('unit.files') : tr('unit.lines');
  const group = (['Kernel','Adapter','Tooling'] as const).find(name => name === snapshot.fields.atlasGroup) ?? 'all';
  const modules = rows.filter(module => group === 'all' || module.group === group);
  const nodes: SceneNodeInput[] = [];
  const addText = (id: string, text: string, x: number, y: number, w: number, size = 12, color: string = P.muted) => {
    const node = workspaceViewText(id, text, x, y, w, size, color); nodes.push(node); return node.height ?? 0;
  };
  addText('atlas-eyebrow', tr('atlas.title'), pad, top, inner, 11, P.accent);
  const metricWidth = Math.min(130, (inner - 8) / 2);
  (['lines', 'files'] as const).forEach((item, index) => nodes.push(workspaceViewNode(`atlas-metric-${item}`, {
    kind: 'button', text: item === 'lines' ? tr('unit.codeLines') : tr('unit.files'), label: tr('atlas.metric', {unit:tr(item === 'lines' ? 'unit.codeLines' : 'unit.files')}), onActivate: `atlas.metric.${item}`, pressed: metric === item,
    x: pad + index * (metricWidth + 8), y: top + 30, width: metricWidth, height: 40, color: metric === item ? P.selected : P.surface, foreground: metric === item ? P.accent : P.muted,
  })));
  const groups = ['all', 'Kernel', 'Adapter', 'Tooling'] as const, groupWidth = (inner - 18) / 4;
  groups.forEach((item, index) => nodes.push(workspaceViewNode(`atlas-group-${item}`, {
    kind: 'button', text: item === 'all' ? tr('atlas.overview') : tr(`group.${item}`), label: item === 'all' ? tr('atlas.showAll') : tr('atlas.inspect',{group:tr(`group.${item}`)}), onActivate: `atlas.group.${item}`, pressed: group === item,
    x: pad + index * (groupWidth + 6), y: top + 82, width: groupWidth, height: 38, textInset: width < 550 ? 2 : 8, fontSize: 11,
    color: group === item ? P.selected : P.surface, foreground: item === 'all' ? P.accent : WORKSPACE_GROUP_COLORS[item],
  })));
  let y = top + 136;
  y += addText('atlas-breadcrumb', tr('atlas.crumb',{group:group === 'all' ? tr('atlas.all') : tr(`group.${group}`), count:modules.length}), pad, y, inner, 12, P.foreground) + 10;
  const total = modules.reduce((sum, module) => sum + module[metric], 0);
  y += addText('atlas-total', `${formatNumber(locale,total)} ${unit} · ${group === 'all' ? tr('atlas.open') : tr('atlas.area')}`, pad, y, inner, 12, P.accent) + 18;
  if (group === 'all') {
    for (const name of ['Kernel', 'Adapter', 'Tooling'] as const) {
      const members = modules.filter(module => module.group === name);
      const sources = members.map(module => `module-shell-${module.id}`);
      const amount = members.reduce((sum, module) => sum + module[metric], 0);
      const id = `atlas-cluster-${name}`;
      nodes.push(workspaceViewNode(id, { kind: 'box',
        x: pad, y, width: inner, height: 122, radius: 20, color: P.surface, layer: 0,
        anatomy: { componentId: id, part: 'surface', behavior: 'presentation' },
        motion: { ports: [{ id: 'center', x: .5, y: .5 }], ...(sources.length && sources.length <= 32 ? { correspondence: [{ kind: sources.length > 1 ? 'merge' as const : 'match' as const, sources, whenState: 'atlas', whenPresent: sources, groupId: `atlas-${name}` }] } : {}) },
      }));
      nodes.push(workspaceViewNode(`atlas-open-${name}`, { kind: 'button', text: tr(`group.${name}`), label: tr('atlas.groupOpen',{group:tr(`group.${name}`),count:members.length}), onActivate: `atlas.group.${name}`, disabled: !members.length,
        x: pad, y, width: inner, height: 122, radius: 20, color: P.surface, foreground: WORKSPACE_GROUP_COLORS[name], fontSize: 22, textInset: 18, textInsetY: 14, layer: 2, panelOpacity: 0,
        anatomy: { componentId: id, part: 'control', behavior: 'button' }, motion: { follow: id, label: 'context' },
      }));
      addText(`${id}-summary`, tr('atlas.summary',{count:members.length,value:`${formatNumber(locale,amount)} ${unit}`}), pad + 18, y + 53, inner - 36, 12, P.foreground);
      const fraction = total ? amount / total : 0;
      nodes.push(workspaceViewNode(`${id}-track`, { kind: 'box', x: pad + 18, y: y + 89, width: inner - 36, height: 4, radius: 2, color: P.border, layer: 1 }));
      if (fraction > 0) nodes.push(workspaceViewNode(`${id}-weight`, { kind: 'box', x: pad + 18, y: y + 89, width: Math.max(.1, (inner - 36) * fraction), height: 4, radius: 2, color: WORKSPACE_GROUP_COLORS[name], layer: 2 }));
      y += 138;
    }
    addText('atlas-chart-caption', tr('atlas.bars'), pad, y, inner, 11);
    return nodes;
  }
  const splitMotion = (module: WorkspaceModule) => ({ ports: [{ id: 'center', x: .5, y: .5 }], ...(modules.length <= 32 ? { correspondence: [{
    kind: modules.length > 1 ? 'split' as const : 'match' as const,
    sources: [`atlas-cluster-${module.group}`], whenState: 'atlas', whenPresent: [`atlas-cluster-${module.group}`], groupId: `atlas-${module.group}`,
  }] } : {}) });
  const chart = { x: pad, y, width: inner, height: width < 550 ? 360 : 390 };
  const layout = workspaceAtlasCells(modules, metric, chart), detailed: WorkspaceModule[] = [];
  if (!total) {
    nodes.push(workspaceViewNode('atlas-empty-panel', { kind: 'box', ...chart, height: 110, color: P.surface, layer: 0 }));
    addText('atlas-empty', modules.length ? tr('atlas.zero',{unit}) : tr('atlas.empty'), pad + 14, y + 18, inner - 28, 16, P.foreground);
    detailed.push(...modules); y += 130;
  } else {
    const cellMap = new Map(layout.cells.map(cell => [cell.id, cell]));
    for (const module of modules) {
      const cell = cellMap.get(module.id);
      const readable = cell && cell.width >= 148 && cell.height >= 118;
      if (cell && cell.width >= 3 && cell.height >= 3 && !readable) {
        // A 2px inset is decorative spacing. The mathematical allocation above
        // remains exact and is tested separately from this optical gutter.
        nodes.push(workspaceViewNode(`atlas-cell-${module.id}`, { kind: 'box', x: cell.x + 1, y: cell.y + 1, width: cell.width - 2, height: cell.height - 2,
          color: module.group === 'Kernel' ? P.surfaceRaised : module.group === 'Adapter' ? P.selected : P.hover, radius: 4, layer: 0 }));
      }
      if (readable) {
        nodes.push(workspaceViewNode(`module-shell-${module.id}`, { kind: 'box', x: cell.x + 1, y: cell.y + 1, width: cell.width - 2, height: cell.height - 2,
          color: P.surface, radius: 12, layer: 0, anatomy: { componentId: `module-${module.id}`, part: 'surface', behavior: 'presentation' }, motion: splitMotion(module) }));
        nodes.push(...project(module, {
          control: { layer: 2, kind: 'button', text: module.id, x: cell.x + 8, y: cell.y + 8, width: cell.width - 16, height: 38, color: P.surfaceRaised, foreground: P.foreground, fontSize: 16, textInset: 8, textLines: 1, radius: 6 },
          selection: { kind: 'checkbox', x: cell.x + cell.width - 39, y: cell.y + cell.height - 38, width: 28, height: 28 },
          summary: { layer: 2, kind: 'text', text: `${formatNumber(locale,module[metric])} ${unit}`, x: cell.x + 12, y: cell.y + 53, width: cell.width - 24, height: 21, fontSize: 12, textInset: 0, textInsetY: 0, foreground: WORKSPACE_GROUP_COLORS[module.group] },
        }));
        addText(`atlas-layer-${module.id}`, tr(`group.${module.group}`), cell.x + 12, cell.y + cell.height - 28, cell.width - 58, 11, WORKSPACE_GROUP_COLORS[module.group]);
      } else detailed.push(module);
    }
    y += chart.height + 18;
    y += addText('atlas-chart-caption', tr('atlas.caption'), pad, y, inner, 11) + 20;
  }
  if (detailed.length) {
    const detailHeading = tr('atlas.small', {count:detailed.length});
    y += addText('atlas-detail-heading', detailHeading, pad, y, inner, 14, P.foreground) + 14;
    for (const module of detailed.sort((a, b) => b[metric] - a[metric] || a.id.localeCompare(b.id, 'en'))) {
      nodes.push(workspaceViewNode(`module-shell-${module.id}`, { kind: 'box', x: pad, y, width: inner, height: 80, color: P.surface, layer: 0,
        anatomy: { componentId: `module-${module.id}`, part: 'surface', behavior: 'presentation' }, motion: splitMotion(module) }));
      nodes.push(...project(module, {
        control: { layer: 2, kind: 'button', text: module.id, x: pad + 8, y: y + 7, width: inner - 58, height: 34, color: P.surface, foreground: P.foreground, fontSize: 15, textInset: 6 },
        selection: { kind: 'checkbox', x: pad + inner - 40, y: y + 10, width: 30, height: 30 },
        summary: { layer: 2, kind: 'text', text: `${tr(`group.${module.group}`)} · ${formatNumber(locale,module[metric])} ${unit}${module[metric] === 0 ? tr('atlas.noArea') : ''}`, x: pad + 14, y: y + 48, width: inner - 28, height: 22, textInset: 0, textInsetY: 0, fontSize: 11, foreground: WORKSPACE_GROUP_COLORS[module.group] },
      })); y += 90;
    }
  }
  return nodes;
}
