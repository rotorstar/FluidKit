import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

test.use({ locale: 'de-DE' });

for (const [width,height] of [[1280,720],[390,844]] as const) {
  test(`inspect the shared midpoint and both directions at ${width}`,async({page})=>{
    const evidence = process.env.FLUID_CAPTURE_DIR;
    await page.setViewportSize({width,height});
    await page.goto('/studio/transitions');
    const stage=page.locator('[data-motion-version="2"]'), original=page.locator('[data-motion-version="1"]');
    const records: Array<{ story: string; file: string; sourceBuild: string | null; timestamp: string; route: string; width: number; height: number; dpr: number; canvas: Awaited<ReturnType<typeof stage.boundingBox>>; progress: number; backend: string | null; sha256: string }> = [];
    if(width===390) {
      const visibility=page.getByRole('group',{name:'Sichtbare Vergleichsansicht'});
      await expect(original).toBeHidden();
      await visibility.getByRole('button',{name:'Original',exact:true}).click();
      await expect(original).toBeVisible();
      await expect(stage).toBeHidden();
      await visibility.getByRole('button',{name:'Beide',exact:true}).click();
      await expect(stage).toBeVisible();
      await expect(original).toBeVisible();
      await visibility.getByRole('button',{name:'Formübergang',exact:true}).click();
    }
    for(const story of [
      {id:'match',select:'Zeile → Karte',go:'In Karten verwandeln'},
      {id:'split',select:'Gruppe → Module',go:'Kernel aufteilen'},
      {id:'merge',select:'Karten → Vergleich',go:'Auswahl verbinden'},
    ]) {
      await page.getByRole('button',{name:story.select,exact:true}).click();
      const go=page.getByRole('button',{name:new RegExp(story.go)});
      await expect(go).toBeEnabled();
      await expect(stage).toHaveAttribute('data-phase','idle');
      await go.click();
      const slider=page.getByRole('slider',{name:'Animationsposition'});
      await expect(slider).toBeEnabled();
      // An input at the currently displayed value still takes ownership from the live clock.
      const sameValue = await slider.evaluate((element: HTMLInputElement) => {
        const value = element.valueAsNumber;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return value;
      });
      for (const item of [stage,original]) await expect(item).toHaveAttribute('data-progress', String(sameValue / 100));
      for(const percent of [25,50,75,100,50,0]) {
        await slider.fill(String(percent));
        for(const item of [stage,original]) await expect(item).toHaveAttribute('data-progress',String(percent/100));
        if(evidence && percent===50 && !records.some(r=>r.story===story.id)) {
          await page.evaluate(()=>window.scrollTo(0,0));
          await mkdir(evidence,{recursive:true});
          const file=story.id+'-'+width+'.png';
          const image=await page.screenshot({path:join(evidence,file)});
          const canvas=await stage.locator('canvas').boundingBox();
          records.push({file,story:story.id,sourceBuild:process.env.FLUID_BUILD_ID??null,timestamp:new Date().toISOString(),route:new URL(page.url()).pathname,
            width,height,dpr:await page.evaluate(()=>devicePixelRatio),canvas,progress:percent/100,backend:await stage.getAttribute('data-backend'),sha256:createHash('sha256').update(image).digest('hex')});
        }
      }
      // Prepare a real live source for the next case.
      await page.getByRole('button',{name:'Live',exact:true}).first().click();
    }
    if(evidence) await writeFile(join(evidence,'capture-'+width+'.json'),JSON.stringify(records,null,2)+'\n');
  });
}
