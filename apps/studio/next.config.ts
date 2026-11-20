import type { QualityReport } from '@fluidkit/contracts';
import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_SERVER } from 'next/constants';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const config: NextConfig = {
  generateBuildId: async () => {
    const report = JSON.parse(await readFile(join(process.cwd(), 'generated/design-static.json'), 'utf8')) as QualityReport;
    return report.context.buildId;
  },
  transpilePackages: ['@fluidkit/i18n', '@fluidkit/contracts', '@fluidkit/core', '@fluidkit/webgpu', '@fluidkit/react', '@fluidkit/testing', '@fluidkit/intelligence', '@fluidkit/cases', '@fluidkit/server'],
};
export default function nextConfig(phase: string): NextConfig {
  // This workspace keeps its approved local secrets in the project root.
  // Load only when running the server, never through Next's client `env` option.
  // Next has already initialized @next/env for apps/studio. Force a reload for
  // the distinct workspace root, otherwise the loader returns that cached result.
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER) loadEnvConfig(join(process.cwd(), '../..'), phase === PHASE_DEVELOPMENT_SERVER, console, true);
  return config;
}
