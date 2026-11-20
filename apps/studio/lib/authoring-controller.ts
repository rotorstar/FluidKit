import { AuthoringDocumentSchema, AuthoringResultSchema, DEFAULT_AUTHORING_DOCUMENT, type AuthoringDocument, type AuthoringResult } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { authoredWorkspaceScene, createAuthoredWorkspaceFlow, workspaceCollectionOrder, type WorkspaceData } from '@fluidkit/cases';

export function createAuthoringController(data: WorkspaceData) {
  function immutable<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) immutable(child); }
    return value;
  }
  function createRuntime(document: AuthoringDocument) {
    return createFluidRuntime({ flow: createAuthoredWorkspaceFlow(document, data), mode: 'manual',
      projections: { workspace: (snapshot, viewport, effects, locale, context) => authoredWorkspaceScene(document, data, snapshot, viewport, effects, locale, context) },
      collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language),
    });
  }
  let document = immutable(AuthoringDocumentSchema.parse(DEFAULT_AUTHORING_DOCUMENT)), documentRevision = 0, runtime = createRuntime(document);
  let request: { id: string; documentRevision: number; runtimeRevision: number } | null = null;
  let generation = 0;
  let disposed = false;
  const retired: ReturnType<typeof createRuntime>[] = [];
  const basis = () => ({ documentRevision, runtimeRevision: runtime.getSnapshot().revision });
  function matches(value: ReturnType<typeof basis>) {
    return !disposed && value.documentRevision === documentRevision && value.runtimeRevision === runtime.getSnapshot().revision;
  }
  function validate(input: unknown) {
    const candidate = AuthoringDocumentSchema.parse(input);
    for (const next of candidate.sections) {
      const previous = document.sections.find(item => item.type === next.type);
      if (previous && previous.id !== next.id) throw new Error('Die stabile ID eines vorhandenen Bausteins darf nicht verändert werden.');
    }
    return immutable(candidate);
  }
  function prepareCandidate(input: unknown, expected: ReturnType<typeof basis>) {
    if (!matches(expected)) throw new Error('Workspace oder Dokument wurde inzwischen geändert. Bitte erneut prüfen.');
    const candidate = validate(input), interaction = runtime.getInteraction(), snapshot = runtime.getSnapshot();
    if (interaction.composingId || interaction.pressedId || runtime.getScene().some(node => node.id === interaction.focusedId && node.binding)) throw new Error('Bitte die aktive Eingabe abschließen, bevor du den Entwurf übernimmst.');
    if (String(snapshot.fields.workspaceNote ?? '').length && !candidate.sections.some(item => item.type === 'project-note')) throw new Error('Eine ausgefüllte Projektnotiz darf nicht ausgeblendet werden.');
    const next = createRuntime(candidate);
    try {
      const previousView = document.sections.find(item => item.type === 'module-explorer')!;
      const nextView = candidate.sections.find(item => item.type === 'module-explorer')!;
      const state = previousView.type === 'module-explorer' && nextView.type === 'module-explorer' && previousView.view !== nextView.view ? nextView.view : snapshot.state;
      next.configureEffects(runtime.getVisualState().settings);
      const restored = next.send('navigation.restore', { state, fields: snapshot.fields }, 'host', 'programmatic');
      if (!restored.accepted) throw new Error('Workspace-Daten können nicht verlustfrei übernommen werden.');
      for (const width of [320, 390, 768, 1280]) next.getScene({ width, height: 1000 });
    } catch (error) { next.dispose(); throw error; }
    return { document: candidate, runtime: next };
  }
  return {
    current: () => ({ document, documentRevision, runtime }), basis, matches,
    validate,
    begin(id: string, input: unknown = document) { if (disposed) throw new Error('Authoring-Controller ist geschlossen.'); const candidate = validate(input); request = { id, ...basis() }; return { schemaVersion: 1 as const, ...request, document: candidate }; },
    cancel() { request = null; generation++; },
    accept(input: AuthoringResult) {
      const result = AuthoringResultSchema.parse(input);
      if (!request || result.requestId !== request.id || !matches(request) || !matches(result)) throw new Error('Dieser Entwurf gehört zu einem überholten Zustand. Bitte neu anfordern.');
      const candidate = validate(result.document); request = null;
      return candidate;
    },
    /** Isolated GPU candidate. The caller owns and disposes this runtime. */
    preview(input: unknown, expected: ReturnType<typeof basis>) { return prepareCandidate(input, expected); },
    /** Candidate is fully prepared before a single host reference swap. */
    apply(input: unknown, expected: ReturnType<typeof basis>) {
      const prepared = prepareCandidate(input, expected);
      retired.push(runtime); runtime = prepared.runtime; document = prepared.document; documentRevision++; request = null; generation++;
      return { document, documentRevision, runtime };
    },
    token: () => generation,
    releaseRetired() { retired.splice(0).forEach(item => item.dispose()); },
    dispose() { if (disposed) return; disposed = true; request = null; generation++; runtime.dispose(); retired.splice(0).forEach(item => item.dispose()); },
  };
}
