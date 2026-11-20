import { build } from 'vite';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Bundle the same vanilla host operation with both published adapters. Neither is externalized.
const variants = {
  fluidkit: `import {defineCatalog} from '@fluidkit/i18n'; const t=defineCatalog({count:{de:'{n, plural, one {# Datei} other {# Dateien}}',en:'{n, plural, one {# file} other {# files}}',fr:'{n, plural, one {# fichier} other {# fichiers}}'}}); export const render=n=>t('fr','count',{n});`,
  'use-intl/core':`import {createTranslator} from 'use-intl/core'; const t=createTranslator({locale:'fr-FR',timeZone:'UTC',messages:{count:'{n, plural, one {# fichier} other {# fichiers}}'}}); export const render=n=>t('count',{n});`,
};
const dir=await mkdtemp(join(tmpdir(),'fluidkit-intl-'));
const profiles=[];
try {
  for(const [name, source] of Object.entries(variants)) {
    const id=resolve('fluidkit-comparison-entry.mjs');
    const result=await build({configFile:false,logLevel:'silent',define:{'process.env.NODE_ENV':JSON.stringify('production')},plugins:[{name:'qualification-fixture',resolveId:entry=>entry===id?id:null,load:entry=>entry===id?source:null}],build:{write:false,target:'es2022',minify:true,lib:{entry:id,formats:['es'],fileName:'host'},rolldownOptions:{output:{codeSplitting:false}}}});
    const chunk=(Array.isArray(result)?result[0]:result).output.find(item=>item.type==='chunk' && item.isEntry);
    assert.ok(chunk);
    const forbidden=chunk.moduleIds.filter(path=>/\/node_modules\/(?:next|react|react-dom)\//.test(path));
    if (name==='fluidkit') assert.deepEqual(forbidden,[]);
    const path=join(dir,`${profiles.length}.mjs`);await writeFile(path,chunk.code);
    const {render}=await import(pathToFileURL(path).href);
    assert.deepEqual([0,1,2,1234].map(render),['0 fichier','1 fichier','2 fichiers','1 234 fichiers']);
    profiles.push({name,entryBytes:Buffer.byteLength(chunk.code),entryGzipBytes:gzipSync(chunk.code).length,modules:chunk.moduleIds.length,uiFrameworkModules:forbidden.map(id=>id.split('/node_modules/').at(-1)),host:'Node, no browser globals'});
  }
  const root='docs/qa/2026-11-20-m11';await mkdir(root,{recursive:true});
  await writeFile(`${root}/adapter-comparison.json`,JSON.stringify({node:process.version,icu:process.versions.icu,formatjs:'12.2.0',useIntl:'4.15.1',platform:process.platform,arch:process.arch,gzipDeltaFluidMinusUseIntl:profiles[0].entryGzipBytes-profiles[1].entryGzipBytes,profiles},null,2)+'\n');
  console.table(profiles);
} finally {await rm(dir,{recursive:true,force:true});}
