import { describeAttestationStats } from "@/lib/synthese";
import type { ClaimDetail } from "@/lib/taxon";

const DIVULGATION_LABELS: Record<string, string> = {
  declaratif: "déclaratif",
  documente: "documenté",
  complet: "complet",
};

// Nombre d'attestations, nombre de traditions indépendantes, régions,
// langues (§4 du brief). Les contributeurs qui acceptent d'être cités le
// sont nommément — c'est ce bloc qui rend l'attribution réelle plutôt que
// déclarative.
export function AttestationSection({
  stats,
  attestations,
  estPilote,
}: {
  stats: ClaimDetail["stats"];
  attestations: ClaimDetail["attestations"];
  estPilote: boolean;
}) {
  const description = describeAttestationStats(stats);

  return (
    <div className="text-xs text-neutral-500 dark:text-neutral-400">
      <p>{description || "Aucune attestation traditionnelle enregistrée pour l'instant."}</p>
      {attestations.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {attestations.map((a) => (
            <li key={a.id}>
              {[a.region, a.langue].filter(Boolean).join(", ") || "Origine non précisée"} —{" "}
              {DIVULGATION_LABELS[a.niveau_divulgation]}
              {a.contributeur?.preference_attribution === "nommement" && a.contributeur.nom_affichage
                ? ` — ${a.contributeur.nom_affichage}`
                : ""}
            </li>
          ))}
        </ul>
      )}
      {!estPilote && (
        <p className="mt-1 italic">
          Corpus documentaire initial — pas encore de vraie collecte de terrain sur ce couple.
        </p>
      )}
    </div>
  );
}
