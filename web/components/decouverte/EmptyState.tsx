import Link from "next/link";
import { ContributeButton } from "./ContributeButton";
import type { FilterOption } from "@/lib/decouverte";

// Un résultat vide est une redirection, pas un message (§3 du brief) :
// jamais laisser croire qu'aucune plante ne traite le mal cherché — on
// propose les indications réellement couvertes et une passerelle vers la
// contribution.
export function EmptyState({ suggestions }: { suggestions: FilterOption[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/60 p-6 text-center dark:border-neutral-800/70 dark:bg-neutral-900/40">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Aucun résultat pour cette combinaison de filtres — ça ne veut pas dire qu&apos;il n&apos;existe rien,
        seulement que ce croisement précis n&apos;est pas encore documenté chez Lafi.
      </p>

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            Indications couvertes actuellement
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {suggestions.map((s) => (
              <Link
                key={s.value}
                href={`/decouverte?indication=${s.value}`}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-800 dark:hover:text-emerald-400"
              >
                {s.label} ({s.count})
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <ContributeButton />
      </div>
    </div>
  );
}
