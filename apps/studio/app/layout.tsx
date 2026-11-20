import type { Metadata } from 'next';
import { headers } from 'next/headers';
import designReport from '../generated/design-static.json';
import './globals.css';
import { StudioNavigation } from '../components/studio-navigation';
import { AppearanceProvider } from '../components/appearance-provider';
import { StudioLocaleProvider } from '../components/studio-locale';
import { LOCALE_HEADER, isStudioLocale } from '../lib/locale-routing';
import { studioMessage } from '../lib/studio-messages';
import styles from '../components/studio-navigation.module.css';

async function documentLocale() {
  const value = (await headers()).get(LOCALE_HEADER);
  return isStudioLocale(value) ? value : 'de';
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await documentLocale();
  return { title: studioMessage(locale, 'metaTitle'), description: studioMessage(locale, 'metaDescription') };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await documentLocale();
  return <html lang={locale} dir="ltr"><body><StudioLocaleProvider initialLocale={locale} buildId={designReport.context.buildId}>
    <div className={`root ${styles.shell}`}><AppearanceProvider><StudioNavigation/>{children}</AppearanceProvider></div>
  </StudioLocaleProvider></body></html>;
}
