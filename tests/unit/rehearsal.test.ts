import { describe, expect, it } from 'vitest';
import { DESIGN_TOKENS, FLUID_THEME, ThemeDefinitionSchema, themeCSS, StoryDefinitionSchema } from '@fluidkit/contracts';
import { createWorkspaceFlow, createWorkspaceStory, WorkspaceDataSchema, workspaceScene } from '@fluidkit/cases';
import { createFluidRuntime } from '@fluidkit/core';
import { createStoryRunner } from '@fluidkit/testing/story';

const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'explicit-test-fixture', capturedAt: '2026-11-02T06:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'webgpu', name: '@fixture/webgpu', version: '1', group: 'Adapter', files: 2, lines: 20, dependencies: ['three', 'yoga'], internal: [] },
  { id: 'contracts', name: '@fixture/contracts', version: '1', group: 'Kernel', files: 1, lines: 10, dependencies: ['zod'], internal: [] },
] });
function setup(cancel = false) {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport) => workspaceScene(data, snapshot, viewport) }, beforeChange: details => { if (cancel) details.cancel(); } });
  return { runtime, story: createWorkspaceStory(data) };
}
const viewport = { width: 390, height: 1348 };
describe('causal workspace story', () => {
  it('executes five declared beats on one domain state and correlates accepted events', () => {
    const { runtime, story } = setup(), runner = createStoryRunner(runtime, story);
    runner.advance(viewport); runner.advance(viewport);
    expect(runtime.getSnapshot().fields.sort).toBe('dependencies');
    runner.advance(viewport); expect(runtime.getSnapshot().state).toBe('cards');
    runner.advance(viewport); expect(runtime.getSnapshot().fields.selected).toBe('webgpu');
    const last = runner.advance(viewport, 'story-reset');
    expect(last.complete).toBe(true); expect(last.snapshot.state).toBe('table'); expect(last.snapshot.fields.selected).toBe('');
    expect(runner.getRecords().map(record => record.eventType)).toEqual([null, 'sort.dependencies.asc', 'view.cards', 'select.webgpu', 'reset']);
    expect(runner.getRecords().slice(1).every(record => record.eventId && record.after === record.before + 1)).toBe(true); runtime.dispose();
  });
  it('rejects a click/event mismatch before committing', () => {
    const { runtime, story } = setup(); story.beats[1]!.target = { kind: 'part', nodeId: 'column-dependencies', eventType: 'sort.dependencies.desc' };
    const runner = createStoryRunner(runtime, story); runner.advance(viewport); const before = runtime.getSnapshot();
    expect(() => runner.advance(viewport)).toThrow('Eventvertrag'); expect(runtime.getSnapshot()).toBe(before); runtime.dispose();
  });
  it('does not invent a successful scene when a guard rejects or a target is missing', () => {
    for (const cancel of [false, true]) {
      const { runtime, story } = setup(cancel);
      if (!cancel) story.beats[1]!.target = { kind: 'part', nodeId: 'missing', eventType: 'sort.dependencies.asc' };
      const runner = createStoryRunner(runtime, story); runner.advance(viewport);
      expect(() => runner.advance(viewport)).toThrow(); expect(runtime.getSnapshot().revision).toBe(0); expect(runner.getRecords()).toHaveLength(1); runtime.dispose();
    }
  });
  it('stops after user takeover, explicit stop and runtime disposal', () => {
    for (const action of ['user', 'stop', 'dispose']) {
      const { runtime, story } = setup(), runner = createStoryRunner(runtime, story); runner.advance(viewport);
      if (action === 'user') runtime.send('view.map'); else if (action === 'stop') runner.stop(); else runtime.dispose();
      expect(() => runner.advance(viewport)).toThrow(); expect(runner.getRecords()).toHaveLength(1); runtime.dispose();
    }
  });
  it('requires the named Studio reset and never resets a different runtime', () => {
    const { runtime, story } = setup(), other = setup().runtime, runner = createStoryRunner(runtime, story);
    other.send('select.webgpu'); for (let i = 0; i < 4; i++) runner.advance(viewport);
    const before = runtime.getSnapshot(); expect(() => runner.advance(viewport)).toThrow('Studio-Control'); expect(runtime.getSnapshot()).toBe(before); expect(other.getSnapshot().state).toBe('detail'); runtime.dispose(); other.dispose();
  });
  it('rejects duplicate beats and missing real modules', () => {
    const story = createWorkspaceStory(data); story.beats[1]!.id = story.beats[0]!.id;
    expect(StoryDefinitionSchema.safeParse(story).success).toBe(false); expect(() => createWorkspaceStory({ ...data, modules: [] })).toThrow('webgpu');
  });
  it('derives CSS and GPU roles from the same versioned sRGB/px theme and rejects downgrades', () => {
    const css = themeCSS(FLUID_THEME);
    expect(css).toContain(`--fluid-theme-gpu:${FLUID_THEME.colors.gpu}`); expect(css).toContain(`--fluid-caption:${DESIGN_TOKENS.captionPx}px`);
    expect(ThemeDefinitionSchema.safeParse({ ...FLUID_THEME, minimumTarget: 16 }).success).toBe(false);
    expect(ThemeDefinitionSchema.safeParse({ ...FLUID_THEME, colorSpace: 'display-p3' }).success).toBe(false);
    expect(ThemeDefinitionSchema.safeParse({ ...FLUID_THEME, alias: '{unknown.token}' }).success).toBe(false);
  });
});
