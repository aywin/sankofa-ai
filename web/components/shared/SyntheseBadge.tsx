import { computeForceAttestation, forceLabelGrandPublic, qualiteLabelGrandPublic } from "@/lib/synthese";
import type { AttestationStats, GradeTier } from "@/lib/types";

// Deux signaux séparés, jamais fusionnés (lafi-best.md P2) : ce que
// rapportent les tradipraticiens, et ce que dit la science. Chacun en
// trois traits + un mot, lisible d'un coup d'œil. Le vocabulaire technique
// (GRADE, statuts) reste dans le laboratoire.

const NIVEAU_SCIENCE: Record<GradeTier, number> = { elevee: 3, moderee: 2, faible: 1, tres_faible: 1 };

function Traits({ niveau }: { niveau: number }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${i === 1 ? "h-1.5" : i === 2 ? "h-2.5" : "h-3.5"} ${
            i <= niveau ? "bg-emerald-600 dark:bg-emerald-400" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        />
      ))}
    </span>
  );
}

function Signal({ titre, niveau, libelle }: { titre: string; niveau: number; libelle: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
      <span className="text-neutral-500">{titre}</span>
      <Traits niveau={niveau} />
      <span className="font-medium text-neutral-800 dark:text-neutral-100">{libelle}</span>
    </span>
  );
}

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
  const niveauTradition = force === "multi_traditions" ? 3 : force === "convergente" ? 2 : force === "tradition_unique" ? 1 : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {contreIndicationForte ? (
        <span className="text-xs font-semibold text-red-700 dark:text-red-400">Usage délicat : demande un avis avant</span>
      ) : force === "contredite" || divergenceNote ? (
        <span className="text-xs font-semibold text-laterite-700 dark:text-laterite-300">Avis partagés entre praticiens</span>
      ) : (
        <>
          {niveauTradition > 0 && <Signal titre="Tradition" niveau={niveauTradition} libelle={forceLabelGrandPublic(force)} />}
          {qualitePreuve && <Signal titre="Science" niveau={NIVEAU_SCIENCE[qualitePreuve]} libelle={qualiteLabelGrandPublic(qualitePreuve)} />}
        </>
      )}
      {!estPilote && <span className="text-xs text-neutral-400">Exemple de démonstration</span>}
    </div>
  );
}
