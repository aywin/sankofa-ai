"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadFavorites, removeFavorite, type FavoritePlant } from "@/lib/favorites";
import { slugify } from "@/lib/slug";
import { useEspace } from "./Espace";

// Onglet "Mes plantes" : les plantes gardées depuis le chat ou les fiches.
export function MesPlantes() {
  const { user } = useEspace();
  const [plantes, setPlantes] = useState<FavoritePlant[] | null>(null);

  useEffect(() => {
    loadFavorites(user.id).then(setPlantes);
  }, [user.id]);

  const retirer = async (nom: string) => {
    await removeFavorite(user.id, nom);
    setPlantes((p) => p?.filter((x) => x.planteNom !== nom) ?? null);
  };

  if (!plantes) return <p className="text-sm text-neutral-500">Chargement…</p>;
  if (plantes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
        Aucune plante gardée pour l&apos;instant. Dans le chat ou sur une fiche, touche ☆ pour garder une plante ici.
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/chat" className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            Parler à Lafi
          </Link>
          <Link href="/decouverte" className="rounded-xl border border-neutral-300 px-4 py-2 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900">
            Découvrir les plantes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {plantes.map((p) => (
        <li key={p.planteNom} className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800/70 dark:bg-neutral-900/60">
          <Link href={`/plants/${slugify(p.planteNom)}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
            🌿 {p.planteNom}
          </Link>
          <button type="button" onClick={() => retirer(p.planteNom)} className="text-xs text-neutral-500 hover:text-red-600 hover:underline">
            Retirer
          </button>
        </li>
      ))}
    </ul>
  );
}
