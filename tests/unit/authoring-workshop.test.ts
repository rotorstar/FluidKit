// @vitest-environment jsdom
import { act, createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FluidRuntime } from '@fluidkit/core';
import { AuthoringDocumentSchema, AuthoringRequestSchema, AuthoringResultSchema, DEFAULT_AUTHORING_DOCUMENT, DevelopmentProposalRequestSchema, type AuthoringRequest } from '@fluidkit/contracts';
import type { WorkspaceData } from '@fluidkit/cases';
import { workspaceDatasetHash } from '../../packages/server/src/local-project';
import { createDevelopmentProposal } from '../../packages/server/src/development-proposal';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { AuthoringWorkshop } from '../../apps/studio/components/authoring-workshop';

const port = vi.hoisted(() => ({ active: null as FluidRuntime | null, seen: new Set<FluidRuntime>() }));
// Qualify the real UI/controller/Core boundary. jsdom substitutes only the GPU
// port and unrelated effect controls; it does not prove rendering/native input.
vi.mock('@fluidkit/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@fluidkit/react')>();
  return { ...actual, FluidSurface: function ProjectionPort() {
    const { runtime, snapshot } = actual.useFluid();
    const nodes = runtime.getScene({ width: 1000, height: 1600 });
    useEffect(() => { port.active = runtime; port.seen.add(runtime); return () => { if (port.active === runtime) port.active = null; }; }, [runtime]);
    return createElement('div', { 'data-test-projection': true, 'data-state': snapshot.state, 'data-node-count': nodes.length });
  } };
});
vi.mock('../../apps/studio/components/local-draft-library', () => ({ LocalDraftLibrary: () => null }));
vi.mock('../../apps/studio/components/effect-lab', () => ({ EffectLab: () => null, EffectTransport: () => null }));

let data: WorkspaceData;
const originalAnimations = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations');
beforeAll(async () => { data = await readWorkspace(process.cwd()); });
beforeEach(() => {
  port.active = null; port.seen.clear();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalAnimations) Object.defineProperty(Element.prototype, 'getAnimations', originalAnimations);
  else Reflect.deleteProperty(Element.prototype, 'getAnimations');
});
function control(host: HTMLElement, name: string) {
  const result = [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === name);
  if (!result) throw new Error(`Missing button ${name}`); return result;
}
function documentInput(host: HTMLElement) {
  const result = host.querySelector<HTMLTextAreaElement>('[aria-label="Authoring-Dokument"]');
  if (!result) throw new Error('Missing authoring input'); return result;
}
async function edit(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function current() { if (!port.active) throw new Error('Missing runtime projection'); return port.active; }
function configuration(configured: boolean) { return Response.json({ configured, token: 'a'.repeat(48), policy: { model: 'fixture-provider', sessionUsd: .35 } }); }
function requestBody(init: RequestInit | undefined): unknown {
  if (typeof init?.body !== 'string') throw new Error('Expected explicit JSON transport'); return JSON.parse(init.body);
}
function preflightResponse(input: unknown) {
  const request = DevelopmentProposalRequestSchema.parse(input);
  return Response.json(createDevelopmentProposal({ ...request, data }));
}
function envelope(input: unknown) {
  if (typeof input !== 'object' || input === null || !('operation' in input) || !('input' in input)) throw new Error('Missing transport envelope');
  return input;
}
async function mount() {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(createElement(AuthoringWorkshop, { data, datasetHash: workspaceDatasetHash(data) })));
  return { host, cleanup: async () => { await act(async () => root.unmount()); host.remove(); } };
}
function complete(request: AuthoringRequest) {
  return { type: 'complete', result: AuthoringResultSchema.parse({ schemaVersion: 1, requestId: request.id,
    documentRevision: request.documentRevision, runtimeRevision: request.runtimeRevision,
    document: { ...DEFAULT_AUTHORING_DOCUMENT, title: 'Late fixture result' },
    provenance: { sdk: 'ai@7.0.159', provider: 'openai', model: 'fixture-provider', resolvedModel: 'fixture-provider', responseId: 'fixture-only', policyVersion: 'fixture-1', pricingVersion: 'fixture-1',
      startedAt: '2026-11-13T10:00:00Z', durationMs: 1, inputTokens: 1, outputTokens: 1, reservationUsd: .05, chargedUpperEstimateUsd: .001, scope: 'local-process', coverage: 'registered-workspace-composition' },
  }) };
}

describe('Authoring UI authority and candidate lifecycle', () => {
  it.each(['unknown-component', 'syntax'] as const)('shows concise actionable feedback for %s without sending or applying the invalid document', async invalid => {
    const fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(false);
      throw new Error('Invalid local documents must not reach the server');
    });
    vi.stubGlobal('fetch', fetch);
    const app = await mount(), original = current(), snapshot = original.getSnapshot();
    try {
      const input = invalid === 'syntax' ? '{ "private-value": "PRIVATE-INPUT", '
        : JSON.stringify({ ...DEFAULT_AUTHORING_DOCUMENT, sections: [{ ...DEFAULT_AUTHORING_DOCUMENT.sections[0], type: 'unknown-widget-PRIVATE-INPUT' }, ...DEFAULT_AUTHORING_DOCUMENT.sections.slice(1)] });
      await edit(documentInput(app.host), input);
      await act(async () => control(app.host, 'Entwurf prüfen').click());
      const message = app.host.querySelector('[role="status"]')?.textContent ?? '';
      expect(message.length).toBeGreaterThan(30); expect(message.length).toBeLessThan(220);
      expect(message).toContain(invalid === 'syntax' ? 'Prüfe Anführungszeichen, Kommas und Klammern' : 'Baustein 1 ist ungültig. Nutze registrierte Bausteine');
      expect(message).not.toContain('PRIVATE-INPUT'); expect(message).not.toContain('invalid_union'); expect(message).not.toContain('"code"');
      expect(fetch.mock.calls.filter(([, init]) => init?.method)).toHaveLength(0);
      expect(app.host.querySelector('[aria-label="Preflight"]')).toBeNull();
      expect(current()).toBe(original); expect(original.getSnapshot()).toBe(snapshot);
    } finally { await app.cleanup(); }
  });

  it.each(['Entwurf visuell ansehen', 'Entwurf übernehmen'])('preserves the explicit dirty-note guard for %s', async operation => {
    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(false);
      const request = envelope(requestBody(init)); expect(request.operation).toBe('preflight');
      return preflightResponse(request.input);
    }));
    const app = await mount(), original = current();
    try {
      await act(async () => { original.send('field.change', { fieldId: 'workspaceNote', value: 'Preserve my local note' }); });
      const snapshot = original.getSnapshot();
      await edit(documentInput(app.host), JSON.stringify({ ...DEFAULT_AUTHORING_DOCUMENT, sections: DEFAULT_AUTHORING_DOCUMENT.sections.filter(section => section.type !== 'project-note') }));
      await act(async () => control(app.host, 'Entwurf prüfen').click());
      expect(control(app.host, operation).disabled).toBe(false);
      await act(async () => control(app.host, operation).click());
      expect(app.host.querySelector('[role="status"]')?.textContent).toBe('Eine ausgefüllte Projektnotiz darf nicht ausgeblendet werden.');
      expect(current()).toBe(original); expect(original.getSnapshot()).toBe(snapshot);
    } finally { await app.cleanup(); }
  }, 15000);

  it('keeps manual preflight and explicit adoption available without a configured provider', async () => {
    const operations: unknown[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(false);
      const body = envelope(requestBody(init)); operations.push(body.operation);
      if (body.operation !== 'preflight') throw new Error('Unexpected provider call');
      return preflightResponse(body.input);
    }));
    const app = await mount(); const original = current();
    try {
      expect(control(app.host, 'AI-Entwurf erstellen').disabled).toBe(true);
      expect(control(app.host, 'Entwurf prüfen').disabled).toBe(false);
      const candidate = { ...DEFAULT_AUTHORING_DOCUMENT, title: 'Manuell geprüft' };
      await edit(documentInput(app.host), JSON.stringify(candidate));
      await act(async () => control(app.host, 'Entwurf prüfen').click());
      expect(app.host.querySelector('[aria-label="Preflight"]')).not.toBeNull();
      expect(control(app.host, 'Entwurf übernehmen').disabled).toBe(false);
      expect(current()).toBe(original);
      await act(async () => control(app.host, 'Entwurf übernehmen').click());
      expect(current()).not.toBe(original);
      expect(original.getDiagnostics().disposed).toBe(true);
      expect(current().getScene().some(node => node.text === candidate.title)).toBe(true);
      expect(operations).toEqual(['preflight']);
    } finally { await app.cleanup(); }
    expect([...port.seen].every(runtime => runtime.getDiagnostics().disposed)).toBe(true);
  }, 15000);

  it.each(['cancel', 'prompt-edit'] as const)('refuses a late complete stream after %s even when transport ignores Abort', async method => {
    let request: AuthoringRequest | undefined, writer: ReadableStreamDefaultController<Uint8Array> | undefined;
    let signal: AbortSignal | null | undefined;
    let markRequestStarted: () => void = () => {};
    const requestStarted = new Promise<void>(resolve => { markRequestStarted = resolve; });
    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(true);
      const body = envelope(requestBody(init)); expect(body.operation).toBe('generate');
      request = AuthoringRequestSchema.parse(body.input); signal = init.signal; markRequestStarted();
      return new Response(new ReadableStream<Uint8Array>({ start(controller) { writer = controller; } }));
    }));
    const app = await mount(); const original = current();
    try {
      await act(async () => { control(app.host, 'AI-Entwurf erstellen').click(); await requestStarted; });
      expect(request).toBeDefined();
      if (method === 'cancel') await act(async () => control(app.host, 'Abbrechen').click());
      else await edit(app.host.querySelector<HTMLTextAreaElement>('textarea')!, 'A newer user prompt');
      expect(signal?.aborted).toBe(true);
      const mine = { ...DEFAULT_AUTHORING_DOCUMENT, title: 'User input wins' };
      await edit(documentInput(app.host), JSON.stringify(mine));
      await act(async () => { writer!.enqueue(new TextEncoder().encode(`${JSON.stringify(complete(request!))}\n`)); writer!.close(); });
      expect(AuthoringDocumentSchema.parse(JSON.parse(documentInput(app.host).value))).toEqual(mine);
      expect(app.host.textContent).not.toContain('Late fixture result');
      expect([...app.host.querySelectorAll('summary')].some(node => node.textContent === 'AI-Nachweis')).toBe(false);
      expect(current()).toBe(original); expect(original.getSnapshot().revision).toBe(0);
    } finally { await app.cleanup(); }
  });

  it('isolates candidate interactions and disposes the discarded candidate without disposing the active Core', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(false);
      return preflightResponse(envelope(requestBody(init)).input);
    }));
    const app = await mount(); const original = current(); let preview: FluidRuntime | undefined;
    try {
      const first = data.modules[0]!.id, second = data.modules[1]!.id;
      await act(async () => {
        expect(original.send('collection.change', { collectionId: 'modules', keys: [first] }).accepted).toBe(true);
        expect(original.send('field.change', { fieldId: 'workspaceNote', value: 'Active local test note' }).accepted).toBe(true);
      });
      await edit(documentInput(app.host), JSON.stringify({ ...DEFAULT_AUTHORING_DOCUMENT, accent: 'amber' }));
      await act(async () => control(app.host, 'Entwurf prüfen').click());
      await act(async () => control(app.host, 'Entwurf visuell ansehen').click());
      preview = current(); expect(preview).not.toBe(original);
      expect(app.host.textContent).toContain('Isolierter Entwurf · noch nicht übernommen');
      expect(preview.getSnapshot().fields.selection).toEqual([first]);
      await act(async () => {
        preview!.send('collection.change', { collectionId: 'modules', keys: [second] });
        preview!.send('field.change', { fieldId: 'workspaceNote', value: 'Candidate-only note' });
      });
      await act(async () => control(app.host, 'Aktiven Workspace ansehen').click());
      expect(current()).toBe(original);
      expect(original.getSnapshot().fields).toMatchObject({ selection: [first], workspaceNote: 'Active local test note' });
      expect(preview.getDiagnostics().disposed).toBe(false);
      await act(async () => control(app.host, 'Entwurf verwerfen').click());
      expect(preview.getDiagnostics().disposed).toBe(true);
      expect(original.getDiagnostics().disposed).toBe(false);
      expect(app.host.textContent).not.toContain('Entwurf ansehen');
    } finally { await app.cleanup(); }
    expect(original.getDiagnostics().disposed).toBe(true);
  }, 15000);

  it('does not authorize a preflight response for a document edited while the request was pending', async () => {
    let deliver: ((response: Response) => void) | undefined, input: unknown;
    vi.stubGlobal('fetch', vi.fn(async (_url: unknown, init?: RequestInit) => {
      if (!init?.method) return configuration(false);
      input = envelope(requestBody(init)).input;
      return new Promise<Response>(resolve => { deliver = resolve; });
    }));
    const app = await mount(); const original = current();
    try {
      await act(async () => control(app.host, 'Entwurf prüfen').click());
      expect(deliver).toBeDefined();
      await edit(documentInput(app.host), JSON.stringify({ ...DEFAULT_AUTHORING_DOCUMENT, title: 'Changed during preflight' }));
      await act(async () => deliver!(preflightResponse(input)));
      expect(app.host.querySelector('[aria-label="Preflight"]')).toBeNull();
      expect(app.host.textContent).toContain('während der Prüfung verändert');
      expect(current()).toBe(original); expect(original.getSnapshot().revision).toBe(0);
    } finally { await app.cleanup(); }
  }, 15000);
});
