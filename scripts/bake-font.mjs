import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const config=JSON.parse(await readFile('font-bake.config.json','utf8'));
const version=JSON.parse(await readFile('node_modules/@pmndrs/glyph/package.json','utf8')).version;
if(config.schemaVersion!==2||version!==config.glyphVersion)throw new Error('Font baker version mismatch; qualify the new artifact before changing the pin');
for(const font of config.fonts){
  const hash=createHash('sha256').update(await readFile(font.input)).digest('hex');
  if(hash!==font.sourceSha256)throw new Error(`Font source hash mismatch: ${font.id}`);
  const result=spawnSync(process.execPath,['node_modules/@pmndrs/glyph/bin/glyph.js','bake','--input',font.input,'--output',font.output,...(font.preparedSubset?[]:['--unicodes',font.unicodes]),'--msdf',...(font.msdf?[font.msdf]:[]),'--yes',...(process.argv.includes('--check')?['--check']:[])],{stdio:'inherit'});
  if(result.status!==0){process.exitCode=result.status??1;break;}
  if(font.maxBytes&&(await stat(font.output)).size>font.maxBytes)throw new Error(`Font artifact exceeds ${font.maxBytes} bytes: ${font.id}`);
}
