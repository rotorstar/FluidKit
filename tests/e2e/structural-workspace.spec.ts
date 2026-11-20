import { expect, test, type Page } from '@playwright/test';
test.use({ locale: 'de-DE' });

async function openWorkspace(page: Page, path='/') {
  await page.goto(path);
  await expect(page.getByRole('button',{name:/In Karten verwandeln/})).toBeEnabled();
}
for(const [width,height] of [[1280,720],[390,844],[320,700]] as const) {
  test(`a real module and the primary action are visible at ${width}`,async({page})=>{
    await page.setViewportSize({width,height});
    await openWorkspace(page);
    const canvas=page.locator('canvas').first();
    const node=page.locator('[data-fluid-node="module-cases"]');
    const geometry=await node.boundingBox();
    expect(geometry).not.toBeNull();
    expect(geometry!.y+geometry!.height).toBeLessThanOrEqual(height);
    await expect(canvas).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(width<=390) { await page.getByText('Navigation',{exact:true}).click(); await expect(page.getByRole('link',{name:/Bedienungsanleitung/})).toBeVisible(); }
  });
}
test('match, split, merge, reverse and restore domain URLs',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await openWorkspace(page);
  await page.getByRole('button',{name:/In Karten verwandeln/}).click();
  await expect(page).toHaveURL(/view=cards/);
  await page.getByRole('button',{name:'Gruppe → Module'}).click();
  await page.getByRole('button',{name:/Kernel aufteilen/}).click();
  await expect(page).toHaveURL(/atlasGroup=Kernel/);
  await page.getByRole('button',{name:/Gruppe schließen/}).click();
  await expect(page).not.toHaveURL(/atlasGroup=Kernel/);
  await page.getByRole('button',{name:'Karten → Vergleich'}).click();
  await page.getByRole('button',{name:/Auswahl verbinden/}).click();
  const comparison=new URL(page.url());
  expect(comparison.searchParams.get('view')).toBe('compare');
  expect(comparison.searchParams.getAll('picked').length).toBeGreaterThanOrEqual(2);
  await page.getByRole('button',{name:/In Karten aufteilen/}).click();
  const focusedCards = new URL(page.url());
  expect(focusedCards.searchParams.get('cards')).toBe('selected');
  expect(focusedCards.searchParams.getAll('picked')).toEqual(comparison.searchParams.getAll('picked'));
  await page.goBack();
  await expect(page).toHaveURL(comparison.toString());
  await page.goForward();
  await expect(page).toHaveURL(focusedCards.toString());
  await page.goBack();
  await expect(page).toHaveURL(comparison.toString());
  await page.getByRole('link',{name:/Im Studio vergleichen/}).click();
  await expect(page.locator('[data-testid="fluid-surface"][data-status="ready"]')).toHaveCount(2);
  await page.getByRole('link',{name:'Workspace',exact:true}).click();
  await expect(page).toHaveURL(comparison.toString());
  expect(errors).toEqual([]);
});
test('both renderer versions share the scrubber, support replay and restore live controls',async({page})=>{
  await openWorkspace(page,'/studio/transitions');
  await page.getByRole('button',{name:/In Karten verwandeln/}).click();
  const position=page.getByRole('slider',{name:'Animationsposition'});
  await expect(position).toBeEnabled();
  await position.fill('50');await expect(position).toHaveValue('50');
  await page.getByRole('button',{name:'Replay',exact:true}).first().click();
  await expect(page.getByText(/Aufzeichnung · Original-Layout/)).toHaveCount(2);
  await page.getByRole('button',{name:'Live',exact:true}).first().click();
  await expect(page.getByText(/Aufzeichnung · Original-Layout/)).toHaveCount(0);
});
test('UI SDK controlled tabs and modal restore keyboard focus',async({page})=>{
  await page.goto('/studio/behaviors');
  const library=page.getByRole('group',{name:'Komponentenbibliothek'});
  await expect(library.getByText('0.1.0-beta.13')).toBeVisible();
  const tabs=page.getByRole('tablist',{name:'Workspace-Ansicht'});
  await tabs.getByRole('tab',{name:'Tabelle'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab',{name:'Karten'})).toHaveAttribute('aria-selected','true');
  const open=page.getByRole('button',{name:/Kontext prüfen/});
  await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  await library.getByRole('button',{name:/Base UI/}).click();
  await expect(page.getByRole('tab',{name:'Karten',exact:true})).toHaveAttribute('aria-selected','true');
});
