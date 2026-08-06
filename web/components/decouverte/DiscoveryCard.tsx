import Link from "next/link";
import { SyntheseBadge } from "@/components/shared/SyntheseBadge";
import { LeafIcon } from "@/components/chat/icons";
import type { DiscoveryResult } from "@/lib/decouverte";

// Une carte = un claim (plante × indication), jamais une plante avec un
// niveau agrégé — même règle que la fiche plante (§4 du brief : "les
// agréger en un niveau global serait faux"). Pas de bouton panier, pas
// d'étoiles/notes : à la place du prix, le niveau de preuve (§3).
export function DiscoveryCard({ result }: { result: DiscoveryResult }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40">
      <Link href={`/plants/${result.taxonSlug}`} className="block">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <LeafIcon className="h-4 w-4 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{result.nomPrincipal}</span>
          {result.langue && (
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-500">({result.langue})</span>
          )}
        </div>
        <p className="text-xs italic text-neutral-500 dark:text-neutral-400">
          {result.nomScientifique}
          {result.famille ? ` — ${result.famille}` : ""}
        </p>

        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Pour : <span className="font-medium">{result.indicationNom}</span>{" "}
          <span className="text-neutral-500 dark:text-neutral-500">({result.partieNom})</span>
        </p>

        <div className="mt-2">
          <SyntheseBadge
            qualitePreuve={result.qualitePreuveScientifique}
            stats={{
              attestations_count: result.attestationsCount,
              lignees_distinctes: result.lignéesDistinctes,
              regions_distinctes: result.regions.length,
              langues_distinctes: 0,
            }}
            contreIndicationForte={result.contreIndicationForte}
            divergenceNote={null}
            estPilote={result.estPilote}
          />
        </div>
      </Link>

      <Link
        href={`/laboratoire/${result.claimId}`}
        className="mt-2 inline-block text-xs text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Voir le raisonnement →
      </Link>
    </div>
  );
}
