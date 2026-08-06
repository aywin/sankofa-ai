import Link from "next/link";
import { getDiscoveryData } from "@/lib/decouverte";
import { LeafIcon } from "@/components/chat/icons";

export const metadata = { title: "Laboratoire — Lafi" };

// Point d'entrée du laboratoire (§5 du brief) quand on n'arrive pas déjà
// avec un couple précis en tête (depuis une fiche plante ou la page
// découverte, qui pointent directement vers /laboratoire/[claimId]).
export default async function LaboratoireIndexPage() {
  const { results } = await getDiscoveryData({});
  const sorted = [...results].sort((a, b) => a.nomPrincipal.localeCompare(b.nomPrincipal, "fr"));

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        🧪 Laboratoire
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Choisis un couple plante × indication pour voir le raisonnement complet, nœud par nœud — d&apos;où vient
        chaque donnée, et comment on arrive au statut final.
      </p>

      <div className="space-y-1.5">
        {sorted.map((r) => (
          <Link
            key={r.claimId}
            href={`/laboratoire/${r.claimId}`}
            className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/70 px-3 py-2 text-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800/70 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
          >
            <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
              <LeafIcon className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              {r.nomPrincipal} <span className="text-neutral-400 dark:text-neutral-500">× {r.indicationNom}</span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">Lancer →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
