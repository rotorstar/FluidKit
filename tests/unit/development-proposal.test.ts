import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it, beforeAll } from 'vitest';
import { AuthoringDocumentSchema, DEFAULT_AUTHORING_DOCUMENT } from '@fluidkit/contracts';
import { WorkspaceDataSchema } from '@fluidkit/cases';
import { checkDevelopmentDocumentType, createDevelopmentProposal, type DevelopmentProposal } from '../../packages/server/src/development-proposal';

const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'unit-fixture', capturedAt: '2026-11-13T00:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'core', name: '@fluidkit/core', version: 'test', group: 'Kernel', files: 3, lines: 30, dependencies: ['@fluidkit/contracts'], internal: ['contracts'] },
  { id: 'contracts', name: '@fluidkit/contracts', version: 'test', group: 'Kernel', files: 2, lines: 20, dependencies: [], internal: [] },
] });
const after = AuthoringDocumentSchema.parse({ ...DEFAULT_AUTHORING_DOCUMENT, title: 'Eine überprüfte Komposition', accent: 'indigo', sections: [...DEFAULT_AUTHORING_DOCUMENT.sections].reverse() });
const request = { before: DEFAULT_AUTHORING_DOCUMENT, after, data, documentRevision: 3, runtimeRevision: 8, origin: { kind: 'manual' } };
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
let proposal: DevelopmentProposal;
beforeAll(() => { proposal = createDevelopmentProposal(request); }, 15000);

describe('bounded development preflight', () => {
  it('resolves the actual Contracts and runs every declared local projection before disposing', () => {
    expect(proposal.preflight.passed, JSON.stringify(proposal.preflight, null, 2)).toBe(true);
    expect(proposal.preflight.typecheck.contractsResolved).toBe(true);
    expect(proposal.preflight.typecheck.inputs.some(input => input.path.endsWith('contracts/src/authoring.ts'))).toBe(true);
    expect(proposal.preflight.conformance.cases.map(item => `${item.width}/${item.state}`)).toEqual(
      [320, 390, 768, 1280].flatMap(width => ['table', 'cards', 'map', 'detail'].map(state => `${width}/${state}`)),
    );
    expect(proposal.preflight.conformance).toMatchObject({ events: 16, disposed: true, pendingActionsAfterDispose: 0 });
    expect(proposal.preflight.application).toBe('not-applied');
    expect(proposal.basis).toMatchObject({ documentRevision: 3, runtimeRevision: 8, moduleCount: 2 });
    expect(existsSync(resolve('__fluid_development_document__.ts'))).toBe(false);
  });

  it('provides a valid full-file unified diff and independent source hashes', () => {
    const lines = proposal.downloadDiff.text.trimEnd().split('\n');
    expect(lines.slice(0, 2)).toEqual(['--- a/fluid-authoring.document.ts', '+++ b/fluid-authoring.document.ts']);
    const [removed, added] = [lines.slice(3).filter(line => line.startsWith('-')).map(line => line.slice(1)), lines.slice(3).filter(line => line.startsWith('+')).map(line => line.slice(1))];
    expect(`${removed.join('\n')}\n`).toBe(proposal.sources.before);
    expect(`${added.join('\n')}\n`).toBe(proposal.sources.after);
    expect(lines[2]).toBe(`@@ -1,${removed.length} +1,${added.length} @@`);
    expect(hash(proposal.sources.before)).toBe(proposal.sources.beforeSha256);
    expect(hash(proposal.sources.after)).toBe(proposal.sources.afterSha256);
    expect(hash(proposal.downloadDiff.text)).toBe(proposal.downloadDiff.sha256);
  });

  it('reports semantic TypeScript errors even for syntactically valid JSON', () => {
    const result = checkDevelopmentDocumentType({ ...after, accent: 'unregistered-color' });
    expect(result.contractsResolved).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.diagnostics.some(issue => issue.code === 2322 && issue.message.includes('unregistered-color'))).toBe(true);
  }, 15000);

  it('keeps source-like title text inside the generated JSON literal', () => {
    const title = '"; throw new Error("this must stay text"); //';
    const candidate = createDevelopmentProposal({ ...request, after: { ...after, title } });
    expect(candidate.preflight.passed).toBe(true);
    expect(candidate.sources.after).toContain(JSON.stringify(title));
    expect(candidate.sources.after.startsWith("import type { AuthoringDocument } from '@fluidkit/contracts';\n")).toBe(true);
  }, 15000);

  it('rejects invented registry entries, commands, note values and executable fields', () => {
    for (const invalid of [
      { ...after, code: 'fetch("https://example.invalid")' },
      { ...after, sections: [{ type: 'module-explorer', id: 'x', binding: 'remote.url', view: 'cards', commands: [] }] },
      { ...after, sections: after.sections.map(section => section.type === 'project-note' ? { ...section, value: 'PRIVATE-NOTE' } : section) },
    ]) expect(() => createDevelopmentProposal({ ...request, after: invalid })).toThrow();
    expect(() => createDevelopmentProposal({ ...request, origin: { kind: 'manual', approved: true } })).toThrow();
  });

  it('keeps IDs an independent gate even when the generated type and runtime are valid', () => {
    const candidate = createDevelopmentProposal({ ...request, after: { ...after, sections: after.sections.map(section => section.type === 'module-explorer' ? { ...section, id: 'replaced-explorer' } : section) } });
    expect(candidate.preflight.passed).toBe(false);
    expect(candidate.preflight.checks.find(check => check.id === 'stable-identities')?.passed).toBe(false);
    expect(candidate.preflight.typecheck.passed).toBe(true);
  }, 15000);

  it('declines a partial-data conformance pass outside the explicit limit', () => {
    const modules = Array.from({ length: 101 }, (_, index) => ({ ...data.modules[0]!, id: `module-${index}`, internal: [] }));
    const candidate = createDevelopmentProposal({ ...request, data: { ...data, modules } });
    expect(candidate.preflight.passed).toBe(false);
    expect(candidate.preflight.conformance).toMatchObject({ passed: false, cases: [], events: 0, disposed: true });
    expect(candidate.preflight.conformance.issues[0]).toContain('100 modules');
  }, 15000);

  it('does not invent a diff or selected-detail case for an unchanged empty workspace', () => {
    const candidate = createDevelopmentProposal({ ...request, after: request.before, data: { ...data, modules: [] } });
    expect(candidate.preflight.passed).toBe(true);
    expect(candidate.downloadDiff.text).toBe('');
    expect(candidate.documents.beforeSha256).toBe(candidate.documents.afterSha256);
    expect(candidate.preflight.conformance.cases).toHaveLength(12);
    expect(candidate.preflight.conformance.cases.every(item => item.state !== 'detail')).toBe(true);
  }, 15000);

  it('produces identical source and diff for object-key order variations', () => {
    const candidate = createDevelopmentProposal({ origin: request.origin, runtimeRevision: 8, documentRevision: 3, data,
      before: request.before, after: { sections: after.sections, accent: after.accent, title: after.title, registryVersion: after.registryVersion, schemaVersion: after.schemaVersion } });
    expect(candidate.sources).toEqual(proposal.sources);
    expect(candidate.downloadDiff).toEqual(proposal.downloadDiff);
  }, 15000);
});
