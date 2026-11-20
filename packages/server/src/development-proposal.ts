import { workspaceDatasetHash } from './local-project';
import { createHash } from 'node:crypto';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { z } from 'zod';
import { DevelopmentProposalRequestSchema, DevelopmentProposalSchema, DevelopmentTypecheckSchema as TypecheckSchema, DevelopmentCheckSchema as CheckSchema, DevelopmentConformanceSchema as ConformanceSchema, type AuthoringDocument, type DevelopmentProposal } from '@fluidkit/contracts';
export { DevelopmentProposalRequestSchema, DevelopmentProposalSchema, type DevelopmentProposal } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { WorkspaceDataSchema, createAuthoredWorkspaceFlow, authoredWorkspaceScene, workspaceCollectionOrder } from '@fluidkit/cases';

// The server working directory owns dependency resolution, including in a Next bundle.
const ROOT = process.cwd();
const VIRTUAL_FILE = resolve(ROOT, '__fluid_development_document__.ts');
const SOURCE_NAME = 'fluid-authoring.document.ts';
const JsonSchema = z.json();
type JsonValue = z.infer<typeof JsonSchema>;
const HostRequestSchema = DevelopmentProposalRequestSchema.extend({ data: WorkspaceDataSchema });

const sha256 = (source: string) => createHash('sha256').update(source).digest('hex');
/** Stable JSON, including object key order. Arrays retain their authored order. */
function canonical(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key]!)]));
  return value;
}
function documentText(value: unknown) {
  const text = JSON.stringify(canonical(JsonSchema.parse(value)), null, 2);
  if (Buffer.byteLength(text, 'utf8') > 64 * 1024) throw new Error('Development document exceeds the 64 KiB limit');
  return text;
}
function sourceText(text: string) {
  return `import type { AuthoringDocument } from '@fluidkit/contracts';\n\nexport const document = ${text} satisfies AuthoringDocument;\n`;
}

/** Compiles only a JSON literal in a fixed template, never arbitrary caller source. */
export function checkDevelopmentDocumentType(value: unknown): z.infer<typeof TypecheckSchema> {
  const source = sourceText(documentText(value));
  const options: ts.CompilerOptions = {
    noEmit: true, strict: true, noUncheckedIndexedAccess: true, skipLibCheck: true,
    target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: [], esModuleInterop: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host), readFile = host.readFile.bind(host), fileExists = host.fileExists.bind(host);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => resolve(file) === VIRTUAL_FILE
    ? ts.createSourceFile(file, source, languageVersion, true)
    : getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
  host.readFile = file => resolve(file) === VIRTUAL_FILE ? source : readFile(file);
  host.fileExists = file => resolve(file) === VIRTUAL_FILE || fileExists(file);
  host.writeFile = () => { throw new Error('The development preflight must never emit files'); };
  const program = ts.createProgram([VIRTUAL_FILE], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => ({
    code: diagnostic.code,
    file: diagnostic.file ? relative(ROOT, diagnostic.file.fileName) : null,
    line: diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : null,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  }));
  const resolved = ts.resolveModuleName('@fluidkit/contracts', VIRTUAL_FILE, options, host).resolvedModule;
  const contractsResolved = Boolean(resolved && program.getSourceFile(resolved.resolvedFileName));
  const inputs = program.getSourceFiles().filter(file => !file.isDeclarationFile && resolve(file.fileName) !== VIRTUAL_FILE)
    .map(file => ({ path: relative(ROOT, file.fileName), sha256: sha256(file.text) })).sort((a, b) => a.path.localeCompare(b.path));
  return TypecheckSchema.parse({ passed: contractsResolved && diagnostics.length === 0, compilerVersion: ts.version, noEmit: true, contractsResolved, diagnostics, inputs });
}

function conformance(document: AuthoringDocument, data: z.infer<typeof WorkspaceDataSchema>): z.infer<typeof ConformanceSchema> {
  const cases: z.infer<typeof ConformanceSchema>['cases'] = [], issues: string[] = [];
  let events = 0, disposed = true, pendingActionsAfterDispose = 0;
  if (data.modules.length > 100) return { passed: false, scope: 'registered-local-runtime', cases, events, disposed, pendingActionsAfterDispose, issues: ['This preflight is bounded to 100 modules; no partial-data pass is issued.'] };
  let runtime: ReturnType<typeof createFluidRuntime> | undefined;
  try {
    const flow = createAuthoredWorkspaceFlow(document, data);
    if (Object.values(flow.states).some(state => Object.values(state.on).some(transition => transition.action))) throw new Error('A preflight flow must not contain external actions');
    runtime = createFluidRuntime({ flow, mode: 'manual', clock: { now: () => 0 },
      projections: { workspace: (snapshot, viewport, effects) => authoredWorkspaceScene(document, data, snapshot, viewport, effects) },
      collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
    });
    disposed = false;
    const runtimeRef = runtime;
    for (const width of [320, 390, 768, 1280]) {
      const transitions = ['view.table', 'view.cards', 'view.map', ...(data.modules[0] ? [`select.${data.modules[0].id}`] : [])];
      for (const event of transitions) {
        const result = runtimeRef.send(event, {}, 'host', 'programmatic');
        if (!result.accepted) throw new Error(`Registered transition rejected: ${event}`);
        events++;
        const nodes = runtimeRef.getScene({ width, height: 1000 });
        if (new Set(nodes.map(node => node.id)).size !== nodes.length) throw new Error('Duplicate scene identity');
        if (nodes.some(node => ![node.x, node.y, node.width, node.height, node.rotation].every(Number.isFinite))) throw new Error('Non-finite scene geometry');
        const note = document.sections.find(section => section.type === 'project-note');
        if (note && !nodes.some(node => node.binding === 'workspaceNote' && node.sensitive && node.anatomy.behavior === 'textbox')) throw new Error('The note lost its sensitive input contract');
        if (runtimeRef.getSnapshot().state !== 'detail') for (const module of data.modules) {
          if (!nodes.some(node => node.id === `module-${module.id}` && node.onActivate === `select.${module.id}`)) throw new Error('A module lost its stable ID or open command');
        }
        cases.push({ width, state: runtimeRef.getSnapshot().state, nodes: nodes.length });
      }
    }
    if (runtime.getDiagnostics().pendingActions !== 0) throw new Error('A read-only preflight scheduled an external action');
  } catch (error) { issues.push(error instanceof Error ? error.message : 'Conformance failed'); }
  finally {
    if (runtime) {
      runtime.dispose();
      disposed = runtime.getDiagnostics().disposed;
      pendingActionsAfterDispose = runtime.getDiagnostics().pendingActions;
      if (!disposed || pendingActionsAfterDispose !== 0) issues.push('Runtime cleanup did not complete');
    }
  }
  return { passed: issues.length === 0 && cases.length === (data.modules.length ? 16 : 12), scope: 'registered-local-runtime', cases, events, disposed, pendingActionsAfterDispose, issues };
}

function unifiedDiff(before: string, after: string) {
  if (before === after) return '';
  const previous = before.trimEnd().split('\n'), next = after.trimEnd().split('\n');
  return [`--- a/${SOURCE_NAME}`, `+++ b/${SOURCE_NAME}`, `@@ -1,${previous.length} +1,${next.length} @@`,
    ...previous.map(line => `-${line}`), ...next.map(line => `+${line}`), ''].join('\n');
}

/** No file writes, generated-code execution, model calls, action adapters or permission grant. */
export function createDevelopmentProposal(input: unknown): DevelopmentProposal {
  const request = HostRequestSchema.parse(input);
  const beforeDocument = documentText(request.before), afterDocument = documentText(request.after);
  const beforeSource = sourceText(beforeDocument), afterSource = sourceText(afterDocument);
  const changedIdentities = request.after.sections.filter(section => {
    const existing = request.before.sections.find(item => item.type === section.type);
    return existing && existing.id !== section.id;
  });
  const typecheck = checkDevelopmentDocumentType(request.after);
  const tested = conformance(request.after, request.data);
  const checks: z.infer<typeof CheckSchema>[] = [
    { id: 'registry', passed: true, detail: 'Both strict registry documents and host data validated; no arbitrary code, binding or command.' },
    { id: 'stable-identities', passed: changedIdentities.length === 0, detail: changedIdentities.length ? 'Existing component IDs changed.' : 'IDs of retained component types are unchanged.' },
    { id: 'typescript', passed: typecheck.passed, detail: `${typecheck.compilerVersion}: installed Contracts resolved=${typecheck.contractsResolved}; ${typecheck.diagnostics.length} diagnostics.` },
    { id: 'conformance', passed: tested.passed, detail: `${tested.cases.length} local runtime projections; ${tested.issues.length} issues.` },
  ];
  const diff = unifiedDiff(beforeSource, afterSource);
  return DevelopmentProposalSchema.parse({ schemaVersion: 1, kind: 'fluid-development-proposal',
    basis: { documentRevision: request.documentRevision, runtimeRevision: request.runtimeRevision, dataSha256: workspaceDatasetHash(request.data), moduleCount: request.data.modules.length },
    origin: request.origin, documents: { beforeSha256: sha256(beforeDocument), afterSha256: sha256(afterDocument) },
    sources: { filename: SOURCE_NAME, before: beforeSource, after: afterSource, beforeSha256: sha256(beforeSource), afterSha256: sha256(afterSource) },
    downloadDiff: { filename: 'fluid-authoring.patch', mime: 'text/x-diff', text: diff, sha256: sha256(diff) },
    preflight: { passed: checks.every(check => check.passed), checks, typecheck, conformance: tested, application: 'not-applied', limitations: [
      'No browser, rendered text, GPU, native accessibility or performance qualification.',
      'Origin records supplied provenance; it does not grant model or deploy authority.',
      'The host must recheck live document/runtime revisions, permissions, focus, composition and note preservation immediately before applying.',
      'The proposed file is a declarative document; no new primitive, handler or import is generated.',
    ] },
  });
}
