'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { z } from 'zod';
import { AuthoringDocumentSchema, LocalDraftListSchema, LocalDraftVersionSchema, LocalBudgetSummarySchema, type AuthoringDocument, type AuthoringResult } from '@fluidkit/contracts';
const State = z.object({ token: z.string(), drafts: LocalDraftListSchema, budget: LocalBudgetSummarySchema });
export function LocalDraftLibrary({ draft, datasetHash, runtimeRevision, aiResult, busy, onLoad }: { draft: string; datasetHash: string; runtimeRevision: number; aiResult: AuthoringResult | null; busy: boolean; onLoad(document: AuthoringDocument): void }) {
  const [state, setState] = useState<z.infer<typeof State> | null>(null), [message, setMessage] = useState(''), [saving, setSaving] = useState(false);
  const alive = useRef(false);
  useEffect(() => { alive.current = true; const controller = new AbortController(); void fetch('/api/local-project', { signal: controller.signal, cache: 'no-store' }).then(async response => { if (!response.ok) throw new Error('Projektspeicher nicht verfügbar.'); const next = State.parse(await response.json()); if (!controller.signal.aborted) setState(next); }).catch(error => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'Projektspeicher fehlt.'); }); return () => { alive.current = false; controller.abort(); }; }, []);
  async function reload() { const response = await fetch('/api/local-project', { cache: 'no-store' }); if (!response.ok) throw new Error('Versionen nicht verfügbar.'); const next = State.parse(await response.json()); if (alive.current) setState(next); }
  async function save() {
    if (!state || saving) return; setSaving(true); setMessage('');
    try {
      const document = AuthoringDocumentSchema.parse(JSON.parse(draft));
      const response = await fetch('/api/local-project', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fluid-studio-token': state.token }, body: JSON.stringify({ operation: 'save-draft', input: { expectedRevision: state.drafts.revision, document, datasetHash, runtimeRevision, origin: aiResult ? 'ai' : 'manual', ai: aiResult } }) });
      const body: unknown = await response.json();
      if (!response.ok) { await reload(); throw new Error(body && typeof body === 'object' && 'error' in body ? String(body.error) : 'Speichern fehlgeschlagen.'); }
      const saved = LocalDraftVersionSchema.parse(body); await reload(); if (alive.current) setMessage(`Version ${saved.revision} lokal gespeichert. Die Arbeitsfläche wurde dadurch nicht geändert.`);
    } catch (error) { if (alive.current) setMessage(error instanceof z.ZodError || error instanceof SyntaxError ? 'Nur ein gültiger registrierter Entwurf kann gespeichert werden.' : error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'); }
    finally { if (alive.current) setSaving(false); }
  }
  return <section aria-label="Lokale Entwurfsversionen"><h3>Deine Entwurfsversionen</h3><p>Projektlokal in <code>.fluid/local/project.sqlite</code>. Layout und AI-Herkunft bleiben erhalten; Notizwerte, Suchtext und Prompts werden nicht gespeichert.</p><div className="quality-actions"><Button className="outline-button" disabled={busy || saving || !state} onClick={() => { void save(); }}>{saving ? 'Speichert …' : 'Entwurf lokal speichern'}</Button><Button className="outline-button" disabled={saving} onClick={() => { void reload().catch(error => setMessage(String(error))); }}>Versionen aktualisieren</Button></div>
    {state && <p>Gemeinsames AI-Projektbudget: {state.budget.projectChargedOrReservedUsd.toLocaleString('de-DE', { maximumFractionDigits: 4 })} / {state.budget.projectLimitUsd} USD gebucht oder reserviert. Gilt gemeinsam für Authoring und Bildanalyse, auch nach Serverneustart.</p>}
    <p role="status">{message}</p><ol>{state?.drafts.versions.map(version => <li key={version.revision}><strong>Version {version.revision} · {version.document.title}</strong> · {version.origin === 'ai' ? 'AI-Entwurf' : 'Manueller Entwurf'}<p>{new Date(version.createdAt).toLocaleString('de-DE')} · Fachrevision {version.runtimeRevision}{version.datasetHash !== datasetHash ? ' · anderer Datenstand; erneute Prüfung erforderlich' : ''}</p><Button className="outline-button" disabled={busy || saving} onClick={() => { onLoad(version.document); setMessage(`Version ${version.revision} als Entwurf geladen. Bitte vor Übernahme erneut prüfen.`); }}>Als Entwurf laden</Button></li>)}</ol>
  </section>;
}
