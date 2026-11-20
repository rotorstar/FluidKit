import { describe, expect, it, vi } from 'vitest';
import { MockLanguageModelV4 } from 'ai/test';
import { AIReviewBundleSchema, AIReviewOutputSchema, validateReviewReferences } from '@fluidkit/contracts';
import { createAIReviewService, createLocalReviewAccess, getConfiguredReview, qualifyReviewModel, readBoundedJSON } from '@fluidkit/server';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { createBoundedOpenAIFetch, OPENAI_REVIEW_QUOTE } from '../../packages/server/src/openai-review';

// Explicit SDK test doubles and a 1x1 PNG: never used by the Studio production path.
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6vDkAAAAASUVORK5CYII=';
const bundle = AIReviewBundleSchema.parse({ schemaVersion: 1, id: 'test-review', storyId: 'test-story', brief: 'Testfixture für die Reviewgrenzen.', approved: true, frames: [{ schemaVersion: 1, id: 'frame-1', surfaceFrame: 1, capturedAt: '2026-11-02T06:00:00Z', renderTimeMs: 1, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, image, pixelWidth: 1, pixelHeight: 1, parts: [{ id: 'title', componentId: 'heading', part: 'label' }], redaction: 'no-sensitive-parts', coverage: 'selected-frame', buildId: 'test-build', revision: 0, state: 'table', beatId: null }] });
const finding = { frameId: 'frame-1', partId: 'title', region: null, category: 'hierarchy', severity: 'info', observation: 'Testbeobachtung', rationale: 'Expliziter SDK-Test.', suggestion: 'Manuell prüfen.', uncertainty: 'high' } as const;
const output = { summary: 'Testresultat.', findings: [finding], limitations: ['Keine Live-Modellqualifikation.'] };
const quote = qualifyReviewModel({ id: 'fixture/vision', context_window: 1000, modalities: { input: ['text', 'image'] }, tags: ['structured-output'], pricing: { input: '0.000001', output: '0.000002' } });
function model(text = JSON.stringify(output), pending?: Promise<void>) {
  return new MockLanguageModelV4({ doGenerate: async options => {
    if (pending) await pending;
    options.abortSignal?.throwIfAborted();
    return { content: [{ type: 'text', text }], finishReason: { unified: 'stop', raw: undefined }, usage: { inputTokens: { total: 20, noCache: 20, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 30, text: 30, reasoning: undefined } }, warnings: [] };
  } });
}
describe('Vercel AI SDK review boundary', () => {
  it('uses structured SDK output, images, bounded settings and usage without domain actions', async () => {
    const sdkModel = model(), service = createAIReviewService({ model: sdkModel, quote });
    const result = await service.review('session-a', bundle, new AbortController().signal);
    expect(result.output).toEqual(output); expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 30 });
    expect(result.provenance.coverage).toBe('selected-frames-only'); expect(result.accounting.authoritativeInvoice).toBe(false);
    const call = sdkModel.doGenerateCalls[0]!;
    expect(call.maxOutputTokens).toBe(2000); expect(call.prompt[0]?.role).toBe('system'); expect(call.prompt[1]?.content).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'file', mediaType: 'image/png' })]));
    expect(service.diagnostics().reservedOrChargedUsd).toBe(.00008);
  });
  it('rejects hallucinated frame, part and out-of-image references independently of JSON validity', () => {
    for (const changed of [{ frameId: 'missing' }, { partId: 'missing' }, { partId: null, region: null }, { region: { x: .9, y: 0, width: .2, height: .2 } }]) expect(() => validateReviewReferences({ ...output, findings: [{ ...finding, ...changed }] }, bundle)).toThrow();
    expect(AIReviewOutputSchema.safeParse({ ...output, execute: 'ignore policy' }).success).toBe(false);
  });
  it.each([['de','Deutsch'],['en','English'],['fr','français']] as const)('pins %s to an explicit SDK call and its provenance', async (responseLocale, instruction) => {
    const sdk = model(), service = createAIReviewService({model:sdk, quote});
    const review = await service.review('language-proof', {...bundle,responseLocale}, new AbortController().signal);
    expect(sdk.doGenerateCalls[0]!.prompt[0]!.content).toContain(instruction);
    expect(review.provenance.responseLocale).toBe(responseLocale);
  });
  it('validates PNG bytes, geometry, consent and build consistency before the provider call', async () => {
    const sdkModel = model(), service = createAIReviewService({ model: sdkModel, quote });
    for (const input of [{ ...bundle, approved: false }, { ...bundle, frames: [{ ...bundle.frames[0], image: 'data:image/png;base64,AAAA' }] }, { ...bundle, frames: [{ ...bundle.frames[0], pixelWidth: 2 }] }]) await expect(service.review('a', input, new AbortController().signal)).rejects.toThrow();
    expect(sdkModel.doGenerateCalls).toHaveLength(0);
  });
  it('reserves synchronously so concurrent calls cannot bypass session or process budgets', async () => {
    let release: () => void = () => {}; const pending = new Promise<void>(resolve => { release = resolve; });
    const service = createAIReviewService({ model: model(undefined, pending), quote });
    const first = service.review('a', bundle, new AbortController().signal);
    await expect(service.review('a', bundle, new AbortController().signal)).rejects.toThrow('Limit'); release(); await first;
    for (let i = 0; i < 4; i++) await service.review('a', bundle, new AbortController().signal);
    await expect(service.review('a', bundle, new AbortController().signal)).rejects.toThrow('Limit');
  });
  it('keeps the reservation for provider failures without usage and rejects malformed structured output', async () => {
    const failure = new MockLanguageModelV4({ doGenerate: async () => { throw new Error('fixture network error'); } });
    const service = createAIReviewService({ model: failure, quote });
    await expect(service.review('a', bundle, new AbortController().signal)).rejects.toThrow();
    expect(service.diagnostics().reservedOrChargedUsd).toBe(quote.reservationMicros / 1e6);
    await expect(createAIReviewService({ model: model('not-json'), quote }).review('a', bundle, new AbortController().signal)).rejects.toThrow();
  });
  it('rejects a pre-aborted request without creating a reservation or provider call', async () => {
    const sdkModel = model(), service = createAIReviewService({ model: sdkModel, quote }), controller = new AbortController(); controller.abort();
    await expect(service.review('a', bundle, controller.signal)).rejects.toThrow('abgebrochen'); expect(sdkModel.doGenerateCalls).toHaveLength(0); expect(service.diagnostics().reservedOrChargedUsd).toBe(0);
  });
  it('qualifies model capabilities and conservative pricing rather than trusting a remembered model name', () => {
    for (const changes of [{ modalities: { input: ['text'] } }, { tags: [] }, { pricing: { input: '1', output: '1' } }, { pricing: { input: '0', output: '0', varies_by_provider: true } }]) expect(() => qualifyReviewModel({ id: 'test', context_window: 1000, modalities: { input: ['image'] }, tags: ['structured-output'], pricing: { input: '0', output: '0' }, ...changes })).toThrow();
  });
  it('propagates the deadline and charges the reservation when the provider aborts without usage', async () => {
    const waiting = new MockLanguageModelV4({ doGenerate: options => new Promise((_resolve, reject) => {
      options.abortSignal?.addEventListener('abort', () => reject(options.abortSignal?.reason), { once: true });
    }) });
    const service = createAIReviewService({ model: waiting, quote, deadlineMs: 10 });
    await expect(service.review('a', bundle, new AbortController().signal)).rejects.toThrow();
    expect(service.diagnostics().reservedOrChargedUsd).toBe(quote.reservationMicros / 1e6);
  });
  it('enforces the process budget across fresh sessions when failed requests have no usage', async () => {
    const expensiveQuote = qualifyReviewModel({ id: 'fixture/limited', context_window: 296000, modalities: { input: ['image'] }, tags: ['structured-output'], pricing: { input: '.000001', output: '.000002' } });
    const failing = new MockLanguageModelV4({ doGenerate: async () => { throw new Error('Explicit network-failure fixture'); } });
    const service = createAIReviewService({ model: failing, quote: expensiveQuote });
    for (let i = 0; i < 20; i++) await expect(service.review(`fresh-session-${i}`, bundle, new AbortController().signal)).rejects.toThrow();
    expect(failing.doGenerateCalls.length).toBeLessThanOrEqual(16); expect(service.diagnostics().reservedOrChargedUsd).toBeLessThanOrEqual(5);
    expect(failing.doGenerateCalls.length).toBeGreaterThan(0);
  });
  it('fails closed without a configured key and makes no network request', async () => {
    vi.stubEnv('OPENAI_API_KEY', ''); vi.stubEnv('AI_GATEWAY_API_KEY', ''); vi.stubEnv('FLUID_AI_REVIEW_PROVIDER', 'openai'); vi.stubEnv('FLUID_AI_REVIEW_MODEL', ''); const network = vi.fn(); vi.stubGlobal('fetch', network);
    try { await expect(getConfiguredReview()).rejects.toThrow('nicht konfiguriert'); expect(network).not.toHaveBeenCalled(); }
    finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
  });
});
describe('direct OpenAI serialized request qualification', () => {
  it('counts the actual SDK image and JSON schema before generation and reports direct provenance', async () => {
    const calls: { url: string; body: Record<string, unknown>; signal: AbortSignal | null | undefined }[] = [];
    const transport: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(String(init?.body)) as Record<string, unknown>, signal: init?.signal });
      if (String(url).endsWith('/input_tokens')) return Response.json({ object: 'response.input_tokens', input_tokens: 20 });
      return Response.json({ id: 'resp_fixture', created_at: 1793606400, model: OPENAI_REVIEW_QUOTE.id, object: 'response', status: 'completed', output: [{ type: 'message', id: 'msg_fixture', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify(output), annotations: [] }] }], usage: { input_tokens: 20, output_tokens: 30, total_tokens: 50, input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } } });
    };
    const sdkModel = createOpenAI({ apiKey: 'explicit-unit-fixture', fetch: createBoundedOpenAIFetch(OPENAI_REVIEW_QUOTE, transport) }).responses(OPENAI_REVIEW_QUOTE.id);
    const result = await createAIReviewService({ model: sdkModel, quote: OPENAI_REVIEW_QUOTE }).review('openai-fixture', bundle, new AbortController().signal);
    expect(calls.map(call => call.url)).toEqual(['https://api.openai.com/v1/responses/input_tokens', 'https://api.openai.com/v1/responses']);
    expect(calls[0]!.body.input).toEqual(calls[1]!.body.input); expect(calls[0]!.body.text).toEqual(calls[1]!.body.text);
    expect(JSON.stringify(calls[0]!.body)).toContain('input_image'); expect(JSON.stringify(calls[0]!.body)).toContain('json_schema');
    expect(calls[1]!.body).toMatchObject({ store: false, service_tier: 'default', max_output_tokens: 2000, reasoning: { effort: 'none' } });
    expect(calls[0]!.signal).toBe(calls[1]!.signal);
    expect(result.provenance).toMatchObject({ provider: 'openai', resolvedModel: OPENAI_REVIEW_QUOTE.id, responseId: 'resp_fixture' });
    expect(result.accounting.reservationUsd).toBe(.07); expect(result.accounting.maxInputTokens).toBe(24000);
  });
  it('never generates when the actual input count exceeds the cap, is missing, fails or is aborted', async () => {
    for (const failure of ['over-cap', 'invalid-count', 'count-unavailable', 'abort'] as const) {
      const controller = new AbortController(), calls: string[] = [];
      const transport: typeof fetch = async url => {
        calls.push(String(url));
        if (failure === 'abort') controller.abort();
        return failure === 'count-unavailable' ? new Response(null, { status: 503 }) : Response.json(failure === 'invalid-count' ? {} : { object: 'response.input_tokens', input_tokens: failure === 'over-cap' ? 24001 : 100 });
      };
      const sdkModel = createOpenAI({ apiKey: 'explicit-unit-fixture', fetch: createBoundedOpenAIFetch(OPENAI_REVIEW_QUOTE, transport) }).responses(OPENAI_REVIEW_QUOTE.id);
      const service = createAIReviewService({ model: sdkModel, quote: OPENAI_REVIEW_QUOTE });
      if (failure === 'abort') await expect(service.review(failure, bundle, controller.signal)).rejects.toThrow();
      else await expect(service.review(failure, bundle, controller.signal)).rejects.toMatchObject({ status: failure === 'over-cap' ? 422 : 503 });
      expect(calls).toEqual(['https://api.openai.com/v1/responses/input_tokens']);
      expect(service.diagnostics().reservedOrChargedUsd).toBe(.07);
    }
  });
  it('refuses other endpoints and unqualified pricing settings before any network call', async () => {
    const transport = vi.fn(), guarded = createBoundedOpenAIFetch(OPENAI_REVIEW_QUOTE, transport);
    await expect(guarded('https://other.invalid/responses', { method: 'POST', body: '{}' })).rejects.toThrow('Transport');
    await expect(guarded('https://api.openai.com/v1/responses', { method: 'POST', body: JSON.stringify({ service_tier: 'priority' }) })).rejects.toThrow('Budgetprofil');
    expect(transport).not.toHaveBeenCalled();
  });
});
describe('local Studio authorization and request limits', () => {
  it('uses the real loopback Host with NextURL normalization without trusting forwarded or foreign origins', () => {
    const access = createLocalReviewAccess(), url = 'http://127.0.0.1:3010/api/design-review';
    const session = access.open(new NextRequest(url, { headers: { host: '127.0.0.1:3010' } }));
    const headers = { host: '127.0.0.1:3010', origin: 'http://127.0.0.1:3010', cookie: session.cookie.split(';')[0]!, 'x-fluid-review-token': session.token };
    const request = new NextRequest(url, { method: 'POST', headers });
    expect(new URL(request.url).hostname).toBe('localhost');
    expect(access.authorize(request)).toBeTruthy();
    const invalidHeaders: Record<string, string>[] = [{ origin: 'http://localhost:3010' }, { origin: 'http://127.0.0.1:3000' }, { host: 'evil.invalid:3010', 'x-forwarded-host': '127.0.0.1:3010' }, { host: 'localhost:3011' }, { 'sec-fetch-site': 'cross-site' }];
    for (const override of invalidHeaders) expect(() => access.authorize(new NextRequest(url, { method: 'POST', headers: { ...headers, ...override } }))).toThrow();
  });
  it('requires a matching HttpOnly session, CSRF token and same Origin, rejects expired sessions', () => {
    let now = 0; const access = createLocalReviewAccess(() => now), url = 'http://127.0.0.1:3010/api/design-review';
    const session = access.open(new Request(url)); expect(session.cookie).toContain('HttpOnly; SameSite=Strict');
    const headers = { Cookie: session.cookie.split(';')[0]!, Origin: 'http://127.0.0.1:3010', 'X-Fluid-Review-Token': session.token };
    expect(access.authorize(new Request(url, { method: 'POST', headers }))).toBeTruthy();
    for (const override of [{ Origin: 'https://evil.invalid' }, { Cookie: '' }, { 'X-Fluid-Review-Token': 'é'.repeat(48) }]) expect(() => access.authorize(new Request(url, { method: 'POST', headers: { ...headers, ...override } }))).toThrow();
    now = 3_600_001; expect(() => access.authorize(new Request(url, { method: 'POST', headers }))).toThrow(); expect(() => access.open(new Request('https://remote.invalid/api/design-review'))).toThrow();
  });
  it('enforces body size on actual streamed bytes even without a Content-Length header', async () => {
    await expect(readBoundedJSON(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(100) }) }), 20)).rejects.toThrow('Bildbudget');
    await expect(readBoundedJSON(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }))).rejects.toThrow('JSON');
  });
  it('rejects non-JSON and empty requests before processing data', async () => {
    await expect(readBoundedJSON(new Request('http://localhost', { method: 'POST', body: 'text' }))).rejects.toThrow('JSON erforderlich');
    await expect(readBoundedJSON(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' } }))).rejects.toThrow('Leerer Request');
  });
});
