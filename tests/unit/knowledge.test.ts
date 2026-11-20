import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseConcept, okfFindings, profileFindings, documentLinks } from '../../scripts/knowledge/format';
import { resolveBundleLink, fingerprintFindings } from '../../scripts/knowledge/check';
import { knowledgeEditionDate, renderChapter } from '../../scripts/knowledge/build';
import { safeFile, bundleFiles } from '../../scripts/knowledge/files';
import { digest, renderAcceptanceSections } from '../../scripts/knowledge/sync';
import type { AcceptanceCriterion } from '../../packages/contracts/src/acceptance';
import { topicsForSource } from '../../scripts/knowledge/config';
import { EFFECT_LIBRARY } from '@fluidkit/effects';

const generated='2026-11-02T09:00:00Z';
const valid='---\ntype: Custom Thing\ntitle: Example\ndescription: Independent fixture\naudience: public\nstatus: draft\ntags: []\ngenerated: {by: "process:test", at: "'+generated+'"}\nstale_after: "2026-12-02T00:00:00+00:00"\nsources: [{id: fact, resource: "urn:fixture:fact"}]\nverified: {by: "human:reviewer", at: "'+generated+'"}\nextra: {future_extension: true}\n---\n\n# Example\n\nA fact.[^fact]\n\n[^fact]: Explicit source.\n';

describe('OKF interoperability and FluidKit publishing boundaries',()=>{
  it('dates the edition from current chapters while preserving historical chapter dates',()=>{
    const old=parseConcept('original.md',valid);
    const current=parseConcept('effects.md',valid.replaceAll(generated,'2026-11-03T22:00:00Z'));
    expect(knowledgeEditionDate([old])).toBe('2. November 2026');
    expect(knowledgeEditionDate([current])).toBe('3. November 2026');
    expect(knowledgeEditionDate([old,current])).toBe('3. November 2026');
    expect(()=>knowledgeEditionDate([])).toThrow('at least one');
  });
  it('preserves offline Markdown supplements as files while routing book chapters to anchors',()=>{
    const html=renderChapter(parseConcept('overview.md',valid+'\n[Load plan](assets/load-validation-plan.md) · [Runtime](core-runtime.md)'));
    expect(html).toContain('href="assets/load-validation-plan.md"');
    expect(html).toContain('href="#chapter-core-runtime"');
  });
  it('accepts the minimal interoperable document and preserves unknown extensions',()=>{
    const doc=parseConcept('example.md','---\ntype: Unregistered Example\nfuture: {nested: 12}\n---\n# Example\n[Missing is tolerated by OKF](missing.md)');
    expect(okfFindings(doc)).toEqual([]);expect(doc.metadata.future).toEqual({nested:12});
    expect(profileFindings(doc,'public',Date.parse(generated))).not.toEqual([]);
  });
  it('accepts a bare verified mapping, explicit offsets and unknown metadata',()=>{
    const doc=parseConcept('example.md',valid);expect(okfFindings(doc)).toEqual([]);expect(profileFindings(doc,'public',Date.parse(generated))).toEqual([]);expect(doc.metadata.extra).toEqual({future_extension:true});
    expect(profileFindings(parseConcept('example.md',valid+'\n```ts\nconst pattern = /[^?#]/;\n```\n'),'public',Date.parse(generated))).toEqual([]);
  });
  it('rejects malformed frontmatter and a missing/empty mandatory type',()=>{
    expect(()=>parseConcept('x.md','---\ntype: one\ntype: two\n---')).toThrow();
    expect(()=>parseConcept('x.md','---\ntype: one')).toThrow();
    for(const source of ['# Heading','---\ntype: ""\n---\nText'])expect(okfFindings(parseConcept('x.md',source))).toHaveLength(1);
  });
  it('distinguishes root-index rules and validates real calendar dates and ordering',()=>{
    expect(okfFindings(parseConcept('index.md','---\nokf_version: "0.2"\n---\n# Contents\n- [Thing](thing.md)'))).toEqual([]);
    expect(okfFindings(parseConcept('nested/index.md','---\nokf_version: "0.2"\n---\n# Contents\n- [Thing](thing.md)'))).not.toEqual([]);
    for(const body of ['# Log\n## 2026-02-31\nEntry','---\ntype: Log\n---\n# Log\n## 2026-11-02\nEntry','# Log\n## 2026-10-01\nOld\n## 2026-11-01\nNew'])expect(okfFindings(parseConcept('log.md',body))).not.toEqual([]);
  });
  it('surfaces expired knowledge, timezone omissions, attribution and public leaks',()=>{
    expect(profileFindings(parseConcept('x.md',valid),'public',Date.parse('2027-01-01'))[0]?.rule).toBe('freshness');
    expect(profileFindings(parseConcept('x.md',valid.replace('2026-12-02T00:00:00+00:00','2026-12-02')),'public',Date.parse(generated))).not.toEqual([]);
    expect(profileFindings(parseConcept('x.md',valid+'\nUnknown.[^unknown]'),'public',Date.parse(generated)).some(f=>f.rule==='attribution')).toBe(true);
    expect(profileFindings(parseConcept('x.md',valid+'\n/Users/example/private-path'),'public',Date.parse(generated)).some(f=>f.rule==='public-boundary')).toBe(true);
  });
  it('resolves portable links while rejecting encoded traversal and executable schemes',()=>{
    expect(resolveBundleLink('nested/a.md','../b.md#section')).toBe('b.md');
    expect(resolveBundleLink('a.md','/b.md')).toBe('b.md');
    expect(resolveBundleLink('a.md','https://example.com')).toBeNull();
    for(const target of ['../engineering/secret.md','%2e%2e/secret','javascript:alert(1)','file:///etc/passwd','a\\b.md'])expect(()=>resolveBundleLink('a.md',target)).toThrow();
    expect(documentLinks(parseConcept('x.md','![Diagram](assets/diagram.png) [Next](next.md)')).map(link=>[link.target,link.image])).toEqual([['assets/diagram.png',true],['next.md',false]]);
  });
  it('renders local chapters, independent footnotes and HTML-like input safely',()=>{
    const source='---\ntype: Example\n---\n# Example\n\n[Next](next.md)\n\n<script>alert(1)</script>\n\nText[^a]\n\n[^a]: Source.\n\n```mermaid\nflowchart LR\nA-->B\n```';
    const first=renderChapter(parseConcept('first.md',source)),second=renderChapter(parseConcept('second.md',source));
    expect(first).toContain('href="#chapter-next"');expect(first).not.toContain('<script>');expect(first).toContain('&lt;script&gt;');expect(first).toContain('class="mermaid"');
    expect(first).toContain('id="fn-chapter-first-1"');expect(second).toContain('id="fn-chapter-second-1"');
  });
  it('detects stale, missing and newly introduced sources instead of silently rebinding',async()=>{
    expect(()=>topicsForSource('packages/unreviewed/src/index.ts')).toThrow();
    expect(()=>topicsForSource('apps/studio/app/new-route/page.tsx')).toThrow();
    // Authoring is a separate controlled generation boundary, not an alias for
    // the earlier image-review endpoint. Unknown future routes still fail above.
    expect(topicsForSource('apps/studio/app/api/authoring/route.ts')).toEqual(['url-routing','studio','contracts','security']);
    const root=await mkdtemp(join(tmpdir(),'fluid-knowledge-source-'));try{
      await writeFile(join(root,'current.ts'),'changed');
      const findings=await fingerprintFindings(root,[{path:'current.ts',sha256:digest('old')},{path:'gone.ts',sha256:digest('old')}],['current.ts','new.ts']);
      expect(findings.map(f=>f.rule).sort()).toEqual(['source-coverage','source-freshness','source-missing']);
    }finally{await rm(root,{recursive:true,force:true});}
  });
  it('publishes milestone and global criteria even when they have no feature-matrix row',()=>{
    const criteria: AcceptanceCriterion[] = [
      ['T01-AC01','T01','Main task condition'],
      ['M7-AC22','M7','Missing frames remain inconclusive'],
      ['GLOBAL-RELEASE-01','GLOBAL','Release gate'],
      ['ARCH-RENDER-01','ARCH','Rendering contract'],
      ['UI-CHECK-01','UI','Readability gate'],
    ].map(([id,task,criterion])=>({id:id!,task:task!,criterion:criterion!,source:'fixture.md',sourceHash:'0'.repeat(64),status:'open',scope:'Fixture scope',remaining:'Executed evidence required',evidence:[]}));
    const rendered=renderAcceptanceSections(criteria,{T01:{feature:'Vision'}});
    for(const item of criteria)expect(rendered.split(`### ${item.id} · open`)).toHaveLength(2);
    expect(rendered).toContain('## T01: Vision');
    expect(rendered).toContain('## M7: M7');
    expect(rendered).toContain('Missing frames remain inconclusive');
    expect(rendered).not.toContain('undefined');
  });
  it('keeps published recommended presets distinct from the original planning targets',async()=>{
    const guide=await readFile(new URL('../../knowledge/public/effects.md',import.meta.url),'utf8');
    for(const id of ['silk-cascade','liquid-lens','particle-weave']){
      const recipe=EFFECT_LIBRARY.find(effect=>effect.id===id)!;
      const {durationMs,intensity}=recipe.recommendedParameters;
      expect(guide).toContain(`| ${recipe.title} | ${durationMs.toLocaleString('de-DE')} ms | ${(intensity*100).toLocaleString('de-DE')} % |`);
    }
    expect(guide).toContain('Für diese Vergleichsaufnahmen wurden einheitlich 1.100 ms und 65 % Intensität');
  });
  it('serves and exports only real files inside one audience, excluding hidden paths and symlinks',async()=>{
    const root=await mkdtemp(join(tmpdir(),'fluid-knowledge-file-'));try{
      await mkdir(join(root,'public'));await writeFile(join(root,'public','index.md'),'public');await writeFile(join(root,'private.md'),'private');
      expect(await safeFile(join(root,'public'),'/index.md')).toBe(await realpath(join(root,'public','index.md')));
      expect(await bundleFiles(join(root,'public'))).toEqual(['index.md']);
      for(const missing of ['/missing.md','/assets/missing.png'])await expect(safeFile(join(root,'public'),missing)).rejects.toThrow();
      for(const path of ['/../private.md','/%2e%2e/private.md','/.env.local'])await expect(safeFile(join(root,'public'),path)).rejects.toThrow();
      await symlink(join(root,'private.md'),join(root,'public','leak.md'));
      await expect(safeFile(join(root,'public'),'/leak.md')).rejects.toThrow();await expect(bundleFiles(join(root,'public'))).rejects.toThrow();
    }finally{await rm(root,{recursive:true,force:true});}
  });
});
