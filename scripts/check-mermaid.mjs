import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
// Mermaid's parser sanitizes labels with DOMPurify. This isolated CLI provides
// its DOM; no browser automation, scripts or remote resources are enabled.
const dom=new JSDOM('');
globalThis.window=dom.window;globalThis.document=dom.window.document;
const {default:mermaid}=await import('mermaid');
mermaid.initialize({startOnLoad:false,securityLevel:'strict'});
async function files(path){const entries=await readdir(path,{withFileTypes:true});return(await Promise.all(entries.map(entry=>entry.isDirectory()?files(join(path,entry.name)):[join(path,entry.name)]))).flat();}
let count=0;
for(const file of ['README.md',...await files('docs'),...await files('knowledge/engineering'),...await files('knowledge/public')]){
 if(file.endsWith('implementation-plan-v1.md'))continue;
 if(!/\.(md|mmd)$/.test(file))continue;
 const source=await readFile(file,'utf8');
 const diagrams=file.endsWith('.mmd')?[source]:[...source.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)].map(match=>match[1]);
 for(const diagram of diagrams){try{await mermaid.parse(diagram);count++;}catch(error){throw new Error(`Invalid Mermaid in ${file}`,{cause:error});}}
}
dom.window.close();console.info(`Validated ${count} Mermaid diagrams with Mermaid 12.2.0.`);
