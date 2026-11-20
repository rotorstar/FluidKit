'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { FluidRuntime } from '@fluidkit/core';
import type { WorkspaceData } from '@fluidkit/cases';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import { captureFlowProof } from '../lib/flow-proof';
import { inspectM8NativeTargets } from '../lib/m8-native-targets';

type Download = { url: string; filename: string; current(): boolean };
export function FlowProofExport({ runtime, controls, data, moduleId, buildId, surfaceHost }: { runtime: FluidRuntime; controls: SurfacePlaybackControls | null; data: WorkspaceData; moduleId: string; buildId: string; surfaceHost: React.RefObject<HTMLElement | null> }) {
  const tr = useDiagnosticMessages();
  const generation = useRef(0), prepared = useRef<Download | null>(null);
  const [download, setDownload] = useState<Download | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  function release() { if (prepared.current) URL.revokeObjectURL(prepared.current.url); prepared.current = null; }
  function invalidate() { generation.current++; release(); setDownload(null); setBusy(false); }
  useEffect(() => {
    // A replacement surface owns a fresh request state; stale async finally blocks cannot clear it.
    invalidate();
    const subscriptions = [runtime.subscribe(invalidate), runtime.subscribeTrace(invalidate), runtime.subscribeInteraction(invalidate), runtime.subscribeVisual(invalidate)];
    window.addEventListener('resize', invalidate);
    return () => { generation.current++; release(); subscriptions.forEach(stop => stop()); window.removeEventListener('resize', invalidate); };
  }, [runtime, controls, data, moduleId, buildId]);
  async function capture() {
    const surface = surfaceHost.current?.querySelector<HTMLElement>('.fluid-surface'), canvas = surface?.querySelector('canvas');
    if (!controls || !surface || !canvas || busy) return;
    const token = ++generation.current; release(); setDownload(null); setBusy(true); setMessage('');
    const viewport = () => { const rect = canvas.getBoundingClientRect(); return { width: rect.width, height: rect.height }; };
    try {
      const proof = await captureFlowProof(runtime, controls, { data, moduleId, buildId }, { viewport, isCurrent: () => token === generation.current && canvas.isConnected && !document.hidden, inspectTargets: (frame, nodes) => inspectM8NativeTargets(surface, frame, nodes) });
      if (token !== generation.current) return;
      const snapshot = runtime.getSnapshot(), visual = runtime.getVisualState(), viewKey = JSON.stringify(viewport()), presentation = JSON.stringify(controls.getPresentation());
      const item = { url: URL.createObjectURL(new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' })), filename: `fluid-flow-proof-${moduleId}-r${proof.snapshot.revision}.json`, current: () => token === generation.current && canvas.isConnected && !document.hidden && controls.getPresentationMode() === 'live' && runtime.getSnapshot() === snapshot && runtime.getVisualState() === visual && JSON.stringify(viewport()) === viewKey && JSON.stringify(controls.getPresentation()) === presentation };
      prepared.current = item; setDownload(item); setMessage(tr('prepareCapture',{backend:proof.frame.backend,revision:proof.snapshot.revision,text:proof.textAudit.issues.length,targets:proof.nativeTargets.issues.length}));
    } catch (error) { if (token === generation.current) setMessage(error instanceof Error ? tr('reportDetail',{detail:error.message}) : tr('reportError')); }
    finally { if (token === generation.current) setBusy(false); }
  }
  return <div><div className="quality-actions"><Button className="outline-button" disabled={!controls || busy} onClick={() => { void capture(); }}>{tr(busy ? 'captureBusy' : 'captureFlow')}</Button>{download && <a className="outline-button" href={download.url} download={download.filename} onClick={event => { if (!download.current()) { event.preventDefault(); invalidate(); setMessage(tr('refreshCapture')); } }}>{tr('proofImage')}</a>}</div><p>{tr('flowImage')}</p>{message && <p role="status">{message}</p>}</div>;
}
