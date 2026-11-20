import { z } from 'zod';

const Color = z.string().regex(/^#[0-9a-f]{6}$/);
export const ThemeDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().regex(/^[a-z][a-z0-9-]*$/), version: z.string().min(1),
  colorSpace: z.literal('srgb'), dimensionUnit: z.literal('px'), timeUnit: z.literal('ms'),
  colors: z.strictObject({ studio: Color, paper: Color, ink: Color, muted: Color, accent: Color, focus: Color, gpu: Color, gpuInk: Color, gpuMuted: Color }),
  typography: z.strictObject({ family: z.literal('Inter'), caption: z.number().min(11), label: z.number().min(12), body: z.number().min(14) }),
  minimumTarget: z.number().min(24), spacing: z.strictObject({ small: z.number().positive(), medium: z.number().positive(), large: z.number().positive() }),
  radius: z.strictObject({ control: z.number().nonnegative(), panel: z.number().nonnegative() }),
  motion: z.strictObject({ reducedDuration: z.literal(0) }),
});
export type ThemeDefinition = z.infer<typeof ThemeDefinitionSchema>;
const BASE_THEME = ThemeDefinitionSchema.parse({
  schemaVersion: 1, id: 'fluid-blue', version: '1.0.0', colorSpace: 'srgb', dimensionUnit: 'px', timeUnit: 'ms',
  colors: { studio: '#f5f7f8', paper: '#ffffff', ink: '#223345', muted: '#607b77', accent: '#2563eb', focus: '#2563eb', gpu: '#0b1520', gpuInk: '#eaf3f7', gpuMuted: '#94a9b9' },
  typography: { family: 'Inter', caption: 11, label: 12, body: 14 }, minimumTarget: 24,
  spacing: { small: 8, medium: 16, large: 24 }, radius: { control: 7, panel: 14 }, motion: { reducedDuration: 0 },
});


export function themeCSS(input: ThemeDefinition) {
  const theme = ThemeDefinitionSchema.parse(input);
  return `:root{${Object.entries(theme.colors).map(([role, value]) => `--fluid-theme-${role}:${value}`).join(';')};--fluid-caption:${theme.typography.caption}px;--fluid-label:${theme.typography.label}px;--fluid-body:${theme.typography.body}px;--fluid-target:${theme.minimumTarget}px;--fluid-focus:${theme.colors.focus};--fluid-radius-control:${theme.radius.control}px;--fluid-radius-panel:${theme.radius.panel}px}\n`;
}

export const ThemePresetIdSchema = z.enum(['blue', 'indigo', 'violet', 'cyan', 'teal', 'rose', 'amber', 'graphite']);
export type ThemePresetId = z.infer<typeof ThemePresetIdSchema>;
export const ThemePreferencesSchema = z.strictObject({
  schemaVersion: z.literal(1).default(1), preset: ThemePresetIdSchema.default('blue'),
  customAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/).transform(value => value.toLowerCase()).nullable().default(null),
});
export type ThemePreferences = z.infer<typeof ThemePreferencesSchema>;
export const DEFAULT_THEME_PREFERENCES = Object.freeze(ThemePreferencesSchema.parse({}));
export const THEME_PRESETS = Object.freeze([
  { id: 'blue', label: 'Blau', accent: '#2563eb' }, { id: 'indigo', label: 'Indigo', accent: '#4f46e5' },
  { id: 'violet', label: 'Violett', accent: '#7c3aed' }, { id: 'cyan', label: 'Cyan', accent: '#0891b2' },
  { id: 'teal', label: 'Türkis', accent: '#0d9488' }, { id: 'rose', label: 'Rosé', accent: '#e11d48' },
  { id: 'amber', label: 'Bernstein', accent: '#d97706' }, { id: 'graphite', label: 'Graphit', accent: '#64748b' },
] as const);
const channels = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
export function mixThemeColor(from: string, to: string, amount: number) {
  const a = channels(from), b = channels(to);
  return '#' + a.map((channel, index) => Math.round(channel + (b[index]! - channel) * amount).toString(16).padStart(2, '0')).join('');
}
export function themeContrast(a: string, b: string) {
  const luminance = (color: string) => channels(color).map(value => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index]!, 0);
  const left = luminance(a), right = luminance(b); return (Math.max(left, right) + .05) / (Math.min(left, right) + .05);
}
/** Adjust only the text/focus role, never reinterpret the user's selected accent. */
function readable(color: string, backgrounds: readonly string[], minimum = 4.5) {
  const adequate = (candidate: string) => backgrounds.every(background => themeContrast(candidate, background) >= minimum);
  if (adequate(color)) return color;
  const extreme = ['#ffffff', '#000000'].find(adequate);
  if (!extreme) throw new Error('Theme role has incompatible contrast backgrounds');
  for (let step = 1; step <= 100; step++) { const candidate = mixThemeColor(color, extreme, step / 100); if (adequate(candidate)) return candidate; }
  return extreme;
}
export function resolveAppearance(input: ThemePreferences = DEFAULT_THEME_PREFERENCES) {
  const preferences = ThemePreferencesSchema.parse(input);
  const preset = THEME_PRESETS.find(item => item.id === preferences.preset)!;
  const accent = preferences.customAccent ?? preset.accent;
  const studio = mixThemeColor('#f7f9fc', accent, .025), paper = '#ffffff';
  const soft = mixThemeColor(paper, accent, .08), selectedChrome = mixThemeColor(paper, accent, .14);
  const chromeBackgrounds = [studio, paper, soft, selectedChrome];
  const background = '#0b1520', surface = mixThemeColor('#152434', accent, .09);
  const surfaceRaised = mixThemeColor('#1e3044', accent, .12), hover = mixThemeColor('#23364d', accent, .16), selected = mixThemeColor('#24364a', accent, .26);
  const backgrounds = [background, surface, surfaceRaised, hover, selected];
  const gpu = Object.freeze({ background, surface, surfaceRaised, selected, hover,
    border: mixThemeColor('#33485d', accent, .2), accent: readable(mixThemeColor(accent, '#ffffff', .45), backgrounds),
    foreground: readable('#edf4ff', backgrounds), muted: readable('#9daec5', backgrounds), focus: readable(mixThemeColor(accent, '#ffffff', .6), backgrounds, 3),
    kernel: readable(mixThemeColor(accent, '#ffffff', .5), backgrounds),
    adapter: readable(mixThemeColor(accent, '#b7acff', .55), backgrounds), tooling: readable(mixThemeColor(accent, '#99d9f0', .55), backgrounds),
  });
  const theme = ThemeDefinitionSchema.parse({ ...BASE_THEME, id: `fluid-${preferences.customAccent ? 'custom' : preferences.preset}`, version: '2.0.0',
    colors: { studio, paper, ink: '#223345', muted: readable('#607087', chromeBackgrounds), accent, focus: readable(accent, chromeBackgrounds, 3), gpu: background, gpuInk: gpu.foreground, gpuMuted: gpu.muted } });
  const cssVariables = {
    ...Object.fromEntries(Object.entries(theme.colors).map(([key, value]) => [`--fluid-theme-${key}`, value])),
    '--fluid-theme-accent-text': readable(accent, chromeBackgrounds), '--fluid-theme-on-accent': readable('#ffffff', [accent]),
    '--fluid-theme-soft': soft, '--fluid-theme-selected': selectedChrome,
    '--fluid-theme-border': mixThemeColor('#dbe3ed', accent, .08), '--fluid-theme-strong-border': readable(mixThemeColor('#6b7e94', accent, .15), [paper], 3),
    '--fluid-theme-gpu-surface': gpu.surface, '--fluid-theme-gpu-raised': gpu.surfaceRaised, '--fluid-theme-gpu-selected': gpu.selected,
    '--fluid-focus': theme.colors.focus, '--accent': accent, '--paper': paper, '--ink': theme.colors.ink, '--muted': theme.colors.muted,
  };
  return { preferences, theme, gpu, cssVariables };
}
export const GPU_PALETTE = resolveAppearance().gpu;
export type GpuPalette = typeof GPU_PALETTE;

/** Only canonical managed paint is themed; saved recordings and arbitrary custom paint stay data. */
export function projectThemePaint<T extends { color: string; foreground: string }>(node: T, preferences: ThemePreferences, palette?: GpuPalette): T {
  const current = palette ?? resolveAppearance(preferences).gpu;
  const roles = Object.keys(GPU_PALETTE) as (keyof GpuPalette)[];
  const map = (value: string) => { const role = roles.find(key => GPU_PALETTE[key] === value); return role ? current[role] : value; };
  return { ...node, color: map(node.color), foreground: map(node.foreground) };
}

export const FLUID_THEME = resolveAppearance().theme;
Object.freeze(FLUID_THEME.colors); Object.freeze(FLUID_THEME.typography); Object.freeze(FLUID_THEME.spacing); Object.freeze(FLUID_THEME.radius); Object.freeze(FLUID_THEME.motion); Object.freeze(FLUID_THEME);

/** CSS is generated only from validated hex tokens; it also reaches DOM portals. */
export function appearanceCSS(preferences: ThemePreferences = DEFAULT_THEME_PREFERENCES) {
  const value = resolveAppearance(preferences);
  return themeCSS(value.theme) + `:root{${Object.entries(value.cssVariables).map(([key, color]) => `${key}:${color}`).join(';')}}`;
}
