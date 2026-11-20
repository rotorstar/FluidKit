import { expect, test } from '@playwright/test';
import { diagnosticMessage } from '../../apps/studio/lib/diagnostic-messages';
import { studioMessage } from '../../apps/studio/lib/studio-messages';

test('diagnostics translate controls and an existing status while preserving original evidence', async ({ page }) => {
  await page.goto('/de/studio/m7');
  await expect(page.getByRole('button', { name: diagnosticMessage('de','exportSurface') })).toBeVisible();
  await page.getByRole('combobox', { name: 'Sprache' }).selectOption('fr');
  await expect(page.getByRole('button', { name: diagnosticMessage('fr','exportSurface') })).toBeVisible();
  await expect(page.getByText(diagnosticMessage('fr','readyMatrix'))).toBeVisible();
  await page.getByRole('combobox', { name: diagnosticMessage('fr','matrixBackend') }).selectOption('webgl2');
  await expect(page.getByText(diagnosticMessage('fr','backendChanged'))).toBeVisible();
  await page.getByRole('combobox', { name: 'Langue' }).selectOption('en');
  await expect(page.getByText(diagnosticMessage('en','backendChanged'))).toBeVisible();

  await page.goto('/fr/studio/m8');
  await expect(page.getByRole('button', { name: diagnosticMessage('fr','matrixM8') })).toBeVisible();
  await expect(page.getByRole('button', { name: diagnosticMessage('fr','timerStart') })).toBeVisible();
  await page.goto('/fr/studio/rehearsal');
  await expect(page.getByRole('button', { name: diagnosticMessage('fr','rehearse') })).toBeVisible();
  await page.getByRole('tab', { name: studioMessage('fr','motion'), exact: true }).click();
  await expect(page.getByRole('button',{ name: diagnosticMessage('fr','sequenceCheck') })).toBeVisible();
  await page.getByRole('tab', { name: studioMessage('fr','aiTab'), exact: true }).click();
  await expect(page.getByRole('button',{ name: diagnosticMessage('fr','listReviews') })).toBeVisible();

  await page.goto('/en/studio/acceptance');
  await expect(page.getByRole('button', { name: diagnosticMessage('en','exportCycle') })).toBeVisible();
  await expect(page.locator('tbody td[lang="de"]').first()).toBeVisible();
});
