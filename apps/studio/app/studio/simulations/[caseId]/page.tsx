import { notFound } from 'next/navigation';
import { SIMULATION_DATASETS, createSimulationAdapter } from '@fluidkit/cases';
import { QualityReportSchema } from '@fluidkit/contracts';
import { SimulationShowcase } from '../../../../components/simulation-showcase';
import designReport from '../../../../generated/design-static.json';

export default async function SimulationPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const dataset = SIMULATION_DATASETS.find(item => item.id === caseId);
  if (!dataset) notFound();
  // Local simulation adapter, validated through exactly the same result contract.
  const result = await createSimulationAdapter(dataset).read({}, new AbortController().signal);
  return <SimulationShowcase dataset={{ ...dataset, records: result.data }} staticReport={QualityReportSchema.parse(designReport)} />;
}
