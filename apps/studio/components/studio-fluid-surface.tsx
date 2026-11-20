'use client';
import type { ComponentProps } from 'react';
import { FluidSurface } from '@fluidkit/react';
import { caseCatalogFingerprint } from '@fluidkit/cases';
import { useStudioLocale } from './studio-locale';

export function StudioFluidSurface(props: ComponentProps<typeof FluidSurface>) {
  const { buildId } = useStudioLocale();
  return <FluidSurface buildId={buildId} catalogFingerprint={caseCatalogFingerprint} {...props}/>;
}
