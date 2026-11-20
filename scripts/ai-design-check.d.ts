// Upstream 0.9.0 has no TypeScript declarations. Treat its output as untrusted;
// scripts/design-static.ts validates every finding before it enters our contracts.
declare module '@enmera/ai-design-check' {
  export function check(cwd: string, overrides?: Record<string, unknown>): unknown;
  export function loadConfig(cwd: string): Record<string, unknown>;
  export function loadRules(): unknown;
}
