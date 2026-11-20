import { defineConfig } from 'vitest/config';
export default defineConfig({
  // Next preserves JSX for its compiler; component regressions need Vite's JSX transform.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['packages/core/src/**', 'packages/contracts/src/**', 'packages/intelligence/src/**', 'packages/testing/src/**', 'packages/server/src/**'], reporter: ['text', 'json-summary'] },
  },
});
