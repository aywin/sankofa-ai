import Link from "next/link";
import { SyntheseBadge } from "@/components/shared/SyntheseBadge";
import { PreparationCard } from "./PreparationCard";
import { AttestationSection } from "./AttestationSection";
import type { ClaimDetail } from "@/lib/taxon";

const ETUDE_TYPE_LABELS: Record<string, string> = {
  preclinique_in_vitro: "préclinique (in vitro)",
  preclinique_animal: "préclinique (animal)",
  essai_clinique_humain: "essai clinique humain",
  revue_systematique: "revue systématique",
  revue_narrative: "revue narrative",
  etude_experimentale_humaine: "étude expérimentale humaine",
  autre: "étude",
};

// Une ligne par indication, chacune avec son propre statut de synthèse —
// jamais agrégées en un niveau global par plante (§4 du brief).
export function IndicationsList({ taxonSlug, claims }: { taxonSlug: string; claims: ClaimDetail[] }) {
  if (claims.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Aucun usage documenté pour cette plante à ce jour.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div
          key={claim.id}
          className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/40"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{claim.indication.nom}</span>
            <Link
              href={`/chat?contexte=${taxonSlug}:${claim.indication.id}`}
              className="text-xs text-emerald-700 hover:underline dark:text-emerald-400"
            >
              En discuter avec Lafi →
            </Link>
          </div>

          <div className="mt-2">
            <SyntheseBadge
              qualitePreuve={claim.qualite_preuve_scientifique}
              stats={claim.stats}
              contreIndicationForte={claim.contre_indication_forte}
              divergenceNote={claim.divergence_note}
              estPilote={claim.est_pilote}
            />
          </div>

          <div className="mt-3">
            <PreparationCard partie={claim.partie} preparation={claim.preparation} />
          </div>

          <div className="mt-3">
            <AttestationSection stats={claim.stats} attestations={claim.attestations} estPilote={claim.est_pilote} />
          </div>

          {claim.etudes.length > 0 && (
            <ul className="mt-3 space-y-0.5 border-t border-neutral-200/70 pt-2 text-xs text-neutral-500 dark:border-neutral-800/70 dark:text-neutral-400">
              {claim.etudes.map((etude) => (
                <li key={etude.id}>
                  {etude.url ? (
                    <a href={etude.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                      {etude.titre}
                    </a>
                  ) : (
                    etude.titre
                  )}{" "}
                  — {ETUDE_TYPE_LABELS[etude.type] ?? etude.type}
                  {etude.annee ? ` (${etude.annee})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
