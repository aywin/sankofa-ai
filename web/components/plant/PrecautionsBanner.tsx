// Extrait en composant réutilisable (fiche plante + futures pages
// découverte/laboratoire) : toujours affiché, jamais dans un accordéon —
// pour un produit de santé, une information de sécurité ne doit jamais
// nécessiter un clic supplémentaire.
export function PrecautionsBanner({ precautions }: { precautions: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p className="mb-1 font-medium">Précautions</p>
      <p>{precautions}</p>
    </div>
  );
}
