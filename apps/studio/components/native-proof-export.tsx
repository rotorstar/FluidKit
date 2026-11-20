'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import { captureNativeProof, proofSha256 } from '@fluidkit/testing/proof-capture';
import { inspectM8NativeTargets } from '../lib/m8-native-targets';

type PreparedProof = { url: string; filename: string; current(): boolean };
/** Explicit local download. It neither captures input nor labels events as trusted. */
export function NativeProofExport({ controls, runtime, data, buildId }: { controls: SurfacePlaybackControls | null; runtime: FluidRuntime; data: WorkspaceData; buildId: string }) {
  const tr = useDiagnosticMessages();
  const host = useRef<HTMLDivElement>(null), generation = useRef(0);
  const prepared = useRef<PreparedProof | null>(null), pending = useRef(false);
  const [download, setDownload] = useState<PreparedProof | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [failed, setFailed] = useState(false);
  function releasePrepared() {
    if (prepared.current) URL.revokeObjectURL(prepared.current.url);
    prepared.current = null;
  }
  function invalidate() {
    const hadWork = pending.current || prepared.current !== null;
    generation.current++; pending.current = false; releasePrepared();
    setDownload(null); setBusy(false);
    if (hadWork) { setFailed(true); setMessage('stale'); }
  }
  useEffect(() => {
    const invalidateCurrent = () => invalidate();
    const subscriptions = [runtime.subscribe(invalidateCurrent), runtime.subscribeTrace(invalidateCurrent), runtime.subscribeInteraction(invalidateCurrent), runtime.subscribeVisual(invalidateCurrent)];
    const canvas = host.current?.closest('.showcase-shell')?.querySelector('canvas');
    const checkDimensions = () => { if (prepared.current && !prepared.current.current()) invalidateCurrent(); };
    const observer = new ResizeObserver(checkDimensions);
    if (canvas) observer.observe(canvas);
    window.addEventListener('resize', invalidateCurrent);
    return () => { generation.current++; pending.current = false; subscriptions.forEach(unsubscribe => unsubscribe()); observer.disconnect(); window.removeEventListener('resize', invalidateCurrent); releasePrepared(); };
  }, [controls, runtime, data, buildId]);
  async function capture() {
    if (!controls || busy) return;
    const surface = host.current?.closest('.showcase-shell')?.querySelector<HTMLElement>('.fluid-surface');
    const canvas = surface?.querySelector('canvas');
    if (!surface || !canvas) { setFailed(true); setMessage('unavailable'); return; }
    const token = ++generation.current;
    releasePrepared(); setDownload(null); pending.current = true;
    setBusy(true); setFailed(false); setMessage('');
    try {
      const dataset = { version: data.capturedAt, source: data.source, moduleIds: data.modules.map(module => module.id), sha256: await proofSha256(JSON.stringify(data)) };
      const report = await captureNativeProof({
        runtime, captureFrame: () => controls.captureFrame(), getPresentation: () => controls.getPresentation(), getMetrics: () => controls.getMetrics(), getRecording: () => controls.getRecording(), getPresentationMode: () => controls.getPresentationMode(),
        isCurrent: () => token === generation.current && surface.isConnected && canvas.isConnected && !document.hidden,
        viewport() { const rect = canvas.getBoundingClientRect(); return { browser: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio }, surface: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } }; },
        inspectTargets: (frame, scene) => inspectM8NativeTargets(surface, frame, scene),
      }, { id: `native-${crypto.randomUUID()}`, buildId, dataset });
      if (token !== generation.current) return;
      const snapshot = runtime.getSnapshot(), visual = runtime.getVisualState(), interaction = runtime.getInteraction(), trace = runtime.getTraceSnapshot();
      const presentation = JSON.stringify(controls.getPresentation()), recording = JSON.stringify(controls.getRecording());
      const item: PreparedProof = {
        url: URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })), filename: `fluid-native-proof-${report.id}.json`,
        current() {
          const rect = canvas.getBoundingClientRect(), metrics = controls.getMetrics();
          return token === generation.current && canvas.isConnected && controls.getPresentationMode() === 'live' && runtime.getSnapshot() === snapshot && runtime.getTraceSnapshot() === trace && runtime.getInteraction() === interaction && runtime.getVisualState() === visual &&
            rect.width === report.viewport.surface.width && rect.height === report.viewport.surface.height && window.innerWidth === report.viewport.browser.width && window.innerHeight === report.viewport.browser.height && window.devicePixelRatio === report.viewport.browser.dpr &&
            metrics?.backend === report.frame.backend && metrics.progress === report.frame.progress && metrics.phase !== 'transitioning' && JSON.stringify(controls.getPresentation()) === presentation && JSON.stringify(controls.getRecording()) === recording;
        },
      };
      prepared.current = item; setDownload(item);
      setMessage(tr('targetsReady',{backend:report.frame.backend,rev:report.snapshot.revision,frame: report.frame.surfaceFrame,n:report.nativeTargets.issues.length}));
    } catch (error) {
      if (token === generation.current) { setFailed(true); setMessage(error instanceof Error ? error.message : tr('reportError')); }
    } finally { if (token === generation.current) { pending.current = false; setBusy(false); } }
  }
  return <div ref={host} data-native-proof-export>
    <div className="quality-actions">
    <Button className="outline-button" disabled={!controls || busy} onClick={() => { void capture(); }}>{tr(busy ? 'exportTargetBusy' : 'exportTarget')}</Button>
    {download && <a className="outline-button" href={download.url} download={download.filename} onClick={event => {
      if (!download.current()) { event.preventDefault(); invalidate(); return; }
      // Keep the URL alive through the browser's native click/download task.
      // It is released on replacement, invalidation or unmount, not synchronously here.
      setMessage(tr('targetsRequested'));
    }}>{tr('downloadJSON')}</a>}
    </div>
    <p>{tr('targetsInfo')}</p>
    {message && <p role={failed ? 'alert' : 'status'}>{message==='stale'?tr('refreshCapture'):message==='unavailable'?tr('missingTarget'):message}</p>}
  </div>;
}
