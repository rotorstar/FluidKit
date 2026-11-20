import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative, posix } from 'node:path';
import { z } from 'zod';
import { BUNDLES, ENGINEERING_TOPICS, PUBLIC_TOPICS } from './config';
import { parseConcept, okfFindings, profileFindings, documentLinks, type Concept, type Finding } from './format';
import { digest, sourcePaths } from './sync';
import { safeFile, bundleFiles } from './files';

const InventorySchema = z.object({ files: z.array(z.object({ path: z.string(), sha256: z.string(), concepts: z.array(z.string()).min(1) })) });
const ShotsSchema = z.object({ screenshots: z.array(z.object({ id: z.string(), file: z.string(), caption: z.string().min(1), capturedAt: z.iso.datetime({ offset: true }), route: z.string().startsWith('/'), sourceBuild: z.string().min(1), viewport: z.object({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }) })) });
export function resolveBundleLink(source: string, target: string): string | null {
  if (!target || target.startsWith('#') || /^(?:https?:|mailto:|urn:)/i.test(target)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.includes('\\')) throw new Error('Unzulässiger Linktyp.');
  const decoded = decodeURIComponent(target.split(/[?#]/)[0]!);
  const result = posix.normalize(decoded.startsWith('/') ? decoded.slice(1) : posix.join(posix.dirname(source),decoded));
  if (result==='..'||result.startsWith('../')||result.startsWith('/')) throw new Error('Link verlässt das Bundle.');
  return result;
}
export async function fingerprintFindings(root:string,files:{path:string;sha256:string}[],currentPaths:string[]):Promise<Finding[]>{
  const current=new Set(currentPaths),findings:Finding[]=[];
  for(const source of files){
    current.delete(source.path);
    try{const path=resolve(root,source.path);if(relative(root,path).startsWith('..'))throw new Error('Source outside workspace');if(digest(await readFile(path))!==source.sha256)findings.push({path:source.path,rule:'source-freshness',message:'Quelle geändert; zugeordnete Konzepte inhaltlich prüfen.'});}
    catch{findings.push({path:source.path,rule:'source-missing',message:'Dokumentierte Quelle fehlt.'});}
  }
  for(const path of current)findings.push({path,rule:'source-coverage',message:'Neue Quelle ist noch nicht dokumentiert.'});
  return findings;
}
async function markdownPaths(root: string, directory=''): Promise<string[]> {
  const files=[];
  for(const entry of await readdir(resolve(root,directory),{withFileTypes:true})){
    if(entry.isSymbolicLink())throw new Error(`Symlink im Bundle: ${directory}/${entry.name}`);
    if(entry.isDirectory()&&entry.name!=='assets')files.push(...await markdownPaths(root,posix.join(directory,entry.name)));
    else if(entry.isFile()&&entry.name.endsWith('.md'))files.push(posix.join(directory,entry.name));
  }return files.sort();
}
export async function checkKnowledge(root=process.cwd(), now=Date.now()) {
  const okf: Finding[]=[], quality: Finding[]=[];
  const documents: Record<string,Concept[]>={};
  for(const audience of BUNDLES){
    const bundle=resolve(root,'knowledge',audience),docs:Concept[]=[];documents[audience]=docs;
    for(const path of await markdownPaths(bundle)){
      try{const doc=parseConcept(path,new TextDecoder('utf-8',{fatal:true}).decode(await readFile(resolve(bundle,path))));docs.push(doc);okf.push(...okfFindings(doc).map(finding=>({...finding,path:`${audience}/${finding.path}`})));quality.push(...profileFindings(doc,audience,now).map(finding=>({...finding,path:`${audience}/${finding.path}`})));}
      catch{okf.push({path:`${audience}/${path}`,rule:'frontmatter',message:'Datei ist kein parsebares UTF-8-/YAML-Dokument.'});}
    }
    const expected=audience==='engineering'?ENGINEERING_TOPICS:PUBLIC_TOPICS;
    for(const topic of expected)if(!docs.some(doc=>doc.path===`${topic}.md`))quality.push({path:audience,rule:'coverage',message:`Konzept fehlt: ${topic}`});
    for(const reserved of ['index.md','log.md'])if(!docs.some(doc=>doc.path===reserved))quality.push({path:audience,rule:'profile-navigation',message:`FluidKit-Navigation fehlt: ${reserved}`});
    for(const doc of docs){
      for(const link of documentLinks(doc)){
        try{
          if(link.image&&!link.alt.trim())throw new Error('Bildbeschreibung fehlt.');
          if(link.image&&/^[a-z]+:/i.test(link.target))throw new Error('Handbuchbilder müssen lokal im Bundle liegen.');
          const target=resolveBundleLink(doc.path,link.target);if(!target)continue;
          const actual=await safeFile(bundle,target);
          if(link.image){const bytes=await readFile(actual);if(!bytes.length||!((bytes[0]===137&&actual.endsWith('.png'))||(bytes[0]===255&&bytes[1]===216&&/\.jpe?g$/.test(actual))))throw new Error('Bildformat und Dateiendung stimmen nicht überein.');}
        }catch(error){quality.push({path:`${audience}/${doc.path}`,rule:link.image?'image':'link',message:`${link.target}: ${error instanceof Error?error.message:'Ungültiges Ziel.'}`});}
      }
      for(const source of Array.isArray(doc.metadata.sources)?doc.metadata.sources:[]){
        if(source&&typeof source==='object'&&'resource'in source&&typeof source.resource==='string'&&/\.(?:json|md)$/.test(source.resource))try{const target=resolveBundleLink(doc.path,source.resource);if(target)await readFile(await safeFile(bundle,target));}catch{quality.push({path:`${audience}/${doc.path}`,rule:'source',message:'Lokale Quelle fehlt.'});}
      }
    }
  }
  try{
    const inventory=InventorySchema.parse(JSON.parse(await readFile(resolve(root,'knowledge/engineering/assets/source-inventory.json'),'utf8')));
    quality.push(...await fingerprintFindings(root,inventory.files,await sourcePaths(root)));
    for(const source of inventory.files)for(const id of source.concepts)if(!documents.engineering?.some(doc=>doc.path===`${id}.md`))quality.push({path:source.path,rule:'coverage',message:`Zugeordnetes Konzept fehlt: ${id}`});
  }catch{quality.push({path:'engineering',rule:'source-inventory',message:'Quellinventar fehlt oder ist ungültig.'});}
  try{
    const shots=ShotsSchema.parse(JSON.parse(await readFile(resolve(root,'knowledge/public/assets/screenshots.json'),'utf8')));
    if(shots.screenshots.length<12)quality.push({path:'public',rule:'screenshots',message:'Mindestens zwölf tatsächliche Bedienbeispiele erforderlich.'});
    const files=new Set(shots.screenshots.map(shot=>shot.file));
    for(const shot of shots.screenshots)await safeFile(resolve(root,'knowledge/public'),shot.file);
    for(const doc of documents.public??[])for(const image of documentLinks(doc).filter(link=>link.image))if(!files.has(resolveBundleLink(doc.path,image.target)??''))quality.push({path:`public/${doc.path}`,rule:'screenshot-provenance',message:`Bild ohne Aufnahmeregister: ${image.target}`});
  }catch{quality.push({path:'public',rule:'screenshots',message:'Screenshotregister fehlt oder ist ungültig.'});}
  try{
    const bundle=resolve(root,'knowledge/public');
    for(const file of await bundleFiles(bundle))if(/\.(?:json|md|html|txt)$/.test(file)&&/(?:\/Users\/|\/private\/|\/tmp\/codex|knowledge\/engineering|\.\.\/engineering|sk-(?:proj-)?[A-Za-z0-9_-]{24,})/.test(await readFile(resolve(bundle,file),'utf8')))quality.push({path:`public/${file}`,rule:'public-boundary',message:'Interner Pfad oder Credentialmuster im Export.'});
  }catch{quality.push({path:'public',rule:'public-files',message:'Nicht freigegebene Datei oder Symlink im Public-Bundle.'});}
  return{schemaVersion:1,checkedAt:new Date(now).toISOString(),okfVersion:'0.2',concepts:Object.fromEntries(BUNDLES.map(a=>[a,documents[a]!.filter(d=>!d.reserved).length])),okfErrors:okf,qualityErrors:quality,verificationScope:'structure, local links/assets, source fingerprints and declared coverage; no invented human sign-off'};
}
if(process.argv[1]?.endsWith('/check.ts')){
  const report=await checkKnowledge();
  if(process.argv.includes('--write'))await writeFile('knowledge/engineering/assets/quality-report.json',JSON.stringify(report,null,2)+'\n');
  console.info(JSON.stringify(report,null,2));if(report.okfErrors.length||report.qualityErrors.length)process.exitCode=1;
}
