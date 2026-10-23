import Link from "next/link";
import type { ProduitDisponible } from "@/lib/boutique";
import { formatFcfa } from "@/lib/format";

// Carte d'un remède en vente — page Remèdes, fiche plante, espace vendeur.
// Mène au produit dans sa boutique (ancre #p-<id>).
export function CarteRemede({ remede }: { remede: ProduitDisponible }) {
  const plante = remede.plantes[0]?.nom_scientifique ?? remede.planteLibre;
  return (
    <Link
      href={`/b/${remede.boutique.slug}#p-${remede.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-emerald-300 hover:shadow-sm dark:border-neutral-800/70 dark:bg-neutral-900/60"
    >
      {remede.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={remede.image_url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-emerald-50 text-2xl dark:bg-emerald-950/40" aria-hidden>
          🌿
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">{remede.nom}</p>
        {plante && <p className="mt-0.5 truncate text-xs italic text-neutral-500">{plante}</p>}
        <p className="mt-1 text-sm">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatFcfa(remede.prix)}</span>
          {remede.prixInitial && <span className="ml-1.5 text-xs text-neutral-400 line-through">{formatFcfa(remede.prixInitial)}</span>}
        </p>
        <p className="mt-auto truncate pt-1 text-xs text-neutral-500">
          {remede.boutique.nom}
          {remede.ville && ` · ${remede.ville}`}
        </p>
      </div>
    </Link>
  );
}
