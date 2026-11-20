import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import nextEnv from '@next/env';
import { AIReviewFrameSchema } from '@fluidkit/contracts';
import { LOCALES } from '@fluidkit/i18n';
import { getConfiguredReview } from '@fluidkit/server';
import { z } from 'zod';

const [flag,source,destination]=process.argv.slice(2);
if(flag!=='--live'||!source||!destination)throw new Error('Usage: --live <approved redacted run.json> <output.json>');
nextEnv.loadEnvConfig(process.cwd());
const run=z.object({frames:z.array(AIReviewFrameSchema).min(1)}).parse(JSON.parse(await readFile(source,'utf8')));
const frame=run.frames[0]!;
if(frame.redaction!=='no-sensitive-parts')throw new Error('Only an approved frame without sensitive parts can be used here.');
const {quote,service}=await getConfiguredReview();
if(quote.provider!=='openai'||quote.reservationMicros>70000)throw new Error('Unqualified provider or budget for this evaluation');
const rows=[];
for(const responseLocale of LOCALES) {
  try {
    const result=await service.review('m11-language-qualification',{schemaVersion:1,id:`m11-${responseLocale}`,storyId:'language-review',approved:true,responseLocale,brief:'Describe one visible component and a concrete improvement for this frame in a short sentence. Retain stable identifiers.',frames:[frame]},new AbortController().signal);
    rows.push({requested:responseLocale,returned:result.provenance.responseLocale,model:result.provenance.resolvedModel,summary:result.output.summary,findings:result.output.findings.length,usage:result.usage,accounting:result.accounting,status:'accepted'});
  } catch {rows.push({requested:responseLocale,status:'no-accepted-result'});process.exitCode=1;}
}
await writeFile(destination,JSON.stringify({schemaVersion:1,at:new Date().toISOString(),inputSha256:createHash('sha256').update(frame.image).digest('hex'),maximumReservationUsd:quote.reservationMicros*LOCALES.length/1e6,rows},null,2)+'\n');
console.info(rows.map(row=>`${row.requested} ${row.status}`).join('\n'));
