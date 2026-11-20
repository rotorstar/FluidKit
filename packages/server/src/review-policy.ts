import { z } from 'zod';

export const REVIEW_POLICY = Object.freeze({ version: 'review-3', maxOutputTokens: 2000, deadlineMs: 20000, sessionUsd: .35, processUsd: 5, requestsPerSession: 5 });
export class ReviewError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
const QuoteSchema = z.strictObject({
  id: z.string().min(1), provider: z.enum(['openai', 'vercel-ai-gateway']),
  contextWindow: z.number().int().positive(), maxInputTokens: z.number().int().positive(),
  inputRate: z.number().nonnegative(), outputRate: z.number().nonnegative(),
  inputMeasurement: z.enum(['openai-input-tokens', 'full-context-bound']), pricingVersion: z.string().min(1),
});
export function defineReviewQuote(input: z.input<typeof QuoteSchema>) {
  const quote = QuoteSchema.parse(input);
  if (quote.maxInputTokens > quote.contextWindow || (quote.inputMeasurement === 'openai-input-tokens' && quote.maxInputTokens + REVIEW_POLICY.maxOutputTokens > quote.contextWindow)) throw new ReviewError('Input- und Outputbudget überschreiten das Kontextfenster.', 503);
  const reservationMicros = Math.ceil((quote.maxInputTokens * quote.inputRate + REVIEW_POLICY.maxOutputTokens * quote.outputRate) * 1e6);
  if (reservationMicros > REVIEW_POLICY.sessionUsd * 1e6) throw new ReviewError('Konservatives Modellbudget überschreitet das Sessionlimit.', 503);
  return Object.freeze({ ...quote, reservationMicros });
}
export type ReviewModelQuote = ReturnType<typeof defineReviewQuote>;
