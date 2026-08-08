import { computeForceAttestation, forceLabelGrandPublic, qualiteLabelGrandPublic } from "@/lib/synthese";
import type { AttestationStats, GradeTier } from "@/lib/types";

// Vocabulaire grand public (lafi-best.md P2) — remplace le badge fusionné
// à 6 valeurs (ConfidenceBadge historique, puis le premier SyntheseBadge)
// par deux pastilles séparées : "ce que disent les tradipraticiens" et
// "ce que dit la science" répondent à deux questions différentes,
// jamais réduites à un seul mot. Le vocabulaire technique (GRADE,
// "Plausible", statut à 6 valeurs) reste disponible dans le laboratoire
// et le mode expert — pas ici.
const PILL_CLASS = "rounded-full px-2.5 py-1 text-xs font-semibold";

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
  const rienDocumente = force === "non_renseignee" && qualitePreuve === null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {contreIndicationForte ? (
        <span className={`${PILL_CLASS} bg-red-600 text-white`}>Prudence — risque signalé</span>
      ) : force === "contredite" || divergenceNote ? (
        <span className={`${PILL_CLASS} bg-laterite-500 text-white`}>Avis partagés</span>
      ) : rienDocumente ? (
        <span className={`${PILL_CLASS} bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300`}>
          Pas encore documenté
        </span>
      ) : (
        <>
          <span className={`${PILL_CLASS} bg-emerald-600 text-white`}>{forceLabelGrandPublic(force)}</span>
          <span className={`${PILL_CLASS} bg-sky-600 text-white`}>{qualiteLabelGrandPublic(qualitePreuve)}</span>
        </>
      )}
      {!estPilote && (
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          Démonstration — terrain non réalisé
        </span>
      )}
    </div>
  );
}
