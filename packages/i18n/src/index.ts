import type { GetICUArgs } from '@schummar/icu-type-parser';
import IntlMessageFormat from 'intl-messageformat';
import { TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { LOCALES, formatRegion, type LocaleContext, type Locale } from './locale';
export * from './locale';

export type MessageValues = Readonly<Record<string, string | number | boolean | Date | bigint>>;
type Translations = Readonly<Record<Locale, string>>;

function remember<T>(cache: Map<string, T>, key: string, create: () => T, limit = 256): T {
  const previous = cache.get(key);
  if (previous !== undefined) return previous;
  const entry = create();
  if (cache.size >= limit) cache.delete(cache.keys().next().value!);
  cache.set(key, entry);
  return entry;
}
const numberFormats = new Map<string, Intl.NumberFormat>();
const collators = new Map<string, Intl.Collator>();
const messages = new Map<string, IntlMessageFormat>();
type FormatContext = Locale | LocaleContext;
const regionOf = (locale: FormatContext) => typeof locale === 'string' ? formatRegion(locale) : locale.formatLocale;
const zoneOf = (locale: FormatContext) => typeof locale === 'string' ? 'UTC' : locale.timeZone;
const languageOf = (locale: FormatContext) => typeof locale === 'string' ? locale : locale.language;
export function formatNumber(locale: FormatContext, value: number | bigint, options: Intl.NumberFormatOptions = {}): string {
  const key = JSON.stringify([locale, Object.entries(options).sort()]);
  return remember(numberFormats, key, () => new Intl.NumberFormat(regionOf(locale), options)).format(value);
}
export function getCollator(locale: FormatContext, options: Intl.CollatorOptions = {}): Intl.Collator {
  const key = JSON.stringify([locale, Object.entries(options).sort()]);
  return remember(collators, key, () => new Intl.Collator(regionOf(locale), options));
}
function compiled(locale: FormatContext, pattern: string) {
  return remember(messages, JSON.stringify([locale, pattern]), () => new IntlMessageFormat(pattern, languageOf(locale), undefined, {
    ignoreTag: true,
    formatters: {
      getNumberFormat: (_locales, options) => remember(numberFormats, JSON.stringify([regionOf(locale), options]), () => new Intl.NumberFormat(regionOf(locale), options as Intl.NumberFormatOptions)),
      getPluralRules: (locales, options) => new Intl.PluralRules(locales, options),
      getDateTimeFormat: (_locales, options) => new Intl.DateTimeFormat(regionOf(locale), { ...options, timeZone: zoneOf(locale) }),
    },
  }), 1024);
}
export function formatMessage(locale: FormatContext, pattern: string, values?: MessageValues): string {
  const text = compiled(locale, pattern).format(values);
  if (typeof text !== 'string') throw new TypeError('Fluid messages must resolve to plain text.');
  return text;
}

/** A deterministic catalog change identifier. Authentication of archived documents uses SHA-256 separately. */
export function contentFingerprint(text: string): string {
  let value = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index++) {
    value = BigInt.asUintN(64, (value ^ BigInt(text.charCodeAt(index))) * 0x100000001b3n);
  }
  return 'fnv1a64-' + value.toString(16).padStart(16, '0');
}
function argumentSignature(elements: readonly MessageFormatElement[]) {
  const args = new Map<string, string>();
  function visit(nodes: readonly MessageFormatElement[]) {
    for (const node of nodes) {
      if (node.type === TYPE.literal || node.type === TYPE.pound) continue;
      if (node.type === TYPE.tag) throw new TypeError('Use separate semantic nodes for rich content.');
      const kind = node.type === TYPE.plural || node.type === TYPE.number ? 'number'
        : node.type === TYPE.date || node.type === TYPE.time ? 'date' : 'value';
      const prior = args.get(node.value);
      if (prior && kind !== 'value' && prior !== 'value' && prior !== kind) throw new TypeError('Incompatible argument: ' + node.value);
      if (!prior || prior === 'value') args.set(node.value, kind);
      if ('options' in node) for (const branch of Object.values(node.options)) visit(branch.value);
    }
  }
  visit(elements);
  return JSON.stringify([...args].sort());
}
export function assertCompatibleMessage(source: string, translation: string) {
  if (argumentSignature(compiled('en',source).getAst()) !== argumentSignature(compiled('en',translation).getAst())) throw new TypeError('Incompatible message arguments');
}
type CatalogArguments<S extends string> = GetICUArgs<S, { ICUArgument: string | number | boolean; ICUNumberArgument: number | bigint; ICUDateArgument: Date }>;
export interface FluidCatalog<Entries extends Readonly<Record<string, Translations>>> {
  (locale: FormatContext, key: Extract<keyof Entries,string>, values?: MessageValues): string;
  typed<Key extends Extract<keyof Entries,string>>(locale: FormatContext, key: Key, ...args: keyof CatalogArguments<Entries[Key]['de']> extends never ? [] : [values:CatalogArguments<Entries[Key]['de']>]): string;
  fingerprint(locale: Locale): string;
  validate(): void;
}
export function defineCatalog<const Entries extends Readonly<Record<string, Translations>>>(entries: Entries): FluidCatalog<Entries> {
  type K = Extract<keyof Entries, string>;
  const keys = (Object.keys(entries) as K[]).sort();
  const fingerprints = new Map<Locale, string>();
  const translate = (locale: FormatContext, key: K, values?: MessageValues) => {
    if (!Object.hasOwn(entries, key)) throw new RangeError('Unknown message key: ' + key);
    return formatMessage(locale, entries[key]![languageOf(locale)], values);
  };
  return Object.assign(translate, {
    /** For hosts authoring literal messages, parameter names and kinds follow the source ICU string. */
    typed<Key extends K>(locale: FormatContext, key: Key, ...args: keyof CatalogArguments<Entries[Key]['de']> extends never ? [] : [values: CatalogArguments<Entries[Key]['de']>]) {
      return translate(locale, key, args[0] as MessageValues | undefined);
    },
    fingerprint: (locale: Locale) => remember(fingerprints, locale, () => contentFingerprint(JSON.stringify(keys.map(key => [key, entries[key]![locale]])))),
    validate() {
      for (const key of keys) {
        const signatures = LOCALES.map(locale => {
          const message = entries[key]![locale];
          if (typeof message !== 'string' || !message.trim()) throw new TypeError('Missing ' + locale + ' message: ' + key);
          return argumentSignature(compiled(locale, message).getAst());
        });
        if (new Set(signatures).size !== 1) throw new TypeError('Translation parameters differ for ' + key);
      }
    },
  });
}
