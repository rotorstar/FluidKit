import { formatNumber, getCollator, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseTranslator, compareIds } from './messages';
import { GPU_PALETTE as P, type ComponentInstantiation, type RuntimeSnapshot, type SceneNodeInput } from '@fluidkit/contracts';
import type { WorkspaceData, WorkspaceModule } from './workspace';

export type WorkspaceModuleProjector = (module: WorkspaceModule, layouts: ComponentInstantiation['layouts']) => SceneNodeInput[];
export const WORKSPACE_GROUP_COLORS = { Kernel: P.kernel, Adapter: P.adapter, Tooling: P.tooling };
export function workspaceSuggestedComparison(data: WorkspaceData): string[] {
  const preferred = ['core', 'react', 'webgpu'].filter(id => data.modules.some(module => module.id === id));
  return [...preferred, ...data.modules.map(module => module.id).sort().filter(id => !preferred.includes(id))].slice(0, 3);
}

/** Conservative line allocation; long dependency tokens remain complete and wrap. */
export function workspaceWrap(value: string, width: number, fontSize = 12): string[] {
  const limit = Math.max(1, Math.floor(width / (fontSize * .66)));
  return value.split('\n').flatMap(paragraph => {
    if (!paragraph) return [''];
    const lines: string[] = []; let line = '';
    for (const word of paragraph.split(/[ \t]+/)) {
      if (line && line.length + word.length + 1 > limit) { lines.push(line); line = ''; }
      let remainder = word;
      while (remainder.length > limit) { if (line) { lines.push(line); line = ''; } lines.push(remainder.slice(0, limit)); remainder = remainder.slice(limit); }
      line = line ? `${line} ${remainder}` : remainder;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  });
}
export function workspaceViewNode(id: string, input: Omit<SceneNodeInput, 'id' | 'anatomy'> & { anatomy?: SceneNodeInput['anatomy'] }): SceneNodeInput {
  return { id, anatomy: { componentId: `workspace-${id}`, part: id, behavior: input.kind === 'button' ? 'button' : 'presentation' },
    radius: 12, color: P.background, foreground: P.foreground, fontSize: 12, textInset: 10, textInsetY: 8, textLines: 1, layer: 2, ...input };
}
export function workspaceViewText(id: string, value: string, x: number, y: number, width: number, fontSize = 12, foreground: string = P.muted): SceneNodeInput {
  const lines = workspaceWrap(value, width, fontSize);
  return workspaceViewNode(id, { kind: 'text', text: lines.join('\n'), x, y, width, height: lines.length * fontSize * 1.4,
    textLines: lines.length, textInset: 0, textInsetY: 0, fontSize, foreground });
}
export function workspaceComparison(modules: WorkspaceModule[], locale: Locale | LocaleContext = 'de') {
  const tr = caseTranslator(locale);
  const common = [...new Set(modules[0]?.dependencies ?? [])].filter(name => modules.every(module => module.dependencies.includes(name))).sort();
  const definitions = [
    { id: 'files', label: tr('unit.sourceFiles'), values: modules.map(module => formatNumber(locale,module.files)) },
    { id: 'lines', label: tr('unit.codeLines'), values: modules.map(module => formatNumber(locale,module.lines)) },
    { id: 'version', label: 'Version', values: modules.map(module => module.version || tr('compare.unspecified')) },
    { id: 'shared', label: tr('compare.common'), values: modules.map(() => common.join('\n') || tr('compare.none')) },
    { id: 'distinct', label: tr('compare.extra'), values: modules.map(module => [...new Set(module.dependencies)].filter(name => !common.includes(name)).sort().join('\n') || tr('compare.none')) },
  ];
  return definitions.map(row => ({ ...row, different: new Set(row.values).size > 1 }));
}

/** Raw case coordinates; the caller applies the shared dock/toolbar offsets once. */
export function workspaceCompareScene(data: WorkspaceData, snapshot: RuntimeSnapshot, width: number, project: WorkspaceModuleProjector, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[] {
  const tr = caseTranslator(context);
  const pad = width < 550 ? 18 : 30, inner = width - pad * 2, top = 346;
  const selected = new Set(Array.isArray(snapshot.fields.selection) ? snapshot.fields.selection : []);
  const modules = data.modules.filter(module => selected.has(module.id)).sort((a, b) => getCollator(locale, {numeric:true}).compare(a.id,b.id) || compareIds(a.id,b.id));
  const nodes: SceneNodeInput[] = [];
  const text = (id: string, value: string, x: number, y: number, w: number, font = 12, color: string = P.muted) => {
    const node = workspaceViewText(id, value, x, y, w, font, color); nodes.push(node); return node.height ?? 0;
  };
  text('compare-eyebrow', tr('compare.heading'), pad, top, inner, 11, P.accent);
  let y = top + 30;
  if (modules.length < 2 || modules.length > 4) {
    y += text('compare-guidance', modules.length > 4 ? tr('compare.tooMany',{count:modules.length}) : tr('compare.tooFew'), pad, y, inner, 20, P.foreground) + 18;
    y += text('compare-preservation', tr('compare.preservation'), pad, y, inner) + 16;
    if (modules.length < 2 && data.modules.length >= 2) {
      nodes.push(workspaceViewNode('compare-suggest', { kind: 'button', text: tr('compare.suggest'), label: tr('compare.suggestLabel',{names:workspaceSuggestedComparison(data).join(', ')}), onActivate: 'compare.suggest', x: pad, y, width: Math.min(inner, 230), height: 42, color: P.selected, foreground: P.accent })); y += 58;
    }
    for (const module of modules) {
      nodes.push(...project(module, {
        control: { layer: 2, kind: 'button', text: module.id, x: pad, y, width: inner - 48, height: 40, color: P.surface, foreground: P.foreground, textInset: 12, fontSize: 14 },
        selection: { kind: 'checkbox', x: pad + inner - 36, y: y + 4, width: 30, height: 30 },
        summary: { layer: 2, kind: 'text', text: tr('compare.count',{group:tr(`group.${module.group}`), count:module.files}), x: pad + 12, y: y + 46, width: inner - 24, height: 20, textInset: 0, textInsetY: 0, fontSize: 12, foreground: WORKSPACE_GROUP_COLORS[module.group] },
      })); y += 84;
    }
    return nodes;
  }
  const onlyDifferences = snapshot.fields.compareDifferences === true;
  const attributes = workspaceComparison(modules, context).filter(row => !onlyDifferences || row.different);
  nodes.push(workspaceViewNode('compare-differences', { kind: 'button', text: onlyDifferences ? tr('compare.diff') : tr('compare.all'), label: onlyDifferences ? tr('compare.showAll') : tr('compare.showDiff'),
    onActivate: `compare.differences.${onlyDifferences ? 'off' : 'on'}`, pressed: onlyDifferences, x: pad, y, width: Math.min(inner, 210), height: 40, color: onlyDifferences ? P.selected : P.surfaceRaised, foreground: P.accent }));
  y += 58;
  const surfaceTop = y;
  const compact = width < 900;
  if (compact) {
    for (const [index, module] of modules.entries()) {
      const cardTop = y, contentWidth = inner - 28;
      y += 84;
      const attributeNodes: SceneNodeInput[] = [];
      for (const row of attributes) {
        const label = workspaceViewText(`compare-${module.id}-${row.id}-label`, row.label, pad + 14, y, contentWidth, 11, row.different ? P.accent : P.muted);
        attributeNodes.push(label); y += (label.height ?? 16) + 4;
        const value = workspaceViewText(`compare-${module.id}-${row.id}`, row.values[index]!, pad + 14, y, contentWidth, 14, P.foreground);
        attributeNodes.push(value); y += (value.height ?? 20) + 18;
      }
      if (!attributes.length) y += 10;
      nodes.push(workspaceViewNode(`compare-panel-${module.id}`, { kind: 'box', x: pad, y: cardTop, width: inner, height: y - cardTop, color: P.surface, radius: 18, layer: 0, panelOpacity: 0 }));
      nodes.push(...project(module, {
        control: { layer: 2, kind: 'button', text: module.id, x: pad + 10, y: cardTop + 10, width: inner - 64, height: 34, color: P.surface, foreground: P.foreground, fontSize: 18, textInset: 4 },
        selection: { kind: 'checkbox', x: pad + inner - 44, y: cardTop + 12, width: 30, height: 30 },
        summary: { layer: 2, kind: 'text', text: tr(`group.${module.group}`), x: pad + 14, y: cardTop + 51, width: inner - 28, height: 20, textInset: 0, textInsetY: 0, fontSize: 12, foreground: WORKSPACE_GROUP_COLORS[module.group] },
      })); nodes.push(...attributeNodes); y += 18;
    }
  } else {
    const labelWidth = 144, columnWidth = (inner - labelWidth) / modules.length, tableTop = y;
    const rowNodes: SceneNodeInput[] = [];
    const row = (id: string, top: number, height: number) => rowNodes.push(workspaceViewNode(id, { kind: 'box', x: pad, y: top, width: inner, height, color: P.surface, panelOpacity: 0, semantics: { role: 'row', parentId: 'compare-table' }, layer: 0 }));
    row('compare-header', y, 58); row('compare-selection-row', y + 58, 44); row('compare-group-row', y + 102, 40);
    for (const [i, module] of modules.entries()) {
      const x = pad + labelWidth + i * columnWidth;
      const parts = project(module, {
        control: { layer: 2, kind: 'button', text: module.id, x: x + 5, y: y + 8, width: columnWidth - 10, height: 42, color: P.surfaceRaised, foreground: P.foreground, fontSize: 16, textInset: 8, textLines: 2 },
        selection: { kind: 'checkbox', x: x + 10, y: y + 65, width: 28, height: 28 },
        summary: { layer: 2, kind: 'text', text: tr(`group.${module.group}`), x: x + 10, y: y + 110, width: columnWidth - 20, height: 22, textInset: 0, textInsetY: 0, fontSize: 12, foreground: WORKSPACE_GROUP_COLORS[module.group] },
      });
      rowNodes.push(...parts.map(part => ({ ...part, semantics: { role: part.id === `module-${module.id}` ? 'columnheader' as const : 'cell' as const,
        parentId: part.id.endsWith('-selection') ? 'compare-selection-row' : part.id.endsWith('-summary') ? 'compare-group-row' : 'compare-header', columnIndex: i + 1 } })));
    }
    for (const [id, label, top] of [['header', tr('compare.attribute'), y + 17], ['selection-row', tr('selection.heading'), y + 70], ['group-row', tr('compare.group'), y + 112]] as const) rowNodes.push({ ...workspaceViewText(`compare-label-${id}`, label, pad + 12, top, labelWidth - 24), semantics: { role: id === 'header' ? 'columnheader' : 'cell', parentId: `compare-${id}`, columnIndex: 0 } });
    y += 150;
    for (const attribute of attributes) {
      const values = attribute.values.map(value => workspaceWrap(value, columnWidth - 24, 12));
      const height = Math.max(48, ...values.map(lines => lines.length * 16.8 + 24));
      const id = `compare-row-${attribute.id}`; row(id, y, height);
      rowNodes.push({ ...workspaceViewText(`compare-label-${attribute.id}`, attribute.label, pad + 12, y + 12, labelWidth - 24, 11, attribute.different ? P.accent : P.muted), semantics: { role: 'cell', parentId: id, columnIndex: 0 } });
      values.forEach((lines, i) => rowNodes.push({ ...workspaceViewText(`compare-${modules[i]!.id}-${attribute.id}`, lines.join('\n'), pad + labelWidth + i * columnWidth + 12, y + 12, columnWidth - 24, 12, P.foreground), semantics: { role: 'cell', parentId: id, columnIndex: i + 1 } })); y += height + 3;
    }
    nodes.push(workspaceViewNode('compare-table', { kind: 'box', label: tr('compare.table'), x: pad, y: tableTop, width: inner, height: y - tableTop, opacity: 0, semantics: { role: 'table' } }), ...rowNodes);
  }
  const shellSources = modules.map(module => `module-shell-${module.id}`);
  nodes.unshift(workspaceViewNode('compare-surface', { kind: 'box', x: pad, y: surfaceTop, width: inner, height: y - surfaceTop, radius: 20, color: P.surface, layer: 0,
    motion: { ports: [{ id: 'center', x: .5, y: .5 }], correspondence: [
      { kind: 'merge', sources: shellSources, whenState: 'cards', whenPresent: shellSources, groupId: 'workspace-comparison' },
      { kind: 'merge', sources: shellSources, whenState: 'map', whenPresent: shellSources, groupId: 'workspace-comparison' },
    ] },
  }));
  text('compare-caption', onlyDifferences ? tr('compare.filteredCaption') : tr('compare.caption'), pad, y + 10, inner, 11);
  return nodes;
}
