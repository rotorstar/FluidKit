import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { defineReviewQuote, REVIEW_POLICY, ReviewError, type ReviewModelQuote } from './review-policy';

const BASE_URL = 'https://api.openai.com/v1';
// Qualified 2026-11-02 against the official model/pricing and input_tokens docs.
// Standard tier only; the input ceiling also covers the more expensive 12h cache write.
// https://developers.openai.com/api/docs/models/gpt-6.1-terra
export const OPENAI_REVIEW_QUOTE = defineReviewQuote({
  id: 'gpt-6.1-terra', provider: 'openai', contextWindow: 1_050_000, maxInputTokens: 24_000,
  inputRate: 2.50 / 1e6, outputRate: 5 / 1e6,
  inputMeasurement: 'openai-input-tokens', pricingVersion: 'openai-standard-2026-11-02',
});
const RequestSchema = z.strictObject({
  model: z.string(), input: z.array(z.unknown()), max_output_tokens: z.literal(REVIEW_POLICY.maxOutputTokens),
  text: z.object({ format: z.object({ type: z.literal('json_schema') }).loose() }).loose(),
  store: z.literal(false), service_tier: z.literal('default'),
  reasoning: z.strictObject({ effort: z.literal('none') }),
  prompt_cache_options: z.strictObject({ mode: z.literal('explicit'), ttl: z.literal('30m') }),
  include: z.array(z.literal('reasoning.encrypted_content')).optional(),
});
const CountSchema = z.object({ object: z.literal('response.input_tokens'), input_tokens: z.number().int().nonnegative() });

/** Counts the SDK's actual serialized image/schema input before forwarding it unchanged.
 * A count failure never falls back to an estimate or sends the generation request. */
export function createBoundedOpenAIFetch(quote: ReviewModelQuote, transport: typeof fetch = fetch): typeof fetch {
  return async (input, init) => {
    if (String(input) !== `${BASE_URL}/responses` || init?.method !== 'POST' || typeof init.body !== 'string' || Buffer.byteLength(init.body) > 12_000_000) throw new ReviewError('Unzulässiger OpenAI-Review-Transport.', 503);
    let raw: unknown;
    try { raw = JSON.parse(init.body); } catch { throw new ReviewError('Ungültige serialisierte Modellanfrage.', 503); }
    const parsed = RequestSchema.safeParse(raw);
    if (!parsed.success || parsed.data.model !== quote.id) throw new ReviewError('Modellanfrage entspricht nicht dem qualifizierten Budgetprofil.', 503);
    init.signal?.throwIfAborted();
    const { model, input: contents, text, reasoning } = parsed.data;
    const count = await transport(`${BASE_URL}/responses/input_tokens`, { method: 'POST', headers: init.headers, signal: init.signal, redirect: 'error', body: JSON.stringify({ model, input: contents, text, reasoning }) });
    if (!count.ok) throw new ReviewError(`OpenAI-Inputprüfung nicht verfügbar (HTTP ${count.status}). Keine Generierung gestartet.`, 503);
    const measured = CountSchema.safeParse(await count.json());
    if (!measured.success) throw new ReviewError('OpenAI liefert keine belastbare Inputzählung. Keine Generierung gestartet.', 503);
    if (measured.data.input_tokens > quote.maxInputTokens) throw new ReviewError(`Bildauswahl überschreitet das Inputbudget von ${quote.maxInputTokens} Tokens. Weniger oder kleinere Bilder auswählen.`, 422);
    init.signal?.throwIfAborted();
    return transport(input, { ...init, redirect: 'error' });
  };
}

export async function createOpenAIReviewModel(apiKey: string, modelId: string) {
  const quote = OPENAI_REVIEW_QUOTE;
  if (modelId !== quote.id) throw new ReviewError('Dieses OpenAI-Modell hat noch kein qualifiziertes Review-Budgetprofil.', 503);
  const response = await fetch(`${BASE_URL}/models/${encodeURIComponent(modelId)}`, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(5000), redirect: 'error', cache: 'no-store' });
  if (!response.ok) throw new ReviewError(`OpenAI-Modellzugang nicht verfügbar (HTTP ${response.status}). Key, Modellfreigabe und API-Abrechnung prüfen.`, 503);
  const model = createOpenAI({ apiKey, baseURL: BASE_URL, fetch: createBoundedOpenAIFetch(quote) }).responses(modelId);
  return { quote, model };
}
