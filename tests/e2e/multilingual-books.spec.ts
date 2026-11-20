import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { ENGINEERING_TOPICS, PUBLIC_TOPICS } from '../../scripts/knowledge/config';

for (const [audience, topics] of [['public',PUBLIC_TOPICS],['engineering',ENGINEERING_TOPICS]] as const) {
  test(`${audience}: six offline navigation directions share chapter IDs and local resources`, async ({page,context})=>{
    test.setTimeout(120_000);
    await context.setOffline(true);
    const external:string[]=[]; page.on('request',req=>{if(/^https?:/.test(req.url()))external.push(req.url());});
    const chapter=audience==='public'?'workspace':'data-actions';
    const base=resolve('knowledge',audience);
    await page.goto(pathToFileURL(resolve(base,'de/handbook.html')).href+'#chapter-'+chapter);
    for(const lang of ['en','fr','de','fr','en','de']) {
      await expect(page.locator('html')).toHaveAttribute('data-knowledge-ready','true',{timeout:45_000});
      await page.locator('a[data-language][hreflang="'+lang+'"]').click();
      await expect(page.locator('html')).toHaveAttribute('lang',lang);
      await expect(page).toHaveURL(new RegExp(`/${lang}/handbook.html#chapter-${chapter}$`));
      await expect(page.locator('article.kb-chapter')).toHaveCount(topics.length);
      await expect(page.locator('html')).toHaveAttribute('data-knowledge-ready','true',{timeout:45_000});
      if(lang!=='de') {
        await expect(page.locator('img').first()).toHaveJSProperty('complete',true);
        expect(await page.locator('img').first().evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
        await page.locator('#knowledge-search').fill('zzzzzzzz');
        await expect(page.locator('article:visible')).toHaveCount(0);
        await page.locator('#knowledge-search').fill('');
        await expect(page.locator('article:visible')).toHaveCount(topics.length);
        if(audience==='engineering')await expect(page.locator('.mermaid[data-rendered="true"]')).toHaveCount(4);
      }
      await page.locator(`#chapter-${chapter}`).evaluate(el=>el.scrollIntoView());
    }
    expect(external).toEqual([]);
  });
}
