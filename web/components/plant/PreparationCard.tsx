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

const VOIES: Record<string, string> = {
  orale: "à boire",
  cutanee: "sur la peau",
  bain: "en bain",
  inhalation: "en inhalation",
  gargarisme: "en gargarisme",
  collyre: "dans les yeux",
  autre: "autre",
};

function Ligne({ titre, alerte = false, children }: { titre: string; alerte?: boolean; children: React.ReactNode }) {
  return (
    <div className={alerte ? "text-laterite-800 dark:text-laterite-200" : "text-neutral-600 dark:text-neutral-400"}>
      <dt className="inline font-semibold">{titre} : </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

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
    <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800/70">
      <p className="font-medium text-neutral-800 dark:text-neutral-200">
        {MODE_LABELS[preparation.mode] ?? preparation.mode} · {partie.nom}
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
      {preparation.etapes && (
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-neutral-700 dark:text-neutral-300">
          {preparation.etapes.split(">").map((etape, i) => (
            <li key={i}>{etape.trim()}</li>
          ))}
        </ol>
      )}
      <dl className="mt-2 space-y-1 text-xs">
        {preparation.voie && (
          <Ligne titre="Voie">{VOIES[preparation.voie] ?? preparation.voie}</Ligne>
        )}
        {preparation.mode_usage_rapporte && <Ligne titre="Usage rapporté">{preparation.mode_usage_rapporte}</Ligne>}
        {preparation.public_deconseille && (
          <Ligne titre="Déconseillé" alerte>
            {preparation.public_deconseille}
          </Ligne>
        )}
        {preparation.signes_arret && (
          <Ligne titre="Arrêter et consulter si" alerte>
            {preparation.signes_arret}
          </Ligne>
        )}
      </dl>
      {preparation.precautions_specifiques && (
        <p className="mt-1.5 text-xs font-medium text-laterite-700 dark:text-laterite-300">
          {preparation.precautions_specifiques}
        </p>
      )}
    </div>
  );
}
