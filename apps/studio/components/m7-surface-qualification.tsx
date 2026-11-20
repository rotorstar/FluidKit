'use client';
import { useDiagnosticMessages } from './diagnostic-locale';
import type { DiagnosticStatus } from '../lib/diagnostic-messages';


import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { M7SurfaceQualification as QualificationReport } from '@fluidkit/contracts';
import { StudioSelect } from './studio-controls';
import { qualifyM7Surfaces } from '../lib/m7-surface-qualification';

export function M7SurfaceQualification({ buildId }: { buildId: string }) {
  const tr = useDiagnosticMessages();
  const host = useRef<HTMLDivElement>(null), controller = useRef<AbortController | null>(null);
  const [backend, setBackend] = useState<'webgpu-only' | 'webgl2'>('webgpu-only');
  const [running, setRunning] = useState(false), [status, setStatus] = useState<DiagnosticStatus>(['noRun']);
  const [report, setReport] = useState<QualificationReport | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  async function run(cycles: 3 | 100) {
    if (!host.current || running) return;
    const aborter = new AbortController(); controller.current = aborter; setRunning(true); setReport(null);
    setStatus(['prepareGPU']);
    try {
      const result = await qualifyM7Surfaces({ host: host.current, buildId, backend, cycles, signal: aborter.signal,
        onProgress: (completed, total, label) => { if (controller.current === aborter) setStatus(['surfaceProgress',{n:completed,total,label}]); } });
      if (controller.current === aborter) {
        setReport(result); setStatus(['surfaceDone',{n:result.cases.length,result:result.result}]);
      }
    } catch (error) { if (controller.current === aborter) setStatus(['reportDetail',{detail:error instanceof Error ? error.message : String(error)}]); }
    finally { if (controller.current === aborter) { controller.current = null; setRunning(false); } }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `fluid-m7-surface-${report.requestedBackend}.json`; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="lifecycle-proof" aria-label={tr('m7Surface')}>
    <h2>{tr('surfaceHeading')}</h2>
    <p>{tr('surfaceInfo')}</p>
    <label>{tr('testBackend')} <StudioSelect aria-label={tr('surfaceBackend')} disabled={running} value={backend} onChange={event => { if (event.target.value === 'webgpu-only' || event.target.value === 'webgl2') setBackend(event.target.value); }}><option value="webgpu-only">{tr('webgpuStrict')}</option><option value="webgl2">{tr('webglTest')}</option></StudioSelect></label>
    <div className="quality-actions">
      <Button className="outline-button" disabled={running} onClick={() => { void run(3); }}>{tr('smoke')}</Button>
      <Button className="play-button" disabled={running} onClick={() => { void run(100); }}>{tr('lifecycle')}</Button>
      <Button className="outline-button" disabled={!running} onClick={() => controller.current?.abort()}>{tr('stopM7')}</Button>
      <Button className="outline-button" disabled={running || !report} onClick={download}>{tr('exportSurface')}</Button>
    </div>
    <p role="status">{tr(...status)}</p>
    <p>{tr('surfaceScope')}</p>
    <div ref={host} className="lifecycle-mount" />
    {report && <><p><strong>{tr('surfaceReport')}</strong> {report.requestedBackend} · Build {report.buildId} · {report.viewport.width} × {report.viewport.height} · {tr('cycles',{n:report.requestedCycles})}.</p>
      <ul>{report.cases.filter(item => item.kind !== 'cycle' || item.result !== 'passed').map(item => <li key={item.id}>{item.id}: {item.result} · <span lang="de">{item.detail.join(' ')}</span></li>)}</ul>
      <details><summary>{tr('surfaceReport')}</summary><pre lang="de" data-testid="m7-surface-report">{JSON.stringify(report, null, 2)}</pre></details></>}
  </section>;
}
