"use client";

import type { MatchClaimResult } from "@/lib/types";
import { PlantCard } from "./PlantCard";
import { LeafIcon } from "./icons";

// Panneau des plantes proposées par une réponse de Lafi : à droite sur
// ordinateur, en feuille par-dessus le chat sur téléphone. Chaque plante
// mène à sa fiche — le chat ne vend rien, c'est la fiche qui montre les
// remèdes en vente.
export function PanneauPlantes({ usages, onFermer }: { usages: MatchClaimResult[]; onFermer: () => void }) {
  const plantes = new Set(usages.map((u) => u.nom_principal)).size;

  const contenu = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <LeafIcon className="h-4 w-4 text-emerald-600" />
          Sources : {plantes} plante{plantes > 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le panneau"
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {usages.map((u) => (
          <PlantCard key={u.claim_id} usage={u} />
        ))}
        <p className="pt-2 text-xs text-neutral-500">
          Usages traditionnels documentés, pas une prescription. Ouvre une fiche pour les précautions complètes et les
          remèdes disponibles chez des tradipraticiens.
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
