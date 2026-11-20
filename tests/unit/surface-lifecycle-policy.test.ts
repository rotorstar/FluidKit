import { describe, expect, it } from 'vitest';
import { SceneNodeSchema } from '@fluidkit/contracts';
import { createPresentationTimeline } from '../../packages/webgpu/src/timeline';
import { redactSceneNode } from '../../packages/webgpu/src/privacy';

describe('surface visibility and privacy boundaries', () => {
  it('freezes hidden time without overriding a manual pause', () => {
    let now = 0; const clock = createPresentationTimeline(() => now);
    clock.start(1000); now = 250; clock.suspend(); now = 4250;
    expect(clock.sample()).toMatchObject({ progress: .25, phase: 'paused' });
    clock.resume(); now = 4350; expect(clock.sample().progress).toBe(.35);
    clock.pause(); clock.suspend(); now = 9000; clock.resume(); now = 10000;
    expect(clock.sample()).toMatchObject({ progress: .35, phase: 'paused' });
    clock.play(); now = 10100; expect(clock.sample().progress).toBe(.45);
  });
  it('keeps starts and seeks made while hidden stationary until resume', () => {
    let now = 0; const clock = createPresentationTimeline(() => now);
    clock.suspend(); clock.start(1000); now = 4000; expect(clock.sample().progress).toBe(0);
    clock.seek(.6); clock.play(); now = 5000; expect(clock.sample().progress).toBe(.6);
    clock.resume(); now = 5100; expect(clock.sample().progress).toBe(.7);
    clock.seek(1); now = 6000; clock.resume(); expect(clock.sample()).toMatchObject({ progress: 1, phase: 'idle' });
  });
  it('redacts both displayed text and accessible labels without mutating the private source', () => {
    const sensitive = SceneNodeSchema.parse({ id: 'secret', kind: 'text', text: 'synthetic-private', label: 'synthetic-private', sensitive: true,
      anatomy: { componentId: 'fixture', part: 'root', behavior: 'presentation' } });
    expect(JSON.stringify(redactSceneNode(sensitive))).not.toContain('synthetic-private');
    expect(sensitive.text).toBe('synthetic-private'); expect(sensitive.label).toBe('synthetic-private');
    const publicNode = { ...sensitive, sensitive: false, text: 'Public label', label: undefined };
    expect(redactSceneNode(publicNode)).toBe(publicNode);
    expect(redactSceneNode({ ...sensitive, label: undefined }).label).toBeUndefined();
  });
});
