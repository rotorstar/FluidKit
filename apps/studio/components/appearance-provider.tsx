'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_THEME_PREFERENCES, THEME_PRESETS, ThemePreferencesSchema, appearanceCSS, resolveAppearance, type ThemePreferences } from '@fluidkit/contracts';
import { FluidThemeProvider } from '@fluidkit/react';
import { useStudioMessages } from './studio-locale';
import { Button } from '@base-ui/react/button';
import { StudioInput, StudioSelect } from './studio-controls';
import { readAppearance, writeAppearance } from './appearance-storage';
import styles from './appearance-provider.module.css';

type AppearanceContextValue = { preferences: ThemePreferences; setPreferences(value: ThemePreferences): void; warning: string | null };
const AppearanceContext = createContext<AppearanceContextValue | null>(null);
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const t = useStudioMessages();
  const [preferences, update] = useState<ThemePreferences>(DEFAULT_THEME_PREFERENCES);
  const [warning, setWarning] = useState<string | null>(null);
  useEffect(() => {
    try { const saved = readAppearance(window.localStorage); update(saved.preferences); setWarning(saved.warning); }
    catch { setWarning('Lokale Speicherung ist nicht verfügbar. Farbwahl bleibt in dieser Sitzung möglich.'); }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'fluid.appearance.v1' && event.key !== null) return;
      try { const saved = readAppearance(window.localStorage); update(saved.preferences); setWarning(saved.warning); }
      catch { setWarning('Farbwahl konnte nicht synchronisiert werden.'); }
    };
    window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage);
  }, []);
  function setPreferences(value: ThemePreferences) {
    const next = ThemePreferencesSchema.parse(value); update(next);
    try { setWarning(writeAppearance(window.localStorage, next)); }
    catch { setWarning('Farbwahl gilt für diese Sitzung; lokale Speicherung ist nicht verfügbar.'); }
  }
  return <AppearanceContext.Provider value={{ preferences, setPreferences, warning }}><FluidThemeProvider preferences={preferences}>
    <style>{appearanceCSS(preferences)}</style><details className={styles.toolbar}><summary>{t('appearance')}</summary><AppearanceControls /></details>{children}
  </FluidThemeProvider></AppearanceContext.Provider>;
}
export function AppearanceControls() {
  const context = useContext(AppearanceContext);
  if (!context) return null;
  return <AppearanceInputs {...context} />;
}
function AppearanceInputs({ preferences, setPreferences, warning }: AppearanceContextValue) {
  const t = useStudioMessages();
  const accent = resolveAppearance(preferences).theme.colors.accent;
  const [draft, setDraft] = useState(accent);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setDraft(accent); }, [accent]);
  function apply(value: string) {
    const parsed = ThemePreferencesSchema.safeParse({ ...preferences, customAccent: value });
    if (!parsed.success) { setError(t('hexError')); return; }
    setError(null); setPreferences(parsed.data);
  }
  return <div className={styles.controls}>
    <label>{t('palette')} <StudioSelect aria-label={t('palette')} value={preferences.customAccent ? 'custom' : preferences.preset} onChange={event => {
      if (event.target.value !== 'custom') { setError(null); setPreferences(ThemePreferencesSchema.parse({ preset: event.target.value, customAccent: null })); }
    }}><option value="custom" disabled>{t('customColor')}</option>{THEME_PRESETS.map(preset => <option key={preset.id} value={preset.id}>{t(preset.id)}</option>)}</StudioSelect></label>
    <label className={styles.picker}>{t('accent')} <StudioInput aria-label={t('pickAccent')} type="color" value={accent} onChange={event => apply(event.target.value)} /></label>
    <form onSubmit={event => { event.preventDefault(); apply(draft); }} className={styles.hex}>
      <StudioInput aria-label={t('hexAccent')} spellCheck={false} value={draft} maxLength={7} onChange={event => setDraft(event.target.value)} aria-invalid={Boolean(error)} />
      <Button type="submit">{t('apply')}</Button>
    </form>
    {(error || warning) && <span className={styles.message} role="status">{error ?? warning}</span>}
  </div>;
}
