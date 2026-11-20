import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, symlink, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const root=process.cwd();
const temp=await mkdtemp(join(tmpdir(),'fluid-ui-sdk-compare-'));
const results=[];
const tests=['collection','collection-bridge','behavior-comparison'].map(name=>'tests/unit/'+name+'.test.ts');
try {
  for(const version of ['0.1.0-beta.1','0.1.0-beta.13']) {
    const dir=join(temp,version);
    await mkdir(dir);
    await writeFile(join(dir,'package.json'),JSON.stringify({name:'fluid-qualification',private:true,type:'module'}));
    execFileSync('npm',['install','--prefix',dir,'--omit=peer','--ignore-scripts','--no-audit','--no-fund','@ui-sdk/core@'+version,'@ui-sdk/react@'+version],{stdio:'inherit'});
    for(const peer of ['react','react-dom']) await symlink(resolve('node_modules',peer),join(dir,'node_modules',peer),'dir');
    const resolveInSuite=createRequire(join(dir,'package.json')).resolve;
    const aliases=[];
    for(const name of ['core','react']) {
      const pkg='@ui-sdk/'+name;
      const manifest=JSON.parse(await readFile(join(dir,'node_modules',pkg,'package.json'),'utf8'));
      if(manifest.version!==version) throw new Error('Different SDK version resolved');
      for(const subpath of Object.keys(manifest.exports)) {
        if(subpath.includes('*')||subpath.includes('package.json')) continue;
        const spec=pkg+subpath.slice(1);
        aliases.push({find:spec,replacement:resolveInSuite(spec)});
      }
    }
    aliases.sort((a,b)=>b.find.length-a.find.length);
    const config=join(dir,'vitest.config.mjs'),report=join(dir,'result.json');
    await writeFile(config,'export default '+JSON.stringify({root,oxc:{jsx:{runtime:'automatic'}},resolve:{alias:aliases},test:{include:tests}}));
    execFileSync(resolve('node_modules/.bin/vitest'),['run','--config',config,'--reporter=json','--outputFile='+report,...tests],{stdio:'inherit'});
    const run=JSON.parse(await readFile(report,'utf8'));
    results.push({version,tests:run.numPassedTests,failed:run.numFailedTests,files:tests,aliases:['@ui-sdk/core','@ui-sdk/react'],success:run.success});
  }
  const evidence=JSON.stringify({testedAt:new Date().toISOString(),runner:'vitest; identical checked-in contracts and React/ReactDOM peers',results},null,2)+'\n';
  if(process.argv[2]) await writeFile(process.argv[2],evidence); else console.info(evidence);
} finally { await rm(temp,{recursive:true,force:true}); }
