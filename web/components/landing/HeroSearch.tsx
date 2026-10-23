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

  const onglet = (cle: "mal" | "plante", libelle: string) => (
    <button
      type="button"
      onClick={() => setMode(cle)}
      aria-pressed={mode === cle}
      className={`whitespace-nowrap border-b-2 pb-1 text-sm font-medium transition ${
        mode === cle
          ? "border-emerald-600 text-neutral-900 dark:text-neutral-100"
          : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      }`}
    >
      {libelle}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="mb-3 flex gap-5">
        {onglet("mal", "J'ai un mal")}
        {onglet("plante", "Je cherche une plante")}
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white p-1.5 pl-4 shadow-sm focus-within:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-900">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === "mal" ? "Ex. fièvre et frissons depuis deux jours" : "Ex. neem, bissap, moringa"}
          aria-label={mode === "mal" ? "Décris ton mal" : "Nom de la plante"}
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Demander à Lafi
        </button>
      </div>
    </form>
  );
}
