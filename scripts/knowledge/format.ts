import { parseDocument } from 'yaml';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { z } from 'zod';

export const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false }).use(footnote);
export const ActorSchema = z.string().regex(/^(?:human:[^\s]+|process:[^\s]+|[^\s/]+\/[^\s]+)$/);
const TimestampSchema = z.iso.datetime({ offset: true });
export const SourceSchema = z.object({ id: z.string().optional(), resource: z.string().min(1), title: z.string().optional(), last_modified: TimestampSchema.optional() }).loose();
const VerificationSchema = z.object({ by: ActorSchema, at: TimestampSchema }).loose();
export const ProfileSchema = z.object({
  type: z.string().trim().min(1), title: z.string().min(1), description: z.string().min(1),
  audience: z.enum(['engineering', 'public']), status: z.enum(['draft', 'stable', 'deprecated']),
  generated: z.object({ by: ActorSchema, at: TimestampSchema }).loose(),
  stale_after: TimestampSchema, sources: z.array(SourceSchema).min(1), tags: z.array(z.string()),
  verified: z.union([VerificationSchema, z.array(VerificationSchema)]).optional(),
  source_files: z.array(z.string()).optional(),
}).loose();
export type Concept = { path: string; metadata: Record<string, unknown>; body: string; reserved: boolean };
export type Finding = { path: string; rule: string; message: string };

export function parseConcept(path: string, source: string): Concept {
  let metadata: Record<string, unknown> = {}, body = source;
  if (source.startsWith('---\n') || source.startsWith('---\r\n')) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
    if (!match) throw new Error('Frontmatter hat keinen Abschluss.');
    const yaml = parseDocument(match[1]!, { uniqueKeys: true });
    if (yaml.errors.length) throw new Error('Ungültiges YAML-Frontmatter.');
    const parsed: unknown = yaml.toJS({ maxAliasCount: 25 });
    metadata = z.record(z.string(), z.unknown()).parse(parsed);
    body = source.slice(match[0].length);
  }
  return { path, metadata, body, reserved: /(^|\/)(index|log)\.md$/.test(path) };
}

/** OKF interoperability is intentionally more permissive than our publishing profile. */
export function okfFindings(doc: Concept): Finding[] {
  const errors: Finding[] = [], fail = (message: string) => errors.push({ path: doc.path, rule: 'okf-0.2', message });
  if (!doc.reserved) {
    if (typeof doc.metadata.type !== 'string' || !doc.metadata.type.trim()) fail('Konzept benötigt einen nichtleeren type.');
  } else if (doc.path.endsWith('index.md')) {
    const keys = Object.keys(doc.metadata);
    if (keys.length && (doc.path !== 'index.md' || keys.some(key => key !== 'okf_version') || doc.metadata.okf_version !== '0.2')) fail('Nur der Bundle-Rootindex darf okf_version: "0.2" als Frontmatter führen.');
    if (!/^#{1,6} .+/m.test(doc.body) || !/^[-*] \[[^\]]+\]\([^)]+\)/m.test(doc.body)) fail('Index benötigt gegliederte Linkeinträge.');
  } else {
    if (Object.keys(doc.metadata).length) fail('log.md besitzt kein Frontmatter.');
    const dates = [...doc.body.matchAll(/^## (.+)$/gm)].map(match => match[1]!);
    if (!dates.length || dates.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date)) fail('Loggruppen benötigen gültige YYYY-MM-DD-Daten.');
    if (dates.some((date, index) => index > 0 && date > dates[index - 1]!)) fail('Loggruppen müssen absteigend sortiert sein.');
  }
  return errors;
}
export function profileFindings(doc: Concept, audience: 'engineering' | 'public', now: number): Finding[] {
  if (doc.reserved) return [];
  const parsed = ProfileSchema.safeParse(doc.metadata), findings: Finding[] = [];
  if (!parsed.success) return [{ path: doc.path, rule: 'fluidkit-profile', message: 'Titel, Beschreibung, Audience, Quellen, Autor und explizite Zeitangaben prüfen.' }];
  if (parsed.data.audience !== audience) findings.push({ path: doc.path, rule: 'audience', message: 'Falsche Audience.' });
  if (Date.parse(parsed.data.stale_after) <= now) findings.push({ path: doc.path, rule: 'freshness', message: 'Konzept muss erneut inhaltlich geprüft werden.' });
  const ids = new Set(parsed.data.sources.flatMap(source => source.id ? [source.id] : []));
  if (ids.size !== parsed.data.sources.filter(source => source.id).length) findings.push({ path: doc.path, rule: 'source-id', message: 'Doppelte Quellen-ID.' });
  const inspectNotes=(tokens:ReturnType<typeof markdown.parse>)=>{for(const token of tokens){
    const labels=token.type==='text'?[...token.content.matchAll(/\[\^([^\]]+)\]/g)].map(match=>match[1]!):[];
    if(token.type==='footnote_ref'){const meta=z.object({label:z.string()}).safeParse(token.meta);if(meta.success)labels.push(meta.data.label);}
    for(const label of labels)if(!ids.has(label))findings.push({path:doc.path,rule:'attribution',message:`Fußnote ohne sources-ID: ${label}`});
    if(token.children)inspectNotes(token.children);
  }};inspectNotes(markdown.parse(doc.body,{}));
  if (audience === 'public' && /(?:\/Users\/|\/private\/|\/tmp\/codex|\.\.\/.*engineering|knowledge\/engineering|sk-(?:proj-)?[A-Za-z0-9_-]{24,})/.test(JSON.stringify(doc.metadata) + doc.body)) findings.push({ path: doc.path, rule: 'public-boundary', message: 'Interner Pfad oder Credentialmuster in Public.' });
  return findings;
}
export function documentLinks(doc: Concept) {
  const result: { target: string; image: boolean; alt: string }[] = [];
  const visit = (tokens: ReturnType<typeof markdown.parse>) => { for (const token of tokens) {
    if (token.type === 'link_open') result.push({ target: String(token.attrGet('href') ?? ''), image: false, alt: '' });
    if (token.type === 'image') result.push({ target: String(token.attrGet('src') ?? ''), image: true, alt: token.content });
    if (token.children) visit(token.children);
  } };
  visit(markdown.parse(doc.body, {})); return result;
}
export function escapeHTML(text: string) { return text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!); }
