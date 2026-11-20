'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useStudioLocale, useStudioMessages } from './studio-locale';
import { useMemo, useState } from 'react';
import { type AcceptanceLedger } from '@fluidkit/contracts';
import { StudioInput, StudioSelect } from './studio-controls';
const LABELS = { verified:'approved',implemented:'implemented',partial:'partial',open:'pending',external:'external' } as const;
export function AcceptanceBrowser({ ledger }: { ledger: AcceptanceLedger }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const [search, setSearch] = useState(''), [status, setStatus] = useState('all');
  const shown = useMemo(() => { const query = search.trim().toLocaleLowerCase(locale); return ledger.criteria.filter(item => (status === 'all' || item.status === status) && (!query || [item.id, item.task, item.criterion, item.scope, item.remaining, ...item.evidence.map(file => file.path)].join(' ').toLocaleLowerCase(locale).includes(query))); }, [locale, ledger, search, status]);
  return <section aria-label={t('acceptSearch')}><h2>{t('acceptMatrix')}</h2><div className="quality-actions"><label>{t('findCriterion')}<StudioInput type="search" maxLength={160} value={search} onChange={event => setSearch(event.target.value)}/></label><label>Status<StudioSelect value={status} onChange={event => setStatus(event.target.value)}><option value="all">{t('allStatuses')}</option>{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{tr(label)}</option>)}</StudioSelect></label></div><p role="status">{tr('acCount',{n:shown.length,total:ledger.criteria.length})}</p><div className="acceptance-table"><table><thead><tr><th>AC</th><th>{t('criteriaLabel')}</th><th>{t('statusScope')}</th><th>{t('openEvidence')}</th></tr></thead><tbody>{shown.map(item => <tr key={item.id} id={item.id}><th scope="row"><a href={`#${item.id}`}>{item.id}</a></th><td lang="de">{item.criterion}</td><td><strong>{tr(LABELS[item.status])}</strong><p lang="de">{item.scope}</p></td><td><p lang="de">{item.remaining || 'Im genannten Scope belegt'}</p><ul>{item.evidence.map((file, index) => <li key={`${file.path}-${index}`}><a href={`/api/evidence?criterion=${encodeURIComponent(item.id)}&index=${index}`} download>{file.kind} · {file.path.split('/').at(-1)}</a><details><summary>{t('sourceHash')}</summary><code>{file.path}</code><p><code>{file.sha256}</code></p></details></li>)}</ul></td></tr>)}</tbody></table></div></section>;
}
