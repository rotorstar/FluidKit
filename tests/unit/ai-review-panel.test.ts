// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Blob as NodeBlob } from 'node:buffer';
import { expect, it, vi } from 'vitest';
import { AIReviewAssessmentSchema, AIReviewFrameSchema, AIReviewResultSchema } from '@fluidkit/contracts';
import { createWorkspaceStory, WorkspaceDataSchema } from '@fluidkit/cases';
import { AIReviewPanel } from '../../apps/studio/components/ai-review-panel';

it('requires per-selection consent and exports human assessments without applying model suggestions', async () => {
  const frame = AIReviewFrameSchema.parse({ schemaVersion: 1, id: 'fixture-frame', surfaceFrame: 1, capturedAt: '2026-11-02T06:00:00Z', renderTimeMs: 1, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, image: 'data:image/png;base64,AAAA', pixelWidth: 1, pixelHeight: 1, parts: [{ id: 'title', componentId: 'heading', part: 'label' }], redaction: 'no-sensitive-parts', coverage: 'selected-frame', buildId: 'fixture-build', revision: 0, state: 'table', beatId: null });
  const story = createWorkspaceStory(WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'explicit-component-fixture', capturedAt: '2026-11-02T06:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [{ id: 'webgpu', name: '@fixture/webgpu', version: '1', group: 'Adapter', files: 1, lines: 1, dependencies: [], internal: [] }] }));
  const result = AIReviewResultSchema.parse({ schemaVersion: 1, id: 'fixture-review', output: { summary: 'Explicit component-test response', findings: [{ frameId: frame.id, partId: 'title', region: null, category: 'hierarchy', severity: 'info', observation: 'Fixture finding', rationale: 'Test', suggestion: 'Never automatically execute', uncertainty: 'high' }], limitations: ['Not a live model evaluation'] }, provenance: { sdk: 'ai@7.0.159', provider: 'explicit-test-fixture', model: 'fixture', policyVersion: 'fixture', startedAt: frame.capturedAt, durationMs: 1, frameIds: [frame.id], coverage: 'selected-frames-only' }, usage: { inputTokens: 1, outputTokens: 1 }, accounting: { reservationUsd: .01, usageUpperEstimateUsd: .001, scope: 'local-process', authoritativeInvoice: false } });
  const network = vi.fn().mockImplementation((_url: string, init?: RequestInit) => Promise.resolve(Response.json(init?.method === 'POST' ? result : { configured: true, token: 'a'.repeat(48), provider: 'Explicit component test', model: 'fixture', scope: 'local-process', reservationUsd: .01 })));
  let artifact: NodeBlob | undefined;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubGlobal('fetch', network); vi.stubGlobal('Blob', NodeBlob);
  vi.stubGlobal('URL', class extends URL { static override createObjectURL(blob: Blob | MediaSource) { if (!(blob instanceof NodeBlob)) throw new Error('Expected the explicit test Blob'); artifact = blob; return 'blob:fixture'; } static override revokeObjectURL() {} });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host), onSelect = vi.fn();
  const button = (text: string) => [...host.querySelectorAll('button')].find(button => button.textContent === text)!;
  try {
    await act(async () => root.render(createElement(AIReviewPanel, { frames: [frame], story, onSelect })));
    expect(network).not.toHaveBeenCalled();
    await act(async () => button('AI-Zugang prüfen').click());
    const checkboxes = host.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    await act(async () => checkboxes[0]!.click());
    expect(button('Auswahl analysieren').disabled).toBe(true);
    await act(async () => checkboxes[1]!.click());
    await act(async () => button('Auswahl analysieren').click());
    expect(network).toHaveBeenCalledTimes(2); expect(onSelect).not.toHaveBeenCalled();
    const sent = JSON.parse(String(network.mock.calls[1]![1].body)) as { approved: boolean; frames: { id: string }[] };
    expect(sent.approved).toBe(true); expect(sent.frames.map(frame => frame.id)).toEqual([frame.id]);
    const assessment = host.querySelector('select')!;
    await act(async () => { assessment.value = 'confirmed'; assessment.dispatchEvent(new Event('change', { bubbles: true })); });
    await act(async () => button('AI-Review exportieren').click());
    const exported = AIReviewAssessmentSchema.parse(JSON.parse(await artifact!.text()));
    expect(exported.assessments).toEqual([{ findingIndex: 0, status: 'confirmed', note: '' }]); expect(exported.result).toEqual(result); expect(onSelect).not.toHaveBeenCalled();
    expect(AIReviewAssessmentSchema.safeParse({ ...exported, assessments: [] }).success).toBe(false);
    await act(async () => button('Bild öffnen · title').click()); expect(onSelect).toHaveBeenCalledWith(frame.id);
    await act(async () => checkboxes[0]!.click()); expect(checkboxes[1]!.checked).toBe(false); expect(button('Auswahl analysieren').disabled).toBe(true);
    await act(async () => root.render(createElement(AIReviewPanel, { frames: [], story, onSelect })));
    expect(button('Bild nicht mehr im lokalen Puffer · title').disabled).toBe(true); expect(host.querySelector('select')?.value).toBe('confirmed');
  } finally { await act(async () => root.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals(); host.remove(); }
});
