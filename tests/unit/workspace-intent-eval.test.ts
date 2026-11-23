import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, it } from 'vitest';
import { z } from 'zod';
import { createWorkspaceIntentSession } from '@fluidkit/intelligence';

const corpusPath = 'tests/evaluations/workspace-intent-holdout-v1.json';
const recognizerPath = 'packages/intelligence/src/workspace-intent.ts';
const reportPath = 'docs/qa/2026-11-23-intent/evaluation.json';
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
const corpusSchema = z.strictObject({
  schemaVersion: z.literal(1), split: z.literal('synthetic-holdout'), labelDefinition: z.string(),
  sessions: z.array(z.strictObject({
    id: z.string(), task: z.string(), opens: z.array(z.tuple([z.number().nonnegative(), z.string()])),
    checkAt: z.number().nonnegative(), expected: z.tuple([z.string(), z.string()]).nullable(),
  })),
});

it('measures exact-pair proposals and quiet sessions on separate task-labelled scripted sessions', () => {
  const corpus = corpusSchema.parse(JSON.parse(readFileSync(corpusPath, 'utf8')));
  // Host capabilities are known before a session starts. Neither future opens nor task labels are inputs.
  const moduleIds = ['cases', 'cli', 'contracts', 'core', 'effects', 'gpu-kernels', 'i18n', 'intelligence', 'react', 'server', 'testing', 'webgpu'];
  const sessions = corpus.sessions.map(({ id, opens, checkAt, expected }) => {
    const session = createWorkspaceIntentSession(moduleIds);
    for (const [seconds, moduleId] of opens) session.observeModule(moduleId, seconds * 1000);
    const { suggestion, reason } = session.read(checkAt * 1000);
    const proposed = suggestion?.moduleIds ?? null;
    const correct = JSON.stringify(proposed) === JSON.stringify(expected);
    return { id, expected, proposed, reason, correct };
  });
  const proposals = sessions.filter(row => row.proposed !== null);
  const positive = sessions.filter(row => row.expected !== null);
  const negative = sessions.length - positive.length;
  const exactPairs = proposals.filter(row => row.correct).length;
  const falseAlarms = proposals.filter(row => row.expected === null).length;
  const wrongPairs = proposals.length - exactPairs - falseAlarms;
  const correctAbstentions = negative - falseAlarms;
  const report = {
    schemaVersion: 1,
    scope: 'One labelled decision point per independent synthetic session. Comparison is the only candidate action. These results do not estimate human task completion, production accuracy or calibrated confidence.',
    corpus: { path: corpusPath, sha256: sha256(corpusPath), split: corpus.split },
    recognizer: { path: recognizerPath, sha256: sha256(recognizerPath) },
    metrics: {
      sessions: sessions.length, positive: positive.length, negative, proposals: proposals.length,
      exactPairs, falseAlarms, wrongPairs, missedPairs: positive.length - exactPairs,
      abstentions: sessions.length - proposals.length, correctAbstentions,
      exactPairPrecision: exactPairs / proposals.length, exactPairRecall: exactPairs / positive.length,
      specificity: correctAbstentions / negative, suggestionCoverage: proposals.length / sessions.length,
    }, sessions,
  };
  if (process.env.FLUID_WRITE_INTENT_EVALUATION === '1') {
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  }
  expect(report).toEqual(JSON.parse(readFileSync(reportPath, 'utf8')));
  expect(report.metrics.exactPairs).toBeGreaterThan(0);
  expect(report.metrics.correctAbstentions).toBeGreaterThan(0);
  const identical = ['dependency-review', 'verify-two-facts'].map(id => sessions.find(session => session.id === id));
  expect(identical[0]?.proposed).toEqual(identical[1]?.proposed);
  expect(identical[0]?.expected).not.toEqual(identical[1]?.expected);
});
