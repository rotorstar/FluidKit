'use client';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { FluidLocaleProvider } from '@fluidkit/react';
import type { Locale } from '@fluidkit/i18n';
import { LOCALE_COOKIE, pathLocale, studioHref } from '../lib/locale-routing';
import { studioMessage } from '../lib/studio-messages';

const LocaleState = createContext<{locale: Locale; buildId?: string; chooseLocale: (value: Locale) => void}>({locale: 'de', chooseLocale: () => {}});
export const useStudioLocale = () => useContext(LocaleState);

export function StudioLocaleProvider({ initialLocale, buildId, children }: { initialLocale: Locale; buildId?: string; children: ReactNode }) {
  const [locale, setLocale] = useState(initialLocale);
  const composing = useRef(false);
  const pending = useRef<Locale | null>(null);

  const apply = useCallback((value: Locale) => {
    const url = studioHref(location.pathname + location.search + location.hash, value);
    // Keep the document, editing session and live Surface mounted. Next's native
    // History integration updates usePathname without triggering a new route.
    if (url !== location.pathname + location.search + location.hash) window.history.replaceState(null, '', url);
    document.cookie = `${LOCALE_COOKIE}=${value}; Path=/; SameSite=Lax; Max-Age=31536000${location.protocol === 'https:' ? '; Secure' : ''}`;
    setLocale(value);
  }, []);
  const chooseLocale = useCallback((value: Locale) => {
    if (composing.current) pending.current = value;
    else apply(value);
  }, [apply]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
    document.title = studioMessage(locale, 'metaTitle');
    document.querySelector('meta[name="description"]')?.setAttribute('content', studioMessage(locale, 'metaDescription'));
  }, [locale]);
  useEffect(() => {
    const start = () => { composing.current = true; };
    const end = () => {
      composing.current = false;
      const value = pending.current;
      pending.current = null;
      if (value) queueMicrotask(() => apply(value));
    };
    const restore = () => { pending.current = null; setLocale(pathLocale(location.pathname) ?? initialLocale); };
    document.addEventListener('compositionstart', start, true);
    document.addEventListener('compositionend', end, true);
    window.addEventListener('popstate', restore);
    return () => {
      document.removeEventListener('compositionstart', start, true);
      document.removeEventListener('compositionend', end, true);
      window.removeEventListener('popstate', restore);
    };
  }, [apply, initialLocale]);

  return <LocaleState.Provider value={{locale, buildId, chooseLocale}}><FluidLocaleProvider locale={locale}>{children}</FluidLocaleProvider></LocaleState.Provider>;
}

export function StudioLink({href, ...props}: ComponentProps<'a'> & {href: string}) {
  const {locale} = useStudioLocale();
  return <a {...props} href={studioHref(href, locale)}/>;
}

export function useStudioMessages() {
  const {locale} = useStudioLocale();
  return (id: Parameters<typeof studioMessage>[1], values?: Parameters<typeof studioMessage>[2]) => studioMessage(locale, id, values);
}

export function StudioText({id,values}: {id: Parameters<typeof studioMessage>[1]; values?: Parameters<typeof studioMessage>[2]}) {
  return useStudioMessages()(id,values);
}
