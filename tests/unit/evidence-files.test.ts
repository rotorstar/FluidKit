import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { contentHash } from '../../packages/server/src/local-project';
import { readAcceptanceEvidence } from '../../packages/server/src/evidence-files';
const roots: string[] = [];
function fixture(path = 'docs/qa/proof.json') {
  const root = mkdtempSync(join(tmpdir(), 'fluid-evidence-test-')); roots.push(root);
  mkdirSync(join(root, 'docs/acceptance'), { recursive: true }); mkdirSync(join(root, 'docs/qa'), { recursive: true });
  writeFileSync(join(root, 'docs/qa/proof.json'), '{"result":"inconclusive"}');
  writeFileSync(join(root, 'docs/acceptance/ledger.json'), JSON.stringify({ schemaVersion: 1, updatedAt: '2026-11-20', criteria: [{ id: 'T99-AC01', task: 'T99', source: 'test', sourceHash: 'a'.repeat(64), criterion: 'Fixture', status: 'partial', scope: 'Explicit test only', remaining: 'Native verification', evidence: [{ path, kind: 'artifact', sha256: contentHash('{"result":"inconclusive"}') }] }] })); return root;
}
afterEach(() => { roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })); });
it('downloads only ledger references and keeps their original bytes and digest', async () => { const root = fixture(); const result = await readAcceptanceEvidence(root, 'T99-AC01', 0); expect(result.bytes.toString()).toBe('{"result":"inconclusive"}'); expect(result.sha256).toBe(contentHash(result.bytes.toString())); await expect(readAcceptanceEvidence(root, 'T99-AC01', 1)).rejects.toThrow('Register'); });
it('rejects changed evidence rather than attaching its historical hash to new bytes', async () => { const root = fixture(); writeFileSync(join(root, 'docs/qa/proof.json'), '{"result":"passed"}'); await expect(readAcceptanceEvidence(root, 'T99-AC01', 0)).rejects.toThrow('geändert'); });
it('rejects traversal and symlink targets even when registered locally', async () => { const root = fixture('../../outside.json'); await expect(readAcceptanceEvidence(root, 'T99-AC01', 0)).rejects.toThrow('freigegeben'); const other = fixture('docs/qa/link.json'); symlinkSync(join(root, 'docs/qa/proof.json'), join(other, 'docs/qa/link.json')); await expect(readAcceptanceEvidence(other, 'T99-AC01', 0)).rejects.toThrow('freigegeben'); });
