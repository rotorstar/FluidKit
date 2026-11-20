import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['package-lock.json','tsconfig.json','tsconfig.base.json','packages/gpu-kernels/package.json','packages/gpu-kernels/tsconfig.build.json','packages/gpu-kernels/vite.config.ts', ...readdirSync(resolve(root,'packages/gpu-kernels/src'),{recursive:true}).filter(file=>file.endsWith('.ts')).sort().map(file=>`packages/gpu-kernels/src/${file}`)];
const hash = createHash('sha256');
for (const file of files) if (existsSync(resolve(root,file))) hash.update(file).update(readFileSync(resolve(root,file)));
const fingerprint=hash.digest('hex');
const stamp=resolve(root,'packages/gpu-kernels/dist/.build-hash');
if (!existsSync(stamp) || readFileSync(stamp,'utf8')!==fingerprint || !['index.js','index.d.ts'].every(file=>existsSync(resolve(root,'packages/gpu-kernels/dist',file)))) {
  for (const args of [['node_modules/typescript/bin/tsc','-p','packages/gpu-kernels/tsconfig.build.json'],['node_modules/vite/bin/vite.js','build','--config','packages/gpu-kernels/vite.config.ts']]) {
    const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
    if(result.status!==0)process.exit(result.status??1);
  }
  writeFileSync(stamp,fingerprint);
}
