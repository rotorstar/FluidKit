// Run against the local Studio revision whose source and build ID are recorded below.
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = new URL(process.env.FLUID_STUDIO_URL ?? 'http://127.0.0.1:3011');
if (!['localhost','127.0.0.1','[::1]'].includes(baseURL.hostname)) throw new Error('Capture requires the local Studio.');
const destination = resolve('docs/readme/assets');
const sourceHash = createHash('sha256');
const inputs=['apps/studio/proxy.ts','apps/studio/next.config.ts','package-lock.json'];
const packages=await readdir('packages',{withFileTypes:true});
const directories=['apps/studio/app','apps/studio/components','apps/studio/lib','apps/studio/public/fonts',
  ...packages.filter(entry=>entry.isDirectory()).map(entry=>'packages/'+entry.name+'/src')];
async function collect(directory) {
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const path=directory+'/'+entry.name;
    if(entry.isDirectory()) await collect(path);
    else if(entry.isFile()) inputs.push(path);
  }
}
for(const directory of directories) await collect(directory);
for(const path of inputs.sort()) sourceHash.update(path).update('\0').update(await readFile(path)).update('\0');
const browser = await chromium.launch({channel:process.env.FLUID_BROWSER_CHANNEL ?? 'chrome'});
const screenshots = [];
try {
  await mkdir(destination,{recursive:true});
  for (const [locale,view,viewport] of [
    ['de','table',{width:1370,height:910}],
    ['en','compare',{width:1370,height:910}],
    ['fr','cards',{width:390,height:844}],
  ]) {
    const context = await browser.newContext({viewport,locale,deviceScaleFactor:1,reducedMotion:'reduce'});
    try {
      const page = await context.newPage();
      const query = new URLSearchParams({view,sort:'name',direction:'asc',selected:'',group:'all'});
      if (view === 'compare') { query.append('picked','core'); query.append('picked','webgpu'); }
      await page.goto(new URL('/'+locale+'?'+query, baseURL).href);
      const stage=page.locator('[data-motion-version="2"]');
      await page.locator('[data-testid="fluid-surface"][data-status="ready"]').waitFor();
      await page.waitForFunction(view => document.querySelector('[data-motion-version="2"]')?.dataset.view === view
        && /^(webgpu|webgl2)$/.test(document.querySelector('[data-motion-version="2"]')?.dataset.backend ?? ''),view);
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      const png=await page.screenshot({path:resolve(destination,'m11-workspace-'+locale+'.png'),style:'nextjs-portal { display:none !important }'});
      const buildPage = await context.request.get(new URL('/'+locale+'/studio/acceptance',baseURL).href);
      const buildId=/<code>(fluid-[a-z0-9]+)<\/code>/.exec(await buildPage.text())?.[1];
      if(!buildId) throw new Error('Studio did not provide its build ID.');
      const url=new URL(page.url());
      screenshots.push({file:'m11-workspace-'+locale+'.png',locale,view,url:url.pathname+url.search,viewport,dpr:1,
        backend:await stage.getAttribute('data-backend'),buildId,sha256:createHash('sha256').update(png).digest('hex')});
    } finally { await context.close(); }
  }
  await writeFile(resolve(destination,'m11-workspace-screenshots.json'), JSON.stringify({schemaVersion:1,capturedAt:new Date().toISOString(),browser:browser.version(),
    sourceSha256:sourceHash.digest('hex'),capture:'Browser viewport, reduced motion, Next developer indicator hidden.',screenshots},null,2)+'\n');
} finally { await browser.close(); }
