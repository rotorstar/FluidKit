import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { createFluidRuntime } from '@fluidkit/core';
import { EFFECT_LIBRARY, createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { DEFAULT_EFFECT_SETTINGS, FlowDefinitionSchema, defineFlow } from '@fluidkit/contracts';
import { WorkspaceDataSchema, createWorkspaceFlow, workspaceScene, workspaceRows, workspaceSearch, readWorkspaceLocation, workspaceLayout } from '@fluidkit/cases';
import { interpolateBounds, motionProgress, visibleRange } from '@fluidkit/webgpu';

// Explicit test fixtures, never loaded by the Studio or a production adapter.
const data=WorkspaceDataSchema.parse({schemaVersion:1,name:'test-workspace',capturedAt:'2026-11-01T12:00:00Z',source:'Workspace package.json + src/**/*.ts(x)',modules:[
 {id:'core',name:'@test/core',version:'1',group:'Kernel',files:3,lines:30,dependencies:['@test/contracts','xstate'],internal:['contracts']},
 {id:'contracts',name:'@test/contracts',version:'1',group:'Kernel',files:1,lines:10,dependencies:['zod'],internal:[]},
 {id:'react',name:'@test/react',version:'1',group:'Adapter',files:1,lines:20,dependencies:['@test/core','react'],internal:['core']},
]});
const runtime=()=>createFluidRuntime({flow:createWorkspaceFlow(data),projections:{workspace:(snapshot,viewport)=>workspaceScene(data,snapshot,viewport)}});

describe('adaptive workspace',()=>{
 it('keeps input, navigation, headers and module rows in their own presentation groups',()=>{
  const r=createFluidRuntime({flow:createWorkspaceFlow(data),effectSettings:{...DEFAULT_EFFECT_SETTINGS,effect:{id:'silk-cascade',version:'1.0.0'}},projections:{workspace:(s,v,settings)=>workspaceScene(data,s,v,settings)}});
  r.setRenderCapabilities({backend:'webgpu',typegpu:true,compute:true,reducedMotion:false});
  const source=r.getScene({width:870,height:1136});
  expect(source.find(node=>node.id==='search')?.anatomy.componentId).toBe('workspace-search');
  expect(source.find(node=>node.id==='search-hint')?.anatomy.componentId).toBe('workspace-search');
  expect(source.find(node=>node.id==='view-cards')?.anatomy.componentId).toBe('workspace-navigation');
  expect(source.find(node=>node.id==='column-name')?.anatomy.componentId).toBe('workspace-table-header');
  expect(source.find(node=>node.id==='row-core')?.anatomy.componentId).toBe('module-core');
  r.setInteraction({focusedId:'column-name'});r.send('view.cards');
  const clip=createTransitionClip({source,target:r.getScene({width:870,height:1136}),plan:r.getVisualState().current,durationMs:r.getTransitionDuration(),viewport:{width:870,height:1136}});
  for(const progress of [.2,.5,.75]){
   const frame=sampleTransitionClip(clip,progress);
   for(const id of ['column-name','column-files','column-dependencies','column-group']){expect(frame.nodes.find(node=>node.id===id)?.text).toBe('');expect(frame.nodeStates.find(node=>node.id===id)?.textOpacity).toBe(0);}
   expect(frame.nodes.find(node=>node.id==='search-hint')?.text).toBe('Module suchen …');
  }
  r.dispose();
 });
 it('keeps static workspace headings outside Silk detail-content choreography',()=>{
  const r=createFluidRuntime({flow:createWorkspaceFlow(data),effectSettings:{...DEFAULT_EFFECT_SETTINGS,effect:{id:'silk-cascade',version:'1.0.0'}},projections:{workspace:(s,v,settings)=>workspaceScene(data,s,v,settings)}});
  r.setRenderCapabilities({backend:'webgpu',typegpu:true,compute:true,reducedMotion:false});
  r.send('view.cards');const source=r.getScene({width:870,height:1136});r.send('select.core');
  const target=r.getScene({width:870,height:1136});
  const clip=createTransitionClip({source,target,plan:r.getVisualState().current,durationMs:r.getTransitionDuration(),viewport:{width:870,height:1136}});
  for(const progress of [.25,.5,.75])for(const id of ['eyebrow','title','subtitle']){
   const frame=sampleTransitionClip(clip,progress),before=source.find(node=>node.id===id)!,current=frame.nodes.find(node=>node.id===id)!;
   expect(current.text).not.toBe('');
   expect({x:current.x,y:current.y,width:current.width,height:current.height}).toEqual({x:before.x,y:before.y,width:before.width,height:before.height});
   expect(frame.nodeStates.find(state=>state.id===id)?.textOpacity).toBe(1);
   expect(frame.nodeStates.find(state=>state.id===id)?.shadow.opacity).toBe(0);
  }
  r.dispose();
 });
 it('shares effect settings with a GPU control dock that fits narrow and wide surfaces',()=>{
  const r=createFluidRuntime({flow:createWorkspaceFlow(data),effectSettings:DEFAULT_EFFECT_SETTINGS,projections:{workspace:(s,v,settings)=>workspaceScene(data,s,v,settings)}});
  for(const width of [268,298,320,390,650,732,1100]){
   const scene=r.getScene({width,height:1348}),controls=scene.filter(node=>node.onVisual),dock=scene.find(node=>node.id==='effect-dock')!,view=scene.find(node=>node.id==='view-cards')!,search=scene.find(node=>node.id==='search')!;
   expect(controls).toHaveLength(EFFECT_LIBRARY.length+5);expect(view.y+view.height).toBeLessThan(dock.y);expect(dock.y+dock.height).toBeLessThan(search.y);
   expect(scene.indexOf(view)).toBeLessThan(scene.indexOf(controls[0]!));
   for(const node of controls){expect(node.x).toBeGreaterThanOrEqual(dock.x);expect(node.x+node.width).toBeLessThanOrEqual(dock.x+dock.width);expect(node.y).toBeGreaterThanOrEqual(dock.y);expect(node.y+node.height).toBeLessThanOrEqual(dock.y+dock.height);expect(node.width).toBeGreaterThanOrEqual(24);expect(node.height).toBeGreaterThanOrEqual(24);
    for(const other of controls)if(node!==other)expect(node.x+node.width<=other.x||other.x+other.width<=node.x||node.y+node.height<=other.y||other.y+other.height<=node.y).toBe(true);
   }
   const layout=workspaceLayout(width,data.modules.length,EFFECT_LIBRARY.length);
   expect(layout.surfaceHeight).toBeGreaterThan(Math.max(...scene.map(node=>node.y+node.height)));
   expect(scene.find(node=>node.id==='column-dependencies')?.label).toBe('Nach Abhängigkeiten sortieren');
  }
  const before=r.getSnapshot();r.send('visual.command',{command:{type:'effect.select',effect:{id:'spring-reflow',version:'1.0.0'}}});expect(r.getSnapshot()).toBe(before);expect(r.getScene().find(node=>node.id==='effect-preset-spring-reflow')?.pressed).toBe(true);r.dispose();
 });
 it('reserves two lines for the empty state before its reset control',()=>{
  const r=runtime();r.send('field.change',{fieldId:'query',value:'no-match'});
  for(const width of [280,320,390,550,1100]){const scene=r.getScene({width,height:1348}),empty=scene.find(node=>node.id==='empty')!,reset=scene.find(node=>node.id==='reset-empty')!;expect(empty.textLines).toBe(2);expect(empty.y+empty.height).toBeLessThan(reset.y);}
  r.dispose();
 });
 it('sorts numbers numerically and ties deterministically in both directions',()=>{
  const r=runtime();r.send('sort.files.desc');expect(workspaceRows(data,r.getSnapshot()).map(row=>row.id)).toEqual(['core','contracts','react']);
  r.send('sort.files.asc');expect(workspaceRows(data,r.getSnapshot()).map(row=>row.id)).toEqual(['contracts','react','core']);
  const headers=r.getScene().filter(node=>node.semantics?.sort);expect(headers).toHaveLength(1);expect(headers[0]?.semantics?.sort).toBe('ascending');r.dispose();
 });
 it('preserves query, sorting, filter and stable identities through all views',()=>{
  const r=runtime();r.send('field.change',{fieldId:'query',value:'core'});r.send('sort.dependencies.desc');r.send('select.core');
  const fields=r.getSnapshot().fields;for(const event of ['view.cards','view.map','view.table']){expect(r.send(event).accepted).toBe(true);expect(r.getSnapshot().fields).toEqual(fields);expect(r.getScene().some(node=>node.id==='module-core')).toBe(true);}
  r.dispose();
 });
 it('validates every projection at narrow and wide sizes and rejects stale focus after filtering',()=>{
  const r=runtime();r.setInteraction({focusedId:'module-core'});r.send('field.change',{fieldId:'query',value:'no-match'});expect(r.getInteraction().focusedId).toBeNull();expect(r.getScene().some(node=>node.id==='reset-empty')).toBe(true);r.send('reset');
  for(const state of ['table','cards','map']){r.send(`view.${state}`);for(const width of [320,650,1100]){const nodes=r.getScene({width,height:1100});expect(nodes.every(node=>node.x>=0&&node.width>0)).toBe(true);expect(new Set(nodes.map(node=>node.id)).size).toBe(nodes.length);}}
  r.dispose();
 });
 it('restores URL state in one commit without external actions and rejects bad references',()=>{
  const r=runtime();r.send('sort.files.desc');r.send('select.core');const search=workspaceSearch(r.getSnapshot());const restored=readWorkspaceLocation(search,data);
  const other=runtime();expect(other.send('navigation.restore',restored,'host').accepted).toBe(true);expect(other.getSnapshot().state).toBe('detail');expect(other.getSnapshot().fields.selected).toBe('core');expect(other.getSnapshot().revision).toBe(1);
  expect(()=>readWorkspaceLocation('?view=detail&selected=missing',data)).toThrow();expect(()=>readWorkspaceLocation('?sort=arbitrary',data)).toThrow();expect(()=>readWorkspaceLocation('?view=detail',data)).toThrow();r.dispose();other.dispose();
 });
 it('atomically cancels state and field assignment, validates fields before actor execution',()=>{
  const r=createFluidRuntime({flow:createWorkspaceFlow(data),projections:{workspace:(s,v)=>workspaceScene(data,s,v)},beforeChange:details=>details.cancel()});
  expect(r.send('select.core').accepted).toBe(false);expect(r.getSnapshot().fields.selected).toBe('');expect(r.getSnapshot().state).toBe('table');r.dispose();
  expect(()=>defineFlow({id:'bad',name:'Bad assignment',initial:'a',fields:[{id:'n',type:'number',initial:1}],states:{a:{label:'A',nodes:[],on:{go:{target:'a',assign:{n:'wrong'}}}}}})).toThrow();
 });
 it('rejects bad dynamic projections without advancing the actor or committing fields',()=>{
  const flow=createWorkspaceFlow(data);let bad=true;
  const r=createFluidRuntime({flow,projections:{workspace:(s,v)=>bad&&s.state==='cards'?[{id:'invalid',kind:'button',anatomy:{componentId:'invalid',part:'trigger',behavior:'button'},onActivate:'unknown'}]:workspaceScene(data,s,v)}});
  expect(r.send('view.cards').accepted).toBe(false);expect(r.getSnapshot().state).toBe('table');bad=false;expect(r.send('view.map').accepted).toBe(true);expect(r.getSnapshot().state).toBe('map');r.dispose();
 });
 it('rejects semantic cycles, missing parents and misplaced aria-sort',()=>{
  const r=runtime();const flow=createWorkspaceFlow(data);const nodes=r.getScene().map(node=>({...node}));
  const table=nodes.find(node=>node.id==='module-table')!;table.semantics={role:'table',parentId:'header-row'};
  expect(FlowDefinitionSchema.safeParse({...flow,states:{...flow.states,table:{...flow.states.table,nodes}}}).success).toBe(false);r.dispose();
 });
 it('keeps all dataset identities through generated view/sort/selection sequences',()=>{
  fc.assert(fc.property(fc.array(fc.constantFrom('view.table','view.cards','view.map','sort.files.asc','sort.files.desc','select.core','select.contracts','reset'),{maxLength:35}),events=>{
    const r=runtime();for(const event of events){expect(r.send(event).accepted).toBe(true);const scene=r.getScene();expect(new Set(scene.map(node=>node.id)).size).toBe(scene.length);expect(workspaceRows(data,r.getSnapshot())).toHaveLength(3);}r.dispose();
  }),{numRuns:60});
 });
});

describe('RP1 deterministic presentation and virtualization',()=>{
 it('continues interrupted motion from the presented bounds and honors reduced motion',()=>{
  const from={x:0,y:10,width:200,height:40,radius:10,rotation:0,opacity:1};const target={...from,x:500,height:200,radius:30,opacity:.2};
  const shown=interpolateBounds(from,target,motionProgress(200,800).eased);
  expect(interpolateBounds(shown,from,0)).toEqual(shown);expect(interpolateBounds(shown,from,1)).toEqual(from);expect(motionProgress(0,800,true)).toEqual({linear:1,eased:1});expect(motionProgress(-10,800).linear).toBe(0);
 });
 it('bounds work for 10,000 rows independently of dataset size',()=>{
  fc.assert(fc.property(fc.integer({min:0,max:399000}),scroll=>{const range=visibleRange(10000,40,scroll,600);expect(range.start).toBeGreaterThanOrEqual(0);expect(range.end).toBeLessThanOrEqual(10000);expect(range.end-range.start).toBeLessThanOrEqual(20);}),{numRuns:100});
 });
});

it('validates the next revision before actor mutation and never re-executes that prepared commit',()=>{
 const flow=createWorkspaceFlow(data);
 const r=createFluidRuntime({flow,projections:{workspace:(s,v)=>s.state==='cards'&&s.revision===1?[{id:'bad',kind:'button',anatomy:{componentId:'bad',part:'button',behavior:'button'}}]:workspaceScene(data,s,v)}});
 expect(r.send('view.cards').accepted).toBe(false);expect(r.getSnapshot().state).toBe('table');expect(r.getSnapshot().revision).toBe(0);
 expect(r.send('select.core').accepted).toBe(true);expect(r.getSnapshot().state).toBe('detail');r.dispose();
});

it('keeps compact dependency-map controls separate and within the viewport',()=>{
 const r=runtime();r.send('view.map');
 for(const width of [320,390,600]){
  const controls=r.getScene({width,height:1060}).filter(node=>node.id.startsWith('module-')&&node.anatomy.behavior==='button');
  for(const a of controls){expect(a.x).toBeGreaterThanOrEqual(0);expect(a.x+a.width).toBeLessThanOrEqual(width);for(const b of controls){if(a.id===b.id)continue;expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}}
 }
 r.dispose();
});

it('separates eleven map controls and places their caption after the compact layout',()=>{
 const expanded=WorkspaceDataSchema.parse({...data,modules:Array.from({length:11},(_,i)=>({...data.modules[i%3],id:`mod-${i}`,name:`@test/mod-${i}`,internal:[]}))});
 const r=createFluidRuntime({flow:createWorkspaceFlow(expanded),effectSettings:DEFAULT_EFFECT_SETTINGS,projections:{workspace:(s,v,settings)=>workspaceScene(expanded,s,v,settings)}});r.send('view.map');
 for(const width of [305,320,650,800,1100]){
  const scene=r.getScene({width,height:1400}),controls=scene.filter(node=>node.id.startsWith('module-')&&node.anatomy.behavior==='button');
  expect(controls).toHaveLength(11);
  for(const a of controls)for(const b of controls){if(a.id!==b.id)expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
  if(width<800)expect(scene.find(node=>node.id==='map-caption')!.y).toBeGreaterThan(Math.max(...controls.map(node=>node.y+node.height)));
 }
 r.dispose();
});
