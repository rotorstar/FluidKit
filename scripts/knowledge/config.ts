export const BUNDLES = ['engineering', 'public'] as const;
export const ENGINEERING_TOPICS = ['overview','why-fluid','architecture','contracts','core-runtime','rendering','layout-text-input','react-integration','effects','gpu-kernels','data-actions','workspace-case','perspectives','appearance','simulation-cases','user-flows','state-flows','url-routing','studio','rehearsal','ai-review','security','quality-testing','development-cli','performance-lifecycle','release-roadmap','feature-matrix','acceptance-reference','knowledge-maintenance','api-reference','schema-reference','source-map'] as const;
export const PUBLIC_TOPICS = ['start','why-fluid','workspace','sorting-search','views','perspectives','appearance','effects','replay','rehearsal','comparison','ai-analysis','quality','simulations','accessibility','troubleshooting','glossary','privacy','version-status'] as const;
const ROUTE_CONCEPTS:Record<string,string[]>={
  'apps/studio/app/studio/page.tsx':['user-flows','studio'],
  'apps/studio/app/studio/transitions/page.tsx':['effects','studio','quality-testing'],
  'apps/studio/app/api/evidence/route.ts':['quality-testing','security'],
  'apps/studio/app/api/local-project/route.ts':['data-actions','studio','security'],
  'apps/studio/app/page.tsx':['workspace-case','studio'],
  'apps/studio/app/studio/flows/page.tsx':['perspectives','studio','state-flows'],
  'apps/studio/app/studio/rehearsal/page.tsx':['rehearsal','studio'],
  'apps/studio/app/studio/m7/page.tsx':['rehearsal','quality-testing','performance-lifecycle'],
  'apps/studio/app/studio/authoring/page.tsx':['studio','architecture','workspace-case','quality-testing'],
  'apps/studio/app/studio/m8/page.tsx':['studio','quality-testing','release-roadmap'],
  'apps/studio/app/studio/behaviors/page.tsx':['studio','architecture','workspace-case','quality-testing'],
  'apps/studio/app/studio/acceptance/page.tsx':['quality-testing'],
  'apps/studio/app/studio/simulations/[caseId]/page.tsx':['simulation-cases'],
  'apps/studio/app/api/design-review/route.ts':['ai-review','security'],
  'apps/studio/app/api/authoring/route.ts':['studio','contracts','security'],
  'apps/studio/app/api/validate/route.ts':['contracts','security'],
};
export function topicsForSource(path: string): string[] {
  if(path.startsWith('apps/studio/app/')&&/\/(?:page|route)\.tsx?$/.test(path)){
    const topics=ROUTE_CONCEPTS[path.replace('/app/[locale]/','/app/')];if(!topics)throw new Error(`Neue Route benötigt eine Knowledge-Zuordnung und URL-Vertragsreview: ${path}`);
    return ['url-routing',...topics];
  }
  if (path.startsWith('knowledge/editions/')) return ['knowledge-maintenance','url-routing'];
  if (path.includes('theme') || path.includes('appearance')) return ['appearance','contracts','rendering'];
  if (path.includes('flow-explorer') || path.includes('workspace-compare') || path.includes('workspace-atlas')) return ['perspectives','workspace-case','user-flows','url-routing'];
  if (path.startsWith('packages/i18n/')) return ['contracts','react-integration','layout-text-input'];
  if (path.startsWith('packages/contracts/')) return ['contracts','schema-reference'];
  if (path.startsWith('packages/core/src/data')) return ['data-actions'];
  if (path.startsWith('packages/core/')) return ['core-runtime','state-flows'];
  if (path.startsWith('packages/webgpu/')) return ['rendering','layout-text-input','performance-lifecycle'];
  if (path.startsWith('packages/react/')) return ['react-integration','layout-text-input'];
  if (path.startsWith('packages/effects/')) return ['effects'];
  if (path.startsWith('packages/gpu-kernels/')) return ['gpu-kernels'];
  if (path.startsWith('packages/cases/') && (path.includes('simulation')||path.includes('/fixtures/'))) return ['simulation-cases'];
  if (path.startsWith('packages/cases/')) return ['workspace-case','user-flows','url-routing'];
  if (path.startsWith('packages/server/')) return ['ai-review','security'];
  if (path.includes('workspace-intent')) return ['workspace-case','state-flows','quality-testing'];
  if (path.startsWith('packages/intelligence/')) return ['architecture','workspace-case','release-roadmap'];
  if (path.startsWith('packages/testing/')) return ['quality-testing','rehearsal'];
  if (path.startsWith('packages/cli/')) return ['development-cli'];
  if (path.startsWith('packages/')) throw new Error(`Neue Paketgrenze benötigt eine bewusste Knowledge-Zuordnung: ${path}`);
  if (path === 'docs/research/fluid-ui-rationale.md') return ['why-fluid','overview','rendering'];
  if (path === 'docs/research/effect-extension.md' || path === 'docs/milestones/m7-plan.md' || path === 'docs/decisions/m7-scores.json') return ['effects','rehearsal','quality-testing'];
  if (path === 'docs/milestones/m9-plan.md') return ['perspectives','appearance','release-roadmap'];
  if (path.includes('ui-sdk') || path === 'docs/milestones/m8-plan.md') return ['architecture','contracts','core-runtime','studio','release-roadmap'];
  if(path.endsWith('/ai-review-panel.tsx'))return ['ai-review','studio'];
  if(path.endsWith('/lifecycle-proof.tsx'))return ['performance-lifecycle','quality-testing'];
  if(path.endsWith('/read-workspace.ts'))return ['workspace-case'];
  if(path.includes('typegpu'))return ['gpu-kernels','effects'];
  if(path.includes('base-ui'))return ['layout-text-input','studio'];
  if(path.includes('stageshow'))return ['rehearsal','quality-testing'];
  if (path.includes('/app/api/')) return ['ai-review','security'];
  if (path.includes('rehearsal')) return ['rehearsal','studio'];
  if (path.includes('simulation')) return ['simulation-cases','studio'];
  if (path.includes('quality') || path.includes('acceptance')) return ['quality-testing'];
  if (path.includes('/components/effect-')) return ['effects','studio'];
  if (path.includes('studio-showcase')) return ['workspace-case','url-routing','studio'];
  if (path.startsWith('scripts/knowledge/')) return ['knowledge-maintenance'];
  if (path.startsWith('apps/')) return ['studio','architecture'];
  if (path.startsWith('tests/')) return ['quality-testing'];
  if (path.startsWith('docs/')) return ['release-roadmap','quality-testing'];
  return ['development-cli','architecture'];
}
