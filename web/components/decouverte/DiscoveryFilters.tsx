import Link from "next/link";
import type { DiscoveryData, DiscoveryFilters as Filters } from "@/lib/decouverte";

// Formulaire GET pur, pas de JS nécessaire — cohérent avec la pagination
// de web/app/plants/page.tsx. Tri par défaut = niveau de preuve, jamais
// popularité (§3 du brief) : pas de sélecteur de tri exposé, exprès.
export function DiscoveryFilters({ options, current }: { options: DiscoveryData["options"]; current: Filters }) {
  const hasActiveFilters = !!(current.indicationId || current.partieNom || current.qualite || current.region);
  const selectClass =
    "rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

  return (
    <form method="get" className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="indication" className="text-xs text-neutral-500 dark:text-neutral-400">
          Mal ou indication
        </label>
        <select id="indication" name="indication" defaultValue={current.indicationId ?? ""} className={selectClass}>
          <option value="">Toutes</option>
          {options.indications.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.count})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="partie" className="text-xs text-neutral-500 dark:text-neutral-400">
          Partie utilisée
        </label>
        <select id="partie" name="partie" defaultValue={current.partieNom ?? ""} className={selectClass}>
          <option value="">Toutes</option>
          {options.parties.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.count})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="qualite" className="text-xs text-neutral-500 dark:text-neutral-400">
          Qualité de preuve scientifique
        </label>
        <select id="qualite" name="qualite" defaultValue={current.qualite ?? ""} className={selectClass}>
          <option value="">Toutes</option>
          {options.qualites.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.count})
            </option>
          ))}
        </select>
      </div>

      {options.regions.length > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="region" className="text-xs text-neutral-500 dark:text-neutral-400">
            Région d&apos;attestation
          </label>
          <select id="region" name="region" defaultValue={current.region ?? ""} className={selectClass}>
            <option value="">Toutes</option>
            {options.regions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} ({o.count})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Filtrer
      </button>
      {hasActiveFilters && (
        <Link
          href="/decouverte"
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          Réinitialiser
        </Link>
      )}
    </form>
  );
}
