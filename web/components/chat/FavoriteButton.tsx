"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "./icons";
import { addFavorite, loadFavorites, removeFavorite } from "@/lib/favorites";
import { useAuth } from "@/lib/useAuth";

export function FavoriteButton({
  planteNom,
  onChange,
}: {
  planteNom: string;
  onChange?: () => void;
}) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadFavorites(user?.id ?? null).then((favs) => {
      if (!cancelled) setIsFavorite(favs.some((f) => f.planteNom === planteNom));
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, planteNom]);

  const toggle = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (next) await addFavorite(user?.id ?? null, planteNom);
    else await removeFavorite(user?.id ?? null, planteNom);
    onChange?.();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={isFavorite}
      className={`rounded-full p-1 transition ${
        isFavorite
          ? "text-amber-500"
          : "text-neutral-300 hover:text-amber-500 dark:text-neutral-600"
      }`}
    >
      <StarIcon filled={isFavorite} />
    </button>
  );
}
