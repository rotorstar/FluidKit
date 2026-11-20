import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { AIReviewFrameSchema } from '@fluidkit/contracts';

test.use({ locale: 'de-DE' });

test('exported rehearsal contains the captured live pixels and the bound run', async ({ page }) => {
  await page.goto('/studio/rehearsal');
  await page.getByRole('button', { name: 'Aktuellen Frame aufnehmen' }).click();
  await page.getByRole('button', { name: 'Run exportieren', exact: true }).click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Run-Datei herunterladen' }).click();
  const file = await (await downloading).path();
  expect(file).toBeTruthy();
  const run = JSON.parse(await readFile(file!, 'utf8'));
  const frame = AIReviewFrameSchema.parse(run.frames[0]);
  expect(frame.binding?.runId).toBe(run.runId);
  expect(frame.binding?.presentation).toBe('live');
  const pixels = Buffer.from(frame.image.split(',')[1]!, 'base64');
  expect(createHash('sha256').update(pixels).digest('hex')).toBe(frame.binding?.imageSha256);
  expect(run.coverage).toBe('selected-frames-only');
});

test('filtering a criterion downloads exactly its registered evidence bytes', async ({ page }) => {
  await page.goto('/studio/acceptance');
  await page.getByRole('searchbox').fill('T44-AC01');
  const row = page.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'T44-AC01' }) });
  const download = row.locator('a[download]').first();
  const intendedDigest = await row.locator('li').first().locator('details p code').textContent();
  const downloading = page.waitForEvent('download');
  await download.click();
  const file = await (await downloading).path();
  expect(file).toBeTruthy();
  const bytes = await readFile(file!);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(intendedDigest);
});
