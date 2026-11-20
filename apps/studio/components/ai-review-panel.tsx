import { useDiagnosticMessages } from './diagnostic-locale';
import { ReviewEvidenceLibrary } from './review-evidence-library';
import { aiRequestMessage, AIRequestError } from '../lib/ai-request-status';
import { formatNumber, LOCALE_NAMES } from '@fluidkit/i18n';
import { useStudioLocale, useStudioMessages } from './studio-locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { StudioInput, StudioSelect } from './studio-controls';
import { AIReviewAssessmentSchema, AIReviewBundleSchema, AIReviewResultSchema, AIReviewStatusSchema, type AIReviewAssessment, type AIReviewFrame, type AIReviewResult, type AIReviewStatus, type StoryDefinition } from '@fluidkit/contracts';

export function AIReviewPanel({ frames, story, onSelect }: { frames: AIReviewFrame[]; story: StoryDefinition; onSelect: (id: string) => void }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const [failedStatus,setFailedStatus] = useState<number | null>(null);
  const [status, setStatus] = useState<AIReviewStatus | null>(null), [selected, setSelected] = useState<string[]>([]);
  const [approved, setApproved] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [result, setResult] = useState<AIReviewResult | null>(null);
  const [reviewedFrames, setReviewedFrames] = useState<AIReviewFrame[]>([]);
  const [assessments, setAssessments] = useState<AIReviewAssessment['assessments']>([]);
  const assessmentArtifact = useMemo(() => result ? { schemaVersion: 1 as const, exportedAt: result.provenance.startedAt, scope: 'local-review' as const, result, assessments } : null, [result, assessments]);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { setApproved(false); setSelected(ids => ids.filter(id => frames.some(frame => frame.id === id))); }, [frames]);
  async function configure() {
    setFailedStatus(null); setError('');
    try { const response = await fetch('/api/design-review', { cache: 'no-store' }); if (!response.ok) throw new AIRequestError(response.status); setStatus(AIReviewStatusSchema.parse(await response.json())); }
    catch (error) { if (error instanceof AIRequestError) setFailedStatus(error.status); else setFailedStatus(502); }
  }
  function toggle(id: string) { setApproved(false); setSelected(ids => ids.includes(id) ? ids.filter(item => item !== id) : ids.length < 3 ? [...ids, id] : ids); }
  async function review() {
    if (!status?.configured || !approved || busy) return;
    const request = new AbortController(); controller.current = request; setBusy(true); setFailedStatus(null); setError(''); setResult(null);
    try {
      const bundle = AIReviewBundleSchema.parse({ schemaVersion: 1, id: `review-${crypto.randomUUID()}`, storyId: story.id, brief: story.brief, approved, frames: frames.filter(frame => selected.includes(frame.id)) });
      const response = await fetch('/api/design-review', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Fluid-Studio-Token': status.token }, body: JSON.stringify({ ...bundle, responseLocale: locale }), signal: request.signal });
      const input: unknown = await response.json();
      if (!response.ok) throw new AIRequestError(response.status);
      if (!request.signal.aborted) {
        const reviewed = AIReviewResultSchema.parse(input);
        setResult(reviewed); setReviewedFrames(bundle.frames); setAssessments(reviewed.output.findings.map((_finding, findingIndex) => ({ findingIndex, status: 'pending', note: '' })));
      }
    } catch (error) { if (!request.signal.aborted) setFailedStatus(error instanceof AIRequestError ? error.status : 502); }
    finally { if (controller.current === request) { controller.current = null; setBusy(false); } }
  }
  function exportReview() {
    if (!result) return;
    const artifact = AIReviewAssessmentSchema.parse({ schemaVersion: 1, exportedAt: new Date().toISOString(), scope: 'local-review', result, assessments });
    const url = URL.createObjectURL(new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${result.id}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="review-panel" aria-label={t('aiDesign')}>
    <div className="review-section-heading"><div><h2>{t('aiTitle')}</h2><p>{t('aiIntro')}</p></div><Button className="outline-button" disabled={busy} onClick={() => { void configure(); }}>{t('aiCheck')}</Button></div>
    <p role="status">{status ? status.configured ? `${status.provider} · ${status.model}` : <>{tr('noAi')} {status.reason && <span>{status.reason}</span>}</> : t('aiIdle')}</p>
    <p>{t('aiLimits')}</p>
    {!status?.configured && <p>{t('aiSetup')}</p>}
    {status?.configured && <p>{t('aiReserve', {cost:formatNumber(locale,status.reservationUsd ?? 0,{style:'currency',currency:'USD',maximumFractionDigits:4})})}</p>}
    <fieldset disabled={busy}><legend>{t('aiFrames', {count:selected.length})}</legend>{frames.length === 0 && <p>{t('aiNoFrames')}</p>}<div className="review-frame-options">{frames.map(frame => <label key={frame.id}><StudioInput className="review-checkbox" type="checkbox" checked={selected.includes(frame.id)} disabled={busy || (!selected.includes(frame.id) && selected.length >= 3)} onChange={() => toggle(frame.id)}/><span>{frame.beatId ?? tr('frameManual')} · {frame.state} · r{frame.revision}</span><img src={frame.image} alt={tr('gpuCapture',{state:frame.state})} loading="lazy"/></label>)}</div></fieldset>
    <label className="review-consent"><StudioInput className="review-checkbox" type="checkbox" disabled={busy || !selected.length} checked={approved} onChange={event => setApproved(event.target.checked)}/><span>{t('aiConsent')}</span></label>
    <div className="quality-actions"><Button className="play-button" disabled={!status?.configured || !approved || !selected.length || busy} onClick={() => { void review(); }}>{t(busy ? 'aiBusy' : 'aiAnalyze')}</Button>{busy && <Button className="outline-button" onClick={() => { controller.current?.abort(); setError(tr('aiCancel')); }}>{t('cancelAction')}</Button>}</div>
    {(error || failedStatus) && <p role="alert">{failedStatus ? t(aiRequestMessage(failedStatus)) : error}</p>}
    <ReviewEvidenceLibrary disabled={busy} result={assessmentArtifact} frames={reviewedFrames} onLoad={value => { controller.current?.abort(); setResult(value.assessment.result); setAssessments(value.assessment.assessments); setReviewedFrames(value.frames.map(item => item.frame)); }}/>
    {result && reviewedFrames.length > 0 && <details><summary>{t('aiOriginals')}</summary><div className="review-frame-options">{reviewedFrames.map(frame => <figure key={frame.id}><img src={frame.image} alt={tr('reviewedState',{state:frame.state,rev:frame.revision})}/><figcaption>{frame.state} · r{frame.revision} · {frame.buildId} · {frame.binding ? `${frame.binding.runId} · ${tr('liveFrame')}` : tr('historicFrame')}</figcaption></figure>)}</div></details>}
    {result && <div className="review-ai-result"><h3 lang={result.provenance.responseLocale}>{result.output.summary}</h3><p>{t('aiReviewLanguage',{language:result.provenance.responseLocale ? LOCALE_NAMES[result.provenance.responseLocale] : t('languageUnknown')})}</p><p>{result.provenance.provider} · {result.provenance.model} · {result.provenance.sdk} · {tr('reviewUsage',{n:result.provenance.frameIds.length,input:result.usage.inputTokens ?? '?',output:result.usage.outputTokens ?? '?',seconds:formatNumber(locale,result.provenance.durationMs / 1000,{maximumFractionDigits:1})})}</p><p>{tr('reviewEstimate',{cost:result.accounting.usageUpperEstimateUsd === null ? tr('unavailableValue') : formatNumber(locale,result.accounting.usageUpperEstimateUsd,{style:'currency',currency:'USD',maximumFractionDigits:4})})}</p><Button className="outline-button" onClick={exportReview}>{t('aiExport')}</Button><ul>{result.output.findings.map((finding, index) => <li key={index}><Button className="outline-button" disabled={!frames.some(frame => frame.id === finding.frameId)} onClick={() => onSelect(finding.frameId)}>{t(frames.some(frame => frame.id === finding.frameId) ? 'aiOpenFrame' : 'aiMissingFrame')} · {finding.partId ?? finding.category}</Button><strong lang={result.provenance.responseLocale}>{finding.observation}</strong><p lang={result.provenance.responseLocale}>{finding.rationale}</p><p>{t('aiSuggestion')}: <span lang={result.provenance.responseLocale}>{finding.suggestion}</span></p><small>{t('aiUncertainty')}: <span lang={result.provenance.responseLocale}>{finding.uncertainty}</span> · {finding.severity}</small><label>{t('aiAssessment')}<StudioSelect aria-label={tr('assess',{n:index+1})} value={assessments[index]?.status ?? 'pending'} onChange={event => { const status = AIReviewAssessmentSchema.shape.assessments.element.shape.status.parse(event.target.value); setAssessments(items => items.map(item => item.findingIndex === index ? { ...item, status } : item)); }}><option value="pending">{t('aiOpen')}</option><option value="confirmed">{t('aiConfirmed')}</option><option value="dismissed">{t('aiDismissed')}</option></StudioSelect></label><label>{t('aiRationale')}<StudioInput aria-label={tr('reason',{n:index+1})} maxLength={1000} value={assessments[index]?.note ?? ''} onChange={event => setAssessments(items => items.map(item => item.findingIndex === index ? { ...item, note: event.target.value } : item))}/></label></li>)}</ul><h3>{t('aiLimitations')}</h3><ul>{result.output.limitations.map((limit, index) => <li key={index} lang={result.provenance.responseLocale}>{limit}</li>)}</ul></div>}
  </section>;
}
