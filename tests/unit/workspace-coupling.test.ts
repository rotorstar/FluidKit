import { describe, expect, it } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { DEFAULT_EFFECT_SETTINGS, type SceneNode } from '@fluidkit/contracts';
import { captureTransitionSource, createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceScene, workspaceSurfaceHeight } from '@fluidkit/cases';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';

describe('real workspace shape correspondence', () => {
  it.each([320, 390, 1280])('declares rows, groups and comparison without changing selected data at %ipx', async width => {
    const data = await readWorkspace(process.cwd());
    const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
      projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) },
      collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
    });
    runtime.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
    const viewport = { width, height: 9000 };
    const scene = () => runtime.getScene(viewport);
    const transition = (event: string) => {
      const source = scene(); expect(runtime.send(event).accepted).toBe(true); const target = scene();
      return createTransitionClip({ source, target, plan: runtime.getVisualState().current, durationMs: runtime.getTransitionDuration(), viewport, motionVersion: 2 });
    };
    const assertBounds = (nodes: SceneNode[]) => {
      const height = workspaceSurfaceHeight(data, runtime.getSnapshot(), width);
      for (const node of nodes) {
        expect(node.x, node.id).toBeGreaterThanOrEqual(0); expect(node.x + node.width, node.id).toBeLessThanOrEqual(width + .001);
        expect(node.y + node.height, node.id).toBeLessThanOrEqual(height);
      }
    };
    try {
      const cards = transition('view.cards');
      for (const module of data.modules) expect(cards.target.find(node => node.id === `module-shell-${module.id}`)?.motion?.correspondence?.[0]).toMatchObject({ kind: 'match', sources: [`row-${module.id}`] });
      for (const progress of [.25, .5, .75]) {
        const frame = sampleTransitionClip(cards, progress);
        for (const module of data.modules) {
          const id = `module-${module.id}-files`;
          expect(cards.source.find(node => node.id === id)?.text).toBe(String(module.files));
          expect(frame.nodes.find(node => node.id === id)?.text).toBe(String(module.files));
          expect(frame.nodeStates.find(node => node.id === id)?.textOpacity).toBe(1);
        }
      }
      assertBounds(cards.target);
      const selected = data.modules.slice(0, 2).map(module => module.id);
      runtime.send('collection.change', { collectionId: 'modules', keys: selected });
      const compare = transition('view.compare'), midway = sampleTransitionClip(compare, .5);
      expect(compare.target.find(node => node.id === 'compare-surface')?.motion?.correspondence?.[0]).toMatchObject({ kind: 'merge', sources: [...selected].sort((a, b) => a.localeCompare(b, 'en')).map(id => `module-shell-${id}`) });
      expect(midway.couplings?.some(group => group.kind === 'merge')).toBe(true);
      expect(runtime.getSnapshot().fields.selection).toEqual(selected); assertBounds(compare.target);
      const reverse = transition('view.cards');
      expect(sampleTransitionClip(reverse, .5).couplings?.some(group => group.kind === 'split')).toBe(true);
      transition('view.atlas');
      expect(scene().filter(node => /^atlas-cluster-(Kernel|Adapter|Tooling)$/.test(node.id))).toHaveLength(3);
      expect(workspaceCollectionOrder(data, runtime.getSnapshot())).toEqual([]);
      expect(scene().find(node => node.id === 'atlas-open-Kernel')?.onActivate).toBe('atlas.group.Kernel');
      const expand = transition('atlas.group.Kernel');
      const members = data.modules.filter(module => module.group === 'Kernel');
      expect(expand.target.filter(node => node.collection).map(node => node.collection!.itemId).sort()).toEqual(members.map(module => module.id).sort());
      expect(sampleTransitionClip(expand, .5).couplings?.some(group => group.kind === 'split' && group.sourceIds.includes('atlas-cluster-Kernel'))).toBe(true);
      assertBounds(expand.target);
      const collapse = transition('atlas.group.all');
      expect(sampleTransitionClip(collapse, .5).couplings?.some(group => group.kind === 'merge' && group.targetIds.includes('atlas-cluster-Kernel'))).toBe(true);
      expect(runtime.getSnapshot().fields.selection).toEqual(selected);
    } finally { runtime.dispose(); }
  });

  it('declares real dependency endpoints on the module surfaces', async () => {
    const data = await readWorkspace(process.cwd());
    const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport) => workspaceScene(data, snapshot, viewport) } });
    try {
      runtime.send('view.map'); const nodes = runtime.getScene({ width: 390, height: 6000 });
      const edges = nodes.filter(node => node.motion?.connector);
      expect(edges.length).toBeGreaterThan(0);
      for (const edge of edges) {
        const connector = edge.motion!.connector!;
        for (const endpoint of [connector.from, connector.to]) expect(nodes.find(node => node.id === endpoint.nodeId)?.motion?.ports).toContainEqual({ id: 'center', x: .5, y: .5 });
        expect(edge.anatomy.behavior).toBe('presentation');
      }
    } finally { runtime.dispose(); }
  });

  it.each([.25, .5, .75])('retargets the actual complete workspace journey at %f without dangling followers or source reset', async progress => {
    const data = await readWorkspace(process.cwd());
    for (const width of [390, 1280]) {
      const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
        projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) },
        collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
      });
      runtime.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
      const viewport = { width, height: 9000 };
      const selection = data.modules.filter(module => module.group === 'Kernel').slice(0, 2).map(module => module.id);
      runtime.send('collection.change', { collectionId: 'modules', keys: selection });
      let source: Pick<ReturnType<typeof createTransitionClip>, 'source' | 'sourceCheckpoint'> = { source: runtime.getScene(viewport), sourceCheckpoint: null };
      try {
        for (const event of ['view.cards', 'view.compare', 'view.cards', 'view.atlas', 'atlas.group.Kernel', 'atlas.group.all', 'view.map']) {
          expect(runtime.send(event).accepted, event).toBe(true);
          const target = runtime.getScene(viewport);
          const clip = createTransitionClip({ ...source, target, plan: runtime.getVisualState().current, durationMs: runtime.getTransitionDuration(), viewport, motionVersion: 2 });
          const start = sampleTransitionClip(clip, 0);
          expect(start.nodes, `${event} source`).toEqual(source.source);
          if (source.sourceCheckpoint) {
            expect(start.nodeStates, `${event} paint`).toEqual(source.sourceCheckpoint.nodeStates);
            expect(start.couplings ?? [], `${event} seam`).toEqual(source.sourceCheckpoint.motion?.couplings ?? []);
          }
          const epsilon = sampleTransitionClip(clip, .000001);
          for (const prior of source.source.filter(node => node.motion?.follow)) {
            const current = epsilon.nodes.find(node => node.id === prior.id);
            if (current) expect(Math.hypot(current.x - prior.x, current.y - prior.y), `${event}/${prior.id} near-zero continuity`).toBeLessThan(.1);
          }
          const frame = sampleTransitionClip(clip, progress);
          for (const node of frame.nodes) {
            for (const key of ['x', 'y', 'width', 'height', 'opacity'] as const) expect(Number.isFinite(node[key]), `${event}/${node.id}/${key}`).toBe(true);
            if (node.motion?.follow) expect(frame.nodes.some(value => value.id === node.motion!.follow), `${event}/${node.id} follower`).toBe(true);
          }
          expect(frame.couplings?.length ?? 0).toBeLessThanOrEqual(8);
          expect(sampleTransitionClip(clip, 1).nodes).toEqual(target);
          expect(sampleTransitionClip(clip, progress)).toEqual(frame);
          source = captureTransitionSource(frame);
        }
        expect(runtime.getSnapshot().fields.selection).toEqual(selection);
      } finally { runtime.dispose(); }
    }
  });
});
