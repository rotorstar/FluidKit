import { ChildProcess } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { awaitTopCompletion } from '../../scripts/collect-load';

describe('load collector process lifetime', () => {
  afterEach(() => vi.useRealTimers());

  it('ends by elapsed time even when top has not emitted its requested sample count', async () => {
    vi.useFakeTimers();
    const child = new ChildProcess();
    const kill = vi.spyOn(child, 'kill').mockImplementation(signal => {
      expect(signal).toBe('SIGTERM');
      child.emit('close', null, 'SIGTERM');
      return true;
    });
    const terminateOwned = vi.fn();
    const completion = awaitTopCompletion(child, 5000, { isAborted: () => false, terminateOwned });
    await vi.advanceTimersByTimeAsync(4999);
    expect(kill).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await completion).toEqual([]);
    expect(kill).toHaveBeenCalledTimes(1);
    expect(terminateOwned).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(child.listenerCount('close')).toBe(0);
  });

  it('keeps an explicit abort distinct from an unexpected top failure', async () => {
    vi.useFakeTimers();
    const child = new ChildProcess(), terminateOwned = vi.fn();
    let aborted = false;
    const completion = awaitTopCompletion(child, 5000, { isAborted: () => aborted, terminateOwned });
    aborted = true;
    child.emit('close', null, 'SIGTERM');
    expect(await completion).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
    expect(terminateOwned).not.toHaveBeenCalled();
    const failure = new ChildProcess();
    const failed = awaitTopCompletion(failure, 5000, { isAborted: () => false, terminateOwned });
    failure.emit('close', 1, null);
    expect(await failed).toEqual(['Top did not finish normally.']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses an independent hard watchdog if the owned process ignores termination', async () => {
    vi.useFakeTimers();
    const child = new ChildProcess();
    const kill = vi.spyOn(child, 'kill').mockReturnValue(true), terminateOwned = vi.fn();
    const completion = awaitTopCompletion(child, 5000, { isAborted: () => false, terminateOwned });
    await vi.advanceTimersByTimeAsync(5000);
    expect(kill).toHaveBeenCalledWith('SIGTERM');
    expect(terminateOwned).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(10000);
    expect(await completion).toEqual(['Collector exceeded its bounded duration.']);
    expect(terminateOwned).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans both deadlines when spawning fails', async () => {
    vi.useFakeTimers();
    const child = new ChildProcess();
    const completion = awaitTopCompletion(child, 5000, { isAborted: () => false, terminateOwned: vi.fn() });
    child.emit('error', new Error('unavailable'));
    expect(await completion).toEqual(['Top unavailable.']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
