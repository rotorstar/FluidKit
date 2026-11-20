import { describe, expect, it } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { SIMULATION_DATASETS, createSimulationFlow, simulationCanPrepare, simulationLocation, simulationRows, simulationScene, simulationSearch } from '@fluidkit/cases';

describe('simulation cases share data, state, URL and GPU contracts',()=>{
  for (const dataset of SIMULATION_DATASETS) {
    it(`${dataset.id}: projects every view at 320/768/1280 px and preserves draft across view/history changes`,()=>{
      const runtime=createFluidRuntime({flow:createSimulationFlow(dataset),guards:{'can-prepare':snapshot=>simulationCanPrepare(dataset,snapshot)},projections:{simulation:(snapshot,viewport)=>simulationScene(dataset,snapshot,viewport)}});
      runtime.send('field.change',{fieldId:'draft',value:'Entwurf für diese Simulation'});
      for(const view of ['cards','table','detail','comparison','prepared','handoff']) {
        const restore=runtime.send('navigation.restore',{state:view},'host');expect(restore.accepted).toBe(true);
        for(const width of [320,768,1280]) {
          const nodes=runtime.getScene({width,height:2600});
          for(const node of nodes) { expect(node.x+node.width).toBeLessThanOrEqual(width+1); expect(node.x).toBeGreaterThanOrEqual(0); }
          expect(new Set(nodes.map(node=>node.id)).size).toBe(nodes.length);
        }
        const snapshot=runtime.getSnapshot();expect(simulationLocation(simulationSearch(snapshot),dataset).state).toBe(view);
        expect(snapshot.fields.draft).toBe('Entwurf für diese Simulation');
        expect(simulationSearch(snapshot)).not.toContain('Entwurf');
      }
      runtime.send('view.cards');runtime.send('sort.price-desc');
      const rows=simulationRows(dataset,runtime.getSnapshot());expect(rows[0]!.priceMinor).toBe(Math.max(...dataset.records.map(item=>item.priceMinor)));
      expect(()=>simulationLocation('?selected=unknown',dataset)).toThrow('existiert');
      expect(()=>simulationLocation('?view=unknown',dataset)).toThrow();
      runtime.dispose();
    });
  }
  it('blocks stale quotes and out-of-stock preparation and requires explicit revalidation',()=>{
    const dataset=SIMULATION_DATASETS.find(item=>item.id==='travel')!;
    const runtime=createFluidRuntime({flow:createSimulationFlow(dataset),guards:{'can-prepare':snapshot=>simulationCanPrepare(dataset,snapshot)},projections:{simulation:(snapshot,viewport)=>simulationScene(dataset,snapshot,viewport)}});
    runtime.send('detail.open');runtime.send('clock.expire',{},'host');
    expect(runtime.send('prepare').accepted).toBe(false);
    runtime.send('clock.reset',{},'host');expect(runtime.send('prepare').accepted).toBe(true);
    expect(runtime.send('handoff').accepted).toBe(true);
    expect(runtime.getDiagnostics().pendingActions).toBe(0);runtime.dispose();
    const commerce=SIMULATION_DATASETS.find(item=>item.id==='commerce')!,soldOut=commerce.records.find(item=>!item.available)!;
    const shop=createFluidRuntime({flow:createSimulationFlow(commerce),guards:{'can-prepare':snapshot=>simulationCanPrepare(commerce,snapshot)},projections:{simulation:(snapshot,viewport)=>simulationScene(commerce,snapshot,viewport)}});
    shop.send(`select.${soldOut.id}`);expect(shop.send('prepare').accepted).toBe(false);shop.dispose();
  });
});
