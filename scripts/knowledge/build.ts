import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { BUNDLES, ENGINEERING_TOPICS, PUBLIC_TOPICS } from './config';
import { parseConcept, escapeHTML, ProfileSchema, type Concept } from './format';
import { resolveBundleLink, checkKnowledge } from './check';
import { bundleFiles } from './files';
import { digest } from './sync';
import { writeEditions } from './editions';
import { publishKnowledge } from './publish';

export const chapterID=(path:string)=>`chapter-${path.replace(/\.md$/,'').replace(/[^a-z0-9-]/gi,'-')}`;
/** Book editions follow the newest source chapter; chapter dates remain independent. */
export function knowledgeEditionDate(docs:readonly Concept[]):string {
  if(docs.length===0)throw new Error('An edition requires at least one dated chapter');
  const latest=Math.max(...docs.map(doc=>Date.parse(ProfileSchema.parse(doc.metadata).generated.at)));
  return new Intl.DateTimeFormat('de-DE',{dateStyle:'long',timeZone:'UTC'}).format(latest);
}
/** The renderer never accepts raw HTML. All local chapter targets remain in this book. */
export function renderChapter(doc:Concept) {
  const md=new MarkdownIt({html:false,linkify:false}).use(footnote);
  const originalLink=md.renderer.rules.link_open??((tokens,index,options,_env,self)=>self.renderToken(tokens,index,options));
  md.renderer.rules.link_open=(tokens,index,options,env,self)=>{
    const token=tokens[index]!,href=String(token.attrGet('href')??'');
    const local=resolveBundleLink(doc.path,href);
    if(local && /^(?:[^/]+)\.md$/.test(local))token.attrSet('href',`#${chapterID(local)}`);
    else if(/^https?:/i.test(href)){token.attrSet('rel','noreferrer noopener');}
    return originalLink(tokens,index,options,env,self);
  };
  const originalFence=md.renderer.rules.fence!;
  md.renderer.rules.fence=(tokens,index,options,env,self)=>{
    const token=tokens[index]!;
    return token.info.trim()==='mermaid'?`<div class="diagram" tabindex="0" aria-label="Mermaid-Diagramm, horizontal scrollbar"><pre class="mermaid">${escapeHTML(token.content)}</pre></div><details class="diagram-source"><summary>Mermaid-Quelltext</summary><pre><code>${escapeHTML(token.content)}</code></pre></details>`:originalFence(tokens,index,options,env,self);
  };
  md.renderer.rules.image=(tokens,index)=>{const token=tokens[index]!,src=String(token.attrGet('src')??''),alt=token.content;return `<a data-image href="${escapeHTML(src)}" aria-label="Bild vergrößern: ${escapeHTML(alt)}"><img loading="lazy" src="${escapeHTML(src)}" alt="${escapeHTML(alt)}"></a><span class="image-caption">${escapeHTML(alt)} · Anklicken zum Vergrößern</span>`;};
  const meta=ProfileSchema.safeParse(doc.metadata);
  const sources=meta.success?'<details class="sources"><summary>Quellen und Herkunft</summary><ul>'+meta.data.sources.map(source=>{
    const label=escapeHTML(source.title??source.resource),resource=source.resource;
    const linked=/^https?:\/\//.test(resource)||/^[a-z0-9/._-]+\.(?:json|md)$/.test(resource);
    return `<li>${linked?`<a href="${escapeHTML(resource)}" rel="noreferrer noopener">${label}</a>`:label}</li>`;
  }).join('')+'</ul></details>':'';
  const html=md.render(doc.body,{docId:chapterID(doc.path)})+sources;
  // Native tables remain semantic; an independent scroll surface keeps small screens usable.
  return html.replace(/<table>/g,'<div class="table-scroll" tabindex="0" aria-label="Tabelle, horizontal scrollbar"><table>').replace(/<\/table>/g,'</table></div>');
}
export async function buildKnowledge(){
  const report=await checkKnowledge();
  const stale = report.qualityErrors.filter(finding => finding.rule === 'freshness');
  if (stale.length) console.warn(`Review due for ${stale.length} handbook topics. See npm run knowledge:check.`);
  if (report.okfErrors.length || report.qualityErrors.some(finding => finding.rule !== 'freshness')) {
    throw new Error('Knowledge-Prüfung vor Build fehlgeschlagen. knowledge:check zeigt die Befunde.');
  }
  const out=resolve('node_modules/.cache/fluid-knowledge');
  await build({configFile:false,logLevel:'warn',build:{outDir:out,emptyOutDir:true,reportCompressedSize:false,license:{fileName:'THIRD-PARTY-NOTICES.txt'},lib:{entry:resolve('scripts/knowledge/reader.ts'),name:'FluidKnowledge',formats:['iife'],fileName:()=> 'reader.js'},rolldownOptions:{output:{codeSplitting:false}},minify:true}});
  const css=await readFile('scripts/knowledge/style.css','utf8');
  for(const audience of BUNDLES){
    const root=`knowledge/${audience}`,topics=audience==='engineering'?ENGINEERING_TOPICS:PUBLIC_TOPICS;
    const docs=await Promise.all(topics.map(async topic=>parseConcept(`${topic}.md`,await readFile(`${root}/${topic}.md`,'utf8'))));
    const title=audience==='engineering'?'Engineering Knowledge':'Bedienungsanleitung';
    const toc=docs.map((doc,i)=>`<a class="chapter-link" href="#${chapterID(doc.path)}"><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(String(doc.metadata.title))}</a>`).join('');
    const chapters=docs.map((doc,i)=>`<article class="kb-chapter" id="${chapterID(doc.path)}"><div class="chapter-meta">${String(i+1).padStart(2,'0')} / ${escapeHTML(String(doc.metadata.type))}</div>${renderChapter(doc)}<footer class="chapter-footer">Quelle: <a href="${doc.path}">OKF-Konzept als Markdown</a> · Status: Entwurf · Stand ${knowledgeEditionDate([doc])}</footer></article>`).join('');
    const html=`<!doctype html><html lang="de" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>FluidKit · ${title}</title><style>${css}</style><script defer src="assets/reader.js"></script></head><body><a class="skip" href="#content">Zum Inhalt</a><aside><a class="wordmark" href="#top"><span class="brand-mark">f</span>FluidKit<span class="edition">KNOWLEDGE</span></a><div class="audience">${title}</div><label for="knowledge-search">In diesem Handbuch suchen</label><input type="search" id="knowledge-search" placeholder="Begriff eingeben …" autocomplete="off"><p id="search-status" role="status">${docs.length} Kapitel</p><nav aria-label="Kapitel">${toc}</nav><a class="source-index" href="index.md">OKF-v0.2-Index ↗</a></aside><main id="content"><header id="top"><div class="eyebrow">FLUIDKIT / ${audience.toUpperCase()} / OKF 0.2</div><h1>${audience==='engineering'?'Ein System.<br>Alle Zusammenhänge.':'Oberflächen verstehen.<br>Möglichkeiten entdecken.'}</h1><p>${audience==='engineering'?'Verträge, Architektur und nachweisbarer Implementierungsstand. Vom Event bis zum GPU-Frame.':'Deine Anleitung für Workspace, Effekte und die Studio-Prüfwerkstatt. Mit echten Ansichten und klaren Schritten.'}</p><div class="header-actions"><a class="primary" href="#${chapterID(docs[0]!.path)}">${audience==='engineering'?'Architektur erkunden':'Jetzt beginnen'} ↓</a><button id="print-book">Drucken / als PDF sichern</button></div><div class="scope-note"><strong>0.2 Alpha · Stand ${knowledgeEditionDate(docs)}</strong><span>Dokumentiert den tatsächlich vorhandenen Produktstand. Offene Releasekriterien bleiben offen. Lokal lesbar, ohne externe Skripte oder Analyseaufrufe.</span></div></header>${chapters}<footer class="book-footer">FluidKit · ${title} · Quellenformat OKF v0.2 · <a href="log.md">Änderungslog</a></footer></main><dialog id="image-dialog" aria-label="Screenshot in voller Größe"><div class="dialog-tools"><button id="image-size">Originalgröße</button><button id="close-image" autofocus>Schließen ×</button></div><p id="image-caption"></p><div class="image-viewport"><img id="dialog-image" alt=""></div></dialog></body></html>`;
    await mkdir(`${root}/assets`,{recursive:true});
    await Promise.all([copyFile(`${out}/reader.js`,`${root}/assets/reader.js`),copyFile(`${out}/THIRD-PARTY-NOTICES.txt`,`${root}/assets/THIRD-PARTY-NOTICES.txt`),copyFile('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',`${root}/assets/inter-400.woff2`),copyFile('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2',`${root}/assets/inter-600.woff2`),copyFile('node_modules/@fontsource/inter/LICENSE',`${root}/assets/FONT-LICENSE.txt`)]);
    await writeEditions(audience,topics,html,css);
    const paths=(await bundleFiles(resolve(root))).filter(path=>!['assets/book-build.json','assets/quality-report.json'].includes(path));
    await writeFile(`${root}/assets/book-build.json`,JSON.stringify({schemaVersion:1,builtAt:new Date().toISOString(),files:await Promise.all(paths.map(async path=>({path,sha256:digest(await readFile(`${root}/${path}`))})))},null,2)+'\n');
  }
  await publishKnowledge();
  console.info('Built both offline handbooks in German, English and French with local Mermaid and fonts.');
}
if(process.argv[1]?.endsWith('/build.ts'))await buildKnowledge();
