import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { defineFlow, JsonSchema, type RuntimeEvent } from '@fluidkit/contracts';
import { createFluidRuntime, type Action } from '@fluidkit/core';
import { createProjectProof } from '@fluidkit/cases';

const actionFlow=()=>defineFlow({id:'actions',name:'Host action',initial:'ready',states:{ready:{label:'Ready',nodes:[],on:{save:{target:'saved',action:'save'}}},saved:{label:'Saved',nodes:[]}}});
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
describe('runtime failure boundaries',()=>{
  it('isolates synchronous and asynchronous action failures from the committed state',async()=>{
    for(const action of [()=>{throw new Error('sync host failure');},async()=>{throw new Error('async host failure');}]) {
      const runtime=createFluidRuntime({flow:actionFlow(),actions:{save:action}});
      expect(runtime.send('save').accepted).toBe(true);expect(runtime.getSnapshot().state).toBe('saved');
      await flush();expect(runtime.getTrace().filter(entry=>entry.kind==='error')).toHaveLength(1);
      expect(runtime.getDiagnostics().pendingActions).toBe(0);runtime.dispose();
    }
  });
  it('aborts pending effects on disposal and never publishes a late result or recreates caches/subscriptions',async()=>{
    let resolve!:()=>void;let signal:AbortSignal|undefined;
    const runtime=createFluidRuntime({flow:actionFlow(),actions:{save:context=>{signal=context.signal;return new Promise<void>(done=>{resolve=done;});}}});
    const listener=vi.fn();runtime.subscribe(listener);runtime.send('save');const calls=listener.mock.calls.length;
    runtime.dispose();expect(signal?.aborted).toBe(true);resolve();await flush();expect(listener).toHaveBeenCalledTimes(calls);
    expect(runtime.send('save').accepted).toBe(false);
    for(const subscribe of [runtime.subscribe,runtime.subscribeInteraction,runtime.subscribeTrace,runtime.subscribeVisual])expect(()=>subscribe(listener)).toThrow('disposed');
    expect(()=>runtime.getScene()).toThrow('disposed');expect(()=>runtime.configureEffects({})).toThrow('disposed');
    expect(runtime.getDiagnostics()).toEqual({disposed:true,subscriptions:0,pendingActions:0,cachedScenes:0});
  });
  it('keeps validated handler registries isolated from later host object mutations',async()=>{
    const save=vi.fn(async()=>{}),actions:Record<string,Action>={save};const runtime=createFluidRuntime({flow:actionFlow(),actions});
    actions.save=async()=>{throw new Error('replacement must not run');};runtime.send('save');await flush();expect(save).toHaveBeenCalledTimes(1);runtime.dispose();
  });
  it('rejects host exceptions before commit and handles a reentrant host event atomically',()=>{
    for(const failure of [new Error('Denied by host'),'non-Error failure']){
      const runtime=createFluidRuntime({flow:createProjectProof('Original'),beforeChange:()=>{throw failure;}});
      const before=runtime.getSnapshot();expect(runtime.send('validation.start').accepted).toBe(false);expect(runtime.getSnapshot()).toBe(before);runtime.dispose();
    }
    let nested=false;const runtime=createFluidRuntime({flow:createProjectProof('Original'),beforeChange:()=>{if(!nested){nested=true;runtime.send('field.change',{fieldId:'projectName',value:'Nested value'});}}});
    expect(runtime.send('validation.start').accepted).toBe(false);expect(runtime.getSnapshot().state).toBe('ready');expect(runtime.getSnapshot().fields.projectName).toBe('Nested value');runtime.dispose();
  });
  it('never commits an invalid projected target, including history restoration',()=>{
    const flow=defineFlow({id:'projection-failure',name:'Projection',initial:'ready',states:{ready:{label:'Ready',nodes:[],on:{next:{target:'broken'}}},broken:{label:'Broken',nodes:[],projection:'broken'}}});
    expect(()=>createFluidRuntime({flow})).toThrow('Missing scene projection');
    const runtime=createFluidRuntime({flow,projections:{broken:()=>{throw new Error('Bad host projection');}}});
    const before=runtime.getSnapshot();expect(runtime.send('next').accepted).toBe(false);expect(runtime.send('navigation.restore',{state:'broken'},'host').accepted).toBe(false);expect(runtime.getSnapshot()).toBe(before);runtime.dispose();
    expect(()=>createFluidRuntime({flow:actionFlow()})).toThrow('Missing action');
  });
  it('keeps invalid inputs and unauthorized history events outside the domain state',()=>{
    fc.assert(fc.property(fc.jsonValue(),value=>{
      const runtime=createFluidRuntime({flow:createProjectProof('Original')});const before=runtime.getSnapshot();
      expect(runtime.send('field.change',{fieldId:'missing',value:JsonSchema.parse(value)}).accepted).toBe(false);
      expect(runtime.send('navigation.restore',{state:'detail'},'user').accepted).toBe(false);
      expect(runtime.send('mode.set',{mode:'unsupported'}).accepted).toBe(false);
      expect(runtime.getSnapshot()).toBe(before);runtime.dispose();
    }),{numRuns:100});
    const runtime=createFluidRuntime({flow:createProjectProof('Original')});
    const payloads:RuntimeEvent['payload'][]=[{state:'missing'},{state:'detail',fields:[]},{state:'detail',fields:{unknown:true}},{state:'detail',fields:{projectName:12}},{state:'detail',fields:{projectName:'x'.repeat(2001)}}];
    for(const payload of payloads)expect(runtime.send('navigation.restore',payload,'host').accepted).toBe(false);
    expect(runtime.send('field.change',{fieldId:'projectName',value:'x'.repeat(2001)}).accepted).toBe(false);
    expect(runtime.send('focus.set',{nodeId:'missing'}).accepted).toBe(false);runtime.dispose();
  });
});

it('keeps failing guards and invalid policy plans from committing state',()=>{
  const flow=defineFlow({id:'guarded',name:'Guarded',initial:'a',states:{a:{label:'A',nodes:[],on:{next:{target:'b',guard:'host'}}},b:{label:'B',nodes:[]}}});
  expect(()=>createFluidRuntime({flow})).toThrow('Missing guard');
  const guarded=createFluidRuntime({flow,guards:{host:()=>{throw new Error('Permission service unavailable');}}});
  const before=guarded.getSnapshot();expect(guarded.send('next')).toMatchObject({accepted:false,reason:'Guard failed: Permission service unavailable'});expect(guarded.getSnapshot()).toBe(before);guarded.dispose();
  const runtime=createFluidRuntime({flow:createProjectProof('Project'),mode:'auto',clock:{now:()=>10}});
  const plan={schemaVersion:1,id:'valid-plan',flowId:'project-proof',snapshotRevision:0,policyVersion:'policy-1',expiresAt:100,eventType:'detail.open',explanation:'Open approved detail'};
  for(const patch of [{flowId:'wrong'},{snapshotRevision:99},{policyVersion:'wrong'},{expiresAt:10},{eventType:'validation.start'}])expect(runtime.propose({...plan,...patch}).accepted).toBe(false);
  expect(runtime.propose(plan).accepted).toBe(true);expect(runtime.getSnapshot().state).toBe('detail');
  runtime.dispose();expect(runtime.propose({...plan,snapshotRevision:1}).accepted).toBe(false);
});
