import { LOCALES, type Locale } from '@fluidkit/i18n';
import { caseTranslator } from './messages';
import { GPU_PALETTE, defineFlow, type FlowDefinition } from '@fluidkit/contracts';

/** A real project is supplied by the host. Only event timing is simulated. */
export function createProjectProof(projectName: string, locale: Locale = 'de'): FlowDefinition {
  const tr = caseTranslator(locale);
  const label = { id: 'heading', anatomy: { componentId: 'project', part: 'label', behavior: 'presentation' as const }, kind: 'text' as const, text: tr('proof.heading'), x: 38, y: 34, width: 560, height: 48, color: GPU_PALETTE.background, foreground: GPU_PALETTE.foreground, radius: 0 };
  const caption = { id: 'caption', anatomy: { componentId: 'project', part: 'description', behavior: 'presentation' as const }, kind: 'text' as const, text: tr('proof.caption'), x: 38, y: 80, width: 560, height: 42, color: GPU_PALETTE.background, foreground: GPU_PALETTE.muted, radius: 0 };
  const name = { id: 'project-name', anatomy: { componentId: 'project-name', part: 'control', behavior: 'textbox' as const }, kind: 'input' as const, text: projectName, binding: 'projectName', label: tr('proof.name'), x: 38, y: 166, width: 360, height: 54, color: GPU_PALETTE.surface, foreground: GPU_PALETTE.foreground };
  const common = [label, caption, name];
  return defineFlow({ id: 'project-proof', name: tr('proof.title'), initial: 'ready', fields: [{ id: 'projectName', initial: projectName }, { id: 'report', initial: tr('proof.initialReport') }], states: {
    ready: { label: tr('proof.ready'), route: '/proof/ready', nodes: [...common,
      { id: 'morph', anatomy: { componentId: 'validation', part: 'trigger', behavior: 'button' }, kind: 'button', text: tr('proof.start'), label: tr('proof.startLabel'), x: 38, y: 262, width: 230, height: 58, color: GPU_PALETTE.accent, foreground: GPU_PALETTE.background, onActivate: 'validation.start' },
      { id: 'hint', anatomy: { componentId: 'validation', part: 'description', behavior: 'presentation' }, kind: 'text', text: tr('proof.hint'), x: 38, y: 370, width: 560, height: 52, color: GPU_PALETTE.background, foreground: GPU_PALETTE.muted, radius: 0 },
    ], on: { 'validation.start': { target: 'validating' }, 'detail.open': { target: 'detail', aiAllowed: true } } },
    validating: { label: tr('proof.validating'), route: '/proof/validating', nodes: [...common,
      { id: 'morph', anatomy: { componentId: 'validation', part: 'indicator', behavior: 'progressbar' }, kind: 'progress', text: tr('proof.progress'), x: 38, y: 270, width: 560, height: 44, color: GPU_PALETTE.selected, foreground: GPU_PALETTE.foreground, progress: 0.65 },
      { id: 'hint', anatomy: { componentId: 'validation', part: 'description', behavior: 'presentation' }, kind: 'text', text: tr('proof.running'), x: 38, y: 370, width: 560, height: 60, color: GPU_PALETTE.background, foreground: GPU_PALETTE.muted, radius: 0 },
    ], on: { 'validation.complete': { target: 'result' }, 'validation.failed': { target: 'failed' }, 'reset': { target: 'ready' } } },
    result: { label: tr('proof.result'), route: '/proof/result', nodes: [label, caption, name,
      { id: 'morph', anatomy: { componentId: 'validation', part: 'content', behavior: 'status' }, kind: 'card', binding: 'report', text: '', x: 38, y: 252, width: 560, height: 126, color: GPU_PALETTE.selected, foreground: GPU_PALETTE.foreground, radius: 22 },
      { id: 'detail', anatomy: { componentId: 'detail', part: 'trigger', behavior: 'button' }, kind: 'button', text: tr('proof.details'), x: 38, y: 406, width: 240, height: 54, color: GPU_PALETTE.surfaceRaised, onActivate: 'detail.open' },
      { id: 'again', anatomy: { componentId: 'reset', part: 'trigger', behavior: 'button' }, kind: 'button', text: tr('proof.again'), x: 300, y: 406, width: 180, height: 54, color: GPU_PALETTE.surface, onActivate: 'reset' },
    ], on: { 'detail.open': { target: 'detail', aiAllowed: true }, 'reset': { target: 'ready' } } },
    detail: { label: tr('proof.detail'), route: '/proof/detail', nodes: [label, caption,
      { id: 'project-name', anatomy: { componentId: 'project-name', part: 'control', behavior: 'textbox' as const }, kind: 'input', binding: 'projectName', text: '', label: tr('proof.name'), x: 38, y: 150, width: 560, height: 54, color: GPU_PALETTE.surface },
      { id: 'morph', anatomy: { componentId: 'validation', part: 'content', behavior: 'status' }, kind: 'card', text: tr('proof.body'), x: 38, y: 238, width: 560, height: 152, color: GPU_PALETTE.surfaceRaised, radius: 24 },
      { id: 'again', anatomy: { componentId: 'reset', part: 'trigger', behavior: 'button' }, kind: 'button', text: tr('proof.back'), x: 38, y: 422, width: 260, height: 54, color: GPU_PALETTE.accent, foreground: GPU_PALETTE.background, onActivate: 'reset' },
    ], on: { 'reset': { target: 'ready' } } },
    failed: { label: tr('proof.failed'), nodes: [label, name, { id: 'morph', anatomy: { componentId: 'validation', part: 'content', behavior: 'status' }, kind: 'card', text: '', binding: 'report', x: 38, y: 252, width: 560, height: 130, color: '#5c3037' }, { id: 'again', anatomy: { componentId: 'reset', part: 'trigger', behavior: 'button' }, kind: 'button', text: tr('proof.retry'), x: 38, y: 420, width: 240, height: 54, onActivate: 'reset' }], on: { 'reset': { target: 'ready' } } },
  } });
}
/** Keep the canonical proof and field bindings when the host changes presentation language. */
export function projectProofOptions(flow: FlowDefinition) {
  if (flow.id !== 'project-proof') return {flow};
  const projectName = String(flow.fields.find(field => field.id === 'projectName')?.initial ?? '');
  const templates = new Map(LOCALES.map(language => [language, createProjectProof(projectName, language)]));
  return {
    flow: {...flow, states: Object.fromEntries(Object.entries(flow.states).map(([id,state]) => [id,{...state,projection:'project-proof'}]))},
    projections: { 'project-proof': (snapshot: {state:string}, _viewport: unknown, _effects: unknown, language: Locale) => {
      const target = templates.get(language)?.states[snapshot.state]?.nodes ?? [];
      const originals = [...templates.values()].flatMap(template => template.states[snapshot.state]?.nodes ?? []);
      return flow.states[snapshot.state]!.nodes.map(node => {
        const localized = target.find(item => item.id === node.id);
        if (!localized) return node;
        const recognized = originals.filter(item => item.id === node.id);
        return {...node,
          text: recognized.some(item => item.text === node.text) ? localized.text : node.text,
          label: recognized.some(item => item.label === node.label) ? localized.label : node.label,
        };
      });
    } },
  };
}
export * from './workspace';
export * from './workspace-layout';
export * from './simulation';
export * from './simulation-flow';
export * from './workspace-story';
export * from './authoring';

// Executable local Architecture Review (M9).
export * from './flow-explorer';

export * from './workspace-compare';
export * from './workspace-atlas';

export { caseMessage, caseCatalogFingerprint } from './messages';
