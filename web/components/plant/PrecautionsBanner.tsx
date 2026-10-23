// Extrait en composant réutilisable (fiche plante + futures pages
// découverte/laboratoire) : toujours affiché, jamais dans un accordéon —
// pour un produit de santé, une information de sécurité ne doit jamais
// nécessiter un clic supplémentaire.
export function PrecautionsBanner({ precautions }: { precautions: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-laterite-200 bg-laterite-50 p-4 text-laterite-900 dark:border-laterite-800 dark:bg-laterite-950 dark:text-laterite-100">
      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-laterite-500 text-xs font-bold text-white">
        !
      </span>
      <div>
        <p className="font-semibold">Précautions</p>
        <p className="mt-0.5">{precautions}</p>
      </div>
    </div>
  );
}
