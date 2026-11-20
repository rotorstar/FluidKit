'use client';
import { studioDestinations, studioGroups } from '../../lib/studio-destinations';
import { StudioLink, useStudioMessages } from '../../components/studio-locale';
import styles from '../../components/studio-navigation.module.css';

export default function StudioPage() {
  const t = useStudioMessages();
  return <main className={styles.studioHome}><h1>Fluid Studio</h1>
    {studioGroups.map(group => <section key={group}><h2>{t(group)}</h2><div>{studioDestinations.filter(item => item.group === group).map(item =>
      <StudioLink key={item.href} href={item.href}><strong>{t(item.title)}</strong><p>{t(item.description)}</p></StudioLink>)}</div></section>)}
  </main>;
}
