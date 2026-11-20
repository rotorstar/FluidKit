import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { AcceptanceLedgerSchema } from '@fluidkit/contracts';
import { acceptanceSources } from '../../scripts/acceptance-source';

describe('complete acceptance reconciliation',()=>{
  it('contains every task and retains multiline normative conditions',async()=>{
    const sources=await acceptanceSources(process.cwd());
    for(let i=1;i<=58;i++)expect([...sources.values()].some(source=>source.task===`T${String(i).padStart(2,'0')}`)).toBe(true);
    expect([...sources.values()].some(source=>source.criterion.includes('Pointer und Tastatur auch bei 320 px'))).toBe(true);
    expect([...sources.values()].some(source=>source.criterion.includes('10.000 Datenzeilen'))).toBe(true);
    expect(sources.has('GLOBAL-RELEASE-06')).toBe(true);
    expect(sources.has('GLOBAL-COVERAGE-01')).toBe(true);
    expect(sources.has('GLOBAL-ROLLOUT-01')).toBe(true);
    expect(sources.has('M5-AC04')).toBe(true);
    expect(sources.has('M6-AC09')).toBe(true);
    expect(sources.has('M7-AC27')).toBe(true);
    expect([...sources.values()].filter(source=>source.task==='M7')).toHaveLength(27);
    expect(sources.has('T58-AC05')).toBe(true);
    expect(sources.has('ARCH-API-29')).toBe(true);
    expect(sources.has('UI-CHECK-19')).toBe(true);
    expect(sources.get('T54-AC03')?.criterion).toContain('inconclusive');
    expect(sources.has('PROVIDER-AC04')).toBe(true);
    expect(sources.has('UI-CHECK-12')).toBe(true);
    expect(sources.has('UI-TASK-05')).toBe(true);
    expect(sources.has('UI-RUN-04')).toBe(true);
  });
  it('never lets a source path alone close a criterion and rejects duplicate AC IDs',()=>{
    const current=JSON.parse(readFileSync('docs/acceptance/ledger.json','utf8'));
    const first=current.criteria[0];
    expect(AcceptanceLedgerSchema.safeParse({...current,criteria:[{...first,status:'verified',evidence:[]}]}).success).toBe(false);
    expect(AcceptanceLedgerSchema.safeParse({...current,criteria:[first,first]}).success).toBe(false);
  });
});

it('fails on omitted criteria, changed canonical text, missing files and changed evidence bytes',async()=>{
  const {validateAcceptanceLedger}=await import('../../scripts/acceptance-validation');
  const {sourceHash}=await import('../../scripts/acceptance-source');
  const source={task:'T01',source:'plan.md',criterion:'Original criterion',sourceHash:sourceHash('Original criterion')};
  const first={id:'T01-AC01',...source,status:'verified',scope:'Unit fixture',remaining:'',evidence:[{path:'report.json',kind:'artifact',sha256:sourceHash('executed')} ]};
  const ledger={schemaVersion:1,updatedAt:'2026-11-01',criteria:[first]},sources=new Map([['T01-AC01',source]]);
  await expect(validateAcceptanceLedger(ledger,sources,async()=>'executed')).resolves.toBeDefined();
  await expect(validateAcceptanceLedger({...ledger,criteria:[]},sources,async()=>'executed')).rejects.toThrow('coverage drift');
  await expect(validateAcceptanceLedger({...ledger,criteria:[{...first,criterion:'Edited'}]},sources,async()=>'executed')).rejects.toThrow('Canonical AC');
  await expect(validateAcceptanceLedger(ledger,sources,async()=>'changed')).rejects.toThrow('Evidence changed');
  await expect(validateAcceptanceLedger(ledger,sources,async()=>{throw new Error('file missing');})).rejects.toThrow('file missing');
});
