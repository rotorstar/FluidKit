import { describe, expect, it } from 'vitest';
import { assembleM8Evidence, qualifyM8Matrix, readOriginalPng, summarizeM8Report } from '../../scripts/m8-evidence';
import { CapturedFrameSchema, EffectSettingsSchema, M8QualificationSchema, M8_DIRECTIONS, M8_EFFECT_IDS, M8_PHASES, NativeTargetAuditSchema, SceneNodeSchema, TextAuditSchema, VisualScenarioV3Schema } from '@fluidkit/contracts';
import { resolveEffect } from '@fluidkit/effects';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

// One authentic PNG encoding; the report below is explicitly synthetic schema data, never browser evidence.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=';
function fixture(backend: 'webgpu' | 'webgl2' = 'webgpu', width = 390) {
  const node = SceneNodeSchema.parse({ id: 'selection-alpha', kind: 'button', width: 1, height: 1,
    anatomy: { componentId: 'alpha', part: 'selection', behavior: 'checkbox' }, collection: { id: 'modules', itemId: 'alpha' }, checked: true });
  const cases = M8_EFFECT_IDS.flatMap(effect => M8_DIRECTIONS.map(([source, target]) => {
    const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: effect, version: '1.0.0' } }), capabilities: { backend, compute: backend === 'webgpu', typegpu: true, reducedMotion: false },
      eventId: `matrix-${source}-${target}`, eventType: `view.${target}`, caseId: 'synthetic-cli-test', sourceState: source, targetState: target, sourceRevision: 3, targetRevision: 4, baseDuration: 900, nodeCount: 1 });
    return { effect, source, target, revision: 4, selectedIds: ['alpha', 'beta'], inspectorOpen: true, issues: [],
      setupEvents: [{ type: 'reset', revision: 1, accepted: true }, { type: 'collection.change', revision: 2, accepted: true }, { type: 'inspector.open', revision: 3, accepted: true }],
      recording: VisualScenarioV3Schema.parse({ schemaVersion: 3, source: [node], target: [node], viewport: { width: 1, height: 1 }, plan, durationMs: 900, caseId: 'synthetic-cli-test', redacted: false }),
      samples: M8_PHASES.map((progress, index) => ({
        frame: CapturedFrameSchema.parse({ schemaVersion: 1, id: `${effect}-${source}-${target}-${index}`, surfaceFrame: index + 1,
          capturedAt: '2026-11-13T10:00:00Z', renderTimeMs: index, backend, progress, viewport: { width: 1, height: 1, dpr: 1 }, pixelWidth: 1, pixelHeight: 1, image: PNG, parts: [], redaction: 'no-sensitive-parts', coverage: 'selected-frame' }),
        textAudit: TextAuditSchema.parse({ scale: 1, viewport: { width: 1, height: 1 }, backend, progress, checkedNodes: 0, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] }),
        geometry: { progress, nodes: [{ id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, rotation: node.rotation, opacity: node.opacity }], lensPresent: false, particleCount: 0, shadowCount: 0 },
        nativeTargets: NativeTargetAuditSchema.parse({ method: 'domrect-versus-presented-controls', toleranceCssPx: 1, expectedIds: [node.id], issues: [], observations: [{
          id: node.id, componentId: 'alpha', part: 'selection', matches: 1, actualComponentId: 'alpha', actualPart: 'selection', expected: { x: node.x, y: node.y, width: 1, height: 1 }, actual: { x: node.x, y: node.y, width: 1, height: 1 }, maxDeviation: 0, expectedChecked: true, actualChecked: true, inert: false, tabIndex: 0,
        }] }), selectedIds: ['alpha', 'beta'], inspectorOpen: true,
      })),
    };
  }));
  return M8QualificationSchema.parse({ schemaVersion: 1, milestone: 'M8', generatedAt: '2026-11-13T10:00:00Z', buildId: 'synthetic-only', dataVersion: 'synthetic-only', dataSource: 'explicit synthetic unit fixture', moduleIds: ['alpha', 'beta'], selectedIds: ['alpha', 'beta'],
    scope: 'core-collection-five-checkpoints-native-targets', backend, browser: { width, height: 900, dpr: 1 }, surface: { width: 1, height: 1, dpr: 1 }, cases, result: 'passed', issues: [], limitations: ['Synthetic contract fixture only.'] });
}
const matrix = () => (['webgpu', 'webgl2'] as const).flatMap(backend => [320, 390, 768, 1280].map(width => summarizeM8Report(fixture(backend, width))));

describe('M8 immutable matrix evidence assembly', () => {
  it('requires all eight profiles and all720 phase samples without claiming visual or native review', () => {
    const reports = matrix(); const result = qualifyM8Matrix(reports);
    expect(result.result).toBe('automated-checks-passed'); expect(result.cases).toBe(144); expect(result.checkpoints).toBe(720);
    expect(result.manualVisualReview).toBe('pending'); expect(result.nativeJourneys).toBe('separate-evidence-required');
    expect(qualifyM8Matrix(reports.slice(1)).result).toBe('incomplete-or-failed');
  });
  it.each(['duplicate', 'build', 'selection', 'phase', 'reported-failure'] as const)('refuses a false aggregate pass for %s', kind => {
    const reports = matrix();
    switch (kind) {
      case 'duplicate': reports[1] = structuredClone(reports[0]!); break;
      case 'build': reports[1]!.buildId = 'other'; break;
      case 'selection': reports[1]!.selectedIds = ['alpha', 'other']; break;
      case 'phase': reports[1]!.cases[0]!.frames.pop(); break;
      case 'reported-failure': reports[1]!.result = 'failed'; break;
    }
    expect(qualifyM8Matrix(reports).result).toBe('incomplete-or-failed');
  });
  it('keeps valid geometry coverage separate from an unequal-seed comparison', () => {
    const reports = matrix(); reports[1]!.cases[0]!.seed++;
    const result = qualifyM8Matrix(reports);
    expect(result.result).toBe('automated-checks-passed');
    expect(result.sameSeedComparison).toBe('not-qualified');
    expect(result.comparisonIssues).toHaveLength(1);
  });
  it('checks the canonical schema before assembling and validates original PNG dimensions and checksums', () => {
    expect(readOriginalPng(PNG, 1, 1).toString('base64')).toBe(PNG.split(',')[1]);
    expect(() => readOriginalPng(PNG, 2, 1)).toThrow('dimensions');
    const bytes = Buffer.from(PNG.split(',')[1]!, 'base64'); bytes[42] = bytes[42]! ^ 1;
    expect(() => readOriginalPng(`data:image/png;base64,${bytes.toString('base64')}`, 1, 1)).toThrow('checksum');
    const report = fixture(); report.cases[0]!.samples[0]!.geometry.nodes[0]!.x++;
    expect(() => summarizeM8Report(report)).toThrow();
  });
  it('preserves original JSON bytes through gzip and extracts unchanged original PNG bytes', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'm8-archive-'));
    try {
      const input = join(directory, 'original.json'), bytes = Buffer.from(`  ${JSON.stringify(fixture())}\n\n`);
      await writeFile(input, bytes);
      const result = await assembleM8Evidence({ files: [input], out: join(directory, 'archive'), assets: join(directory, 'assets') });
      expect(result.summary.qualification.result).toBe('incomplete-or-failed');
      expect(await readFile(input)).toEqual(bytes);
      expect(gunzipSync(await readFile(join(directory, 'archive', result.summary.archives[0]!.archive)))).toEqual(bytes);
      const image = result.summary.representativeImages[0]!;
      expect(await readFile(image.path)).toEqual(readOriginalPng(PNG, 1, 1));
      await writeFile(image.path, 'existing different evidence');
      await expect(assembleM8Evidence({ files: [input], out: join(directory, 'archive'), assets: join(directory, 'assets') })).rejects.toThrow('Refusing to overwrite');
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
