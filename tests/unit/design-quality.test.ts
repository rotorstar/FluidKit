// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { createFluidRuntime } from '@fluidkit/core';
import { createProjectProof } from '@fluidkit/cases';
import { EffectLab } from '../../apps/studio/components/effect-lab';
import { DESIGN_TOKENS, QualityReportSchema, SceneNodeSchema, TextAuditSchema } from '@fluidkit/contracts';
import { createQualityReport, gpuReadabilityCheck, measuredCheck, openCheck, summarizeQuality, textAuditCheck } from '@fluidkit/testing/quality';
import { hiddenByClosedDetails, inspectSemantics, intersectText, occludedByChrome } from '@fluidkit/testing/dom-quality';
import { buildDesignReport, DesignProfileSchema, runDesignCheck } from '../../scripts/design-static';

const profile: unknown = JSON.parse(readFileSync('design-quality.config.json', 'utf8'));
const temporary: string[] = [];
afterEach(() => { for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true }); });
function fixture(source: string) {
  const root = mkdtempSync(join(tmpdir(), 'fluid-design-test-')); temporary.push(root);
  mkdirSync(join(root, 'apps/studio/components'), { recursive: true });
  const file = join(root, 'apps/studio/components/probe.tsx'); writeFileSync(file, source);
  return { root, file };
}

describe('qualified static studio profile', () => {
  it('keeps generated knowledge out of runtime identity while retaining real asset changes', async () => {
    const {root}=fixture('<Button>Neue Datei</Button>');
    for(const path of ['packages','apps/studio/app','apps/studio/lib','apps/studio/public','scripts'])mkdirSync(join(root,path),{recursive:true});
    writeFileSync(join(root,'design-quality.config.json'),JSON.stringify(profile));
    for(const file of ['package.json','package-lock.json','font-bake.config.json'])writeFileSync(join(root,file),'{}');
    writeFileSync(join(root,'apps/studio/next.config.ts'),'export default {};');
    const initial=(await buildDesignReport(root)).context.buildId;
    mkdirSync(join(root,'apps/studio/public/knowledge/public/assets'),{recursive:true});
    writeFileSync(join(root,'apps/studio/public/knowledge/public/assets/product-facts.json'),'{}');
    expect((await buildDesignReport(root)).context.buildId).toBe(initial);
    writeFileSync(join(root,'apps/studio/public/font.woff2'),'changed font data');
    expect((await buildDesignReport(root)).context.buildId).not.toBe(initial);
  });
  it('accepts German nouns, externally styled headless primitives and the shared native control owner', () => {
    const { root } = fixture('<Button aria-label="Neue Datei" className="outline-button">Neue Datei</Button>');
    writeFileSync(join(root, 'apps/studio/components/studio-controls.tsx'), '<input aria-label="Datei" />');
    expect(runDesignCheck(root, profile).findings).toEqual([]);
  });
  it('blocks introduced font and focus defects and never hides a replacement behind a count baseline', () => {
    const { root, file } = fixture('<button className="outline-none text-[7px]">Save</button>');
    const first = runDesignCheck(root, profile).findings;
    expect(first.filter(item => item.severity === 'error').map(item => item.rule).sort()).toEqual(['focus-ring-removed', 'type-scale']);
    writeFileSync(file, '<button className="focus-visible:ring-2">Save</button>\n<button className="text-[6px]">Other</button>');
    const next = runDesignCheck(root, profile).findings;
    expect(next.some(item => item.rule === 'type-scale' && item.target.line === 2 && item.severity === 'error')).toBe(true);
    expect(next.some(item => item.rule === 'focus-ring-removed')).toBe(false);
  });
  it('detects unnamed icon buttons independently of the native-control convention', () => {
    const { root } = fixture('<Button><svg><path /></svg></Button>');
    expect(runDesignCheck(root, profile).findings.some(item => item.rule === 'icon-button-name' && item.severity === 'error')).toBe(true);
  });
  it('rejects undocumented exclusions and misspelled rules', () => {
    const parsed = DesignProfileSchema.parse(profile);
    expect(DesignProfileSchema.safeParse({ ...parsed, exceptions: [] }).success).toBe(false);
    const { root } = fixture('<Button>Save</Button>');
    expect(() => runDesignCheck(root, { ...parsed, qualifiedBlockingRules: ['typo'] })).toThrow('Unknown design rule');
  });
});

describe('quality evidence and coverage', () => {
  const context = { buildId: 'test-build', backend: 'webgpu' as const, viewport: { width: 390, height: 900 }, phase: 1, revision: 3 };
  it('does not turn an empty checker or a manual open gate into a full pass', () => {
    const empty = measuredCheck('empty', 'gpu', 'No data', 0, []);
    const report = createQualityReport(context, [empty, openCheck('manual', 'visual', 'Review', 'Screenshot not reviewed')]);
    expect(summarizeQuality(report)).toMatchObject({ status: 'incomplete', open: 2 });
    expect(QualityReportSchema.safeParse({ ...report, checks: [{ ...empty, status: 'passed' }] }).success).toBe(false);
  });
  it('preserves source, location and failure through JSON export and rejects duplicate checks', () => {
    const check = measuredCheck('geometry', 'gpu', 'Geometry', 1, [{ rule: 'overlap', severity: 'error', message: 'Collision', target: { componentId: 'card', part: 'title', nodes: ['title'] } }]);
    const report = createQualityReport(context, [check]);
    expect(QualityReportSchema.parse(JSON.parse(JSON.stringify(report)))).toEqual(report);
    expect(summarizeQuality(report)).toMatchObject({ status: 'failed', errors: 1 });
    expect(QualityReportSchema.safeParse({ ...report, checks: [check, check] }).success).toBe(false);
  });
  it('imports real ink findings and assesses displayed font size after replay scaling', () => {
    const audit = TextAuditSchema.parse({ scale: 0.3, viewport: { width: 390, height: 900 }, backend: 'webgpu', progress: 1, checkedNodes: 1, hiddenDuringMotion: 0, boxes: [], textStyles: [{ id: 'title', componentId: 'card', part: 'title', fontSize: 4.2 }], issues: [{ kind: 'overlap', nodes: ['title', 'other'], detail: 'Actual collision', severity: 'error' }] });
    expect(textAuditCheck(audit).findings[0]?.rule).toBe('overlap');
    expect(gpuReadabilityCheck(audit).findings[0]?.target.part).toBe('title');
    expect(DESIGN_TOKENS.captionPx).toBeGreaterThan(4.2);
  });
  it('compares actual text fragments without union-box false positives for wrapped inline text', () => {
    const first = { x: 0, y: 0, width: 40, height: 12 }, wrapped = { x: 0, y: 16, width: 20, height: 12 };
    expect(intersectText(first, wrapped)).toBe(false);
    expect(intersectText(first, { ...first, x: 10, y: 3 })).toBe(true);
    expect(intersectText(first, { ...first, x: 40 })).toBe(false);
  });
  it('excludes closed-details contents while retaining its summary and opening the same controls', () => {
    const details = document.createElement('details');
    details.innerHTML = '<summary><strong>Studio</strong></summary><section><button>Hidden</button></section>';
    expect(hiddenByClosedDetails(details.querySelector('strong')!)).toBe(false);
    expect(hiddenByClosedDetails(details.querySelector('button')!)).toBe(true);
    details.open = true;
    expect(hiddenByClosedDetails(details.querySelector('button')!)).toBe(false);
  });
  it('distinguishes proven opaque sticky occlusion from transparent overlays and ordinary collisions', () => {
    const root = document.createElement('div'); root.innerHTML = '<div style="position:sticky;background:rgb(245,247,248)"><button>Pause</button></div><p>Page content</p>'; document.body.append(root);
    const chrome = root.firstElementChild!, front = chrome.firstElementChild!, back = root.lastElementChild!;
    const previous = Object.getOwnPropertyDescriptor(document, 'elementsFromPoint');
    let stack = [front, chrome, back]; Object.defineProperty(document, 'elementsFromPoint', { configurable: true, value: () => stack });
    const area = { x: 10, y: 10, width: 30, height: 10 };
    try {
      expect(occludedByChrome(front, back, area)).toBe(true);
      (chrome as HTMLElement).style.background = 'rgba(245,247,248,0.5)'; expect(occludedByChrome(front, back, area)).toBe(false);
      (chrome as HTMLElement).style.background = 'rgb(245,247,248)'; (chrome as HTMLElement).style.position = 'static'; expect(occludedByChrome(front, back, area)).toBe(false);
      (chrome as HTMLElement).style.position = 'sticky'; stack = [back, front, chrome]; expect(occludedByChrome(front, back, area)).toBe(false);
    } finally { root.remove(); if (previous) Object.defineProperty(document, 'elementsFromPoint', previous); else Reflect.deleteProperty(document, 'elementsFromPoint'); }
  });
});

describe('native bridge conformance', () => {
  const node = SceneNodeSchema.parse({ id: 'save', anatomy: { componentId: 'form', part: 'save', behavior: 'button' }, kind: 'button', label: 'Speichern', onActivate: 'save', pressed: true });
  function root(markup: string) { const element = document.createElement('main'); element.innerHTML = `<div class="fluid-semantics">${markup}</div>`; return element; }
  it('allows intentional transparent native controls while validating name and pressed state', () => {
    const checks = inspectSemantics(root('<button style="opacity:0" data-fluid-node="save" aria-pressed="true">Speichern</button>'), [node]);
    expect(checks[0]?.status).toBe('passed');
  });
  it('detects duplicate, hidden and stale semantic controls', () => {
    expect(inspectSemantics(root('<button data-fluid-node="save">Speichern</button><button data-fluid-node="save">Speichern</button>'), [node])[0]?.findings[0]?.rule).toBe('bridge-cardinality');
    const checks = inspectSemantics(root('<button aria-hidden="true" data-fluid-node="save" aria-pressed="false">Old label</button>'), [node]);
    expect(checks[0]?.findings.map(item => item.rule)).toEqual(expect.arrayContaining(['accessible-name', 'hidden-control', 'pressed-state']));
  });
  it('leaves replay semantics explicitly open rather than failing or reporting a false pass', () => {
    const element = root(''); element.insertAdjacentHTML('afterbegin', '<div class="replay-banner">Replay</div>');
    expect(inspectSemantics(element, [node])[0]?.status).toBe('not-checked');
  });
});

it('keeps Studio range labels associated even when a labelable output precedes the input', () => {
  const runtime = createFluidRuntime({ flow: createProjectProof('Quality test') });
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderToStaticMarkup(createElement(EffectLab, { runtime, metrics: null, controls: null, onPreview: () => {} }));
  for (const input of wrapper.querySelectorAll<HTMLInputElement>('input[type=range]')) {
    expect(input.labels?.length).toBe(1);
    expect(input.labels?.[0]?.htmlFor).toBe(input.id);
  }
  expect(wrapper.textContent).toContain('2,5');
  runtime.dispose();
});
