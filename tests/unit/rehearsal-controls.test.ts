// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { WorkspaceDataSchema } from '@fluidkit/cases';
import { createQualityReport } from '@fluidkit/testing/quality';
import { RehearsalWorkshop } from '../../apps/studio/components/rehearsal-workshop';

// Explicit component-test adapter; no claim about GPU rendering is made here.
vi.mock('@fluidkit/react', async importOriginal => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('@fluidkit/react')>();
  return {
    ...actual,
    FluidSurface: ({ onControls }: { onControls: (controls: unknown) => void }) => {
      React.useEffect(() => { onControls({ restoreLive() {}, pause() {}, play() {}, getPresentationMode() { return 'live'; } }); }, []);
      return React.createElement('div', null, React.createElement('canvas'), ...['column-dependencies', 'view-cards', 'module-webgpu'].map(id => React.createElement('button', { key: id, 'data-fluid-node': id }, id)));
    },
  };
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });
it('preserves keyboard focus, pauses future story events and advances one explicit beat', async () => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(1348);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 390, height: 100, x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 100, toJSON() {} });
  const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'explicit-component-fixture', capturedAt: '2026-11-02T06:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [{ id: 'webgpu', name: '@fixture/webgpu', version: '1', group: 'Adapter', files: 1, lines: 1, dependencies: [], internal: [] }] });
  const report = createQualityReport({ buildId: 'test-build', backend: 'not-applicable' }, [{ id: 'fixture', source: 'static', title: 'Explicit test fixture', status: 'passed', checked: 1, findings: [] }]);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  const button = (text: string) => [...host.querySelectorAll('button')].find(button => button.textContent === text)!;
  try {
    await act(async () => root.render(createElement(RehearsalWorkshop, { data, staticReport: report })));
    await act(async () => button('Story starten').click());
    const pause = button('Führung pausieren'); pause.focus();
    await act(async () => vi.advanceTimersByTime(1900));
    expect(document.activeElement).toBe(pause);
    await act(async () => pause.click());
    expect(host.querySelector('.rehearsal-run-status')?.textContent).toContain('pausiert');
    const before = host.querySelector('.rehearsal-preview .panel-toolbar')?.textContent;
    await act(async () => vi.advanceTimersByTime(10000));
    expect(host.querySelector('.rehearsal-preview .panel-toolbar')?.textContent).toBe(before);
    await act(async () => button('Nächster Schritt').click());
    expect(host.querySelector('.rehearsal-preview .panel-toolbar')?.textContent).toContain('cards');
    // A review may navigate to an image and back. Its session/result owner must
    // survive panel switches; a hidden panel must remain inactive for accessibility.
    const network = vi.fn().mockResolvedValue(Response.json({ configured: false, token: 'a'.repeat(48), provider: 'Fixture Gateway', model: null, scope: 'local-process', reason: 'Explicit component-test configuration' }));
    vi.stubGlobal('fetch', network);
    await act(async () => button('AI-Analyse').click());
    await act(async () => button('AI-Zugang prüfen').click());
    expect(host.querySelector('[aria-label="AI-Designanalyse"] [role="status"]')?.textContent).toContain('Explicit component-test configuration');
    await act(async () => button('Vergleich').click());
    expect(host.querySelector('[aria-label="AI-Designanalyse"]')?.closest('[role="tabpanel"]')?.hasAttribute('hidden')).toBe(true);
    await act(async () => button('AI-Analyse').click());
    expect(host.querySelector('[aria-label="AI-Designanalyse"] [role="status"]')?.textContent).toContain('Explicit component-test configuration');
    expect(network).toHaveBeenCalledTimes(1);
  } finally { await act(async () => root.unmount()); }
});
