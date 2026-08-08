import Link from "next/link";
import { notFound } from "next/navigation";
import { getLaboratoireData } from "@/lib/laboratoire";
import { getDiscoveryData } from "@/lib/decouverte";
import { obtenirExecution } from "@/lib/laboratoireAnalyse";
import { LaboratoireCanvas } from "@/components/laboratoire/LaboratoireCanvas";

export const metadata = { title: "Laboratoire — Lafi" };

export default async function LaboratoirePage({
  params,
  searchParams,
}: {
  params: Promise<{ claimId: string }>;
  searchParams: Promise<{ execution?: string }>;
}) {
  const { claimId } = await params;
  const { execution: executionId } = await searchParams;

  const [data, { results }] = await Promise.all([getLaboratoireData(claimId), getDiscoveryData({})]);
  if (!data) notFound();

  const couples = results.map((r) => ({
    claimId: r.claimId,
    taxonSlug: r.taxonSlug,
    nomPrincipal: r.nomPrincipal,
    indicationId: r.indicationId,
    indicationNom: r.indicationNom,
  }));

  let resultatInitial = null;
  if (executionId) {
    const execution = await obtenirExecution(executionId);
    if (execution && execution.claim_id === claimId) {
      resultatInitial = {
        texte: execution.synthese_texte as string,
        origine: execution.synthese_origine as string,
        executionId: execution.id as string,
      };
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <Link
        href="/laboratoire"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Choisir un autre couple
      </Link>

      <h1 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {data.nomPrincipal} × {data.indication.nom}
      </h1>

      <LaboratoireCanvas initialData={data} couples={couples} resultatInitial={resultatInitial} />
    </div>
  );
}
