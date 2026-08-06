import Link from "next/link";
import { notFound } from "next/navigation";
import { getLaboratoireData } from "@/lib/laboratoire";
import { LaboratoirePipeline } from "@/components/laboratoire/LaboratoirePipeline";

export const metadata = { title: "Laboratoire — Lafi" };

export default async function LaboratoirePage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const data = await getLaboratoireData(claimId);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <Link
        href="/laboratoire"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Choisir un autre couple
      </Link>

      <h1 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {data.nomPrincipal} × {data.indication.nom}
      </h1>
      {!data.estPilote && (
        <p className="mb-4 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          Couple issu du corpus documentaire initial — pas encore enrichi avec de vraies données de terrain ni une
          évaluation de la qualité de preuve.
        </p>
      )}

      <LaboratoirePipeline data={data} />
    </div>
  );
}
