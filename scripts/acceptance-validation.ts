import { AcceptanceLedgerSchema } from '../packages/contracts/src/acceptance';
import { sourceHash, type acceptanceSources } from './acceptance-source';

export async function validateAcceptanceLedger(input: unknown, sources: Awaited<ReturnType<typeof acceptanceSources>>, readEvidence: (path: string) => Promise<string | Uint8Array>) {
  const ledger = AcceptanceLedgerSchema.parse(input);
  if (ledger.criteria.length !== sources.size) throw new Error(`AC coverage drift: ${ledger.criteria.length} entries for ${sources.size} canonical criteria`);
  for (const item of ledger.criteria) {
    const source = sources.get(item.id);
    if (!source || item.sourceHash !== source.sourceHash || item.criterion !== source.criterion || item.source !== source.source) throw new Error(`Canonical AC changed: ${item.id}`);
    for (const evidence of item.evidence) {
      if (evidence.path.startsWith('/') || evidence.path.split('/').some(part => part === '..' || part.startsWith('.env'))) throw new Error(`Unsafe evidence path: ${item.id}`);
      if (sourceHash(await readEvidence(evidence.path)) !== evidence.sha256) throw new Error(`Evidence changed: ${item.id} / ${evidence.path}; review and rerun its check before updating the checksum`);
    }
  }
  return ledger;
}
