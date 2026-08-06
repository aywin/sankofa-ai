import { ContributeButton } from "@/components/decouverte/ContributeButton";

// §7 du brief : rémunérer le travail de documentation, pas la propriété
// du savoir — et la divulgation graduée (déclaratif → documenté →
// complet) pour que l'entrée en matière reste sans engagement. Le
// formulaire actuel (ContributeModal) est encore une capture simple,
// prévue pour évoluer vers ce modèle à l'étape 6.
export function ContributeSection() {
  return (
    <div className="rounded-2xl border border-neutral-200/70 p-5 text-center dark:border-neutral-800/70">
      <p className="mx-auto max-w-md text-sm text-neutral-600 dark:text-neutral-300">
        Un savoir détenu par quarante personnes n&apos;a pas d&apos;auteur unique — on ne paie pas la propriété
        d&apos;un remède, on reconnaît le travail de le documenter. Tu peux commencer par une seule phrase, sans
        engagement, et préciser plus tard.
      </p>
      <div className="mt-4 flex justify-center">
        <ContributeButton />
      </div>
    </div>
  );
}
