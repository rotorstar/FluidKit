import type { RenderCapabilities } from '@fluidkit/contracts';

type MotionSource = Pick<MediaQueryList, 'matches'> & Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

/** One browser subscription owns the initial and changing capability snapshot.
 * No animation frame is requested here; the Surface decides how to present it. */
export function observeSurfaceCapabilities(options: {
  backend: 'webgpu' | 'webgl2'; motion: MotionSource;
  onChange(capabilities: RenderCapabilities, initial: boolean): void;
  onError(error: Error): void;
}) {
  let disposed = false;
  let appReducedMotion = false;
  const getCapabilities = (): RenderCapabilities => ({ backend: options.backend, typegpu: true,
    compute: options.backend === 'webgpu', reducedMotion: options.motion.matches || appReducedMotion });
  const change = () => {
    if (disposed) return;
    try { options.onChange(getCapabilities(), false); }
    catch (error) { options.onError(error instanceof Error ? error : new Error(String(error))); }
  };
  const dispose = () => { if (!disposed) { disposed = true; options.motion.removeEventListener('change', change); } };
  options.motion.addEventListener('change', change);
  try { options.onChange(getCapabilities(), true); }
  catch (error) { dispose(); throw error; }
  return { getCapabilities, dispose, setMotionPreference(value: 'system' | 'reduced') {
    if (disposed) return;
    if (value !== 'system' && value !== 'reduced') throw new Error('Invalid motion preference');
    const reduced = value === 'reduced';
    if (reduced === appReducedMotion) return;
    appReducedMotion = reduced; change();
  } };
}
