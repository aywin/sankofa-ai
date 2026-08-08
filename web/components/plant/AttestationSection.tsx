import { SourceCard } from "@/components/shared/SourceCard";
import type { ClaimDetail } from "@/lib/taxon";

// L'attribution comme bloc visuel de plein droit (lafi-best.md P6), pas
// une ligne de métadonnée grise en bas de fiche : une entrée par
// attestation, chacune formulée comme une source qu'on peut vérifier ou
// resituer plutôt que comme une fiche technique.
export function AttestationSection({
  stats,
  attestations,
  estPilote,
}: {
  stats: ClaimDetail["stats"];
  attestations: ClaimDetail["attestations"];
  estPilote: boolean;
}) {
  const traditions = stats.lignees_distinctes;

  return (
    <div>
      {stats.attestations_count > 0 ? (
        <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-300">
          <span className="font-medium">
            {traditions} tradition{traditions > 1 ? "s" : ""} indépendante{traditions > 1 ? "s" : ""}
          </span>{" "}
          — comptée sur des lignées d&apos;apprentissage distinctes, pas sur le nombre de fois où l&apos;usage a été
          rapporté : dix personnes formées par le même maître comptent pour une seule tradition.
        </p>
      ) : (
        <p className="mb-2 text-xs italic text-neutral-500 dark:text-neutral-400">
          Aucune attestation traditionnelle comptée pour l&apos;instant — la collecte de terrain n&apos;a pas encore
          eu lieu sur ce couple.
        </p>
      )}

      {attestations.length > 0 && (
        <div className="space-y-2">
          {attestations.map((a) =>
            a.source_savoir ? (
              <SourceCard
                key={a.id}
                source={a.source_savoir}
                variant="large"
                contexte={{ region: a.region, langue: a.langue }}
              />
            ) : (
              <p key={a.id} className="text-xs text-neutral-500 dark:text-neutral-400">
                {[a.region, a.langue].filter(Boolean).join(", ") || "Origine non précisée"}
              </p>
            )
          )}
        </div>
      )}

      {!estPilote && (
        <p className="mt-2 text-xs italic text-neutral-500 dark:text-neutral-400">
          Corpus documentaire initial — pas encore de vraie collecte de terrain sur ce couple.
        </p>
      )}
    </div>
  );
}
