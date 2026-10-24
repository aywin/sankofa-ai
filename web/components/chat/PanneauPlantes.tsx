"use client";

import type { MatchClaimResult } from "@/lib/types";
import { PlantCard } from "./PlantCard";

// Panneau des plantes proposées par une réponse de Lafi : à droite sur
// ordinateur, en feuille par-dessus le chat sur téléphone. Chaque plante
// mène à sa fiche — le chat ne vend rien, c'est la fiche qui montre les
// remèdes en vente.
export function PanneauPlantes({ usages, onFermer }: { usages: MatchClaimResult[]; onFermer: () => void }) {
  const plantes = new Set(usages.map((u) => u.nom_principal)).size;

  const contenu = (
    <>
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
          Sources <span className="font-normal text-neutral-500">· {plantes} plante{plantes > 1 ? "s" : ""}</span>
        </p>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le panneau"
          className="rounded-full p-1.5 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pt-2 pb-4">
        {usages.map((u) => (
          <PlantCard key={u.claim_id} usage={u} />
        ))}
        <p className="px-1 pt-1 text-[13px] leading-relaxed text-neutral-500">
          Des usages transmis, pas une ordonnance. Chaque fiche donne les précautions complètes.
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside
        aria-label="Sources de la réponse"
        className="hidden w-[380px] shrink-0 flex-col border-l border-neutral-200 bg-sand-50 lg:flex dark:border-neutral-800/70 dark:bg-sand-950"
      >
        {contenu}
      </aside>
      <div className="fixed inset-0 z-40 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Sources de la réponse">
        <button type="button" aria-label="Fermer" onClick={onFermer} className="absolute inset-0 bg-black/30" />
        <div className="relative flex max-h-[80dvh] w-full flex-col rounded-t-3xl bg-sand-50 shadow-xl dark:bg-sand-950">{contenu}</div>
      </div>
    </>
  );
}
