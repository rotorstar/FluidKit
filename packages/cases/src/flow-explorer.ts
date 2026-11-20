import { type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseTranslator } from './messages';
import { defineFlow, GPU_PALETTE, type FlowDefinition, type RuntimeSnapshot, type SceneNodeInput } from '@fluidkit/contracts';
import { WorkspaceDataSchema, type WorkspaceData } from './workspace';

const STATES = ['scope','inspect','review','revise','approved'] as const;
const ACTIONS = ['review.begin','review.inspect','review.revise','review.retry','review.approve','review.restart'] as const;
function stateCopy(id: string, locale: Locale, field: 'label'|'hint'|'description') {
  const state = STATES.find(value => value === id);
  return state ? caseTranslator(locale)(`review.${state}.${field}`) : id;
}
export function architectureReviewModule(data: WorkspaceData, moduleId?: string) {
  const module = data.modules.find(item => item.id === (moduleId ?? 'core')) ?? (moduleId === undefined ? data.modules[0] : undefined);
  if (!module) throw new Error('Das referenzierte Workspace-Modul existiert nicht.');
  return module;
}
export function createArchitectureReviewFlow(input: WorkspaceData, moduleId?: string, locale: Locale = 'de'): FlowDefinition {
  const data = WorkspaceDataSchema.parse(input); architectureReviewModule(data, moduleId);
  const transitions = {
    scope: { 'review.begin': { target: 'inspect' } }, inspect: { 'review.inspect': { target: 'review' } },
    review: { 'review.revise': { target: 'revise' }, 'review.approve': { target: 'approved' } },
    revise: { 'review.retry': { target: 'inspect' } }, approved: { 'review.restart': { target: 'scope' } },
  };
  return defineFlow({ id: 'architecture-review', name: caseTranslator(locale)('review.title'), initial: 'scope',
    fields: [{ id: 'inspectedNode', initial: 'scope' }],
    states: Object.fromEntries(STATES.map(id => [id, { label: stateCopy(id, locale, 'label'), nodes: [], projection: 'architecture-review', on: {
      ...Object.fromEntries(STATES.map(selected => [`inspect.${selected}`, { target: id, assign: { inspectedNode: selected }, duration: 240 }])),
      ...Object.fromEntries(Object.entries(transitions[id as (typeof STATES)[number]]).map(([event, transition]) => [event, { ...transition, assign: { inspectedNode: transition.target }, duration: 900 }])),
    } }])) });
}
/** State-changing business edges only. Node-inspection self events remain in the full flow and trace. */
export function architectureReviewGraph(flow: FlowDefinition, locale: Locale = 'de') {
  return { nodes: Object.keys(flow.states).map(id => ({ id, label: stateCopy(id, locale, 'label') })),
    edges: Object.entries(flow.states).flatMap(([from, state]) => Object.entries(state.on).filter(([, transition]) => transition.target !== from).map(([event, transition]) => ({ id: `${from}.${event}`, from, to: transition.target, event, label: ACTIONS.some(key => key === event) ? caseTranslator(locale)(`action.${event as typeof ACTIONS[number]}`) : event }))) };
}
export function architectureReviewMermaid(flow: FlowDefinition, currentState?: string, locale: Locale = 'de') {
  const graph = architectureReviewGraph(flow, locale), ids = new Map(graph.nodes.map((node, index) => [node.id, `s${index}`]));
  const safe = (value: string) => value.replace(/["\n\r]/g, ' ');
  return ['stateDiagram-v2', '    %% Lokaler Review; Auswahl-Selbstereignisse sind hier ausgeblendet.',
    ...(currentState && flow.states[currentState] ? [`    %% Aktueller lokaler Zustand: ${safe(currentState)}`] : []),
    `    [*] --> ${ids.get(flow.initial)}`,
    ...graph.nodes.map(node => `    state "${safe(node.label)}" as ${ids.get(node.id)}`),
    ...graph.edges.map(edge => `    ${ids.get(edge.from)} --> ${ids.get(edge.to)}: ${edge.event}`),
  ].join('\n');
}
export function architectureReviewReturnUrl(moduleId: string) {
  return `/?${new URLSearchParams({ view: 'cards', sort: 'name', direction: 'asc', selected: moduleId, group: 'all' })}`;
}
export function architectureReviewLayout(width: number) {
  const compact = width < 760, padding = compact ? 18 : 32, inner = Math.max(204, width - padding * 2);
  const graphTop = compact ? 202 : 190, cardWidth = compact ? inner - 48 : Math.min(250, (inner - 100) / 3), cardHeight = 104;
  const gap = compact ? 42 : (inner - cardWidth * 3) / 2;
  const positions = compact ? Object.fromEntries(STATES.map((id, index) => [id, { x: padding + 24, y: graphTop + index * (cardHeight + gap) }])) : {
    scope: { x: padding, y: graphTop }, inspect: { x: padding + cardWidth + gap, y: graphTop }, review: { x: padding + (cardWidth + gap) * 2, y: graphTop },
    revise: { x: padding + cardWidth + gap, y: graphTop + 180 }, approved: { x: padding + (cardWidth + gap) * 2, y: graphTop + 180 },
  };
  const detailTop = compact ? graphTop + 5 * (cardHeight + gap) + 18 : graphTop + 326;
  const detailHeight = compact ? 244 : 166, actionTop = detailTop + detailHeight + 28;
  return { compact, padding, inner, graphTop, cardWidth, cardHeight, positions: positions as Record<string, { x: number; y: number }>, detailTop, detailHeight, actionTop, surfaceHeight: actionTop + (compact ? 170 : 108) };
}
export function architectureReviewHeight(width: number) { return architectureReviewLayout(width).surfaceHeight; }

export function architectureReviewScene(data: WorkspaceData, moduleId: string, flow: FlowDefinition, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[] {
  const tr = caseTranslator(context);
  const module = architectureReviewModule(data, moduleId), graph = architectureReviewGraph(flow, locale), l = architectureReviewLayout(viewport.width), p = GPU_PALETTE;
  const selected = typeof snapshot.fields.inspectedNode === 'string' && flow.states[snapshot.fields.inspectedNode] ? snapshot.fields.inspectedNode : snapshot.state;
  const nodes: SceneNodeInput[] = [];
  function add(id: string, properties: Omit<SceneNodeInput, 'id' | 'anatomy'>, componentId = id, behavior: 'presentation' | 'button' | 'status' = 'presentation') {
    nodes.push({ id, anatomy: { componentId, part: id, behavior }, color: p.surface, foreground: p.foreground, radius: 12, fontSize: 14, textInset: 16, ...properties });
  }
  function text(id: string, value: string, x: number, y: number, width: number, height: number, options: Partial<SceneNodeInput> = {}, owner?: string) {
    add(id, { kind: 'text', text: value, x, y, width, height, textInset: 0, textInsetY: 0, radius: 0, color: p.background, ...options }, owner);
  }
  function line(id: string, x1: number, y1: number, x2: number, y2: number, color: string, arrow = false) {
    const length = Math.hypot(x2 - x1, y2 - y1); if (!length) return;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    add(id, { kind: 'box', x: (x1 + x2) / 2 - length / 2, y: (y1 + y2) / 2 - 1, width: length, height: 2, rotation: angle, color, radius: 1, layer: -1 });
    if (arrow) for (const [index, sign] of [-1, 1].entries()) {
      const a = angle + sign * Math.PI / 5, endX = x2 - Math.cos(a) * 7, endY = y2 - Math.sin(a) * 7;
      line(`${id}.arrow${index}`, endX, endY, x2, y2, color);
    }
  }
  text('review.eyebrow', tr('review.heading'), l.padding, 24, l.inner, 20, { foreground: p.accent, fontSize: 11 });
  text('review.module', module.id, l.padding, 57, l.inner, 40, { fontSize: l.compact ? 28 : 34 });
  text('review.metrics', tr('review.metrics',{files:module.files,lines:module.lines}), l.padding, 111, l.inner, 24, { foreground: p.muted, fontSize: 13 });
  text('review.graph.label', tr('review.path'), l.padding, l.graphTop - 39, l.inner, 20, { foreground: p.muted, fontSize: 11 });
  for (const edge of graph.edges) {
    const from = l.positions[edge.from]!, to = l.positions[edge.to]!, color = edge.from === snapshot.state ? p.accent : p.border;
    const left = l.padding + 7, right = viewport.width - l.padding - 7;
    if (l.compact) {
      if (edge.from === 'revise' || edge.from === 'approved') {
        const track = edge.from === 'approved' ? right : left;
        const sx = edge.from === 'approved' ? from.x + l.cardWidth : from.x, tx = edge.from === 'approved' ? to.x + l.cardWidth : to.x;
        line(`${edge.id}.a`, sx, from.y + 65, track, from.y + 65, color);
        line(`${edge.id}.b`, track, from.y + 65, track, to.y + 65, color);
        line(`${edge.id}.c`, track, to.y + 65, tx, to.y + 65, color, true);
      } else if (edge.to === 'approved') {
        const track = viewport.width - l.padding;
        line(`${edge.id}.a`, from.x + l.cardWidth, from.y + 38, track, from.y + 38, color);
        line(`${edge.id}.b`, track, from.y + 38, track, to.y + 38, color);
        line(`${edge.id}.c`, track, to.y + 38, to.x + l.cardWidth, to.y + 38, color, true);
      } else line(`${edge.id}.main`, from.x + l.cardWidth / 2, from.y + l.cardHeight, to.x + l.cardWidth / 2, to.y, color, true);
    } else if (edge.from === 'approved') {
      const y = l.graphTop + 306;
      line(`${edge.id}.a`, from.x + l.cardWidth / 2, from.y + l.cardHeight, from.x + l.cardWidth / 2, y, color);
      line(`${edge.id}.b`, from.x + l.cardWidth / 2, y, to.x + l.cardWidth / 2, y, color);
      line(`${edge.id}.c`, to.x + l.cardWidth / 2, y, to.x + l.cardWidth / 2, to.y + l.cardHeight, color, true);
    } else if (edge.from === 'review' && edge.to === 'revise') {
      const y = l.graphTop + 144;
      line(`${edge.id}.a`, from.x + l.cardWidth / 3, from.y + l.cardHeight, from.x + l.cardWidth / 3, y, color);
      line(`${edge.id}.b`, from.x + l.cardWidth / 3, y, to.x + l.cardWidth * .7, y, color);
      line(`${edge.id}.c`, to.x + l.cardWidth * .7, y, to.x + l.cardWidth * .7, to.y, color, true);
    } else if (from.y === to.y) line(`${edge.id}.main`, from.x + l.cardWidth, from.y + 52, to.x, to.y + 52, color, true);
    else line(`${edge.id}.main`, from.x + l.cardWidth / 2, from.y + (to.y > from.y ? l.cardHeight : 0), to.x + l.cardWidth / 2, to.y + (to.y > from.y ? 0 : l.cardHeight), color, true);
  }
  graph.nodes.forEach((node, index) => {
    const position = l.positions[node.id]!, active = node.id === snapshot.state, inspected = node.id === selected, owner = `review.state.${node.id}`;
    add(owner, { kind: 'button', text: node.label, label: tr(active?'review.activeName':'review.inspectName',{name:node.label}), onActivate: `inspect.${node.id}`, pressed: inspected, ...position, width: l.cardWidth, height: l.cardHeight, color: active ? p.selected : p.surface, fontSize: l.compact ? 18 : 17, textInsetY: 37, textLines: 1 }, owner, 'button');
    text(`${owner}.number`, `${String(index + 1).padStart(2, '0')}${active ? tr('review.current') : ''}`, position.x + 16, position.y + 12, l.cardWidth - 32, 16, { fontSize: 11, foreground: active ? p.accent : p.muted, layer: 1 }, owner);
    text(`${owner}.hint`, stateCopy(node.id, locale, 'hint'), position.x + 16, position.y + 76, l.cardWidth - 32, 17, { fontSize: 11, foreground: p.muted, layer: 1 }, owner);
    if (inspected) add('review.inspection-marker', { kind: 'box', x: position.x + 16, y: position.y + l.cardHeight - 3, width: l.cardWidth - 32, height: 3, color: p.accent, radius: 1, layer: 2 });
  });
  const activePosition = l.positions[snapshot.state]!;
  add('review.active-cursor', { kind: 'box', x: activePosition.x + l.cardWidth - 23, y: activePosition.y + 15, width: 8, height: 8, radius: 4, color: p.accent, layer: 2 });
  add('review.details', { kind: 'surface', x: l.padding, y: l.detailTop, width: l.inner, height: l.detailHeight, color: p.surface, semantics: { role: 'region' }, label: tr('review.node') });
  text('review.details.overline', tr('review.explore'), l.padding + 18, l.detailTop + 18, l.inner - 36, 16, { fontSize: 11, foreground: p.muted }, 'review.details');
  text('review.details.title', stateCopy(selected,locale,'label'), l.padding + 18, l.detailTop + 46, l.inner - 36, 30, { fontSize: 23 }, 'review.details');
  text('review.details.body', stateCopy(selected, locale, 'description'), l.padding + 18, l.detailTop + 88, l.inner - 36, l.detailHeight - 100, { fontSize: 14, textLines: l.compact ? 7 : 3 }, 'review.details');
  text('review.actions.label', tr('review.step',{state:stateCopy(snapshot.state,locale,'label').toLocaleUpperCase(locale)}), l.padding, l.actionTop, l.inner, 20, { fontSize: 11, foreground: p.muted });
  graph.edges.filter(edge => edge.from === snapshot.state).forEach((edge, index, actions) => {
    const gap = 12, width = l.compact ? l.inner : (l.inner - gap * (actions.length - 1)) / actions.length;
    add(`review.action.${edge.event}`, { kind: 'button', text: edge.label, onActivate: edge.event, x: l.padding + (l.compact ? 0 : index * (width + gap)), y: l.actionTop + 34 + (l.compact ? index * 58 : 0), width, height: 46, color: index === actions.length - 1 ? p.selected : p.surfaceRaised, fontSize: 14 }, 'review.actions', 'button');
  });
  return nodes;
}
