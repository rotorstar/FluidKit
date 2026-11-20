import { spawnSync } from 'node:child_process';
import './build-gpu-kernels.mjs';
const packages = ['i18n', 'contracts', 'effects', 'core', 'webgpu', 'react', 'intelligence', 'testing', 'cases', 'server', 'cli'];
for (const name of packages) {
  const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', `packages/${name}/tsconfig.build.json`], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
