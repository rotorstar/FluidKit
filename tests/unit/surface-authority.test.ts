import { describe, expect, it, vi } from 'vitest';
import { defineFlow } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';

const flow = defineFlow({ id:'surface-proof',name:'Surface authority',initial:'a',states:{
  a:{ label:'Edit',nodes:[],projection:'responsive',on:{ move:{target:'b',guard:'approve'}, nested:{target:'c'}, save:{target:'b',action:'store'}, refresh:{target:'a'} }},
  b:{ label:'Saved',route:'/saved',nodes:[] },c:{label:'Nested',route:'/nested',nodes:[]},
}});
const projections = { responsive: (_: unknown, size: { width:number }) => [{
  id:size.width<500?'compact-editor':'wide-editor',kind:'button' as const,anatomy:{componentId:'editor',part:'control',behavior:'button' as const},onActivate:'refresh',text:'Edit',
}] };
describe('host authority and multiple measured surfaces',()=>{
  it('retains the inner change when a synchronous guard navigates',()=>{
    const navigate=vi.fn();
    const runtime=createFluidRuntime({flow,projections,guards:{approve:()=>{runtime.send('nested');return true;}},actions:{store:async()=>{}},router:{navigate}});
    expect(runtime.send('move').accepted).toBe(false);
    expect(runtime.getSnapshot()).toMatchObject({revision:1,state:'c'});
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/nested',false);
    runtime.dispose();
  });
  it('an observer can dispose a committed runtime before its external action starts',()=>{
    const store=vi.fn(async()=>{}), navigate=vi.fn();
    const runtime=createFluidRuntime({flow,projections,guards:{approve:()=>true},actions:{store},router:{navigate}});
    runtime.subscribe(()=>runtime.dispose());
    expect(runtime.send('save')).toMatchObject({accepted:true,snapshot:{revision:1,state:'b'}});
    expect(store).not.toHaveBeenCalled();expect(navigate).not.toHaveBeenCalled();
  });
  it('validates each surface at its own width across commits and independent unmounts',()=>{
    const runtime=createFluidRuntime({flow,projections,guards:{approve:()=>true},actions:{store:async()=>{}}});
    const mobile=Symbol('mobile'), desktop=Symbol('desktop');
    runtime.setInteraction({focusedId:'compact-editor'}, {width:320,height:700},mobile);
    runtime.setInteraction({pressedId:'wide-editor',hoveredId:'wide-editor'},{width:1280,height:720},desktop);
    expect(runtime.send('refresh').accepted).toBe(true);
    expect(runtime.getInteraction(mobile).focusedId).toBe('compact-editor');
    expect(runtime.getInteraction(desktop)).toMatchObject({pressedId:null,focusedId:null,hoveredId:'wide-editor'});
    runtime.releaseSurface(desktop);
    expect(runtime.getInteraction()).toMatchObject({focusedId:'compact-editor',hoveredId:null});
    runtime.dispose();
  });
});
