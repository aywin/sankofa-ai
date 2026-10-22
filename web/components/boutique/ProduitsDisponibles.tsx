"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProduitDisponible } from "@/lib/boutique";
import { formatFcfa } from "@/lib/format";

// Ce qui se vend déjà sur Lafi (toutes boutiques) — montré à qui n'a pas
// encore de boutique.
export function ProduitsDisponibles() {
  const [produits, setProduits] = useState<ProduitDisponible[] | null>(null);

  useEffect(() => {
    fetch("/api/boutique/produits")
      .then((r) => r.json())
      .then((d: { produits?: ProduitDisponible[] }) => setProduits(d.produits ?? []))
      .catch(() => setProduits([]));
  }, []);

  if (!produits || produits.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Déjà disponible sur Lafi</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {produits.map((p) => (
          <Link
            key={p.id}
            href={`/b/${p.boutique.slug}`}
            className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white transition hover:border-emerald-300 dark:border-neutral-800/70 dark:bg-neutral-900/60"
          >
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-emerald-50 text-2xl dark:bg-emerald-950/40" aria-hidden>
                🌿
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-medium">{p.nom}</p>
              <p className="text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatFcfa(p.prix)}</span>
                {p.prixInitial && <span className="ml-1.5 text-xs text-neutral-400 line-through">{formatFcfa(p.prixInitial)}</span>}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {p.boutique.nom}
                {p.boutique.ville && ` · ${p.boutique.ville}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
