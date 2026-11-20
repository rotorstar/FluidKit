'use client';
import { useStudioLocale, useStudioMessages } from './studio-locale';
import { Button } from '@base-ui/react/button';
import { useState } from 'react';
import { workspaceRows, workspaceSelection, workspaceSuggestedComparison, type WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';
import styles from './structural-workspace.module.css';

const stories = {
  match: { title: 'matchTitle', forward: 'matchForward', back: 'matchBack' },
  split: { title: 'splitTitle', forward: 'splitForward', back: 'splitBack' },
  merge: { title: 'mergeTitle', forward: 'mergeForward', back: 'mergeBack' },
} as const;
type Story = keyof typeof stories;

export function StructuralControls({ runtime, data, ready }: { runtime: FluidRuntime; data: WorkspaceData; ready: boolean }) {
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const [story, setStory] = useState<Story>('match');
  const [error, setError] = useState('');
  const snapshot = runtime.getSnapshot();
  const picked = workspaceSelection(snapshot);
  const atTarget = story === 'match' ? snapshot.state === 'cards' : story === 'merge' ? snapshot.state === 'compare' : snapshot.state === 'atlas' && snapshot.fields.atlasGroup === 'Kernel';
  function prepare(next: Story) {
    const current = runtime.getSnapshot();
    const currentIds = workspaceSelection(current);
    const fields = { ...current.fields, cardsPickedOnly: next === 'merge' } as typeof current.fields;
    if (next === 'merge' && (currentIds.length < 2 || currentIds.length > 4)) fields.selection = workspaceSuggestedComparison(data);
    if (next === 'split' || next === 'merge') { fields.group = 'all'; fields.query = ''; }
    if (next === 'split') fields.atlasGroup = 'all';
    const state = next === 'match' ? 'table' : next === 'split' ? 'atlas' : 'cards';
    const result = runtime.send('navigation.restore', { state, fields }, 'host');
    if (!result.accepted) { setError(result.reason); return; }
    setStory(next);
    setError('');
  }
  function transform() {
    const source = story === 'match' ? 'table' : story === 'split' ? 'atlas' : 'cards';
    if (!atTarget && (snapshot.state !== source || (story === 'merge' && (picked.length < 2 || picked.length > 4)))) { prepare(story); return; }
    const event = story === 'match' ? atTarget ? 'view.table' : 'view.cards'
      : story === 'split' ? atTarget ? 'atlas.group.all' : 'atlas.group.Kernel' : atTarget ? 'view.cards' : 'view.compare';
    const result = runtime.send(event);
    setError(result.accepted ? '' : result.reason);
  }
  const rows = workspaceRows(data, snapshot, locale);
  const unavailable = story === 'split' ? !data.modules.some(module => module.group === 'Kernel')
    : story === 'merge' ? data.modules.length < 2 : !rows.length;
  const needsSource = !atTarget && ((story === 'match' && snapshot.state !== 'table') || (story === 'split' && snapshot.state !== 'atlas') || (story === 'merge' && (snapshot.state !== 'cards' || picked.length < 2 || picked.length > 4)));
  const witness = rows.find(module => picked.includes(module.id)) ?? rows[0];
  const description = story==='match' && witness ? witness.id+' · '+t('sourceFiles',{count:witness.files})
    : story==='split' ? 'Kernel · '+data.modules.filter(module=>module.group==='Kernel').map(module=>module.id).join(', ')
    : picked.join(' + ');
  return <div className={styles.tools}><div role="group" aria-label={t('chooseStory')} className={styles.stories}>
    {(Object.keys(stories) as Story[]).map(key => <Button type="button" key={key} aria-pressed={story === key} onClick={() => prepare(key)}>{t(stories[key].title)}</Button>)}
    </div><Button type="button" className={styles.primary} disabled={!ready || unavailable} onClick={transform}>{t(needsSource ? 'openSource' : atTarget ? stories[story].back : stories[story].forward)}<span aria-hidden="true"> →</span></Button>
    {description && <span className={styles.witness}>{description}</span>}
    {error && <span role="alert">{error}</span>}</div>;
}
