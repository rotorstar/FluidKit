import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { z } from 'zod';
import { LOCALES, LOCALE_NAMES, type Locale } from '@fluidkit/i18n';
import { escapeHTML } from './format';
import type { BUNDLES } from './config';

const text = z.string().trim().min(1);
const passage = z.tuple([text, text]);
const translations = z.record(z.string(), z.strictObject({en:passage, fr:passage}));
const ui = {
  en: {public:'User guide', engineering:'Engineering handbook', language:'Language', search:'Search this book', chapters:'Chapters', skip:'Skip to content', details:'Read the complete German reference and original evidence', screenshot:'English comparison of the Core and WebGPU modules from this checkout.', print:'Print or save as PDF'},
  fr: {public:'Guide d’utilisation', engineering:'Manuel technique', language:'Langue', search:'Rechercher dans ce manuel', chapters:'Chapitres', skip:'Aller au contenu', details:'Consulter la référence détaillée et les documents d’origine en allemand', screenshot:'L’atelier en français affiche les modules sous forme de cartes sur un écran étroit.', print:'Imprimer ou enregistrer en PDF'},
};
function languageLinks(locale: Locale, nested: boolean) {
  const name = locale==='de'?'Sprache':ui[locale].language;
  return `<div class="book-languages" role="navigation" aria-label="${name}">${LOCALES.map(tag=>`<a data-language lang="${tag}" hreflang="${tag}" href="${nested?'../':''}${tag}/handbook.html"${locale===tag?' aria-current="page"':''}>${LOCALE_NAMES[tag]}</a>`).join(' · ')}</div>`;
}
const flows: Record<string, Record<'en'|'fr', readonly string[]>> = {
  'user-flows':{en:['Select a module','Sort the table','View as cards','Find the same module'],fr:['Sélectionner un module','Trier le tableau','Afficher les cartes','Retrouver le même module']},
  'data-actions':{en:['Host query','Validate the response','Check revision','Project stable IDs'],fr:['Requête hôte','Valider la réponse','Vérifier la révision','Projeter les identifiants']},
  'state-flows':{en:['Input event','Check guards','Commit snapshot','Project scene and semantics'],fr:['Événement','Vérifier les conditions','Valider l’état','Projeter scène et sémantique']},
  'url-routing':{en:['Deep link','Resolve language','Parse domain parameters','Restore selection'],fr:['Lien direct','Résoudre la langue','Lire les paramètres métier','Rétablir la sélection']},
};
function diagram(id: string, locale:'en'|'fr') {
  const steps=flows[id]?.[locale];
  if(!steps)return '';
  const graph='flowchart TD\n  '+steps.map((label,index)=>`n${index}["${label}"]`).join(' --> ');
  return `<div class="diagram"><pre class="mermaid">${escapeHTML(graph)}</pre></div><details><summary>Mermaid</summary><pre>${escapeHTML(graph)}</pre></details>`;
}
export async function writeEditions(audience: typeof BUNDLES[number], topics: readonly string[], original: string, css: string) {
  const root = `knowledge/${audience}`;
  const entries = translations.parse(JSON.parse(await readFile(`knowledge/editions/${audience}.json`,'utf8')));
  if (Object.keys(entries).sort().join() !== [...topics].sort().join()) throw new Error(`Edition topics differ for ${audience}`);
  const addNavigation = (html: string, nested: boolean) => html.replace('</header>',`<figure><img loading="lazy" width="900" style="max-width:100%;height:auto" src="${nested?'../':''}assets/m11-workspace-de.png" alt="Modulwerkstatt mit sortierbarer Tabelle und deutschem Sprachwähler"></figure></header>`).replace('<label for="knowledge-search">',`${languageLinks('de',nested)}<label for="knowledge-search">`).replace('</head>',`<script defer src="${nested?'../':''}assets/edition-reader.js"></script></head>`);
  await writeFile(`${root}/handbook.html`,addNavigation(original,false));
  await copyFile('docs/readme/assets/m11-workspace-de.png',`${root}/assets/m11-workspace-de.png`);
  await copyFile('docs/readme/assets/m11-workspace-screenshots.json',`${root}/assets/edition-images.json`);
  await copyFile('scripts/knowledge/edition-reader.js',`${root}/assets/edition-reader.js`);
  for (const locale of LOCALES) {
    await mkdir(`${root}/${locale}`,{recursive:true});
    const file=`${root}/${locale}/handbook.html`;
    if(locale==='de') {
      const nested=original.replace(/(src|href)="(?!#|[a-z][a-z+.-]*:|\/)([^"]+)"/gi,'$1="../$2"').replaceAll("url('assets/","url('../assets/");
      await writeFile(file,addNavigation(nested,true));
      continue;
    }
    const labels=ui[locale], title=labels[audience];
    const toc=topics.map(id=>`<a class="chapter-link" href="#chapter-${id}">${escapeHTML(entries[id]![locale][0])}</a>`).join('');
    const articles=topics.map(id=>{const [heading,body]=entries[id]![locale];return `<article class="kb-chapter" id="chapter-${id}"><h2>${escapeHTML(heading)}</h2><p>${escapeHTML(body)}</p>${diagram(id,locale)}<a hreflang="de" href="../de/handbook.html#chapter-${id}">${labels.details}</a></article>`;}).join('');
    const csp=original.match(/<meta http-equiv="Content-Security-Policy"[^>]+>/)?.[0];
    if(!csp)throw new Error('Missing offline Content-Security-Policy');
    const image=`m11-workspace-${locale}.png`;
    await copyFile(`docs/readme/assets/${image}`,`${root}/assets/${image}`);
    await writeFile(file,`<!doctype html><html lang="${locale}" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${csp}<title>${title} · FluidKit</title><style>${css.replaceAll("url('assets/","url('../assets/")}</style><script defer src="../assets/reader.js"></script><script defer src="../assets/edition-reader.js"></script></head><body><a class="skip" href="#content">${labels.skip}</a><aside><a class="wordmark" href="#top">FluidKit</a><div class="audience">${title}</div>${languageLinks(locale,true)}<label for="knowledge-search">${labels.search}</label><input type="search" id="knowledge-search"><p id="search-status" role="status">${topics.length}</p><nav aria-label="${labels.chapters}">${toc}</nav></aside><main id="content"><header id="top"><h1>${title}</h1><button id="print-book">${labels.print}</button><figure><img loading="lazy" width="780" style="max-width:100%;height:auto" src="../assets/${image}" alt="${labels.screenshot}"></figure></header>${articles}</main></body></html>`);
  }
}
