import { DEFAULT_THEME_PREFERENCES, ThemePreferencesSchema, type ThemePreferences } from '@fluidkit/contracts';
export const APPEARANCE_STORAGE_KEY = 'fluid.appearance.v1';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export function readAppearance(storage: StoragePort): { preferences: ThemePreferences; warning: string | null } {
  try {
    const raw = storage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return { preferences: DEFAULT_THEME_PREFERENCES, warning: null };
    const parsed = ThemePreferencesSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { preferences: parsed.data, warning: null };
    return { preferences: DEFAULT_THEME_PREFERENCES, warning: 'Gespeicherte Farbwahl ist ungültig. Blau ist aktiv.' };
  } catch { return { preferences: DEFAULT_THEME_PREFERENCES, warning: 'Farbwahl konnte nicht gelesen werden. Blau ist aktiv.' }; }
}
export function writeAppearance(storage: StoragePort, preferences: ThemePreferences): string | null {
  try { storage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(ThemePreferencesSchema.parse(preferences))); return null; }
  catch { return 'Farbwahl gilt für diese Sitzung; lokale Speicherung ist nicht verfügbar.'; }
}
