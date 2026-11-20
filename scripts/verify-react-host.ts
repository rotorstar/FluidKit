import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'vite';
import { readWorkspace } from '../apps/studio/lib/read-workspace';

/** Reproducible bounded integration proof, not an npm-registry clean install.
 * node --import tsx scripts/verify-react-host.ts [--serve] [--port=3012]
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(join(tmpdir(), 'fluid-react-host-'));
const assets = join(temporary, 'public');
await mkdir(join(assets, 'fonts'), { recursive: true });
await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
for (const file of ['main.tsx', 'timing.ts']) await cp(join(root, 'scripts/react-host', file), join(temporary, file));
for (const name of ['inter.font.glb', 'noto-sans-jp-subset.font.glb']) await cp(join(root, 'apps/studio/public/fonts', name), join(assets, 'fonts', name));
const data = await readWorkspace(root), serialized = JSON.stringify(data);
await writeFile(join(assets, 'workspace.json'), serialized);
await writeFile(join(assets, 'host-meta.json'), JSON.stringify({ hostId: basename(temporary), dataSha256: createHash('sha256').update(serialized).digest('hex') }));
await writeFile(join(temporary, 'package.json'), JSON.stringify({ name: 'fluid-independent-react-host', version: '1.0.0', private: true, type: 'module',
  dependencies: { react: '19.2.9', 'react-dom': '19.2.9', '@fluidkit/react': '0.2.0-alpha.0', '@fluidkit/cases': '0.2.0-alpha.0', '@fluidkit/core': '0.2.0-alpha.0', '@fluidkit/contracts': '0.2.0-alpha.0' },
  verification: 'Uses the repository lockfile and linked installed dependencies; no registry clean-install claim.',
}, null, 2));
await writeFile(join(temporary, 'index.html'), `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FluidKit React Host</title>
<style>body{margin:0;background:#eef3fa;color:#182d4c;font-family:system-ui,sans-serif}main{max-width:1080px;margin:auto;padding:20px}h1{font-size:25px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}button,select{font:inherit;padding:9px 13px;border-radius:9px;border:1px solid #b8cbe2;background:white;color:#18375e}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #2563eb;outline-offset:3px}.surface-host{width:100%;overflow:hidden;border-radius:16px;background:#0b1520}pre{max-width:100%;overflow:auto}input[type=range]{max-width:60vw}</style></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>`);

const modules = new Set<string>();
const config = { root: temporary, configFile: false as const, envDir: false as const, logLevel: 'warn' as const,
  oxc: { jsx: { runtime: 'automatic' as const } },
  build: { target: 'es2023', outDir: 'dist', sourcemap: false },
  plugins: [{ name: 'fluid-independent-host-import-audit', moduleParsed(info: { id: string }) { modules.add(info.id); } }],
};
await build(config);
const nextModules = [...modules].filter(id => /(?:^|\/)node_modules\/next\//.test(id) || /\/apps\/studio\//.test(id));
if (nextModules.length) throw new Error(`Independent host imports Studio/Next: ${nextModules.join(', ')}`);
const packageSources = [...modules].filter(id => id.startsWith(join(root, 'packages'))).sort();
const sourceHashes = Object.fromEntries(await Promise.all(packageSources.map(async path => [path.slice(root.length + 1), createHash('sha256').update(await readFile(path)).digest('hex')])));
const inputFiles = ['scripts/react-host/main.tsx', 'scripts/react-host/timing.ts', 'scripts/verify-react-host.ts', 'package-lock.json', 'apps/studio/public/fonts/inter.font.glb', 'apps/studio/public/fonts/noto-sans-jp-subset.font.glb'];
const inputHashes = Object.fromEntries(await Promise.all(inputFiles.map(async path => [path, createHash('sha256').update(await readFile(join(root, path))).digest('hex')])));
const outputFiles = await readdir(join(temporary, 'dist'), { recursive: true, withFileTypes: true });
const outputHashes = Object.fromEntries(await Promise.all(outputFiles.filter(entry => entry.isFile()).map(async entry => {
  const path = join(entry.parentPath, entry.name);
  return [path.slice(join(temporary, 'dist').length + 1), createHash('sha256').update(await readFile(path)).digest('hex')];
})));
const report = { schemaVersion: 1, createdAt: new Date().toISOString(), result: 'build-passed', temporary, datasetSha256: createHash('sha256').update(serialized).digest('hex'),
  dataset: { name: data.name, modules: data.modules.length }, toolchain: { vite: JSON.parse(await readFile(join(root, 'node_modules/vite/package.json'), 'utf8')).version },
  browserGraph: { modules: modules.size, nextModules, publicEntries: ['@fluidkit/react', '@fluidkit/core', '@fluidkit/contracts', '@fluidkit/cases'], packageSources: sourceHashes },
  inputHashes, outputHashes,
  scope: 'Production Vite/React bundle from public package exports and actual workspace data. Workspace-linked pinned dependencies; not a registry installation, browser/GPU test or performance result.',
};
await writeFile(join(temporary, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ result: report.result, host: temporary, report: join(temporary, 'verification.json'), browserModules: modules.size, nextModules: nextModules.length }, null, 2));
if (process.argv.includes('--serve')) {
  const supplied = process.argv.find(value => value.startsWith('--port='));
  const port = supplied ? Number(supplied.slice(7)) : 3012;
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid host port');
  const server = await preview({ ...config, preview: { host: '127.0.0.1', port, strictPort: true } });
  server.printUrls();
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { server.httpServer.close(() => process.exit(0)); });
}
