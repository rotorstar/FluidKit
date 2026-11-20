import { formatNumber, getCollator, LocaleSchema, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { compareIds, searchText } from './messages';
import { z } from 'zod';
import { DataSourceSchema, type RuntimeSnapshot } from '@fluidkit/contracts';
import { defineDataAdapter } from '@fluidkit/core/data';
import properties from './fixtures/real-estate.json';
import products from './fixtures/commerce.json';
import stays from './fixtures/travel.json';

const MoneySchema = z.number().int().nonnegative().max(1_000_000_000);
const base = { id: z.string().regex(/^sim-[a-z0-9-]+$/), title: z.string().min(1), city: z.string().min(1), summary: z.string(),
  priceMinor: MoneySchema, currency: z.literal('EUR'), available: z.boolean() };
export const SimulationRecordSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...base, kind: z.literal('property'), district: z.string(), areaM2: z.number().positive(), rooms: z.number().positive(),
    serviceChargeMinor: MoneySchema, depositMinor: MoneySchema, energyClass: z.enum(['A','B','C','D','E','F','G','H']), features: z.array(z.string()) }),
  z.strictObject({ ...base, kind: z.literal('product'), category: z.string(), taxRate: z.number().min(0).max(1), shippingMinor: MoneySchema,
    variants: z.array(z.strictObject({ id: z.string(), label: z.string(), stock: z.number().int().nonnegative(), priceMinor: MoneySchema })).min(1) }),
  z.strictObject({ ...base, kind: z.literal('stay'), checkIn: z.iso.date(), checkOut: z.iso.date(), adults: z.number().int().positive(),
    rating: z.number().min(0).max(5), cancellation: z.string(), taxesIncluded: z.boolean(), quotedAt: z.iso.datetime(), quoteExpiresAt: z.iso.datetime() }),
]);
export const SimulationDatasetSchema = z.strictObject({ schemaVersion: z.literal(1), id: z.enum(['real-estate','commerce','travel']),
  source: DataSourceSchema, records: z.array(SimulationRecordSchema).min(1) }).superRefine((value, ctx) => {
    if (!value.source.simulation || value.source.mode !== 'synthetic') ctx.addIssue({ code: 'custom', message: 'Simulation fixtures require synthetic provenance' });
    if (new Set(value.records.map(item => item.id)).size !== value.records.length) ctx.addIssue({ code: 'custom', message: 'Duplicate record ID' });
    const expected = { 'real-estate': 'property', commerce: 'product', travel: 'stay' }[value.id];
    for (const record of value.records) {
      if (record.kind !== expected) ctx.addIssue({ code: 'custom', message: 'Record does not belong to case' });
      if (record.kind === 'stay' && (record.checkOut <= record.checkIn || Date.parse(record.quoteExpiresAt) <= Date.parse(record.quotedAt))) ctx.addIssue({ code: 'custom', message: 'Invalid stay or quote dates' });
    }
  });
export type SimulationDataset = z.infer<typeof SimulationDatasetSchema>;
export type SimulationRecord = z.infer<typeof SimulationRecordSchema>;
export const SIMULATION_DATASETS = [properties, products, stays].map(value => SimulationDatasetSchema.parse(value));
export const SimulationQuerySchema = z.strictObject({ locale: LocaleSchema.default('de'), search: z.string().max(200).default(''), sort: z.enum(['price-asc','price-desc','name']).default('name'), availableOnly: z.boolean().default(false) });
export function filterSimulationRecords(dataset: SimulationDataset, query: z.infer<typeof SimulationQuerySchema>) {
  const search = searchText(query.search, query.locale);
  const collator = getCollator(query.locale, { sensitivity: 'base', numeric: true });
  return dataset.records.filter(item => (!query.availableOnly || item.available) && searchText(`${item.title} ${item.city} ${item.summary}`, query.locale).includes(search))
    .sort((a,b) => (query.sort === 'name' ? collator.compare(a.title, b.title) : (query.sort === 'price-desc' ? -1 : 1) * (a.priceMinor - b.priceMinor)) || compareIds(a.id,b.id));
}
export function createSimulationAdapter(dataset: SimulationDataset) {
  return defineDataAdapter({ id: dataset.source.id, version: dataset.source.version, query: SimulationQuerySchema,
    data: z.array(SimulationRecordSchema), async read(query, { signal }) {
      signal.throwIfAborted();
      const records = filterSimulationRecords(dataset, query);
      return { schemaVersion: 1, data: records, source: dataset.source };
    } });
}
export const formatSimulationMoney = (value: number, locale: Locale | LocaleContext = 'de', currency: SimulationRecord['currency'] = 'EUR') => formatNumber(locale, value / 100, {style: 'currency', currency});
export function selectedSimulationRecord(dataset: SimulationDataset, snapshot: RuntimeSnapshot) {
  return dataset.records.find(item => item.id === snapshot.fields.selected);
}
