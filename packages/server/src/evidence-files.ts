import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, sep, basename } from 'node:path';
import { AcceptanceLedgerSchema } from '@fluidkit/contracts';
import { contentHash } from './local-project';
import { ReviewError } from './review-policy';
/** Only references named by the current ledger can be downloaded. */
export async function readAcceptanceEvidence(root: string, criterionId: string, index: number) {
  const canonical = await realpath(root);
  const ledger = AcceptanceLedgerSchema.parse(JSON.parse(await readFile(resolve(canonical, 'docs/acceptance/ledger.json'), 'utf8')));
  const item = ledger.criteria.find(item => item.id === criterionId)?.evidence[index];
  if (!item) throw new ReviewError('Nachweis nicht im AC-Register vorhanden.', 404);
  const path = resolve(canonical, item.path);
  if (!path.startsWith(`${canonical}${sep}`) || await realpath(path) !== path) throw new ReviewError('Nachweispfad ist nicht freigegeben.', 403);
  const info = await stat(path);
  if (!info.isFile() || info.size > 128 * 1024 * 1024) throw new ReviewError('Nachweis ist keine begrenzte Datei.', 413);
  const bytes = await readFile(path);
  const actual = (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex');
  if (actual !== item.sha256) throw new ReviewError('Die Datei wurde seit dem Nachweis geändert. Der Register-Hash passt nicht zum aktuellen Stand.', 409);
  return { bytes, filename: basename(path).replace(/[^a-zA-Z0-9._-]/g, '_'), sha256: actual, ledgerHash: contentHash(JSON.stringify(ledger)) };
}
