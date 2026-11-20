// @vitest-environment jsdom
import { act, createElement as element, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { type Locale } from '@fluidkit/i18n';
import { createFluidRuntime } from '@fluidkit/core';
import { FluidLocaleProvider, FluidProvider, useFluid } from '@fluidkit/react';
import { createProjectProof, projectProofOptions } from '@fluidkit/cases';

function LocalizedHost({id}:{id:string}) {
  const {locale,runtime} = useFluid();
  return element('output',{'data-host':id,lang:locale},runtime.getScene().find(node=>node.kind==='input')?.label);
}

it('keeps two host trees, runtime revisions and field drafts independent when either locale changes', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  const root=createRoot(document.createElement('main'));
  const left=createFluidRuntime(projectProofOptions(createProjectProof('left')));
  const right=createFluidRuntime(projectProofOptions(createProjectProof('right')));
  const render=(a:Locale,b:Locale)=>root.render(element(Fragment,{},
    element(FluidLocaleProvider,{locale:a,children:element(FluidProvider,{runtime:left,children:element(LocalizedHost,{id:'left'})})}),
    element(FluidLocaleProvider,{locale:b,children:element(FluidProvider,{runtime:right,children:element(LocalizedHost,{id:'right'})})}),
  ));
  try {
    await act(async()=>render('en','fr'));
    expect([left.getLocale(),right.getLocale()]).toEqual(['en','fr']);
    const previousLeft=left.getSnapshot(),previousRight=right.getSnapshot();
    await act(async()=>render('de','fr'));
    expect([left.getLocale(),right.getLocale()]).toEqual(['de','fr']);
    expect(left.getSnapshot()).toBe(previousLeft);
    expect(right.getSnapshot()).toBe(previousRight);
    expect(left.getScene().find(node=>node.kind==='input')?.label).not.toBe(right.getScene().find(node=>node.kind==='input')?.label);
  } finally { await act(async()=>root.unmount()); left.dispose(); right.dispose(); vi.unstubAllGlobals(); }
});
