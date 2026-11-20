'use client';
import { useStudioLocale } from './studio-locale';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { z } from 'zod';
import { AIReviewAssessmentSchema, LocalReviewEvidenceSchema, type AIReviewAssessment, type AIReviewFrame, type LocalReviewEvidence } from '@fluidkit/contracts';
import { proofImageBytes, proofSha256 } from '@fluidkit/testing/proof-capture';
const Session = z.object({ token: z.string(), reviews: z.array(z.object({ id: z.string(), created: z.string() })) });
export function ReviewEvidenceLibrary({ result, frames, onLoad, disabled = false }: { result: AIReviewAssessment | null; frames: AIReviewFrame[]; onLoad(value: LocalReviewEvidence): void; disabled?: boolean }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale();
  const [session, setSession] = useState<z.infer<typeof Session> | null>(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [url, setUrl] = useState('');
  const generation = useRef(0), alive = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { generation.current++; setUrl(''); return () => { generation.current++; }; }, [result, frames]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function configure() { const response = await fetch('/api/local-project', { cache: 'no-store' }); if (!response.ok) throw new Error('Nachweisspeicher nicht verfügbar.'); const next = Session.parse(await response.json()); if (alive.current) setSession(next); return next; }
  async function archive() {
    if (!result || busy || disabled) return; const token = generation.current; setBusy(true); setMessage('');
    try {
      const assessment = AIReviewAssessmentSchema.parse(result);
      const evidence = LocalReviewEvidenceSchema.parse({ schemaVersion: 1, kind: 'fluid-local-review-evidence', assessment,
        frames: await Promise.all(frames.map(async frame => ({ frame, imageSha256: await proofSha256(proofImageBytes(frame.image)) }))) });
      if (token !== generation.current) return;
      const current = session ?? await configure();
      if (token !== generation.current) return;
      const response = await fetch('/api/local-project', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fluid-studio-token': current.token }, body: JSON.stringify({ operation: 'save-review', input: evidence }) });
      if (!response.ok) { const body = await response.json(); throw new Error(typeof body.error === 'string' ? body.error : 'Speichern fehlgeschlagen.'); }
      if (token !== generation.current) return;
      setUrl(URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' })));
      setMessage(tr('reviewSaved')); await configure();
    } catch (error) { if (token === generation.current) setMessage(tr('reportDetail',{detail:error instanceof Error ? error.message : String(error)})); }
    finally { if (alive.current) setBusy(false); }
  }
  async function load(id: string) {
    if (!session || busy || disabled) return; const token = generation.current; setBusy(true);
    try {
      const response = await fetch('/api/local-project', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fluid-studio-token': session.token }, body: JSON.stringify({ operation: 'read-review', id }) });
      if (!response.ok) throw new Error('Nachweis konnte nicht gelesen werden.');
      const evidence = LocalReviewEvidenceSchema.parse(await response.json());
      for (const item of evidence.frames) if (await proofSha256(proofImageBytes(item.frame.image)) !== item.imageSha256) throw new Error('Gespeichertes Bild stimmt nicht mit dem Hash überein.');
      if (token !== generation.current || !alive.current) return;
      onLoad(evidence); setMessage(tr('reviewLoaded'));
    } catch (error) { if (alive.current) setMessage(tr('reportDetail',{detail:error instanceof Error ? error.message : String(error)})); }
    finally { if (alive.current) setBusy(false); }
  }
  return <section aria-label={tr('gallery')}><h3>{tr('evidenceTitle')}</h3><p>{tr('reviewInfo')}</p><div className="quality-actions"><Button className="outline-button" disabled={!result || !frames.length || busy || disabled} onClick={() => { void archive(); }}>{tr('saveReview')}</Button><Button className="outline-button" disabled={busy || disabled} onClick={() => { void configure().catch(error => setMessage(tr('reportDetail',{detail:String(error)}))); }}>{tr('listReviews')}</Button>{url && <a className="outline-button" href={url} download={`${result?.result.id ?? 'review'}-evidence.json`}>{tr('downloadEvidence')}</a>}</div><p role="status">{message}</p><ul>{session?.reviews.map(item => <li key={item.id}><Button className="outline-button" disabled={busy || disabled} onClick={() => { void load(item.id); }}>{new Date(item.created).toLocaleString(locale)} · {item.id}</Button></li>)}</ul></section>;
}
