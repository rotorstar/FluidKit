'use client';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { workspaceLayout, workspaceSurfaceHeight, type WorkspaceData } from '@fluidkit/cases';
import { workspaceStage } from '../lib/workspace-stage';
import { EFFECT_LIBRARY } from '@fluidkit/effects';
import { useFluid } from '@fluidkit/react';
import { StudioFluidSurface as FluidSurface } from './studio-fluid-surface';

/** The host uses the same measured-width geometry as the GPU case projection. */
export function WorkspaceSurface({ moduleCount, data, compact = false, comparison = false, ...props }: Omit<ComponentProps<typeof FluidSurface>, 'height'> & { moduleCount: number; compact?: boolean; comparison?: boolean; data?: WorkspaceData }) {
  const { snapshot, locale, localeContext } = useFluid();
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const measured = entries[0]?.contentRect.width;
      if (measured && measured > 0) setWidth(measured);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const height = useMemo(() => {
    if (data && compact) {
      const nodes = workspaceStage(data, snapshot, { width, height: 1 }, comparison, locale, localeContext);
      const bottom = nodes.reduce((edge, node) => Math.max(edge, (node.y ?? 0) + (node.height ?? 0)), 400);
      return Math.ceil(bottom + 32);
    }
    if (data) return workspaceSurfaceHeight(data, snapshot, width, undefined, locale, localeContext);
    return workspaceLayout(width, moduleCount, EFFECT_LIBRARY.length, snapshot.fields.inspectorOpen === true).surfaceHeight;
  }, [data, compact, snapshot, width, comparison, moduleCount, locale, localeContext]);
  return <div ref={host} className="workspace-surface-host"><FluidSurface {...props} height={height}/></div>;
}
