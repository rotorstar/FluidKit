'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useStudioLocale } from './studio-locale';
import { caseCatalogFingerprint, projectProofOptions } from '@fluidkit/cases';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@base-ui/react/button';
import { LifecycleRunSchema, type FlowDefinition, type LifecycleRun } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { FluidProvider, FluidSurface } from '@fluidkit/react';
import { createResourceLedger, type SurfaceMetrics, type SurfacePlaybackControls } from '@fluidkit/webgpu';

export function LifecycleProof({ flow, buildId }: { flow: FlowDefinition; buildId: string }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale();
  const host = useRef<HTMLDivElement>(null), controller = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState(0), [running, setRunning] = useState(false), [report, setReport] = useState<LifecycleRun | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function run(cycles: number) {
    if (!host.current || running) return;
    const signal = new AbortController(); controller.current = signal;
    const ledger = createResourceLedger(), startedAt = new Date().toISOString();
    const samples: LifecycleRun['samples'] = [], failures: string[] = [];
    setReport(null); setProgress(0); setRunning(true);
    for (let cycle = 1; cycle <= cycles && !signal.signal.aborted; cycle++) {
      const mount = document.createElement('div'); host.current.append(mount);
      const root = createRoot(mount), runtime = createFluidRuntime({...projectProofOptions(flow),locale});
      let metrics: SurfaceMetrics | null = null, idleFrameDelta = 0, frames = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const controls = await new Promise<SurfacePlaybackControls>((resolve, reject) => {
          timer = setTimeout(() => reject(new Error('Surface-Initialisierung nach 15 s nicht abgeschlossen.')), 15000);
          const aborted = () => reject(new Error('Prüfung abgebrochen.'));
          signal.signal.addEventListener('abort', aborted, { once: true });
          root.render(<FluidProvider runtime={runtime}><FluidSurface catalogFingerprint={caseCatalogFingerprint} buildId={buildId} resourceLedger={ledger} backendMode="webgpu-only" height={360}
            onError={reject} onMetrics={value => { metrics = value; }}
            onControls={value => { if (value) { signal.signal.removeEventListener('abort', aborted); resolve(value); } }} /></FluidProvider>);
        });
        if (timer) clearTimeout(timer);
        await controls.inspectText();
        const canvas = mount.querySelector('canvas');
        // ResizeObserver/font publication may request one final initial frame.
        // Establish quiescence with a bounded wait before measuring idle frames.
        let previous = Number(canvas?.dataset.frames ?? 0), settled = false;
        for (let attempt = 0; attempt < 20 && !signal.signal.aborted; attempt++) {
          await new Promise<void>(resolve => setTimeout(resolve, 50));
          const current = Number(canvas?.dataset.frames ?? 0);
          if (current === previous) { settled = true; break; }
          previous = current;
        }
        if (!settled) failures.push(`Zyklus ${cycle}: Surface erreicht keinen ruhenden Zustand.`);
        frames = Number(canvas?.dataset.frames ?? 0);
        await new Promise<void>(resolve => setTimeout(resolve, 60));
        idleFrameDelta = Number(canvas?.dataset.frames ?? 0) - frames;
        if (idleFrameDelta !== 0) failures.push(`Zyklus ${cycle}: Frames im ruhenden Zustand.`);
      } catch (error) { failures.push(`Zyklus ${cycle}: ${error instanceof Error ? error.message : 'Prüfung fehlgeschlagen'}`); }
      finally {
        if (timer) clearTimeout(timer);
        try { root.unmount(); } catch (error) { failures.push(`Zyklus ${cycle}: Unmount: ${error instanceof Error ? error.message : 'fehlgeschlagen'}`); }
        try { runtime.dispose(); } catch (error) { failures.push(`Zyklus ${cycle}: Core-Disposal: ${error instanceof Error ? error.message : 'fehlgeschlagen'}`); }
      }
      const diagnostics = runtime.getDiagnostics(), snapshot = ledger.snapshot();
      samples.push({ cycle, frames, idleFrameDelta, textBytesWhileMounted: (metrics as SurfaceMetrics | null)?.textBytes ?? 0,
        coreSubscriptionsAfterDispose: diagnostics.subscriptions, pendingActionsAfterDispose: diagnostics.pendingActions,
        domNodesAfterUnmount: mount.childElementCount, afterDispose: snapshot });
      mount.remove();
      if (snapshot.owners || Object.values(snapshot.live).some(count => count > 0) || snapshot.disposalErrors.length || diagnostics.subscriptions || diagnostics.pendingActions) failures.push(`Zyklus ${cycle}: Ressourcen verbleiben nach Unmount.`);
      setProgress(cycle);
      if (failures.length) break;
    }
    if (signal.signal.aborted) failures.push('Lauf wurde abgebrochen; keine vollständige Freigabe.');
    if (samples.length !== cycles) failures.push(`Nur ${samples.length} von ${cycles} Zyklen abgeschlossen.`);
    setReport(LifecycleRunSchema.parse({ schemaVersion: 1, startedAt, completedAt: new Date().toISOString(), buildId, requestedCycles: cycles, backend: 'webgpu', samples, failures,
      memoryScope: 'Owned resource counts and Glyph-reported buffer bytes; driver and process memory not measured' }));
    setRunning(false); controller.current = null;
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fluid-lifecycle.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="lifecycle-proof" aria-label={tr('gpuLife')}>
    <h2>{tr('mountCycle')}</h2><p>{tr('lifetimeInfo')}</p>
    <div className="quality-actions"><Button className="outline-button" disabled={running} onClick={() => { void run(3); }}>{tr('cycles3')}</Button><Button className="play-button" disabled={running} onClick={() => { void run(100); }}>{tr('cycles100')}</Button><Button className="outline-button" disabled={!running} onClick={() => controller.current?.abort()}>{tr('cancel')}</Button><Button className="outline-button" disabled={!report || running} onClick={download}>{tr('exportCycle')}</Button></div>
    <p role="status">{running ? tr('cycleProgress',{n:progress}) : report ? tr('cycleDone',{n:report.samples.length,total:report.requestedCycles,issues:report.failures.length}) : tr('noRun')}</p>
    <div ref={host} className="lifecycle-mount" />
    {report && <><p>{tr('lifetimeScope')}</p><details><summary>{tr('cycleData')}</summary><pre data-testid="lifecycle-report" lang="de">{JSON.stringify(report, null, 2)}</pre></details></>}
  </section>;
}
