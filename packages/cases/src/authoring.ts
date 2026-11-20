import { contentFingerprint, defineCatalog, formatNumber, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseCatalogFingerprint, caseMessage } from './messages';
import {
  GPU_PALETTE, AuthoringDocumentSchema, defineFlow, defineMultipartComponent, instantiateMultipartComponent, projectMultipartComponent, SceneNodeSchema,
  type AuthoringDocument, type AuthoringSection, type EffectSettings, type RuntimeSnapshot, type SceneNode, type SceneNodeInput,
} from '@fluidkit/contracts';
import { createWorkspaceFlow, workspaceScene, type WorkspaceData } from './workspace';
import { workspaceLayout } from './workspace-layout';

const EXPLORER_HEADER_HEIGHT = 132;
const authoringCopy = defineCatalog({
  data: {de:'DEIN WORKSPACE / ECHTE DATEN',en:'YOUR WORKSPACE / LIVE DATA',fr:'VOTRE PROJET / DONNÉES RÉELLES'},
  modules: {de:'Workspace-Module',en:'Workspace modules',fr:'Modules du projet'},
  metrics: {de:'Workspace-Kennzahlen',en:'Workspace metrics',fr:'Indicateurs du projet'},
  modulesUnit: {de:'Module',en:'Modules',fr:'Modules'},
  packagesUnit: {de:'Pakete',en:'Packages',fr:'Paquets'},
  placeholder: {de:'Deine Notiz …',en:'Your note…',fr:'Votre note…'},
  privacy: {de:'Bleibt in dieser Sitzung.\nWird nicht an die AI gesendet.',en:'Kept in this session.\nPrivate to you.',fr:'Conservée dans cette session.\nVisible de vous seul.'},
});
export const authoredCatalogFingerprint = (locale: Locale) => contentFingerprint(caseCatalogFingerprint(locale) + ':' + authoringCopy.fingerprint(locale));
const PALETTES = {
  // Legacy document key: the default authoring variant now follows the host palette.
  forest: { accent: GPU_PALETTE.accent, fill: GPU_PALETTE.selected, surface: GPU_PALETTE.surface, muted: GPU_PALETTE.muted },
  indigo: { accent: '#b4c0ff', fill: '#3d4876', surface: '#202c45', muted: '#aab3d1' },
  amber: { accent: '#f6d596', fill: '#6b5030', surface: '#362e25', muted: '#c7b69b' },
} as const;
const ACCENT_INKS = new Set([GPU_PALETTE.accent, GPU_PALETTE.kernel, GPU_PALETTE.adapter, GPU_PALETTE.tooling, '#8edbc3', '#8de9cf', '#75b8a5', '#71b5a5', '#7ecbb7', '#b8ffe2', '#c3ffe6', '#b7e8d7', '#d6f5e8', '#aed5c9']);
const prefix = (section: AuthoringSection) => `authoring.section.${section.type}.${section.id}`;

/** Conservative explicit breaks also fit unbroken titles; never split graphemes. */
function labelLayout(text: string, width: number, fontSize: number) {
  // The shipped Inter W advances slightly beyond 1em; leave measured-font headroom.
  const capacity = Math.max(1, Math.floor(width / (fontSize * 1.1)));
  const segmenter = new Intl.Segmenter('de', { granularity: 'grapheme' });
  const lines: string[] = []; let current: string[] = [];
  for (const word of text.split(/[ \t\r\n]+/).filter(Boolean)) {
    const letters = [...segmenter.segment(word)].map(item => item.segment);
    if (current.length && current.length + 1 + letters.length > capacity) { lines.push(current.join('')); current = []; }
    while (letters.length > capacity) { lines.push(letters.splice(0, capacity).join('')); }
    if (current.length) current.push(' ');
    current.push(...letters);
  }
  if (current.length || !lines.length) lines.push(current.join(''));
  return { text: lines.join('\n'), lines: lines.length };
}
function authoredLayout(document: AuthoringDocument, width: number, moduleCount: number, inspectorOpen: boolean) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isInteger(moduleCount) || moduleCount < 0) throw new Error('Invalid authoring layout dimensions');
  const workspace = workspaceLayout(width, moduleCount, 0, inspectorOpen);
  const padding = workspace.padding, innerWidth = workspace.innerWidth, gap = 20;
  const titleSize = width < 550 ? 22 : 30;
  const title = labelLayout(document.title, innerWidth, titleSize), titleLines = title.lines;
  const titleHeight = Math.ceil(titleLines * titleSize * 1.25);
  let y = 48 + titleHeight + gap;
  const sections = document.sections.map(section => {
    const top = y;
    let height: number;
    if (section.type === 'module-explorer') height = workspace.surfaceHeight - EXPLORER_HEADER_HEIGHT;
    else if (section.type === 'metric-grid') height = Math.ceil(section.metrics.length / (width < 550 ? 2 : 3)) * 100 - 12;
    else {
      const labelLines = labelLayout(section.label, Math.max(1, innerWidth - 32), 14).lines;
      height = 16 + Math.ceil(labelLines * 14 * 1.25) + 12 + 46 + 12 + 36 + 16;
    }
    y += height + gap;
    return { id: section.id, type: section.type, top, height };
  });
  return { padding, innerWidth, gap, titleSize, title, titleLines, titleHeight, sections, height: y - gap + padding };
}

/** The host and projection use exactly the same geometry, including an open inspector. */
export function authoredWorkspaceHeight(document: AuthoringDocument, width: number, moduleCount: number, inspectorOpen = false): number {
  return authoredLayout(AuthoringDocumentSchema.parse(document), width, moduleCount, inspectorOpen).height;
}

export function createAuthoredWorkspaceFlow(document: AuthoringDocument, data: WorkspaceData) {
  const parsed = AuthoringDocumentSchema.parse(document);
  const explorer = parsed.sections.find(section => section.type === 'module-explorer');
  if (!explorer || explorer.type !== 'module-explorer') throw new Error('Registered explorer is missing');
  const flow = createWorkspaceFlow(data);
  // Keep the field even in documents without a note: candidates preserve values;
  // the host separately prevents a dirty note from disappearing through removal.
  return defineFlow({ ...flow, initial: explorer.view, fields: [...flow.fields, { id: 'workspaceNote', type: 'text', initial: '', sensitive: true, maxLength: 2000 }] });
}

const NOTE_DEFINITION = defineMultipartComponent({
  schemaVersion: 1, id: 'authoring-project-note', name: 'Lokale Projektnotiz', bindings: ['value'], layouts: ['region', 'label', 'control', 'hint', 'placeholder'],
  parts: [
    { id: 'region', layout: 'region', behavior: 'presentation', name: 'Projektnotiz', semantics: { role: 'region' } },
    { id: 'label', layout: 'label', behavior: 'presentation', semantics: { role: 'group', parent: 'region' } },
    { id: 'control', layout: 'control', behavior: 'textbox', name: 'Projektnotiz', binding: 'value', capabilities: { focus: true, keys: ['native-input'] }, semantics: { role: 'group', parent: 'region' } },
    { id: 'hint', layout: 'hint', behavior: 'presentation', semantics: { role: 'group', parent: 'region' } },
    { id: 'placeholder', layout: 'placeholder', behavior: 'presentation', semantics: { role: 'group', parent: 'region' } },
  ],
});

/** Registered composition only: no code, URLs, imports or provider context is interpreted here. */
export function authoredWorkspaceScene(document: AuthoringDocument, data: WorkspaceData, snapshot: RuntimeSnapshot,
  viewport: { width: number; height: number }, _effects?: EffectSettings, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNode[] {
  const tr = (key: Parameters<typeof authoringCopy>[1]) => authoringCopy(context,key);
  const parsed = AuthoringDocumentSchema.parse(document), theme = PALETTES[parsed.accent];
  const layout = authoredLayout(parsed, viewport.width, data.modules.length, snapshot.fields.inspectorOpen === true);
  const nodes: SceneNode[] = [];
  const add = (node: SceneNodeInput) => nodes.push(SceneNodeSchema.parse(node));
  const plain = { behavior: 'presentation' as const };
  add({ id: 'authoring.document.eyebrow', kind: 'text', anatomy: { componentId: 'authoring.document', part: 'eyebrow', ...plain }, text: tr('data'),
    x: layout.padding, y: 18, width: layout.innerWidth, height: 20, textInset: 0, textInsetY: 0, fontSize: 10, textLines: 1, foreground: theme.accent });
  add({ id: 'authoring.document.title', kind: 'text', anatomy: { componentId: 'authoring.document', part: 'title', ...plain }, text: layout.title.text, label: parsed.title,
    x: layout.padding, y: 44, width: layout.innerWidth, height: layout.titleHeight, textInset: 0, textInsetY: 0, fontSize: layout.titleSize, textLines: layout.titleLines, foreground: '#e9f4f8' });

  for (const section of parsed.sections) {
    const geometry = layout.sections.find(item => item.id === section.id)!;
    const componentId = prefix(section), regionId = `${componentId}.region`;
    if (section.type === 'module-explorer') {
      add({ id: regionId, kind: 'box', anatomy: { componentId, part: 'region', ...plain }, label: tr('modules'), x: 0, y: geometry.top, width: viewport.width,
        height: geometry.height, opacity: 0, semantics: { role: 'region' } });
      // The existing explorer owns its identity, selection, command and semantic
      // composition. Embedding changes only position and permitted accent tokens.
      const explorer = workspaceScene(data, snapshot, { width: viewport.width, height: geometry.height + EXPLORER_HEADER_HEIGHT }, undefined, locale, context);
      for (const raw of explorer) {
        if (['eyebrow', 'title', 'subtitle'].includes(raw.id)) continue;
        const node = SceneNodeSchema.parse(raw);
        nodes.push({ ...node, y: node.y + geometry.top - EXPLORER_HEADER_HEIGHT,
          color: node.checked || node.pressed ? theme.fill : node.color,
          foreground: ACCENT_INKS.has(node.foreground.toLowerCase()) ? theme.accent : node.foreground,
          semantics: node.semantics?.parentId ? node.semantics : { ...node.semantics, parentId: regionId },
        });
      }
    } else if (section.type === 'metric-grid') {
      add({ id: regionId, kind: 'box', anatomy: { componentId, part: 'region', ...plain }, label: tr('metrics'), x: layout.padding, y: geometry.top, width: layout.innerWidth,
        height: geometry.height, opacity: 0, semantics: { role: 'region' } });
      const columns = Math.min(section.metrics.length, viewport.width < 550 ? 2 : 3), gap = 12, width = (layout.innerWidth - (columns - 1) * gap) / columns;
      const values = { modules: data.modules.length, sources: data.modules.reduce((sum, module) => sum + module.files, 0), dependencies: new Set(data.modules.flatMap(module => module.dependencies)).size };
      const labels = { modules: tr('modulesUnit'), sources: caseMessage(context,'table.files'), dependencies: tr('packagesUnit') };
      section.metrics.forEach((metric, index) => {
        const x = layout.padding + (index % columns) * (width + gap), y = geometry.top + Math.floor(index / columns) * 100;
        add({ id: `${componentId}.${metric}.surface`, kind: 'box', anatomy: { componentId, part: `${metric}.surface`, ...plain }, x, y, width, height: 88, color: theme.surface, radius: 14, semantics: { parentId: regionId } });
        add({ id: `${componentId}.${metric}.value`, kind: 'text', anatomy: { componentId, part: `${metric}.value`, ...plain }, text: formatNumber(context,values[metric]), x: x + 14, y: y + 12, width: width - 28, height: 32, textInset: 0, textInsetY: 0, fontSize: 24, textLines: 1, foreground: theme.accent, layer: 2, semantics: { parentId: regionId } });
        add({ id: `${componentId}.${metric}.label`, kind: 'text', anatomy: { componentId, part: `${metric}.label`, ...plain }, text: labels[metric], x: x + 14, y: y + 54, width: width - 28, height: 20, textInset: 0, textInsetY: 0, fontSize: 12, textLines: 1, foreground: theme.muted, layer: 2, semantics: { parentId: regionId } });
      });
    } else {
      const label = labelLayout(section.label, Math.max(1, layout.innerWidth - 32), 14), labelLines = label.lines, labelHeight = Math.ceil(labelLines * 14 * 1.25);
      const inputY = geometry.top + 16 + labelHeight + 12, value = String(snapshot.fields.workspaceNote ?? '');
      const parts = projectMultipartComponent(NOTE_DEFINITION, instantiateMultipartComponent(NOTE_DEFINITION, {
        id: componentId, bindings: { value: 'workspaceNote' }, names: { region: section.label, control: section.label },
        layouts: {
          region: { kind: 'box', x: layout.padding, y: geometry.top, width: layout.innerWidth, height: geometry.height, color: theme.surface, radius: 16 },
          label: { kind: 'text', text: label.text, x: layout.padding + 16, y: geometry.top + 16, width: layout.innerWidth - 32, height: labelHeight, textInset: 0, textInsetY: 0, fontSize: 14, textLines: labelLines, foreground: theme.accent, layer: 2 },
          control: { kind: 'input', text: value, x: layout.padding + 16, y: inputY, width: layout.innerWidth - 32, height: 46, color: '#101e2a', foreground: '#e9f4f8', fontSize: 14, textInset: 12, textInsetY: 12, radius: 10, sensitive: true, layer: 3 },
          placeholder: { kind: 'text', text: tr('placeholder'), x: layout.padding + 28, y: inputY + 12, width: layout.innerWidth - 56, height: 22, textInset: 0, textInsetY: 0, fontSize: 14, foreground: theme.muted, opacity: value ? 0 : 1, layer: 4 },
          hint: { kind: 'text', text: tr('privacy'), x: layout.padding + 16, y: inputY + 58, width: layout.innerWidth - 32, height: 36, textInset: 0, textInsetY: 0, fontSize: 11, textLines: 2, foreground: theme.muted, layer: 2 },
        },
      }));
      nodes.push(...parts);
    }
  }
  return nodes;
}
