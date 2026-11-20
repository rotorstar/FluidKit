import { describe, expect, it, vi } from 'vitest';
import { AuthoringDocumentSchema, AuthoringResultSchema, DEFAULT_AUTHORING_DOCUMENT } from '@fluidkit/contracts';
import { WorkspaceDataSchema, authoredWorkspaceScene, createAuthoredWorkspaceFlow } from '@fluidkit/cases';
import { createFluidRuntime } from '@fluidkit/core';
import { createAuthoringController } from '../../apps/studio/lib/authoring-controller';

const fixture = () => WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'authoring-controller-test', capturedAt: '2026-11-13T10:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 3, lines: 100, dependencies: ['zod'], internal: [] },
  { id: 'react', name: '@test/react', version: '1', group: 'Adapter', files: 2, lines: 50, dependencies: ['react'], internal: ['core'] },
] });
const document = () => AuthoringDocumentSchema.parse(DEFAULT_AUTHORING_DOCUMENT);
const result = (request: { id: string; documentRevision: number; runtimeRevision: number }) => AuthoringResultSchema.parse({
  schemaVersion: 1, requestId: request.id, documentRevision: request.documentRevision, runtimeRevision: request.runtimeRevision, document: document(),
  provenance: { sdk: 'ai@7.0.159', provider: 'openai', model: 'explicit-test-model', resolvedModel: 'explicit-test-model', responseId: 'explicit-test-response',
    policyVersion: 'fixture-1', pricingVersion: 'fixture-1', startedAt: '2026-11-13T10:00:00Z', durationMs: 20, inputTokens: 10, outputTokens: 20,
    reservationUsd: .1, chargedUpperEstimateUsd: .01, scope: 'local-process', coverage: 'registered-workspace-composition' },
});

describe('atomic host adoption of an authoring document', () => {
  it('uses the validated visible draft as AI basis without applying or persisting runtime fields', () => {
    const controller = createAuthoringController(fixture());
    try {
      const draft = { ...document(), title: 'Visible draft edited before AI', accent: 'indigo' };
      const request = controller.begin('visible-draft', draft);
      expect(request.document.title).toBe(draft.title); expect(request.document.accent).toBe('indigo');
      expect(controller.current().document.title).toBe(DEFAULT_AUTHORING_DOCUMENT.title);
      expect(() => controller.begin('bad', { ...draft, code: 'forbidden' })).toThrow();
    } finally { controller.dispose(); }
  });
  it('prepares an isolated interactive preview with identical fields, without swapping or invalidating the canonical runtime', () => {
    const controller = createAuthoringController(fixture()), original = controller.current();
    original.runtime.send('field.change', { fieldId: 'workspaceNote', value: 'Original dirty note' });
    original.runtime.send('collection.change', { collectionId: 'modules', keys: ['react'] });
    const basis = controller.basis(), token = controller.token(), candidate = document(); candidate.accent = 'amber';
    const explorer = candidate.sections.find(section => section.type === 'module-explorer')!;
    if (explorer.type !== 'module-explorer') throw new Error('Missing explorer'); explorer.view = 'table';
    const preview = controller.preview(candidate, basis);
    try {
      expect(preview.runtime).not.toBe(original.runtime); expect(preview.document.accent).toBe('amber');
      expect(preview.runtime.getSnapshot().state).toBe('table');
      expect(preview.runtime.getSnapshot().fields).toEqual(original.runtime.getSnapshot().fields);
      preview.runtime.send('field.change', { fieldId: 'workspaceNote', value: 'Preview-only edit' });
      preview.runtime.send('collection.change', { collectionId: 'modules', keys: ['core'] });
      expect(original.runtime.getSnapshot().fields).toMatchObject({ workspaceNote: 'Original dirty note', selection: ['react'] });
      expect(controller.current()).toEqual(original); expect(controller.basis()).toEqual(basis); expect(controller.token()).toBe(token);
    } finally { preview.runtime.dispose(); controller.dispose(); }
  });
  it('prepares a complete new runtime, preserves all domain fields/effects, then swaps one document reference', () => {
    const controller = createAuthoringController(fixture()), old = controller.current().runtime;
    old.send('field.change', { fieldId: 'query', value: 'core' });
    old.send('field.change', { fieldId: 'workspaceNote', value: 'Nicht verlieren 東京' });
    old.send('collection.change', { collectionId: 'modules', keys: ['core'] });
    old.send('sort.files.desc'); old.send('inspector.open'); old.send('select.core');
    old.configureEffects({ ...old.getVisualState().settings, effect: { id: 'silk-cascade', version: '1.0.0' } });
    const before = old.getSnapshot(), candidate = document(); candidate.accent = 'indigo'; candidate.sections.reverse();
    const applied = controller.apply(candidate, controller.basis());
    expect(applied.documentRevision).toBe(1); expect(applied.runtime).not.toBe(old);
    expect(applied.runtime.getSnapshot().fields).toEqual(before.fields); expect(applied.runtime.getSnapshot().state).toBe('detail');
    expect(applied.runtime.getVisualState().settings).toEqual(old.getVisualState().settings);
    expect(old.getDiagnostics().disposed).toBe(false);
    controller.releaseRetired(); expect(old.getDiagnostics().disposed).toBe(true);
    expect(applied.runtime.getScene().find(node => node.binding === 'workspaceNote')).toMatchObject({ text: 'Nicht verlieren 東京', sensitive: true });
    controller.dispose();
  });

  it('keeps existing identities immutable and rejects renaming or hiding a dirty note without changing active state', () => {
    const controller = createAuthoringController(fixture()), current = controller.current();
    expect(() => { current.document.title = 'Mutated behind revision'; }).toThrow();
    expect(() => current.document.sections.reverse()).toThrow();
    const renamed = document(); renamed.sections[0]!.id = 'replacement';
    expect(() => controller.apply(renamed, controller.basis())).toThrow('stabile ID');
    current.runtime.send('field.change', { fieldId: 'workspaceNote', value: 'Dirty value' });
    const hidden = document(); hidden.sections = hidden.sections.filter(section => section.type !== 'project-note');
    expect(() => controller.apply(hidden, controller.basis())).toThrow('Projektnotiz');
    expect(controller.current()).toEqual({ ...current, runtime: current.runtime });
    expect(current.runtime.getSnapshot().fields.workspaceNote).toBe('Dirty value'); controller.dispose();
  });

  it('blocks active text input/composition/press and stale bases before adoption', () => {
    const controller = createAuthoringController(fixture()), { runtime } = controller.current(), basis = controller.basis();
    const input = runtime.getScene().find(node => node.binding === 'workspaceNote')!;
    for (const interaction of [{ focusedId: input.id }, { composingId: input.id }, { pressedId: 'module-core' }]) {
      runtime.setInteraction(interaction);
      expect(() => controller.apply(document(), basis)).toThrow('aktive Eingabe');
      expect(controller.current().documentRevision).toBe(0);
      runtime.setInteraction({ focusedId: null, composingId: null, pressedId: null });
    }
    runtime.send('field.change', { fieldId: 'workspaceNote', value: 'New input' });
    expect(() => controller.apply(document(), basis)).toThrow('inzwischen geändert');
    expect(controller.current().runtime).toBe(runtime); controller.dispose();
  });

  it('rejects canceled, replaced and late model results without applying their content', () => {
    const controller = createAuthoringController(fixture());
    const canceled = controller.begin('one'); controller.cancel(); expect(() => controller.accept(result(canceled))).toThrow('überholten');
    const replaced = controller.begin('two'); controller.begin('three'); expect(() => controller.accept(result(replaced))).toThrow('überholten');
    const stale = controller.begin('four'); controller.current().runtime.send('field.change', { fieldId: 'workspaceNote', value: 'User wins' });
    expect(() => controller.accept(result(stale))).toThrow('überholten');
    const fresh = controller.begin('five'), candidate = controller.accept(result(fresh));
    expect(candidate).toEqual(document()); expect(controller.current().documentRevision).toBe(0);
    expect(controller.current().runtime.getSnapshot().fields.workspaceNote).toBe('User wins'); controller.dispose();
  });

  it('keeps the old runtime alive on failed preparation and cannot resurrect after disposal', () => {
    const data = fixture(), controller = createAuthoringController(data), before = controller.current(), basis = controller.basis();
    // Simulate an unavailable host dataset while constructing the candidate.
    const modules = data.modules;
    Object.defineProperty(data, 'modules', { configurable: true, get() { throw new Error('Host data unavailable'); } });
    expect(() => controller.apply(document(), basis)).toThrow('Host data unavailable');
    Object.defineProperty(data, 'modules', { value: modules, configurable: true });
    expect(controller.current()).toEqual(before); expect(before.runtime.getDiagnostics().disposed).toBe(false);
    controller.dispose();
    expect(controller.matches(basis)).toBe(false);
    expect(() => controller.begin('late')).toThrow('geschlossen');
    expect(() => controller.apply(document(), basis)).toThrow('inzwischen geändert');
    expect(before.runtime.getDiagnostics().disposed).toBe(true); controller.dispose();
  });

  it('restores authored replay state without invoking host actions or navigation', async () => {
    const data = fixture(), doc = document(), flow = createAuthoredWorkspaceFlow(doc, data), host = vi.fn(async () => {}), navigate = vi.fn();
    flow.states.cards!.on['view.table']!.action = 'host';
    const runtime = createFluidRuntime({ flow, replay: true, actions: { host }, router: { navigate }, projections: { workspace: (snapshot, viewport, settings) => authoredWorkspaceScene(doc, data, snapshot, viewport, settings) } });
    expect(runtime.send('navigation.restore', { state: 'table', fields: { workspaceNote: 'Replay-only local content' } }, 'host').accepted).toBe(true);
    expect(runtime.send('view.cards', {}, 'replay').accepted).toBe(true);
    expect(runtime.send('view.table', {}, 'replay').accepted).toBe(true);
    await Promise.resolve(); expect(host).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled(); runtime.dispose();
  });
});
