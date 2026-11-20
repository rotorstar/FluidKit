import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalReviewEvidenceSchema } from '@fluidkit/contracts';
import { createLocalProjectStore } from '../../packages/server/src/local-project';
const roots: string[] = [];
afterEach(() => roots.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
function fixture() {
  // Explicit non-production 1px image/model result; tests storage, not visual quality.
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
  const imageSha256 = createHash('sha256').update(Buffer.from(image.split(',')[1]!, 'base64')).digest('hex');
  return LocalReviewEvidenceSchema.parse({ schemaVersion: 1, kind: 'fluid-local-review-evidence', assessment: {
    schemaVersion: 1, exportedAt: '2026-11-20T10:00:00Z', scope: 'local-review', assessments: [{ findingIndex: 0, status: 'pending', note: '' }],
    result: { schemaVersion: 1, id: 'fixture-result', output: { summary: 'Test only', limitations: ['No model or quality proof.'], findings: [{ frameId: 'frame', partId: 'title', region: null, category: 'typography', severity: 'info', observation: 'Fixture', rationale: 'Test', suggestion: 'Review', uncertainty: 'high' }] },
      provenance: { sdk: 'fixture', provider: 'fixture', model: 'fixture', policyVersion: 'fixture', startedAt: '2026-11-20T10:00:00Z', durationMs: 1, frameIds: ['frame'], coverage: 'selected-frames-only' }, usage: { inputTokens: null, outputTokens: null }, accounting: { reservationUsd: 0, usageUpperEstimateUsd: null, scope: 'local-project', authoritativeInvoice: false } },
  }, frames: [{ imageSha256, frame: { schemaVersion: 1, id: 'frame', surfaceFrame: 2, capturedAt: '2026-11-20T10:00:00Z', renderTimeMs: 0, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, image, pixelWidth: 1, pixelHeight: 1, parts: [{ id: 'title', componentId: 'heading', part: 'label' }], redaction: 'no-sensitive-parts', coverage: 'selected-frame', buildId: 'fixture-build', revision: 0, state: 'table', beatId: null,
      binding: { runId: 'fixture-run', presentation: 'live', datasetHash: 'a'.repeat(64), imageSha256, visualRevision: 0, traceSequence: 0, auditSurfaceFrame: 1, auditBinding: 'stable-paused-presentation' } } }] });
}
describe('review archive preserves original evidence', () => {
  it('round-trips original image and provenance after reopen, and versions changed assessments immutably', () => {
    const directory = mkdtempSync(join(tmpdir(), 'fluid-evidence-')); roots.push(directory); const store = createLocalProjectStore(directory), value = fixture();
    const first = store.saveReview(value); expect(store.saveReview(value)).toEqual(first); expect(store.reviews()).toHaveLength(1);
    const confirmed = structuredClone(value); confirmed.assessment.assessments[0]!.status = 'confirmed'; const second = store.saveReview(confirmed); expect(second.id).not.toBe(first.id); store.close();
    const reopened = createLocalProjectStore(directory); try { expect(reopened.review(first.id)).toEqual(value); expect(reopened.review(second.id)).toEqual(confirmed); expect(reopened.review(first.id).frames[0]!.frame.image).toBe(value.frames[0]!.frame.image); } finally { reopened.close(); }
  });
  it('rejects image tampering and dimensions without writing a report', () => {
    const directory = mkdtempSync(join(tmpdir(), 'fluid-evidence-')); roots.push(directory); const store = createLocalProjectStore(directory), value = fixture();
    try { const tampered = structuredClone(value); tampered.frames[0]!.imageSha256 = 'b'.repeat(64); tampered.frames[0]!.frame.binding!.imageSha256 = 'b'.repeat(64); expect(() => store.saveReview(tampered)).toThrow('Bildhash'); const dimensions = structuredClone(value); dimensions.frames[0]!.frame.pixelWidth = 2; expect(() => store.saveReview(dimensions)).toThrow('Bildmaße'); expect(store.reviews()).toEqual([]); } finally { store.close(); }
  });
  it('rejects absent original frames, unknown parts and mismatched binding independently of model JSON', () => {
    const value = fixture(); const missing = structuredClone(value); missing.assessment.result.provenance.frameIds.push('missing'); expect(LocalReviewEvidenceSchema.safeParse(missing).success).toBe(false);
    const wrongPart = structuredClone(value); wrongPart.assessment.result.output.findings[0]!.partId = 'absent'; expect(LocalReviewEvidenceSchema.safeParse(wrongPart).success).toBe(false);
    const wrongHash = structuredClone(value); wrongHash.frames[0]!.frame.binding!.imageSha256 = 'b'.repeat(64); expect(LocalReviewEvidenceSchema.safeParse(wrongHash).success).toBe(false);
  });
});
