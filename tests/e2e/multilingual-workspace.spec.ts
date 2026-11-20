import { expect, test } from '@playwright/test';
import { studioMessage } from '../../apps/studio/lib/studio-messages';
import { LOCALES } from '@fluidkit/i18n';

test('legacy links negotiate the language, and prefixed pages send translated HTML', async ({ request }) => {
  const deepLink = '/studio/transitions?view=cards';
  for (const locale of LOCALES) {
    const legacy = await request.get(deepLink, { maxRedirects: 0, headers: { 'Accept-Language': locale } });
    expect(legacy.status()).toBe(307);
    expect(new URL(legacy.headers().location!, legacy.url()).pathname).toBe('/' + locale + '/studio/transitions');
    expect(legacy.headers().location).toContain('?view=cards');
    expect(legacy.headers().vary).toMatch(/cookie/i);
    const explicit = await request.get('/' + locale + '/studio/transitions', { headers: { 'Accept-Language': 'en', cookie: 'fluid_locale=de' } });
    expect(explicit.status()).toBe(200);
    const html = await explicit.text();
    expect(html).toContain('<html lang="' + locale + '" dir="ltr">');
    expect(html).toContain(studioMessage(locale, 'workshopTitle'));
    expect(html).toContain(studioMessage(locale, 'metaTitle'));
  }
  expect((await request.get('/es/studio/transitions')).status()).toBe(404);
});

for (const width of [390, 1280]) {
  test('switching all six language pairs preserves the half-finished transition at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/de/studio/transitions?review=m11#stage');
    await page.getByRole('button', { name: /In Karten verwandeln/ }).click();
    const progress = page.getByRole('slider', { name: 'Animationsposition' });
    await progress.fill('50');
    const stage = page.locator('[data-motion-version="2"]');
    await expect(stage).toHaveAttribute('data-progress', '0.5');
    const surface = stage.locator('canvas').first();
    await surface.evaluate(canvas => { canvas.dataset.session = 'same-surface'; });
    const historyLength = await page.evaluate(() => history.length);
    for (const locale of ['en', 'fr', 'de', 'fr', 'en', 'de'] as const) {
      const picker = page.getByRole('combobox', { name: /^(Sprache|Language|Langue)$/ });
      await picker.focus();
      await picker.selectOption(locale);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('combobox', { name: studioMessage(locale, 'language') })).toBeFocused();
      await expect(page.getByRole('heading', { name: studioMessage(locale, 'workshopTitle') })).toBeVisible();
      await expect(stage).toHaveAttribute('data-view', 'cards');
      await expect(stage).toHaveAttribute('data-progress', '0.5');
      await expect(surface).toHaveAttribute('data-session', 'same-surface');
      expect(new URL(page.url()).pathname).toBe('/' + locale + '/studio/transitions');
      expect(new URL(page.url()).search + new URL(page.url()).hash).toBe('?review=m11#stage');
      expect(await page.evaluate(() => history.length)).toBe(historyLength);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}

test('an unsaved authoring draft survives a language change without submitting it', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', request => { if (request.method() === 'POST' && /\/api\/(authoring|design-review)/.test(request.url())) posts.push(request.url()); });
  await page.goto('/de/studio/authoring');
  const draft = page.locator('textarea:visible').first();
  await draft.fill('Ébauche privée · Entwurf');
  const picker = page.getByRole('combobox', { name: 'Sprache' });
  await draft.dispatchEvent('compositionstart');
  await picker.selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await draft.dispatchEvent('compositionend');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(draft).toHaveValue('Ébauche privée · Entwurf');
  expect(posts).toEqual([]);
});

test('comparison selection, locale, fragment and workspace return survive history and reload', async ({ page }) => {
  await page.goto('/de#selection');
  await page.getByRole('button', {name:'Karten → Vergleich'}).click();
  await page.getByRole('button', {name:/Auswahl verbinden/}).click();
  const compare = new URL(page.url());
  const picked = compare.searchParams.getAll('picked');
  expect(picked.length).toBeGreaterThanOrEqual(2);
  await page.getByRole('combobox',{name:'Sprache'}).selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  const localized = new URL(page.url());
  expect(localized.search).toBe(compare.search);
  expect(localized.hash).toBe('#selection');
  await page.reload();
  await expect(page.locator('[data-motion-version="2"]')).toHaveAttribute('data-view','compare');
  await page.getByRole('link',{name:/Comparer dans Studio/}).click();
  await expect(page).toHaveURL(/\/fr\/studio\/transitions/);
  await page.getByRole('link',{name:'Espace de travail',exact:true}).click();
  await expect.poll(() => new URL(page.url()).searchParams.getAll('picked')).toEqual(picked);
  await page.goBack();
  await expect(page).toHaveURL(/\/fr\/studio\/transitions/);
  await page.goForward();
  await expect(page.locator('[data-motion-version="2"]')).toHaveAttribute('data-view','compare');
  await expect.poll(() => new URL(page.url()).searchParams.getAll('picked')).toEqual(picked);
});

test('an original German recording opens in French and a separately exported French run links back to it', async ({ page }) => {
  await page.goto('/de/studio/transitions');
  await page.getByRole('button',{name:/In Karten verwandeln/}).click();
  await page.getByRole('slider',{name:'Animationsposition'}).fill('50');
  await page.getByRole('button',{name:'Replay',exact:true}).first().click();
  await page.getByRole('combobox',{name:'Sprache'}).selectOption('fr');
  await expect(page.getByText('Langue d’origine : Deutsch',{exact:true}).first()).toBeVisible();
  await page.locator('details').filter({ has:page.locator('section.effect-lab') }).locator(':scope > summary').first().click();
  const originalDownload = page.waitForEvent('download');
  await page.getByRole('button',{name:'Exporter l’exécution',exact:true}).click();
  const { readFile } = await import('node:fs/promises');
  const original = JSON.parse(await readFile((await (await originalDownload).path())!, 'utf8'));
  expect(original.languageProfile.context.language).toBe('de');
  expect(original.languageProfile.buildId).toMatch(/^fluid-/);
  const derivativeDownload = page.waitForEvent('download');
  await page.getByRole('button',{name:'Exporter une nouvelle exécution dans la langue du Studio'}).click();
  const derived=JSON.parse(await readFile((await (await derivativeDownload).path())!, 'utf8'));
  const { createHash } = await import('node:crypto');
  expect(derived.sourceRecordingSha256).toBe(createHash('sha256').update(JSON.stringify(original)).digest('hex'));
  expect(derived.recording.languageProfile.context.language).toBe('fr');
  expect(derived.recording.target.map((node:{id:string})=>node.id)).toEqual(original.target.map((node:{id:string})=>node.id));
  expect(derived.recording.target.map((node:{text:string})=>node.text)).not.toEqual(original.target.map((node:{text:string})=>node.text));
});

test('an explicit AI authoring request binds its own language and a delayed budget error follows the visible language', async ({ page }) => {
  let requestedLocale: unknown;
  let releaseRequest: (() => void) | undefined;
  const responseGate = new Promise<void>(resolve => { releaseRequest = resolve; });
  await page.route('**/api/authoring', async route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({json:{configured:true,token:'a'.repeat(48),policy:{model:'test-provider',sessionUsd:0.35}}});
    }
    requestedLocale=route.request().postDataJSON().input.responseLocale;
    await responseGate;
    return route.fulfill({status:429,json:{error:'provider diagnostic in another language'}});
  });
  await page.goto('/fr/studio/authoring');
  await page.getByRole('button',{name:'Générer un brouillon avec l’IA'}).click();
  await expect.poll(()=>requestedLocale).toBe('fr');
  await page.getByRole('combobox',{name:'Langue'}).selectOption('en');
  releaseRequest?.();
  await expect(page.getByText(studioMessage('en','aiLimit'),{exact:true})).toBeVisible();
  await expect(page.getByText('provider diagnostic in another language')).toHaveCount(0);
});
