import { getEligibleTaxaForSynergies, getSynergieData } from "@/lib/synergies";
import { SynergiesCanvas } from "@/components/synergies/SynergiesCanvas";

export const metadata = { title: "Synergies — Lafi" };

// Deuxième workflow, volontairement séparé du Laboratoire : celui-ci
// documente du réel (usages attestés), celui-ci explore une hypothèse en
// croisant des profils chimiques déjà en base pour deux plantes. Jamais
// mélangés dans la même page.
export default async function SynergiesPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const taxa = await getEligibleTaxaForSynergies();

  if (taxa.length < 2) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-8">
        <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          🧪 Explorer des synergies
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Pas encore assez de plantes avec un profil chimique documenté (composés + cibles moléculaires) pour en
          croiser deux. Reviens quand la base sera enrichie sur ce point.
        </p>
      </div>
    );
  }

  const taxonAId = taxa.find((t) => t.id === a)?.id ?? taxa[0].id;
  const taxonBId = taxa.find((t) => t.id === b && t.id !== taxonAId)?.id ?? taxa.find((t) => t.id !== taxonAId)!.id;

  const data = await getSynergieData(taxonAId, taxonBId);
  if (!data) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Paire introuvable.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        🧪 Explorer des synergies
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Croise les profils chimiques déjà documentés de deux plantes et regarde ce que Lafi en observe — une piste
        de recherche, jamais un usage attesté.
      </p>

      <SynergiesCanvas initialData={data} taxa={taxa} />
    </div>
  );
}
