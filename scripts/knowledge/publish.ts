import { access, copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { BUNDLES } from './config';
import { bundleFiles, safeFile } from './files';

/** Only validated bundle files enter this disposable, generated Studio directory. */
export async function publishKnowledge(root=process.cwd()) {
  for(const audience of BUNDLES){
    const source=resolve(root,'knowledge',audience),target=resolve(root,'apps/studio/public/knowledge',audience);
    const files=await bundleFiles(source);
    if(!files.includes('handbook.html')||!files.includes('assets/reader.js'))throw new Error('Knowledge-Handbücher zuerst mit knowledge:build erzeugen.');
    const originals=await Promise.all(files.map(async path=>({path,source:await safeFile(source,path)})));
    await rm(target,{recursive:true,force:true});
    for(const file of originals){const destination=resolve(target,file.path);await mkdir(dirname(destination),{recursive:true});await copyFile(file.source,destination);}
  }
  console.info('Knowledge available at /knowledge/{engineering,public}/handbook.html.');
}
if(process.argv[1]?.endsWith('/publish.ts')){
  // Workspace lifecycle scripts run from apps/studio; the authoring tools use the repository root.
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  let built=false;
  try{await Promise.all(BUNDLES.flatMap(audience=>['de','en','fr'].map(locale=>access(`knowledge/${audience}/${locale}/handbook.html`))));}
  catch(error){if(!(error instanceof Error&&'code'in error&&error.code==='ENOENT'))throw error;execFileSync(process.execPath,['--import','tsx','scripts/knowledge/build.ts'],{stdio:'inherit'});built=true;}
  if(!built)await publishKnowledge();
}
