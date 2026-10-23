"use client";

import { useEffect, useState } from "react";
import type { ProduitDisponible } from "@/lib/boutique";
import { CarteRemede } from "./CarteRemede";

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
          <CarteRemede key={p.id} remede={p} />
        ))}
      </div>
    </section>
  );
}
