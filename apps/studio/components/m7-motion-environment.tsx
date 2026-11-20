'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { MotionEnvironmentReportSchema, type MotionEnvironmentReport } from '@fluidkit/contracts';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';

export function M7MotionEnvironment({ controls, buildId }: { controls: SurfacePlaybackControls | null; buildId: string }) {
  const tr = useDiagnosticMessages();
  const [armed, setArmed] = useState(false), [events, setEvents] = useState<MotionEnvironmentReport['events']>([]);
  function checkpoint() {
    const metrics = controls?.getMetrics(), frame = controls?.getPresentation();
    setEvents(current => [...current.slice(-63), { at: new Date().toISOString(), trigger: 'checkpoint', hidden: document.hidden, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, progress: metrics?.progress ?? null, frames: metrics?.frames ?? null, phase: metrics?.phase ?? null, backend: metrics?.backend ?? null, effectId: metrics?.effectId ?? null, lensPresent: Boolean(frame?.lens), particles: frame?.particles.length ?? 0 }]);
  }
  useEffect(() => {
    if (!armed || !controls) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const record = (trigger: MotionEnvironmentReport['events'][number]['trigger']) => {
      const metrics = controls.getMetrics(), frame = controls.getPresentation();
      setEvents(current => [...current.slice(-63), { at: new Date().toISOString(), trigger, hidden: document.hidden, reducedMotion: media.matches, progress: metrics?.progress ?? null, frames: metrics?.frames ?? null, phase: metrics?.phase ?? null, backend: metrics?.backend ?? null, effectId: metrics?.effectId ?? null, lensPresent: Boolean(frame?.lens), particles: frame?.particles.length ?? 0 }]);
    };
    const visibility = () => record('visibilitychange'), change = () => record('media-change');
    record('start'); document.addEventListener('visibilitychange', visibility); media.addEventListener('change', change);
    return () => { document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', change); };
  }, [armed, controls]);
  function download() {
    const report = MotionEnvironmentReportSchema.parse({ schemaVersion: 1, buildId, scope: 'observed-browser-events', events });
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })), link = document.createElement('a');
    link.href = url; link.download = 'm7-motion-environment.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <details><summary>{tr('motionObserver')}</summary><p>{tr('observeInfo')}</p>
    <div className="quality-actions"><Button className="outline-button" disabled={!controls} onClick={() => { if (!armed) setEvents([]); setArmed(current => !current); }}>{tr(armed ? 'observeEnd' : 'observeStart')}</Button><Button className="outline-button" disabled={!armed} onClick={checkpoint}>{tr('checkpoint')}</Button><Button className="outline-button" disabled={!events.length} onClick={download}>{tr('downloadEnv')}</Button></div>
    <ol>{events.map((event, index) => <li key={`${index}:${event.at}`}>{event.trigger}: {tr('observeReduced',{hidden:event.hidden?'on':'off',motion:event.reducedMotion?'on':'off'})} · {Math.round((event.progress ?? 0) * 100)} % · {event.phase} · Frame {event.frames}</li>)}</ol>
  </details>;
}
