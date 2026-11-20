import { z } from 'zod';

export const LOCALES = ['de', 'en', 'fr'] as const;
export const LocaleSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;
export const LOCALE_NAMES = Object.freeze({ de: 'Deutsch', en: 'English', fr: 'Français' } satisfies Record<Locale, string>);
const regions = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' } satisfies Record<Locale, string>;
export const LocaleContextSchema = z.strictObject({
  language: LocaleSchema,
  formatLocale: z.string().min(2).max(80).refine(tag => {
    try { return Intl.getCanonicalLocales(tag).length === 1; } catch { return false; }
  }, 'Invalid formatting locale'),
  timeZone: z.string().min(1).max(80).refine(zone => {
    try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
  }, 'Invalid time zone'),
  direction: z.enum(['ltr', 'rtl']),
});
export type LocaleContext = z.infer<typeof LocaleContextSchema>;
export function resolveLocaleContext(language: Locale, options: Partial<Pick<LocaleContext, 'formatLocale' | 'timeZone'>> = {}): LocaleContext {
  return LocaleContextSchema.parse({ language, formatLocale: regions[language], timeZone: 'UTC', ...options, direction: 'ltr' });
}
export const formatRegion = (language: Locale) => regions[language];
