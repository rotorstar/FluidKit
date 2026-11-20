import { LOCALES, type Locale } from '@fluidkit/i18n';

export const LOCALE_COOKIE = 'fluid_locale';
export const LOCALE_HEADER = 'x-fluid-studio-locale';

export function isStudioLocale(value: unknown): value is Locale {
  return LOCALES.some(locale => locale === value);
}

export function pathLocale(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  return isStudioLocale(segment) ? segment : null;
}

export function unprefixedPath(pathname: string): string {
  const locale = pathLocale(pathname);
  return locale ? pathname.slice(locale.length + 1) || '/' : pathname;
}

/** Only local user routes are localized. Download and API addresses are stable. */
export function studioHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const match = /^([^?#]*)(.*)$/.exec(href);
  if (!match) return href;
  const path = unprefixedPath(match[1] ?? '/');
  if (path !== '/' && path !== '/studio' && !path.startsWith('/studio/')) return href;
  return '/' + locale + (path === '/' ? '' : path) + (match[2] ?? '');
}

export function requestLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isStudioLocale(cookie)) return cookie;
  let chosen: Locale = 'de', best = 0;
  for (const entry of (acceptLanguage ?? '').split(',')) {
    const match = /^\s*([a-z]{2,8})(?:-[a-z0-9]{1,8})*(?:\s*;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?\s*$/i.exec(entry);
    const language = match?.[1]?.toLowerCase();
    const weight = Number(match?.[2] ?? 1);
    if (isStudioLocale(language) && weight > best) { chosen = language; best = weight; }
  }
  return chosen;
}
