'use client';
import { StudioLink, useStudioMessages } from './studio-locale';
import { useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';
import styles from './showcase-cases.module.css';

/** Explicit case entry points. The diagrams are decorative previews, never data claims. */
export function ShowcaseCases({ runtime, data }: { runtime: FluidRuntime; data: WorkspaceData }) {
  const t = useStudioMessages();
  const [error, setError] = useState('');
  const reviewModule = data.modules.find(module => module.id === 'core') ?? data.modules[0];
  function open(view: 'compare' | 'atlas') {
    setError('');
    if (view === 'compare') {
      const suggested = runtime.send('compare.suggest');
      if (!suggested.accepted) { setError(suggested.reason ?? 'Vergleich konnte nicht vorbereitet werden.'); return; }
    }
    const result = runtime.send(`view.${view}`);
    if (!result.accepted) { setError(result.reason ?? 'Ansicht konnte nicht geöffnet werden.'); return; }
    document.querySelector('.showcase-preview')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  return <section className={styles.section} aria-label={t('perspectiveTry')}>
    <div className={styles.heading}><span className="eyebrow">{t('perspectiveLabel')}</span><p>{t('perspectiveIntro')}</p></div>
    <div className={styles.grid}>
      <StudioLink className={styles.card} href={`/studio/flows${reviewModule ? `?module=${encodeURIComponent(reviewModule.id)}` : ''}`}>
        <div className={styles.preview} aria-hidden="true"><svg viewBox="0 0 280 110"><path d="M54 55H110M150 55H210M130 73V92H54V73"/><rect x="22" y="36" width="64" height="38" rx="10"/><rect x="108" y="36" width="44" height="38" rx="10" className={styles.filled}/><rect x="204" y="36" width="54" height="38" rx="10"/><circle cx="130" cy="55" r="5" className={styles.dot}/><path d="m197 50 7 5-7 5"/></svg></div>
        <span className={styles.kicker}>01 / FLOW EXPLORER</span><h2>{t('flowCard')}</h2><p>{t('flowCardHint')}</p><span className={styles.cta}>{t('openReview')} <span aria-hidden="true">↗</span></span>
      </StudioLink>
      <Button className={styles.card} onClick={() => open('compare')}>
        <div className={styles.preview} aria-hidden="true"><svg viewBox="0 0 280 110"><rect x="32" y="12" width="64" height="88" rx="9"/><rect x="108" y="12" width="64" height="88" rx="9" className={styles.filled}/><rect x="184" y="12" width="64" height="88" rx="9"/><path d="M44 34h40m36 0h40m36 0h40M44 54h29m47 0h40m36 0h22M44 74h36m40 0h20m56 0h36"/></svg></div>
        <span className={styles.kicker}>02 / VERGLEICH</span><h2>{t('compareCard')}</h2><p>{t('compareCardHint')}</p><span className={styles.cta}>{t('openCompareExample')} <span aria-hidden="true">→</span></span>
      </Button>
      <Button className={styles.card} onClick={() => open('atlas')}>
        <div className={styles.preview} aria-hidden="true"><svg viewBox="0 0 280 110"><rect x="28" y="12" width="116" height="88" rx="9" className={styles.filled}/><rect x="152" y="12" width="100" height="40" rx="8"/><rect x="152" y="60" width="46" height="40" rx="8"/><rect x="206" y="60" width="46" height="40" rx="8"/><path d="M42 30h42m-42 12h22"/></svg></div>
        <span className={styles.kicker}>03 / WORKSPACE ATLAS</span><h2>{t('atlasCard')}</h2><p>{t('atlasCardHint')}</p><span className={styles.cta}>{t('openAtlas')} <span aria-hidden="true">→</span></span>
      </Button>
    </div>
    {error && <p role="alert" className="notice">{error}</p>}
  </section>;
}
