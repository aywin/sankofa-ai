import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscoveryData } from "@/lib/decouverte";
import { getLaboratoireData } from "@/lib/laboratoire";
import { LaboratoireCanvas } from "@/components/laboratoire/LaboratoireCanvas";

export const metadata = { title: "Laboratoire — Lafi" };

// Point d'entrée du laboratoire (§5 du brief) : le canvas lui-même, pas
// une liste de liens — on démarre sur un couple par défaut et on change
// de plante/indication directement dans les nœuds 1 et 2.
export default async function LaboratoireIndexPage() {
  const { results } = await getDiscoveryData({});
  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-8">
        <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          🧪 Laboratoire
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun couple documenté pour l&apos;instant.</p>
      </div>
    );
  }

  const parDefaut = results.find((r) => r.taxonSlug === "bissap-oseille-de-guinee") ?? results[0];
  const data = await getLaboratoireData(parDefaut.claimId);
  if (!data) notFound();

  const couples = results.map((r) => ({
    claimId: r.claimId,
    taxonSlug: r.taxonSlug,
    nomPrincipal: r.nomPrincipal,
    indicationId: r.indicationId,
    indicationNom: r.indicationNom,
  }));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        🧪 Laboratoire
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Choisis une plante et une indication dans les deux premiers nœuds, puis lance : le raisonnement complet
        s&apos;affiche nœud par nœud, et le résultat apparaît à droite.
      </p>

      <LaboratoireCanvas initialData={data} couples={couples} />

      <p className="mt-8 border-t border-neutral-200/70 pt-4 text-xs text-neutral-500 dark:border-neutral-800/70 dark:text-neutral-400">
        Autre chose : <Link href="/synergies" className="text-violet-700 hover:underline dark:text-violet-400">explorer des synergies entre deux plantes</Link>{" "}
        (espace expérimental, distinct de ce qui est documenté ici).
      </p>
    </div>
  );
}
