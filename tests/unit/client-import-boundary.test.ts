import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? sources(join(directory, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(directory, entry.name)] : []);
}

it('keeps all first-party client import paths outside provider, Node and environment secret code', () => {
  const root = process.cwd(), files = sources(join(root, 'apps/studio/components'));
  const queue = [resolve('packages/core/src/index.ts'), resolve('packages/react/src/index.tsx'),
    ...files.filter(file => /^['"]use client['"];?/m.test(readFileSync(file, 'utf8')))];
  const options: ts.CompilerOptions = { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX };
  const visited = new Set<string>(), violations: string[] = [];
  while (queue.length) {
    const file = realpathSync(queue.pop()!);
    if (visited.has(file) || !/\.tsx?$/.test(file)) continue;
    visited.add(file);
    const text = readFileSync(file, 'utf8'), path = relative(root, file);
    if (/process\s*\.\s*env|dangerouslyAllowBrowser/.test(text)) violations.push(`${path}: client environment access`);
    for (const item of ts.preProcessFile(text, true, true).importedFiles) {
      if (/^(?:@fluidkit\/server(?:\/|$)|@ai-sdk\/|ai$|openai(?:\/|$)|node:)/.test(item.fileName)) violations.push(`${path}: ${item.fileName}`);
      const target = ts.resolveModuleName(item.fileName, file, options, ts.sys).resolvedModule?.resolvedFileName;
      if (!target) continue;
      const resolved = realpathSync(target);
      if (resolved.startsWith(`${root}/`) && !relative(root, resolved).startsWith('node_modules/')) queue.push(resolved);
    }
  }
  expect(visited.size).toBeGreaterThan(20);
  expect(violations).toEqual([]);
});
