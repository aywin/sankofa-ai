// "Faciliter l'obtention" = information descriptive NON transactionnelle
// (habitat, région, disponibilité) — jamais d'annuaire de tradipraticiens,
// jamais de mise en relation, jamais de bouton d'action. Décision produit
// explicite pour rester dans les garde-fous du brief (§8 : aucun élément
// marchand). N'affiche rien tant que la donnée n'est pas documentée —
// pas de texte générique inventé à la place.
export function HabitatAvailabilityBlock({ habitatRegion }: { habitatRegion: string | null }) {
  if (!habitatRegion) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-4 text-sm text-neutral-700 dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:text-neutral-300">
      <p className="mb-1 font-medium text-neutral-500 dark:text-neutral-400">Habitat et disponibilité</p>
      <p>{habitatRegion}</p>
    </div>
  );
}
