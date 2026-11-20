import { BackendModeSchema, type BackendMode } from '@fluidkit/contracts';

/** Selection policy is independently testable; a preference is never an active-backend report. */
export async function resolveGPUPreference<T>(input: BackendMode, requestWebGPU: () => Promise<T>) {
  const mode = BackendModeSchema.parse(input);
  if (mode === 'webgl2') return { device: undefined, fallbackReason: 'WebGL2 wurde ausdrücklich für die Diagnose gewählt.' };
  try { return { device: await requestWebGPU(), fallbackReason: null }; }
  catch (error) {
    if (mode === 'webgpu-only') throw error;
    return { device: undefined, fallbackReason: error instanceof Error ? error.message : 'WebGPU-Initialisierung fehlgeschlagen.' };
  }
}
