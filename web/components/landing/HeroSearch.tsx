"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// Un seul champ, bascule plante/mal (§9 du brief). Les deux modes
// atterrissent sur le chat : c'est déjà lui qui sait chercher par
// symptôme (recherche sémantique) et par nom de plante
// (obtenir_details_plante) — pas besoin d'un deuxième moteur de
// recherche en parallèle, juste d'une porte d'entrée différente.
export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<"mal" | "plante">("mal");
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-2 sm:flex-row">
      <div className="flex rounded-xl border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setMode("mal")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
            mode === "mal"
              ? "bg-emerald-600 text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
          }`}
        >
          Un mal
        </button>
        <button
          type="button"
          onClick={() => setMode("plante")}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
            mode === "plante"
              ? "bg-emerald-600 text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
          }`}
        >
          Une plante
        </button>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "mal" ? "Ex. fièvre et frissons depuis deux jours" : "Ex. Neem, Bissap, Moringa…"}
        className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Demander à Lafi
      </button>
    </form>
  );
}
