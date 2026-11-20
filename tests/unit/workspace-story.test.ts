import { expect, it } from 'vitest';
import { createWorkspaceFlow, readWorkspaceLocation, workspaceSearch, workspaceRows } from '@fluidkit/cases';
import { createFluidRuntime } from '@fluidkit/core';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';

it('restores the focused card selection and can return to the complete catalogue',async()=>{
  const data=await readWorkspace(process.cwd());
  const r=createFluidRuntime({flow:createWorkspaceFlow(data), projections:{workspace:()=>[]}});
  const restore=(search:string)=>r.send('navigation.restore',readWorkspaceLocation(search,data),'host');
  expect(restore('?view=cards&cards=selected&picked=react&picked=core').accepted).toBe(true);
  expect(workspaceRows(data,r.getSnapshot()).map(row=>row.id)).toEqual(['core','react']);
  expect(workspaceSearch(r.getSnapshot())).toContain('cards=selected');
  r.send('view.compare');r.send('view.cards');
  expect(workspaceRows(data,r.getSnapshot())).toHaveLength(2);
  r.send('cards.scope.all');
  expect(workspaceRows(data,r.getSnapshot())).toHaveLength(data.modules.length);
  expect(workspaceSearch(r.getSnapshot())).not.toContain('cards=');
  expect(restore('?view=cards').accepted).toBe(true);
  expect(r.getSnapshot().fields.cardsPickedOnly).toBe(false);
  r.dispose();
 });
