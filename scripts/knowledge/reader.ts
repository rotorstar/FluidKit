import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad:false, securityLevel:'strict', theme:'neutral', deterministicIds:true, deterministicIDSeed:'fluidkit-knowledge-v1', flowchart:{htmlLabels:false}, fontFamily:'Inter, system-ui, sans-serif' });
const lang = document.documentElement.lang;
const phrases = lang === 'fr' ? { chapters:'chapitres', of:'sur', preparing:'Préparation des diagrammes…', diagram:'Diagramme', unavailable:'Le diagramme est indisponible. Son texte reste accessible.' }
  : lang === 'en' ? { chapters:'chapters', of:'of', preparing:'Preparing diagrams…', diagram:'Diagram', unavailable:'The diagram could not be rendered. Its source is available below.' }
  : { chapters:'Kapitel', of:'von', preparing:'Flows werden lokal vorbereitet …', diagram:'Diagramm', unavailable:'Diagramm konnte nicht dargestellt werden. Der Mermaid-Quellcode bleibt unten lesbar.' };
const fold=(value:string)=>value.normalize('NFD').replace(/\p{Mark}/gu,'').toLocaleLowerCase(lang);
const chapters=[...document.querySelectorAll<HTMLElement>('.kb-chapter')];
const search=document.querySelector<HTMLInputElement>('#knowledge-search');
const links=[...document.querySelectorAll<HTMLAnchorElement>('.chapter-link')];
const status=document.querySelector<HTMLElement>('#search-status');
function filter(){const query=fold((search?.value??'').trim());let count=0;for(const chapter of chapters){const visible=!query||fold(chapter.textContent??'').includes(query);chapter.hidden=!visible;const link=links.find(link=>link.hash===`#${chapter.id}`);if(link)link.hidden=!visible;if(visible)count++;}if(status)status.textContent=query?`${count} ${phrases.of} ${chapters.length}`:`${chapters.length} ${phrases.chapters}`;} search?.addEventListener('input',filter);filter();
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#chapter-"]'):null;if(target&&search?.value){search.value='';filter();}});
const diagrams=[...document.querySelectorAll<HTMLElement>('.mermaid')];
const main=document.querySelector<HTMLElement>('main'),navigation=document.querySelector<HTMLElement>('nav');
const preparing=document.createElement('p');preparing.setAttribute('role','status');preparing.textContent=phrases.preparing;preparing.style.fontSize='12px';status?.after(preparing);
if(main){main.inert=true;main.setAttribute('aria-busy','true');}if(navigation)navigation.inert=true;if(search)search.disabled=true;
async function prepareDiagrams(){
  // Resolve font metrics and every graph before chapter navigation. Lazy graphs
  // above the reading position otherwise move the chosen chapter after a jump.
  await document.fonts.ready;
  for(const [index,node] of diagrams.entries()){
    try{
      // Explicit per-document IDs keep SVG markers and accessibility targets
      // unique even when deterministic rendering is invoked more than once.
      const rendered=await mermaid.render(`fluid-diagram-${index}`,node.textContent??'');
      node.innerHTML=rendered.svg;rendered.bindFunctions?.(node);
      const svg=node.querySelector<SVGSVGElement>('svg');if(!svg)throw new Error('No diagram');
      svg.style.width=`${Math.max(svg.viewBox.baseVal.width,280)}px`;svg.style.maxWidth='none';
      svg.setAttribute('aria-label',`${phrases.diagram} · ${node.closest('article')?.querySelector('h1,h2')?.textContent??''}`);node.dataset.rendered='true';
    }catch{
      node.dataset.rendered='error';const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent=phrases.unavailable;node.after(notice);
    }
  }
}
void prepareDiagrams().finally(()=>{
  if(main){main.inert=false;main.removeAttribute('aria-busy');}if(navigation)navigation.inert=false;if(search)search.disabled=false;preparing.remove();
  // Direct chapter links are restored after all preceding graph heights settle.
  if(/^#chapter-[a-z0-9-]+$/.test(location.hash))document.getElementById(location.hash.slice(1))?.scrollIntoView();
  document.documentElement.dataset.knowledgeReady='true';
});
const dialog=document.querySelector<HTMLDialogElement>('#image-dialog'),largeImage=document.querySelector<HTMLImageElement>('#dialog-image');
document.addEventListener('click',event=>{const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[data-image]'):null;if(!anchor||!dialog||!largeImage)return;event.preventDefault();largeImage.src=anchor.href;largeImage.alt=anchor.querySelector('img')?.alt??'';const label=document.querySelector('#image-caption');if(label)label.textContent=largeImage.alt;dialog.showModal();});
document.querySelector('#close-image')?.addEventListener('click',()=>dialog?.close());
document.querySelector('#image-size')?.addEventListener('click',event=>{const natural=largeImage?.classList.toggle('natural')??false;(event.currentTarget as HTMLButtonElement).textContent=natural?'An Fenster anpassen':'Originalgröße';});
document.querySelector('#print-book')?.addEventListener('click',()=>window.print());
