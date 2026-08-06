import {
  computeForceAttestation,
  computeSyntheseStatus,
  FORCE_LABELS,
  GRADE_LABELS,
  STATUT_LABELS,
  STATUT_STYLES,
} from "@/lib/synthese";
import type { AttestationStats, GradeTier } from "@/lib/types";

// Remplace components/chat/ConfidenceBadge.tsx (v1-v3, un seul tier).
// Affiche le statut de synthèse ET les deux axes séparés — jamais
// fusionnés en un seul chiffre ou pourcentage (§6 du brief).

export function SyntheseBadge({
  qualitePreuve,
  stats,
  contreIndicationForte,
  divergenceNote,
  estPilote,
}: {
  qualitePreuve: GradeTier | null;
  stats: AttestationStats;
  contreIndicationForte: boolean;
  divergenceNote: string | null;
  estPilote: boolean;
}) {
  const force = computeForceAttestation(stats, !!divergenceNote);
  const statut = computeSyntheseStatus(qualitePreuve, force, contreIndicationForte, divergenceNote);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUT_STYLES[statut]}`}>
        {STATUT_LABELS[statut]}
      </span>
      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Preuve scientifique : {qualitePreuve ? GRADE_LABELS[qualitePreuve] : "non évaluée"} · Attestation
        traditionnelle : {FORCE_LABELS[force]}
      </span>
      {!estPilote && (
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500">
          Démonstration — terrain non réalisé
        </span>
      )}
    </div>
  );
}
