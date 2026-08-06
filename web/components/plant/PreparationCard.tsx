import type { ClaimDetail } from "@/lib/taxon";

const MODE_LABELS: Record<string, string> = {
  decoction: "Décoction",
  infusion: "Infusion",
  maceration: "Macération",
  poudre: "Poudre",
  cataplasme: "Cataplasme",
  application_directe: "Application directe",
  autre: "Autre préparation",
};

// C'est le bloc le plus différenciant (§4 du brief) : l'écart entre savoir
// traditionnel et pharmacologie n'est pas "quelle plante" mais "quelle
// préparation délivre quelle dose". On documente une pratique observée —
// jamais de posologie ni de quantité à l'impératif, et le modèle de
// données ne porte volontairement aucun champ de dosage.
export function PreparationCard({
  partie,
  preparation,
}: {
  partie: ClaimDetail["partie"];
  preparation: ClaimDetail["preparation"];
}) {
  return (
    <div className="rounded-xl border border-neutral-200/70 p-3 text-sm dark:border-neutral-800/70">
      <p className="font-medium text-neutral-800 dark:text-neutral-200">
        {MODE_LABELS[preparation.mode] ?? preparation.mode} — {partie.nom}
      </p>
      {preparation.description_libre && (
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{preparation.description_libre}</p>
      )}
      <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-500">
        {preparation.solvant && (
          <div>
            <dt className="inline font-medium">Solvant : </dt>
            <dd className="inline">{preparation.solvant}</dd>
          </div>
        )}
        {preparation.duree && (
          <div>
            <dt className="inline font-medium">Durée : </dt>
            <dd className="inline">{preparation.duree}</dd>
          </div>
        )}
        {preparation.temperature && (
          <div>
            <dt className="inline font-medium">Température : </dt>
            <dd className="inline">{preparation.temperature}</dd>
          </div>
        )}
      </dl>
      {preparation.precautions_specifiques && (
        <p className="mt-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          {preparation.precautions_specifiques}
        </p>
      )}
    </div>
  );
}
