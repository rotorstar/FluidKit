import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_THEME_PREFERENCES, EffectSettingsSchema, GPU_PALETTE, THEME_PRESETS, ThemePreferencesSchema, appearanceCSS, defineFlow, resolveAppearance, themeContrast } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { readAppearance, writeAppearance } from '../../apps/studio/components/appearance-storage';

const profiles = [...THEME_PRESETS.map(preset => ({ ...DEFAULT_THEME_PREFERENCES, preset: preset.id })), ...['#ffffff', '#000000', '#ffff00', '#00ff00'].map(customAccent => ({ ...DEFAULT_THEME_PREFERENCES, customAccent }))];
describe('shared appearance contract', () => {
  it.each(profiles)('derives readable light chrome and dark GPU roles for $preset/$customAccent', preferences => {
    const appearance = resolveAppearance(preferences), { gpu, theme, cssVariables: css } = appearance;
    for (const fill of [gpu.background, gpu.surface, gpu.surfaceRaised, gpu.selected, gpu.hover]) {
      for (const ink of [gpu.foreground, gpu.muted, gpu.accent, gpu.kernel, gpu.adapter, gpu.tooling]) expect(themeContrast(ink, fill)).toBeGreaterThanOrEqual(4.5);
      expect(themeContrast(gpu.focus, fill)).toBeGreaterThanOrEqual(3);
    }
    for (const fill of [theme.colors.paper, theme.colors.studio]) {
      for (const ink of [theme.colors.ink, theme.colors.muted, css['--fluid-theme-accent-text']]) expect(themeContrast(ink, fill)).toBeGreaterThanOrEqual(4.5);
      expect(themeContrast(theme.colors.focus, fill)).toBeGreaterThanOrEqual(3);
    }
    expect(themeContrast(css['--fluid-theme-on-accent'], theme.colors.accent)).toBeGreaterThanOrEqual(4.5);
    if (preferences.customAccent) expect(theme.colors.accent).toBe(preferences.customAccent);
  });
  it('validates versioned preferences and safely falls back on malformed or inaccessible storage', () => {
    expect(ThemePreferencesSchema.parse({})).toEqual(DEFAULT_THEME_PREFERENCES);
    expect(ThemePreferencesSchema.parse({ customAccent: '#ABCDEF' }).customAccent).toBe('#abcdef');
    for (const customAccent of ['red', '#fff', '#123456;body{}', 'url(x)']) expect(ThemePreferencesSchema.safeParse({ customAccent }).success).toBe(false);
    for (const value of ['{', '{"preset":"unknown"}', '{"schemaVersion":2}', '{"customAccent":"#fff"}']) {
      const loaded = readAppearance({ getItem: () => value, setItem: vi.fn() });
      expect(loaded.preferences).toEqual(DEFAULT_THEME_PREFERENCES); expect(loaded.warning).toBeTruthy();
    }
    const storage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
    expect(readAppearance(storage).warning).toBeTruthy(); expect(writeAppearance(storage, DEFAULT_THEME_PREFERENCES)).toContain('Sitzung');
  });
  it('roundtrips palettes without widening stored data and emits only validated CSS values', () => {
    let value = ''; const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    for (const prefs of profiles) { expect(writeAppearance(storage, prefs)).toBeNull(); expect(readAppearance(storage).preferences).toEqual(prefs); }
    expect(Object.keys(JSON.parse(value))).toEqual(['schemaVersion', 'preset', 'customAccent']);
    expect(appearanceCSS()).toContain('--fluid-theme-accent:#2563eb');
    expect(EffectSettingsSchema.parse({ mode: 'off' }).theme).toEqual(DEFAULT_THEME_PREFERENCES);
  });
  it('repaints only managed live roles without changing domain, focus, history or saved presentation paint', () => {
    const flow = defineFlow({ id: 'theme-proof', name: 'Theme', initial: 'ready', fields: [{ id: 'note', initial: 'privat', sensitive: true }], states: { ready: { label: 'Ready', nodes: [
      { id: 'input', anatomy: { componentId: 'note', part: 'control', behavior: 'textbox' }, kind: 'input', binding: 'note', label: 'Notiz', x: 10, y: 10, width: 250, height: 44, color: GPU_PALETTE.surface, foreground: GPU_PALETTE.foreground },
      { id: 'custom', anatomy: { componentId: 'custom', part: 'panel', behavior: 'presentation' }, kind: 'box', x: 10, y: 70, width: 250, height: 44, color: '#542445', foreground: '#edcabc' },
    ], on: {} } } });
    const navigate = vi.fn(), runtime = createFluidRuntime({ flow, router: { navigate } });
    runtime.send('field.change', { fieldId: 'note', value: 'Meine Notiz' }); runtime.send('focus.set', { nodeId: 'input' });
    const snapshot = runtime.getSnapshot(), interaction = runtime.getInteraction(), before = runtime.getScene();
    const saved = createTransitionClip({ source: before, target: before, plan: null, durationMs: 0, viewport: { width: 1000, height: 700 } });
    const serialized = JSON.stringify(saved), savedPaint = sampleTransitionClip(saved, 1).nodes.map(node => node.color);
    runtime.configureEffects({ ...runtime.getVisualState().settings, theme: { preset: 'rose' } });
    expect(runtime.getSnapshot()).toBe(snapshot); expect(runtime.getInteraction()).toBe(interaction); expect(navigate).not.toHaveBeenCalled();
    const after = runtime.getScene(); expect(after[0]!.color).not.toBe(before[0]!.color); expect(after[1]!.color).toBe('#542445');
    expect(after.map(node => ({ id: node.id, text: node.text, x: node.x, y: node.y, width: node.width }))).toEqual(before.map(node => ({ id: node.id, text: node.text, x: node.x, y: node.y, width: node.width })));
    expect(JSON.stringify(saved)).toBe(serialized); expect(sampleTransitionClip(saved, 1).nodes.map(node => node.color)).toEqual(savedPaint);
    runtime.dispose();
  });
});
