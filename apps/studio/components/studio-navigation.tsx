'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_NAMES } from '@fluidkit/i18n';
import { StudioSelect } from './studio-controls';
import { studioDestinations, studioGroups } from '../lib/studio-destinations';
import { isStudioLocale, studioHref, unprefixedPath } from '../lib/locale-routing';
import { workspaceReturnHref } from '../lib/workspace-navigation';
import { StudioLink, useStudioLocale, useStudioMessages } from './studio-locale';
import styles from './studio-navigation.module.css';

function LanguagePicker() {
  const { locale, chooseLocale } = useStudioLocale();
  const t = useStudioMessages();
  return <label className={styles.language}><span>{t('language')}</span>
    <StudioSelect aria-label={t('language')} value={locale} onChange={event => {
      if (isStudioLocale(event.target.value)) chooseLocale(event.target.value);
    }}>{LOCALES.map(value => <option key={value} lang={value} value={value}>{LOCALE_NAMES[value]}</option>)}</StudioSelect>
  </label>;
}

function Destinations({ pathname }: { pathname: string }) {
  const { locale } = useStudioLocale(), t = useStudioMessages();
  const [workspace, setWorkspace] = useState('/');
  useEffect(() => { setWorkspace(workspaceReturnHref()); }, [pathname]);
  return <>
    {studioGroups.map(group => <div className={styles.group} key={group}><span>{t(group)}</span>
      {studioDestinations.filter(item => item.group === group).map(item =>
        <StudioLink key={item.href} href={item.href === '/' && pathname !== '/' ? workspace : item.href} aria-current={item.href === pathname ? 'page' : undefined}>{t(item.title)}</StudioLink>)}
    </div>)}
    <div className={styles.knowledge}><span>{t('navKnowledge')}</span>
      <a href={`/knowledge/engineering/${locale}/handbook.html`} target="_blank" rel="noreferrer">{t('navEngineering')} ↗</a>
      <a href={`/knowledge/public/${locale}/handbook.html`} target="_blank" rel="noreferrer">{t('navManual')} ↗</a>
    </div>
  </>;
}

export function StudioNavigation() {
  const pathname = unprefixedPath(usePathname() ?? '/');
  const { locale } = useStudioLocale(), t = useStudioMessages();
  const brand = <a className={styles.brand} href={studioHref('/studio',locale)} aria-label={t('navBrand')}><b aria-hidden="true">ƒ</b> Fluid Studio</a>;
  return <>
    <nav className={styles.rail} aria-label={t('navMain')}>{brand}<LanguagePicker/><Destinations pathname={pathname}/></nav>
    <header className={styles.mobile}>{brand}<LanguagePicker/><details key={pathname}><summary>{t('navMenu')}</summary><nav aria-label={t('navMobile')}><Destinations pathname={pathname}/></nav></details></header>
  </>;
}
