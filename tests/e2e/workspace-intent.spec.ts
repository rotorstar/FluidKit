import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { QualityReportSchema } from '@fluidkit/contracts';

test.use({ locale: 'en-US', reducedMotion: 'reduce' });

const approval = (page: Page) => page.getByRole('button', { name: 'Compare modules', exact: true });
const assistance = (page: Page) => page.getByRole('button', { name: 'Intent assistance', exact: true });

async function openWorkspace(page: Page) {
  await page.goto('/en');
  await expect(page.locator('[data-testid="fluid-surface"][data-status="ready"]')).toBeVisible();
}

async function visit(page: Page, moduleId: string) {
  if (new URL(page.url()).searchParams.get('view') === 'detail') {
    await page.getByRole('button', { name: 'Table', exact: true }).press('Enter');
    await expect(page).toHaveURL(/view=table/);
  }
  await page.getByRole('button', { name: 'Open module ' + moduleId, exact: true }).press('Enter');
  await expect(page).toHaveURL(url => url.searchParams.get('view') === 'detail' && url.searchParams.get('selected') === moduleId);
}

test('deliberate visits offer the exact pair and approval creates one reversible navigation', async ({ page, browser }, testInfo) => {
  const errors: string[] = [];
  const modelRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.method() === 'POST' && /\/api\/(authoring|design-review)/.test(request.url())) modelRequests.push(request.url());
  });
  await openWorkspace(page);
  await assistance(page).click();
  for (const id of ['core', 'webgpu', 'core']) {
    await visit(page, id);
    await expect(approval(page)).toBeHidden();
  }
  await visit(page, 'webgpu');
  await expect(approval(page)).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /core.*webgpu|webgpu.*core/ })).toBeVisible();
  const capturePath = process.env.FLUID_INTENT_CAPTURE;
  const stage = page.locator('[data-motion-version="2"]');
  if (capturePath) await page.getByRole('button', { name: 'Table', exact: true }).scrollIntoViewIfNeeded();
  const capture = capturePath ? await stage.screenshot({path: capturePath, animations: 'disabled'}) : undefined;
  const captureInfo = capture && {
    timestamp: new Date().toISOString(),
    sourceBuild: QualityReportSchema.parse(JSON.parse(await readFile('apps/studio/generated/design-static.json', 'utf8'))).context.buildId,
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    viewport: await page.evaluate(() => ({width: innerWidth, height: innerHeight, dpr: devicePixelRatio})),
    sha256: createHash('sha256').update(capture).digest('hex'),
  };
  await page.getByText('Why this suggestion?', { exact: true }).click();
  const visits = page.getByRole('list', { name: 'Module visits' }).getByRole('listitem');
  await expect(visits).toHaveCount(4);
  const detail = page.url();
  const historyBefore = await page.evaluate(() => history.length);
  await approval(page).click();
  await expect(page).toHaveURL(url => url.searchParams.get('view') === 'compare');
  const comparison = new URL(page.url());
  expect(comparison.searchParams.getAll('picked').sort()).toEqual(['core', 'webgpu']);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
  await expect(approval(page)).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(detail);
  await expect(approval(page)).toBeHidden();
  await page.goForward();
  await expect(page).toHaveURL(comparison.toString());
  expect(errors).toEqual([]);
  expect(modelRequests).toEqual([]);
  await testInfo.attach('comparison evidence', { contentType: 'application/json', body: JSON.stringify({
    browser: browser.version(), backend: await stage.getAttribute('data-backend'),
    ...(captureInfo ? { capture: captureInfo } : {}),
    visits: ['core', 'webgpu', 'core', 'webgpu'], selectedAfterApproval: comparison.searchParams.getAll('picked'),
    returnView: new URL(detail).searchParams.get('view'), forwardView: comparison.searchParams.get('view'),
    historyEntriesOnApproval: 1, modelRequests: modelRequests.length,
  }) });
});

test('manual browsing, history restoration and a dismissed pair leave the person in control', async ({ page }) => {
  await openWorkspace(page);
  for (const id of ['core', 'webgpu', 'core', 'webgpu']) await visit(page, id);
  await expect(approval(page)).toBeHidden();
  await assistance(page).click();
  for (let step = 0; step < 4; step++) await page.goBack();
  for (let step = 0; step < 4; step++) await page.goForward();
  await expect(approval(page)).toBeHidden();
  for (const id of ['cases', 'server', 'cases', 'server']) await visit(page, id);
  await expect(approval(page)).toBeVisible();
  const beforeDismissal = page.url();
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  await expect(approval(page)).toBeHidden();
  await expect(page).toHaveURL(beforeDismissal);
  await visit(page, 'cases');
  await visit(page, 'server');
  await expect(approval(page)).toBeHidden();
});

test('starting a search withdraws the offer and preserves the active input', async ({ page }) => {
  await openWorkspace(page);
  await assistance(page).click();
  await page.getByText('Why this suggestion?', { exact: true }).click();
  await expect(page.getByText('No clear intent yet.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Filters & selection' }).click();
  for (const id of ['core', 'webgpu', 'core', 'webgpu']) await visit(page, id);
  await expect(approval(page)).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search modules' });
  await search.focus();
  await expect(approval(page)).toBeHidden();
  await search.fill('gpu');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('gpu');
  await expect(page).toHaveURL(url => url.searchParams.get('view') === 'detail' && !url.searchParams.has('query'));
  await expect(approval(page)).toBeHidden();
});
