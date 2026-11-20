import { useDiagnosticMessages } from './diagnostic-locale';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { QualityReport } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import type { WorkspaceData } from '@fluidkit/cases';
import { NativeProofExport } from './native-proof-export';
import { createQualityReport, gpuReadabilityCheck, openCheck, replayReadabilityCheck, summarizeQuality, textAuditCheck } from '@fluidkit/testing/quality';
import { inspectDomQuality, inspectSemantics } from '@fluidkit/testing/dom-quality';

const STATUS_LABELS = {passed:'passed',failed:'failed','not-checked':'pending',unsupported:'unsupported'} as const;

export function UIQuality({ controls, runtime, staticReport, workspaceData }: { controls: SurfacePlaybackControls | null; runtime: FluidRuntime; staticReport: QualityReport; workspaceData?: WorkspaceData }) {
  const tr = useDiagnosticMessages();
  const [report, setReport] = useState<QualityReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const host = useRef<HTMLElement>(null);
  const request = useRef(0);
  useEffect(() => {
    const canvas = host.current?.closest('.showcase-shell')?.querySelector('canvas');
    let previous = canvas?.getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      const next = canvas?.getBoundingClientRect();
      if (previous && next && (previous.width !== next.width || previous.height !== next.height)) {
        request.current++; setReport(null); setBusy(false); setError('resized');
      }
      previous = next;
    });
    if (canvas) observer.observe(canvas);
    const root = host.current?.closest('.showcase-shell');
    const invalidate = () => { request.current++; setReport(null); setBusy(false); };
    const toggle = (event: Event) => { if (event.target instanceof Element && !host.current?.contains(event.target)) invalidate(); };
    root?.addEventListener('toggle', toggle, true);
    const unsubscribe = runtime.subscribeVisual(invalidate);
    const unsubscribeDomain = runtime.subscribe(invalidate);
    return () => { request.current++; observer.disconnect(); root?.removeEventListener('toggle', toggle, true); unsubscribe(); unsubscribeDomain(); };
  }, [controls, runtime]);
  async function inspect() {
    if (!controls || !host.current) return;
    const root = host.current.closest<HTMLElement>('.showcase-shell');
    if (!root) return;
    const token = ++request.current;
    const snapshot = runtime.getSnapshot(), visual = runtime.getVisualState();
    setReport(null); setError(''); setBusy(true);
    try {
      const audit = await controls.inspectText();
      if (token !== request.current) return;
      if (runtime.getSnapshot() !== snapshot || runtime.getVisualState() !== visual) throw new Error('Zustand während der Prüfung geändert. Bitte erneut prüfen.');
      const checks = [
        ...staticReport.checks, textAuditCheck(audit), gpuReadabilityCheck(audit), replayReadabilityCheck(audit),
        ...inspectDomQuality(root), ...inspectSemantics(root, runtime.getScene(audit.viewport)),
        openCheck('contrast-composited', 'visual', 'Kontrast der zusammengesetzten Darstellung', 'GPU-Effekte, Opacity und tatsächliche Hintergründe benötigen eine gesonderte visuelle/messtechnische Abnahme.'),
        openCheck('keyboard-ime-screenreader', 'semantics', 'Keyboard-, IME- und Screenreader-Journeys', 'Der Vertragsvergleich ersetzt keine manuell ausgeführten Eingabe- und Screenreader-Journeys.'),
        openCheck('motion-preference', 'visual', 'Reduced Motion im aktuellen Browser', 'Policy-Tests bestehen separat; die aktuelle Browserpräferenz und vollständige Journey sind hier nicht geprüft.'),
        openCheck('screenshot-review', 'visual', 'Screenshot und visuelle Review', 'Screenshot aufnehmen, öffnen und im QA-Bericht mit diesem Build und Szenario verknüpfen.'),
      ];
      setReport(createQualityReport({ buildId: staticReport.context.buildId, backend: audit.backend, viewport: audit.viewport, phase: audit.progress, revision: snapshot.revision, caseId: snapshot.flowId, state: snapshot.state }, checks, staticReport.tools));
    } catch (caught) {
      if (token === request.current) setError(caught instanceof Error ? caught.message : 'Qualitätsprüfung fehlgeschlagen.');
    } finally { if (token === request.current) setBusy(false); }
  }
  function exportReport() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `fluid-quality-${report.context.buildId}.json`; link.click(); URL.revokeObjectURL(url);
  }
  const current = report ?? staticReport, summary = summarizeQuality(current);
  return <section ref={host} data-quality-ui data-ui-audit-status={busy ? 'checking' : report ? 'ready' : 'idle'} className="ui-quality" aria-label={tr('checkUi')}>
    <div className="quality-actions"><Button className="outline-button" disabled={!controls || busy} onClick={() => { void inspect(); }}>{tr(busy ? 'checking' : 'inspect')}</Button><Button className="outline-button" disabled={!report || busy} onClick={exportReport}>{tr('exportQA')}</Button></div>
    {workspaceData && <NativeProofExport controls={controls} runtime={runtime} data={workspaceData} buildId={staticReport.context.buildId}/>}
    <p>{tr('checkScope')}</p>
    <p className="quality-build">Build <code>{staticReport.context.buildId}</code> · ai-design-check 0.9.0</p>
    {error && <p role="alert">{error === 'resized' ? tr('sizeChanged') : <>{tr('reportError')} <span>{error}</span></>}</p>}
    <p role="status">{report ? tr('qualityCounts',{errors:summary.errors,warnings:summary.warnings,open:summary.open}) : tr('qaInitial')}</p>
    {report?.context.viewport && <p>{Math.round(report.context.viewport.width)} px · {report.context.backend} · Phase {Math.round((report.context.phase ?? 0) * 100)} % · Revision {report.context.revision}</p>}
    <ul className="quality-checks">{current.checks.map(check => <li key={check.id}><div><strong lang="de">{check.title}</strong><span data-check-status={check.status}>{tr(STATUS_LABELS[check.status])}{check.findings.length ? ' · '+tr('findCount',{count:check.findings.length}) : ''}</span></div>{check.reason && <p lang="de">{check.reason}</p>}{check.findings.length > 0 && <details><summary>{tr('findings')}</summary><ul>{check.findings.map((finding, index) => <li key={`${finding.rule}-${index}`} lang="de"><code>{finding.rule}</code>: {finding.message}{finding.target.file && <small>{finding.target.file}:{finding.target.line}</small>}</li>)}</ul></details>}</li>)}</ul>
    <details><summary>{tr('measurements')}</summary><pre lang="de" data-testid="quality-report">{JSON.stringify(current, null, 2)}</pre></details>
  </section>;
}
