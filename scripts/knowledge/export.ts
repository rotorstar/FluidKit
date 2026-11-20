import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { BUNDLES } from './config';
import { bundleFiles } from './files';
import { digest } from './sync';
import { checkKnowledge } from './check';
import { z } from 'zod';

const report=await checkKnowledge();if(report.okfErrors.length||report.qualityErrors.length)throw new Error('Export benötigt eine fehlerfreie Knowledge-Prüfung.');
await mkdir('knowledge/exports',{recursive:true});
for(const audience of BUNDLES){
  const root=resolve('knowledge',audience),files=await bundleFiles(root);
  if(!files.includes('handbook.html')||!files.includes('assets/reader.js'))throw new Error('Zuerst knowledge:build ausführen.');
  const built=z.object({files:z.array(z.object({path:z.string(),sha256:z.string()}))}).parse(JSON.parse(await readFile(resolve(root,'assets/book-build.json'),'utf8')));
  const expected=files.filter(path=>!['assets/book-build.json','assets/quality-report.json'].includes(path));
  if(JSON.stringify(built.files.map(file=>file.path).sort())!==JSON.stringify(expected))throw new Error('Dateibestand seit HTML-Build geändert.');
  for(const file of built.files)if(digest(await readFile(resolve(root,file.path)))!==file.sha256)throw new Error(`Veraltetes HTML-Bundle: ${file.path}. knowledge:build erneut ausführen.`);
  const target=resolve('knowledge/exports',`fluidkit-${audience}-okf-0.2.zip`);
  // -FS removes obsolete entries; only explicit allowlisted files enter the archive.
  execFileSync('zip',['-q','-X','-FS',target,'-@'],{cwd:root,input:files.join('\n')+'\n'});
  const actual=execFileSync('unzip',['-Z1',target],{encoding:'utf8'}).trim().split('\n').sort();
  if(JSON.stringify(actual)!==JSON.stringify(files))throw new Error('ZIP-Inhalt stimmt nicht mit Bundle überein.');
  const manifest={schemaVersion:1,audience,okfVersion:'0.2',exportedAt:new Date().toISOString(),archive:target.split('/').at(-1),sha256:digest(await readFile(target)),files:await Promise.all(files.map(async path=>({path,sha256:digest(await readFile(resolve(root,path)))})))};
  await writeFile(`knowledge/exports/${audience}-manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.info(`${audience}: ${files.length} Dateien, isoliertes ZIP geprüft.`);
}
