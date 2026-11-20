/** Presentation clock only; it never schedules frames or commits application state. */
export function createPresentationTimeline(now: () => number) {
  let started = now(), duration = 0, elapsed = 0, paused = false, suspended = false;
  function sample(reducedMotion = false) {
    const time = paused || suspended ? elapsed : Math.max(0, now() - started);
    const progress = reducedMotion || duration <= 0 ? 1 : Math.min(1, time / duration);
    return { progress, durationMs: duration, paused: (paused || suspended) && progress < 1, phase: progress >= 1 ? 'idle' as const : paused || suspended ? 'paused' as const : 'transitioning' as const };
  }
  return {
    start(ms: number) { duration = Math.max(0, ms); started = now(); elapsed = 0; paused = false; },
    sample,
    pause() { elapsed = sample().progress * duration; paused = true; },
    play() { started = now() - elapsed; paused = false; },
    seek(progress: number) { elapsed = Math.max(0, Math.min(1, progress)) * duration; paused = true; },
    suspend() { if (!suspended) { elapsed = sample().progress * duration; suspended = true; } },
    resume() { if (suspended) { started = now() - elapsed; suspended = false; } },
  };
}
