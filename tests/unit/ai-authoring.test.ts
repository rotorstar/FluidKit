import { describe, expect, it, vi } from 'vitest';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import type { LanguageModelV4StreamPart } from '@ai-sdk/provider';
import { createOpenAI } from '@ai-sdk/openai';
import { DEFAULT_AUTHORING_DOCUMENT, type AuthoringStreamEvent } from '@fluidkit/contracts';
import { AUTHORING_POLICY, createAuthoringService, createBoundedAuthoringFetch } from '../../packages/server/src/ai-authoring';
import { createLocalReviewAccess } from '../../packages/server/src/review-access';

const request = { schemaVersion: 1, id: 'authoring-test', documentRevision: 2, runtimeRevision: 4, prompt: 'Ordne die registrierten Komponenten sinnvoll.', document: DEFAULT_AUTHORING_DOCUMENT };
const data = { moduleCount: 2, sourceCount: 10, dependencyCount: 3 };
const usage = { inputTokens: { total: 20, noCache: 20, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 30, text: 30, reasoning: undefined } };
const signal = () => new AbortController().signal;
async function collect(stream: AsyncIterable<AuthoringStreamEvent>) { const result: AuthoringStreamEvent[] = []; for await (const value of stream) result.push(value); return result; }
function model(value: unknown = DEFAULT_AUTHORING_DOCUMENT) {
  return new MockLanguageModelV4({ modelId: 'fixture-authoring', doStream: async () => ({ stream: simulateReadableStream<LanguageModelV4StreamPart>({ initialDelayInMs: null, chunkDelayInMs: null, chunks: [
    { type: 'stream-start', warnings: [] }, { type: 'response-metadata', id: 'response-test', modelId: 'fixture-authoring', timestamp: new Date(0) },
    { type: 'text-start', id: 'text' }, { type: 'text-delta', id: 'text', delta: JSON.stringify(value) }, { type: 'text-end', id: 'text' },
    { type: 'finish', finishReason: { unified: 'stop', raw: undefined }, usage },
  ] }) }) });
}

describe('authoring stream and reservation boundary', () => {
  it('streams drafts separately from a valid final result with bounded SDK settings', async () => {
    const sdk = model(), service = createAuthoringService({ model: sdk, now: () => 0 });
    const events = await collect(service.generate('session', request, data, signal()));
    expect(events.some(event => event.type === 'partial')).toBe(true);
    const complete = events.find(event => event.type === 'complete');
    expect(complete?.type).toBe('complete');
    if (complete?.type !== 'complete') throw new Error('Missing final document');
    expect(complete.result.document).toEqual(DEFAULT_AUTHORING_DOCUMENT);
    expect(complete.result).toMatchObject({ documentRevision: 2, runtimeRevision: 4, provenance: { resolvedModel: 'fixture-authoring', responseId: 'response-test', inputTokens: 20, outputTokens: 30 } });
    expect(sdk.doStreamCalls[0]).toMatchObject({ maxOutputTokens: 4000, providerOptions: { openai: { store: false, serviceTier: 'default' } } });
    expect(sdk.doStreamCalls[0]?.tools).toBeUndefined();
    expect(JSON.stringify(sdk.doStreamCalls[0]?.prompt)).not.toContain('workspaceNote');
    expect(service.diagnostics().chargedUpperEstimateUsd).toBe(.0002);
  });

  it('rejects schema-valid JSON with unregistered executable properties', async () => {
    const events: AuthoringStreamEvent[] = [];
    const service = createAuthoringService({ model: model({ ...DEFAULT_AUTHORING_DOCUMENT, execute: 'external-action' }) });
    await expect((async () => { for await (const item of service.generate('session', request, data, signal())) events.push(item); })()).rejects.toThrow();
    expect(events.some(event => event.type === 'complete')).toBe(false);
  });

  it('holds the reservation while streaming and aborts provider work when a consumer returns', async () => {
    let providerSignal: AbortSignal | undefined;
    const sdk = new MockLanguageModelV4({ doStream: async options => {
      providerSignal = options.abortSignal;
      return { stream: new ReadableStream<LanguageModelV4StreamPart>({ start(controller) {
        controller.enqueue({ type: 'stream-start', warnings: [] }); controller.enqueue({ type: 'text-start', id: 'text' });
        controller.enqueue({ type: 'text-delta', id: 'text', delta: '{"title":"Draft' });
        options.abortSignal?.addEventListener('abort', () => controller.error(options.abortSignal?.reason), { once: true });
      } }) };
    } });
    const service = createAuthoringService({ model: sdk }), first = service.generate('session', request, data, signal());
    expect((await first.next()).value?.type).toBe('partial');
    await expect(service.generate('session', request, data, signal()).next()).rejects.toThrow('Limit');
    await first.return(undefined);
    expect(providerSignal?.aborted).toBe(true);
    expect(service.diagnostics().chargedUpperEstimateUsd).toBe(.05);
    const second = service.generate('session', request, data, signal());
    expect((await second.next()).value?.type).toBe('partial');
    await second.return(undefined);
  });

  it('propagates deadlines and conservatively charges missing usage', async () => {
    const sdk = new MockLanguageModelV4({ doStream: options => new Promise((_resolve, reject) => {
      options.abortSignal?.addEventListener('abort', () => reject(options.abortSignal?.reason), { once: true });
    }) });
    const service = createAuthoringService({ model: sdk, deadlineMs: 10 });
    await expect(collect(service.generate('session', request, data, signal()))).rejects.toThrow();
    expect(service.diagnostics().chargedUpperEstimateUsd).toBe(.05);
    expect(sdk.doStreamCalls[0]?.abortSignal?.aborted).toBe(true);
    expect(() => createAuthoringService({ model: sdk, deadlineMs: -1 })).toThrow();
  });

  it('does not reserve or call a provider for aborted or extra-sensitive request input', async () => {
    const sdk = model(), service = createAuthoringService({ model: sdk }), controller = new AbortController(); controller.abort();
    const untrustedContext = { ...data, secret: 'PRIVATE' };
    await expect(collect(service.generate('session', request, data, controller.signal))).rejects.toThrow();
    await expect(collect(service.generate('session', { ...request, note: 'PRIVATE-NOTE' }, data, signal()))).rejects.toThrow();
    await expect(collect(service.generate('session', request, untrustedContext, signal()))).rejects.toThrow();
    expect(sdk.doStreamCalls).toHaveLength(0); expect(service.diagnostics().chargedUpperEstimateUsd).toBe(0);
  });

  it('aborts a runaway partial stream at the local byte gate', async () => {
    let providerSignal: AbortSignal | undefined;
    const chunks: LanguageModelV4StreamPart[] = [{ type: 'stream-start', warnings: [] }, { type: 'text-start', id: 'text' }, { type: 'text-delta', id: 'text', delta: '{"title":"' }];
    for (let index = 0; index < 40; index++) chunks.push({ type: 'text-delta', id: 'text', delta: 'x'.repeat(1000) });
    const sdk = new MockLanguageModelV4({ doStream: async options => {
      providerSignal = options.abortSignal;
      return { stream: simulateReadableStream({ chunks, initialDelayInMs: null, chunkDelayInMs: null }) };
    } });
    const service = createAuthoringService({ model: sdk });
    await expect(collect(service.generate('session', request, data, signal()))).rejects.toThrow('Entwurfsstream');
    expect(providerSignal?.aborted).toBe(true);
    expect(service.diagnostics().chargedUpperEstimateUsd).toBe(.05);
  });

  it('suppresses provider error context and enforces the session request cap', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const sdk = new MockLanguageModelV4({ doStream: async () => { throw new Error('PRIVATE-PROVIDER-CONTEXT'); } });
      const service = createAuthoringService({ model: sdk });
      for (let index = 0; index < 6; index++) await expect(collect(service.generate('session', request, data, signal()))).rejects.toThrow('beim Anbieter fehlgeschlagen');
      await expect(collect(service.generate('session', request, data, signal()))).rejects.toThrow('Limit');
      expect(sdk.doStreamCalls).toHaveLength(6); expect(errorLog).not.toHaveBeenCalled();
    } finally { errorLog.mockRestore(); }
  });
});

describe('authoring transport and isolated local access', () => {
  it('accepts the actual pinned SDK serialization and counts it before any generation', async () => {
    const calls: { url: string; body: Record<string, unknown>; redirect: RequestRedirect | undefined }[] = [];
    const transport: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(String(init?.body)) as Record<string, unknown>, redirect: init?.redirect });
      if (String(url).endsWith('/input_tokens')) return Response.json({ object: 'response.input_tokens', input_tokens: 100 });
      return Response.json({ error: { message: 'Explicit provider failure fixture' } }, { status: 503 });
    };
    const sdk = createOpenAI({ apiKey: 'unit-fixture-only', fetch: createBoundedAuthoringFetch(transport) }).responses(AUTHORING_POLICY.model);
    await expect(collect(createAuthoringService({ model: sdk }).generate('session', request, data, signal()))).rejects.toThrow();
    expect(calls.map(call => call.url)).toEqual(['https://api.openai.com/v1/responses/input_tokens', 'https://api.openai.com/v1/responses']);
    expect(calls[0]?.body.input).toEqual(calls[1]?.body.input); expect(calls[0]?.body.text).toEqual(calls[1]?.body.text);
    // Live provider rejects Zod's discriminated-union `oneOf`; the three
    // literal-tagged branches must be exported as supported, disjoint anyOf.
    const outputSchema = JSON.stringify(calls[0]?.body.text);
    expect(outputSchema).toContain('"anyOf"'); expect(outputSchema).not.toContain('"oneOf"');
    expect(calls[1]?.body).toMatchObject({ model: AUTHORING_POLICY.model, max_output_tokens: 4000, stream: true, store: false, service_tier: 'default' });
    expect(calls.every(call => call.redirect === 'error')).toBe(true);
  });

  it('never generates after unavailable or excessive token counts', async () => {
    for (const count of [12001, null]) {
      const calls: string[] = [];
      const transport: typeof fetch = async url => { calls.push(String(url)); return Response.json(count === null ? {} : { object: 'response.input_tokens', input_tokens: count }); };
      const sdk = createOpenAI({ apiKey: 'unit-fixture-only', fetch: createBoundedAuthoringFetch(transport) }).responses(AUTHORING_POLICY.model);
      await expect(collect(createAuthoringService({ model: sdk }).generate('session', request, data, signal()))).rejects.toThrow();
      expect(calls).toEqual(['https://api.openai.com/v1/responses/input_tokens']);
    }
    const network = vi.fn();
    await expect(createBoundedAuthoringFetch(network)('https://example.invalid', { method: 'POST', body: '{}' })).rejects.toThrow('Transport');
    expect(network).not.toHaveBeenCalled();
  });

  it('cannot reuse design-review cookies/tokens for authoring or cross-site writes', () => {
    const review = createLocalReviewAccess(), authoring = createLocalReviewAccess(Date.now, { cookie: 'fluid_authoring', path: '/api/authoring', header: 'x-fluid-authoring-token' });
    const url = 'http://127.0.0.1:3010/api/authoring', origin = 'http://127.0.0.1:3010';
    const previous = review.open(new Request(`${origin}/api/design-review`));
    expect(() => authoring.authorize(new Request(url, { headers: { Origin: origin, Cookie: previous.cookie, 'x-fluid-authoring-token': previous.token } }))).toThrow();
    const own = authoring.open(new Request(url));
    expect(own.cookie).toContain('HttpOnly; SameSite=Strict; Path=/api/authoring');
    expect(authoring.authorize(new Request(url, { headers: { Origin: origin, Cookie: own.cookie, 'x-fluid-authoring-token': own.token } }))).toBeTruthy();
    expect(() => authoring.authorize(new Request(url, { headers: { Origin: 'https://example.invalid', Cookie: own.cookie, 'x-fluid-authoring-token': own.token } }))).toThrow('Origin');
    expect(() => review.authorize(new Request(`${origin}/api/design-review`, { headers: { Origin: origin, Cookie: own.cookie, 'x-fluid-review-token': own.token } }))).toThrow();
  });
});
