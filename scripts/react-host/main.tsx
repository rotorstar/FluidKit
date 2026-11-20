import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createFluidRuntime } from '@fluidkit/core';
import { DEFAULT_EFFECT_SETTINGS } from '@fluidkit/contracts';
import { FluidProvider, FluidSurface, useFluid } from '@fluidkit/react';
import { createWorkspaceFlow, WorkspaceDataSchema, workspaceCollectionOrder, workspaceScene, workspaceSurfaceHeight, type WorkspaceData } from '@fluidkit/cases';
import { measureHost, type HostTimingReport } from './timing';
import type { BackendMode, SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';

type HostMeta = { hostId: string; dataSha256: string };
function Workspace({ data, meta }: { data: WorkspaceData; meta: HostMeta }) {
  const { runtime, snapshot } = useFluid();
  const [backend, setBackend] = useState<BackendMode>('webgpu-first');
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [controls, setControls] = useState<SurfacePlaybackControls | null>(null);
  const [error, setError] = useState('');
  const [width, setWidth] = useState(900);
  const host = useRef<HTMLDivElement>(null);
  const run = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState('');
  const [timing, setTiming] = useState<HostTimingReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  useEffect(() => () => run.current?.abort(), []);
  async function measure() {
    const canvas = host.current?.querySelector('canvas');
    if (!controls || !canvas || run.current || attempted) return;
    const controller = new AbortController(); run.current = controller; setBusy(true); setAttempted(true); setTiming(null);
    try { const report = await measureHost({ runtime, controls, canvas, signal: controller.signal, ...meta, onProgress: setProgress });
      if (run.current === controller) { setTiming(report); setProgress(`Messung beendet: ${report.result}`); }
    } catch (cause) { setProgress(`Messung unvollständig: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { if (run.current === controller) { run.current = null; setBusy(false); } }
  }
  function downloadTiming() {
    if (!timing) return;
    const link = document.createElement('a'), url = URL.createObjectURL(new Blob([JSON.stringify(timing, null, 2) + '\n'], { type: 'application/json' }));
    link.href = url; link.download = `r6-timing-${timing.backend}-${meta.hostId}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const reportError = useCallback((value: Error) => setError(value.message), []);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => { const value = entries[0]?.contentRect.width; if (value) setWidth(value); });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  return <main>
    <h1>FluidKit · eigenständiger React-Host</h1>
    <p>Vite + React, öffentliche Pakete, echte Workspace-Daten. Ohne Next.js.</p>
    <label>Backend <select disabled={busy} value={backend} onChange={event => { setError(''); setMetrics(null); setBackend(event.target.value as BackendMode); }}>
      <option value="webgpu-first">WebGPU bevorzugt</option><option value="webgl2">WebGL2 prüfen</option>
    </select></label>
    <p role="status" data-testid="backend-status">{error ? `Fehler: ${error}` : metrics ? `${metrics.backend} aktiv · ${metrics.phase} · ${metrics.effectId ?? 'ohne Effekt'}` : 'Surface wird gestartet …'}</p>
    <nav aria-label="Host-Steuerung" inert={busy}>
      <button onClick={() => runtime.send('view.table')}>Tabelle</button>
      <button onClick={() => runtime.send('view.cards')}>Karten</button>
      <button onClick={() => runtime.send('compare.suggest')}>Module auswählen</button>
      <button onClick={() => runtime.send('view.compare')}>Vergleichen</button>
      <button onClick={() => runtime.send('view.atlas')}>Atlas</button>
      <button onClick={() => runtime.send('atlas.group.Kernel')}>Kernel entfalten</button>
      <button onClick={() => runtime.send('atlas.group.all')}>Gruppen zusammenführen</button>
      <button onClick={() => runtime.send('view.map')}>Map</button>
      <button onClick={() => controls?.replay()}>Replay</button>
      <button onClick={() => controls?.pause()}>Pause</button>
      {[0, .25, .5, .75, 1].map(progress => <button key={progress} onClick={() => controls?.seek(progress)}>{progress * 100} %</button>)}
    </nav>
    <label>Darstellung <input disabled={busy} type="range" min="0" max="100" step="1" value={Math.round((metrics?.progress ?? 1) * 100)} onChange={event => controls?.seek(Number(event.target.value) / 100)} /></label>
    <p>State: <output data-testid="state">{snapshot.state}</output> · Revision {snapshot.revision} · Auswahl {JSON.stringify(snapshot.fields.selection)}</p>
    <section aria-label="Echtzeitmessung"><button disabled={busy || attempted || !controls} onClick={() => void measure()}>Strukturübergänge messen</button> <button disabled={!busy} onClick={() => run.current?.abort()}>Messung abbrechen</button> <button disabled={!timing} onClick={downloadTiming}>Messbericht herunterladen</button><p role="status" data-testid="timing-status">{progress}</p><p>Sechs Richtungen mit Aufwärmen, echten Renderintervallen und je einer Sekunde Leerlauf. Keine GPU-Zeitmessung oder Lastfreigabe. Eine Messung je Host-Sitzung; vor dem Backendvergleich die Seite neu laden.</p>{timing && <details><summary>Zeitmessungsbericht</summary><pre data-testid="timing-report">{JSON.stringify(timing, null, 2)}</pre></details>}</section>
    <div ref={host} inert={busy} className="surface-host"><FluidSurface backendMode={backend} motionVersion={2} height={workspaceSurfaceHeight(data, snapshot, width)} onMetrics={setMetrics} onControls={setControls} onError={reportError} /></div>
    <details><summary>Gemessene Surface-Diagnose</summary><pre>{JSON.stringify(metrics, null, 2)}</pre></details>
  </main>;
}

function Host({ data, meta }: { data: WorkspaceData; meta: HostMeta }) {
  const [runtime] = useState(() => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
    projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) },
    collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
  }));
  useEffect(() => () => runtime.dispose(), [runtime]);
  return <FluidProvider runtime={runtime}><Workspace data={data} meta={meta} /></FluidProvider>;
}

class HostBoundary extends Component<{ children: ReactNode }, { error: string }> {
  override state = { error: '' };
  static getDerivedStateFromError(error: unknown) { return { error: error instanceof Error ? error.message : String(error) }; }
  override render() { return this.state.error ? <main><h1>React-Host: Integrationsfehler</h1><pre role="alert">{this.state.error}</pre></main> : this.props.children; }
}

const response = await fetch('/workspace.json');
if (!response.ok) throw new Error(`Workspace-Daten: HTTP ${response.status}`);
const data = WorkspaceDataSchema.parse(await response.json());
const metaResponse = await fetch('/host-meta.json');
if (!metaResponse.ok) throw new Error('Host provenance unavailable');
const meta = await metaResponse.json() as HostMeta;
createRoot(document.getElementById('root')!).render(<HostBoundary><Host data={data} meta={meta} /></HostBoundary>);
