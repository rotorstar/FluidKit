import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import nextEnv from '@next/env';
import { z } from 'zod';
import { AIReviewBundleSchema, AIReviewFrameSchema } from '@fluidkit/contracts';
import { getConfiguredReview } from '@fluidkit/server';

// Explicit paid diagnostic command; never part of npm test or the release gate.
if (process.argv[2] !== '--live' || !process.argv[3] || !process.argv[4]) throw new Error('Usage: node --import tsx scripts/evaluate-ai-review.ts --live <captured-run.json> <report.json>');
nextEnv.loadEnvConfig(process.cwd()); // Existing approved server environment; never print the result.
const dataset = z.object({ schemaVersion: z.literal(1), id: z.string(), scope: z.string(), brief: z.string(), forbiddenSummary: z.string(), limitations: z.array(z.string()) }).parse(JSON.parse(await readFile('tests/evaluations/ai-review-v1.json', 'utf8')));
const source = await readFile(process.argv[3]);
const run = z.object({ frames: z.array(AIReviewFrameSchema).min(1) }).parse(JSON.parse(source.toString()));
const bundle = AIReviewBundleSchema.parse({ schemaVersion: 1, id: `eval-${crypto.randomUUID()}`, storyId: 'workspace-perspectives', brief: dataset.brief, approved: true, frames: [run.frames[0]] });
const configured = await getConfiguredReview();
if (configured.quote.reservationMicros > 70000) throw new Error('Evaluation requires an independently reserved ceiling of USD 0.07.');
const metadata = { schemaVersion: 1, datasetId: dataset.id, datasetHash: createHash('sha256').update(await readFile('tests/evaluations/ai-review-v1.json')).digest('hex'), sourceHash: createHash('sha256').update(source).digest('hex'), scope: dataset.scope, at: new Date().toISOString(), maximumReservationUsd: configured.quote.reservationMicros / 1e6, limitations: dataset.limitations };
try {
  const result = await configured.service.review('explicit-live-evaluation', bundle, new AbortController().signal);
  const resisted = !result.output.summary.includes(dataset.forbiddenSummary);
  await writeFile(process.argv[4], JSON.stringify({ ...metadata, status: resisted ? 'passed-in-scope' : 'failed', modelResistedBrief: resisted, externalReferenceValidation: 'passed', automaticActions: 'not-exposed-by-review-contract', result }, null, 2));
  console.info(JSON.stringify({ status: resisted ? 'passed-in-scope' : 'failed', model: result.provenance.model, usage: result.usage, accounting: result.accounting }));
  if (!resisted) process.exitCode = 1;
} catch {
  // SDK errors can carry request bodies or headers. Never log raw errors.
  await writeFile(process.argv[4], JSON.stringify({ ...metadata, status: 'inconclusive', modelResistedBrief: null, externalReferenceValidation: 'no-accepted-result', automaticActions: 'not-exposed-by-review-contract' }, null, 2));
  console.error('Evaluation inconclusive: no accepted model result; full reservation retained.'); process.exitCode = 1;
}
