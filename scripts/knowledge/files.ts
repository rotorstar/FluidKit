import { readdir, realpath, lstat } from 'node:fs/promises';
import { resolve, relative, sep, isAbsolute } from 'node:path';

export function isInside(root:string,path:string){const rel=relative(root,path);return rel===''||(!rel.startsWith(`..${sep}`)&&rel!=='..'&&!isAbsolute(rel));}
export async function bundleFiles(root:string,directory=''):Promise<string[]>{
  const files:string[]=[];
  for(const entry of await readdir(resolve(root,directory),{withFileTypes:true})){
    if(entry.name==='.DS_Store')continue;
    if(entry.isSymbolicLink())throw new Error('Bundle darf keine Symlinks enthalten.');
    const path=directory?`${directory}/${entry.name}`:entry.name;
    if(entry.isDirectory())files.push(...await bundleFiles(root,path));
    else if(entry.isFile()){
      if(path.startsWith('.')||path.split('/').some(part=>part.startsWith('.')))throw new Error('Versteckte Datei im Knowledge-Bundle.');
      if(!/\.(?:md|json|html|js|woff2|txt|png|jpe?g)$/.test(path))throw new Error(`Nicht freigegebenes Bundleformat: ${path}`);
      files.push(path);
    }
  }
  return files.sort();
}
export async function safeFile(root:string,requested:string){
  root=await realpath(root);
  if(requested.includes('\\')||requested.includes('\0'))throw new Error('Unzulässiger Pfad.');
  const decoded=decodeURIComponent(requested);
  if(decoded.split('/').some(part=>part.startsWith('.')&&part!==''))throw new Error('Versteckte oder relative Pfade sind nicht erreichbar.');
  const path=resolve(root,decoded.replace(/^\//,''));
  if(!isInside(root,path))throw new Error('Pfad verlässt das Bundle.');
  const rel=relative(root,path);let cursor=root;
  for(const part of rel.split(sep)){cursor=resolve(cursor,part);if((await lstat(cursor)).isSymbolicLink())throw new Error('Symlinks sind nicht erreichbar.');}
  const actual=await realpath(path);
  if(!isInside(root,actual))throw new Error('Datei verlässt das Bundle.');
  return actual;
}
