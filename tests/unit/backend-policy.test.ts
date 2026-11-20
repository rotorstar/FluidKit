import { expect, it, vi } from 'vitest';
import { resolveGPUPreference } from '@fluidkit/webgpu';
it('prefers a usable WebGPU device and reports no fallback',async()=>{
 const device={id:'gpu'},request=vi.fn(async()=>device);
 expect(await resolveGPUPreference('webgpu-first',request)).toEqual({device,fallbackReason:null});expect(request).toHaveBeenCalledTimes(1);
});
it('falls back with a reason on missing adapter or device failure',async()=>{
 for(const reason of ['No adapter','Device request failed']){const result=await resolveGPUPreference('webgpu-first',async()=>{throw new Error(reason);});expect(result).toEqual({device:undefined,fallbackReason:reason});}
});
it('keeps strict WebGPU opt-in and explicit WebGL diagnostic distinct',async()=>{
 const fail=vi.fn(async()=>{throw new Error('unavailable');});await expect(resolveGPUPreference('webgpu-only',fail)).rejects.toThrow('unavailable');
 fail.mockClear();expect((await resolveGPUPreference('webgl2',fail)).fallbackReason).toContain('Diagnose');expect(fail).not.toHaveBeenCalled();
});
