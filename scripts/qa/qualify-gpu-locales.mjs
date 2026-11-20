import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { tsImport } from 'tsx/esm/api';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const sourceHash=createHash('sha256');
for (const path of ['packages/webgpu/src/index.ts','apps/studio/public/fonts/inter.font.glb','packages/cases/src/workspace-atlas.ts','packages/cases/src/workspace-compare.ts','packages/core/src/index.ts','packages/core/src/layout.ts','packages/effects/src/motion-sampler.ts','packages/react/src/index.tsx','packages/cases/src/workspace.ts','packages/cases/src/messages.ts','apps/studio/lib/workspace-stage.ts','tests/browser/locale-surface/qualification.ts','font-bake.config.json','package-lock.json']) {
  sourceHash.update(path).update(await readFile(path));
}
const sourceSha256=sourceHash.digest('hex');
const server=await createServer({configFile:false,root:resolve('tests/browser/locale-surface'),publicDir:resolve('apps/studio/public'),logLevel:'warn',
  server:{host:'127.0.0.1',port:0,hmr:false,watch:null,fs:{allow:[process.cwd()]}}, optimizeDeps:{rolldownOptions:{platform:'browser',transform:{target:'esnext'}}}});
await server.listen();
let browser;
try {
  browser=await chromium.launch({channel:process.env.FLUID_BROWSER_CHANNEL??'chrome'});
  const results=[];
  const workspace=[];
  let deviceProfile;
  const {readWorkspace}=await tsImport('../../apps/studio/lib/read-workspace.ts',import.meta.url);
  const data=await readWorkspace(process.cwd());
  const datasetSha256=createHash('sha256').update(JSON.stringify(data.modules)).digest('hex');
  for (const width of [320,390,768,1280]) for (const backend of ['webgpu-only','webgl2']) for (const reduced of [false,true]) {
    const page=await browser.newPage({viewport:{width,height:450},reducedMotion:reduced?'reduce':'no-preference'});
    page.on('console',message=>{if(message.type()==='error')console.log(message.text());});
    page.on('pageerror',error=>console.error(error.message));
    try {
      await page.goto(server.resolvedUrls.local[0]);
      await page.waitForFunction(()=>typeof window.qualify==='function');
      if(!deviceProfile) deviceProfile=await page.evaluate(async()=>{
        const adapter=await navigator.gpu?.requestAdapter();
        return adapter ? {vendor:adapter.info.vendor,architecture:adapter.info.architecture,isFallbackAdapter:adapter.info.isFallbackAdapter} : {available:false};
      });
      const row=await page.evaluate(async options=>window.qualify(...options),[backend,width,reduced]);
      if(row.backend!==(backend==='webgpu-only'?'webgpu':'webgl2'))throw new Error('Unexpected backend');
      console.log(row.backend,width,reduced?'reduced':'full',row.checks.length+' checks');
      results.push(row);
      if(!reduced) {
        const review=await page.evaluate(async args=>window.qualifyWorkspace(...args),[backend,width,data]);
        workspace.push(review);
        console.log('Workspace',review.backend,review.width,review.samples,review.issues.length ? JSON.stringify(review.issues) : 'passed');
      }
    } finally {await page.close();}
  }
  const output=process.env.FLUID_CAPTURE_DIR;
  if(output){await mkdir(output,{recursive:true});await writeFile(resolve(output,'gpu-locales.json'),JSON.stringify({schemaVersion:1,capturedAt:new Date().toISOString(),browser:browser.version(),sourceSha256,datasetSha256,deviceProfile,dataCapturedAt:data.capturedAt,moduleCount:data.modules.length,results,workspace},null,2)+'\n');}
  if(workspace.some(row=>row.issues.length))throw new Error('Workspace text audit failed');
} finally {await browser?.close();await server.close();}
