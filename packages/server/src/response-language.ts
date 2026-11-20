import type { Locale } from '@fluidkit/i18n/locale';

const instructions = {
  de: 'Schreibe die für Nutzer sichtbaren Texte auf Deutsch.',
  en: 'Write user-facing text in English.',
  fr: 'Rédige les textes destinés aux utilisateurs en français.',
} satisfies Record<Locale, string>;

/** The caller supplies only a validated language tag. Identifiers stay part of the schema. */
export function responseLanguageInstruction(locale: Locale = 'de') {
  return instructions[locale];
}
