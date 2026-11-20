import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { z } from 'zod';
import { WorkspaceDataSchema } from '@fluidkit/cases';

const ManifestSchema=z.object({name:z.string(),version:z.string(),dependencies:z.record(z.string(),z.string()).default({})});
async function sourceStats(directory:string):Promise<{files:number;lines:number}>{
  const entries=await readdir(directory,{withFileTypes:true});
  const stats=await Promise.all(entries.filter(entry=>!entry.isSymbolicLink()).map(async entry=>{
    const path=join(directory,entry.name);
    if(entry.isDirectory())return sourceStats(path);
    if(!/\.tsx?$/.test(entry.name))return{files:0,lines:0};
    const source=await readFile(path,'utf8');return{files:1,lines:source.split('\n').length};
  }));
  return stats.reduce((sum,stat)=>({files:sum.files+stat.files,lines:sum.lines+stat.lines}),{files:0,lines:0});
}
export async function readWorkspace(root=resolve(process.cwd(),'../..')){
  const rootManifest=ManifestSchema.parse(JSON.parse(await readFile(join(root,'package.json'),'utf8')));
  const entries=await readdir(join(root,'packages'),{withFileTypes:true});
  const modules=await Promise.all(entries.filter(entry=>entry.isDirectory()&&!entry.isSymbolicLink()).map(async entry=>{
    const directory=join(root,'packages',entry.name);
    const manifest=ManifestSchema.parse(JSON.parse(await readFile(join(directory,'package.json'),'utf8')));
    const dependencies=Object.keys(manifest.dependencies).sort();
    const group=['contracts','core','webgpu','effects','gpu-kernels'].includes(entry.name)?'Kernel': ['react','server','intelligence','cases'].includes(entry.name)?'Adapter':'Tooling';
    return{id:entry.name,name:manifest.name,version:manifest.version,group,...await sourceStats(join(directory,'src')),dependencies,internal:dependencies.filter(name=>name.startsWith('@fluidkit/')).map(name=>name.slice('@fluidkit/'.length))};
  }));
  return WorkspaceDataSchema.parse({schemaVersion:1,name:rootManifest.name,capturedAt:new Date().toISOString(),source:'Workspace package.json + src/**/*.ts(x)',modules:modules.sort((a,b)=>a.id.localeCompare(b.id,'en'))});
}
