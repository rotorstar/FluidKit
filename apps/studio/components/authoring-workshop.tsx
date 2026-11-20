'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { aiRequestMessage, AIRequestError } from '../lib/ai-request-status';
import { LOCALE_NAMES } from '@fluidkit/i18n';
import { useStudioLocale, useStudioMessages } from './studio-locale';
import { Button } from '@base-ui/react/button';
import { z } from 'zod';
import { AuthoringStreamEventSchema, type AuthoringRequest, type AuthoringDocument, type AuthoringResult } from '@fluidkit/contracts';
import { authoredCatalogFingerprint, authoredWorkspaceHeight, type WorkspaceData } from '@fluidkit/cases';
import { FluidProvider, useFluid } from '@fluidkit/react';
import { StudioFluidSurface as FluidSurface } from './studio-fluid-surface';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { createAuthoringController } from '../lib/authoring-controller';
import { EffectLab, EffectTransport } from './effect-lab';
import { StudioInput, StudioTextarea } from './studio-controls';
import styles from './authoring-workshop.module.css';
import { proofSha256 } from '@fluidkit/testing/proof-capture';
import { LocalDraftLibrary } from './local-draft-library';
import { DevelopmentProposalSchema, type DevelopmentProposal } from '@fluidkit/contracts';

type Controller = ReturnType<typeof createAuthoringController>;
const ConfigurationSchema = z.object({ configured: z.boolean(), token: z.string().regex(/^[a-f0-9]{48}$/), policy: z.object({ model: z.string(), sessionUsd: z.number() }) });
type Configuration = z.infer<typeof ConfigurationSchema>;
const pretty = (value: unknown) => JSON.stringify(value, null, 2);

function authoringMessage(error: unknown, fallback: string): string {
  if (error instanceof SyntaxError) return 'Das JSON ist ungültig. Prüfe Anführungszeichen, Kommas und Klammern und starte die Prüfung erneut.';
  if (error instanceof z.ZodError) {
    const issue = error.issues[0], first = issue?.path[0], section = issue?.path[1];
    const field = first === 'title' ? 'Titel' : first === 'accent' ? 'Akzent' : first === 'schemaVersion' ? 'Dokumentversion' : first === 'registryVersion' ? 'Bausteinregister' : 'Entwurf';
    const location = first === 'sections' && typeof section === 'number' ? `Baustein ${section + 1}` : field;
    return `${location} ist ungültig. Nutze registrierte Bausteine und prüfe Typ, Datenbindung, eindeutige IDs und Pflichtfelder.`;
  }
  // Controller guards are authored messages (for example preserving a dirty note).
  // Unexpected verbose diagnostics are not useful product feedback.
  return error instanceof Error && error.message.length <= 240 && !error.message.includes('\n') ? error.message : fallback;
}

function AuthoredSurface({ document, data, onMetrics, onControls }: { document: AuthoringDocument; data: WorkspaceData; onMetrics: (value: SurfaceMetrics) => void; onControls: (value: SurfacePlaybackControls | null) => void }) {
  const { snapshot } = useFluid(), host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const element = host.current; if (!element) return;
    const observer = new ResizeObserver(entries => { const next = entries[0]?.contentRect.width; if (next && next > 0) setWidth(next); });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  return <div ref={host}><FluidSurface catalogFingerprint={authoredCatalogFingerprint} height={authoredWorkspaceHeight(document, width, data.modules.length, snapshot.fields.inspectorOpen === true)} onMetrics={onMetrics} onControls={onControls} /></div>;
}

export function AuthoringWorkshop({ data, datasetHash }: { data: WorkspaceData; datasetHash: string }) {
  const t = useStudioMessages();
  const [session, setSession] = useState<{ controller: Controller; id: string } | null>(null);
  useEffect(() => { const next = createAuthoringController(data); setSession({ controller: next, id: crypto.randomUUID() }); return () => next.dispose(); }, [data]);
  return session ? <AuthoringSession key={session.id} controller={session.controller} data={data} datasetHash={datasetHash}/> : <p role="status">{t('authorLoading')}</p>;
}

function AuthoringSession({ controller, data, datasetHash }: { controller: Controller; data: WorkspaceData; datasetHash: string }) {
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const [failedStatus,setFailedStatus] = useState<number | null>(null);
  const [applied, setApplied] = useState(controller.current), { runtime, document, documentRevision } = applied;
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const [draft, setDraft] = useState(pretty(document)), [prompt, setPrompt] = useState(() => t('draftPrompt'));
  const [config, setConfig] = useState<Configuration | null>(null), [message, setLocalMessage] = useState('');
  function setMessage(next: string) { setFailedStatus(null); setLocalMessage(next); }
  const [stream, setStream] = useState(''), [busy, setBusy] = useState(false), [checking, setChecking] = useState(false);
  const [proposal, setProposal] = useState<DevelopmentProposal | null>(null), [aiResult, setAIResult] = useState<AuthoringResult | null>(null);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null), [controls, setControls] = useState<SurfacePlaybackControls | null>(null);
  const [preview, setPreview] = useState<{ runtime: typeof runtime; document: AuthoringDocument } | null>(null), [showPreview, setShowPreview] = useState(false);
  const displayed = showPreview && preview ? preview : applied;
  const abort = useRef<AbortController | null>(null), latestDraft = useRef(draft), mounted = useRef(true);
  latestDraft.current = draft;
  useEffect(() => { controller.releaseRetired(); }, [controller, documentRevision]);
  useEffect(() => () => preview?.runtime.dispose(), [preview]);
  useEffect(() => {
    mounted.current = true;
    const pending = new AbortController();
    fetch('/api/authoring', { signal: pending.signal }).then(async response => {
      if (!response.ok) throw new Error('Lokale Authoring-Session nicht verfügbar.');
      setConfig(ConfigurationSchema.parse(await response.json()));
    }).catch(error => { if (!pending.signal.aborted) setMessage(error instanceof Error ? error.message : 'Session fehlt.'); });
    return () => { mounted.current = false; pending.abort(); abort.current?.abort(); controller.cancel(); };
  }, [controller]);
  function cancel() { abort.current?.abort(); controller.cancel(); setBusy(false); setStream(''); setMessage('Generierung abgebrochen. Die Arbeitsfläche bleibt erhalten.'); }
  function edit(value: string) { if (busy) cancel(); latestDraft.current = value; setDraft(value); setProposal(null); setAIResult(null); setShowPreview(false); setPreview(null); }
  async function generate() {
    if (!config?.configured || busy) return;
    const pending = new AbortController(); abort.current = pending;
    let request: AuthoringRequest;
    try { request = { ...controller.begin(`authoring-${crypto.randomUUID()}`, JSON.parse(draft)), prompt }; }
    catch (error) { setMessage(authoringMessage(error, 'Entwurf ist ungültig.')); return; }
    setBusy(true); setProposal(null); setStream(''); setShowPreview(false); setPreview(null); setMessage('Entwurf entsteht. Die Arbeitsfläche bleibt bedienbar.');
    try {
      const sourceDocumentHash = await proofSha256(JSON.stringify(request.document));
      if (pending.signal.aborted || latestDraft.current !== draft || !controller.matches(request)) return;
      const response = await fetch('/api/authoring', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fluid-studio-token': config.token }, signal: pending.signal, body: JSON.stringify({ operation: 'generate', datasetHash, input: { ...request, responseLocale: locale } }) });
      if (!response.ok || !response.body) throw new AIRequestError(response.ok ? 502 : response.status);
      const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '', bytes = 0, complete = false;
      try {
        for (;;) {
          const chunk = await reader.read(); if (chunk.done) break;
          bytes += chunk.value.byteLength; if (bytes > 600000) throw new Error('Entwurfsstream zu groß.');
          buffer += decoder.decode(chunk.value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1); if (!line) continue;
            const event = AuthoringStreamEventSchema.parse(JSON.parse(line));
            if (pending.signal.aborted) return;
            if (event.type === 'error') throw new AIRequestError(event.status ?? 502);
            if (event.type === 'partial') {
              if (event.requestId !== request.id || !controller.matches(request)) throw new Error('Workspace verändert. Der alte Entwurf wird verworfen.');
              setStream(pretty(event.value));
            } else {
              if (event.result.basis && (event.result.basis.documentSha256 !== sourceDocumentHash || event.result.basis.datasetSha256 !== datasetHash)) throw new Error('AI-Entwurf gehört zu einer anderen Dokument- oder Datenversion.');
              const candidate = controller.accept(event.result);
              complete = true; setDraft(pretty(candidate)); setAIResult(event.result); setStream('');
              setMessage('Entwurf vollständig. Prüfe Änderungen und Preflight vor der Übernahme.');
            }
          }
        }
        if (!complete || buffer.trim()) throw new Error('Unvollständiger Entwurfsstream. Kein Entwurf freigegeben.');
      } finally { reader.releaseLock(); }
    } catch (error) { if (!pending.signal.aborted) { if (error instanceof AIRequestError) setFailedStatus(error.status); else setMessage(error instanceof Error ? error.message : t('aiUnavailable')); } }
    finally { pending.abort(); if (abort.current === pending) { abort.current = null; controller.cancel(); if (mounted.current) setBusy(false); } }
  }
  async function preflight() {
    if (!config || checking) return;
    const text = draft, basis = controller.basis();
    setChecking(true); setProposal(null);
    try {
      const after = controller.validate(JSON.parse(text));
      const response = await fetch('/api/authoring', { method: 'POST', headers: { 'content-type': 'application/json', 'x-fluid-studio-token': config.token }, body: JSON.stringify({ operation: 'preflight', datasetHash, input: {
        before: document, after, ...basis, origin: aiResult ? { kind: 'ai', requestId: aiResult.requestId, provenance: aiResult.provenance } : { kind: 'manual' },
      } }) });
      if (!response.ok) throw new Error('Preflight nicht verfügbar oder Entwurf ungültig.');
      const result = DevelopmentProposalSchema.parse(await response.json());
      if (!mounted.current) return;
      if (result.basis.dataSha256 !== datasetHash) throw new Error('Prüfung gehört zu anderen Workspace-Daten. Bitte neu laden.');
      if (latestDraft.current !== text || !controller.matches(basis)) throw new Error('Entwurf oder Workspace während der Prüfung verändert. Bitte erneut prüfen.');
      setProposal(result); setMessage(result.preflight.passed ? 'Preflight bestanden. Änderungen sind zur bewussten Übernahme bereit.' : 'Preflight hat offene Befunde. Der Entwurf bleibt unveröffentlicht.');
    } catch (error) { if (mounted.current) setMessage(authoringMessage(error, 'Preflight fehlgeschlagen.')); }
    finally { if (mounted.current) setChecking(false); }
  }
  function apply() {
    if (!proposal?.preflight.passed) return;
    try { setApplied(controller.apply(JSON.parse(draft), proposal.basis)); setShowPreview(false); setPreview(null); setProposal(null); setAIResult(null); setMetrics(null); setMessage('Entwurf übernommen. Auswahl, Suche und Projektnotiz sind erhalten.'); }
    catch (error) { setMessage(authoringMessage(error, 'Übernahme abgelehnt.')); }
  }
  function previewDraft() {
    if (!proposal?.preflight.passed) return;
    try {
      const candidate = controller.validate(JSON.parse(draft));
      const next = controller.preview(candidate, proposal.basis);
      setPreview(next); setShowPreview(true); setMetrics(null);
      setMessage('Isolierte WebGPU-Vorschau. Aktionen darin verändern den aktiven Workspace nicht.');
    } catch (error) { setMessage(authoringMessage(error, 'Vorschau nicht verfügbar.')); }
  }
  function download(report = false) {
    if (!proposal) return;
    const url = URL.createObjectURL(new Blob([report ? pretty(proposal) : proposal.downloadDiff.text], { type: report ? 'application/json' : proposal.downloadDiff.mime }));
    const link = window.document.createElement('a'); link.href = url; link.download = report ? 'fluid-authoring-preflight.json' : proposal.downloadDiff.filename; link.click(); URL.revokeObjectURL(url);
  }
  const stale = proposal && !controller.matches(proposal.basis);
  return <main className={styles.page}>
    <header className={styles.heading}><span className="eyebrow">M8 / COMPOSE WITH INTENT</span><h1>{t('authorHeading')}<br/>{t('authorSub')}</h1><p>{t('authorIntro')}</p></header>
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="authoring-title"><h2 id="authoring-title">{t('compose')}</h2>
        <label>{t('promptLabel')}<StudioTextarea value={prompt} onChange={event => { if (busy) cancel(); setPrompt(event.target.value); }} maxLength={3000} rows={5}/></label>
        <p className={styles.hint}>{config?.configured ? t('sessionLimit', {model:config.policy.model,limit:config.policy.sessionUsd}) : t('manualAvailable')}</p>
        <p className={styles.hint}>{t('authorConsent')}</p>
        <div className={styles.actions}><Button className="play-button" disabled={!config?.configured || busy || checking} onClick={generate}>{t('authorGenerate')}</Button>{busy && <Button className="outline-button" onClick={cancel}>{t('cancelAction')}</Button>}</div>
        {stream && <details open><summary>{t('draftStream')}</summary><pre>{stream}</pre></details>}
        <label>{t('editTitle')}<StudioInput value={(() => { try { return String(JSON.parse(draft).title ?? ''); } catch { return ''; } })()} onChange={event => { try { edit(pretty({ ...JSON.parse(draft), title: event.target.value })); } catch { setMessage('Bitte zuerst das JSON korrigieren.'); } }}/></label>
        <details><summary>{t('editJson')}</summary><label>{t('registeredParts')}<StudioTextarea className={styles.code} aria-label={t('authorDoc')} value={draft} onChange={event => edit(event.target.value)} rows={17} spellCheck={false}/></label></details>
        <div className={styles.actions}><Button className="play-button" disabled={!config || busy || checking} onClick={preflight}>{t(checking ? 'checkingDraft' : 'checkDraft')}</Button><Button className="outline-button" disabled={busy || checking} onClick={() => edit(pretty(document))}>{t('discardDraft')}</Button></div>
        <p role="status" className={styles.message}>{failedStatus ? t(aiRequestMessage(failedStatus)) : message || t('draftWelcome')}</p>
        <LocalDraftLibrary draft={draft} datasetHash={datasetHash} runtimeRevision={snapshot.revision} aiResult={aiResult} busy={busy || checking} onLoad={value => edit(pretty(value))}/>
        {proposal && <section className={styles.preflight} aria-label="Preflight"><h3>{t('reviewChanges')}</h3><ul>{proposal.preflight.checks.map(check => <li key={check.id}><strong>{check.passed ? 'Bestanden' : 'Offen'} · {check.id}</strong><span>{check.detail}</span></li>)}</ul>
          {stale && <p role="alert">{t('draftOutdated')}</p>}
          <details><summary>{t('viewDiff')}</summary><pre>{proposal.downloadDiff.text || 'Keine Änderungen.'}</pre></details>
          <div className={styles.actions}><Button className="outline-button" onClick={() => download()}>{t('downloadDiff')}</Button><Button className="outline-button" onClick={() => download(true)}>{t('downloadChecks')}</Button><Button className="outline-button" disabled={!proposal.preflight.passed || Boolean(stale)} onClick={previewDraft}>{t('previewDraft')}</Button><Button className="play-button" disabled={!proposal.preflight.passed || Boolean(stale)} onClick={apply}>{t('applyDraft')}</Button></div>
          <p className={styles.hint}>{t('checkScope')}</p>
        </section>}
        {aiResult && <details><summary>{t('aiEvidence')}</summary><p>{t('aiReviewLanguage',{language: aiResult.provenance.responseLocale ? LOCALE_NAMES[aiResult.provenance.responseLocale] : t('languageUnknown')})}</p><p className={styles.hint}>{aiResult.provenance.resolvedModel} · {aiResult.provenance.inputTokens} Input / {aiResult.provenance.outputTokens} Output · konservative Kostenschätzung {aiResult.provenance.chargedUpperEstimateUsd.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USD</p></details>}
      </section>
      <section className={styles.preview} aria-label={t('gpuComposition')}><header><strong>{t(metrics?.backend === 'webgpu' ? 'webgpuActive' : metrics?.backend === 'webgl2' ? 'webglActive' : 'startingGPU')}</strong><span>{showPreview ? t('draftIsolated') : t('activeRevision',{doc:documentRevision,revision:snapshot.revision})}</span>{preview && <Button className="outline-button" onClick={() => { setShowPreview(!showPreview); setMetrics(null); }}>{t(showPreview ? 'activeWorkspace' : 'viewDraft')}</Button>}</header>
        <FluidProvider key={`${documentRevision}-${showPreview ? 'draft' : 'active'}`} runtime={displayed.runtime}><AuthoredSurface document={displayed.document} data={data} onMetrics={setMetrics} onControls={setControls}/></FluidProvider>
      </section>
    </div>
    <details className={styles.effects}><summary>{t('effectMotion')}</summary><EffectLab runtime={displayed.runtime} metrics={metrics} controls={controls} onPreview={() => displayed.runtime.send(displayed.runtime.getSnapshot().state === 'cards' ? 'view.table' : 'view.cards', {}, 'user', 'pointer')}/><EffectTransport metrics={metrics} controls={controls}/></details>
  </main>;
}
