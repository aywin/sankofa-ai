"use client";

import Link from "next/link";
import { useState } from "react";
import { FormulaireMotDePasse } from "./InformationsPersonnelles";

// Arrivée par le lien "mot de passe oublié" : Supabase ouvre une session
// de récupération à partir du lien (l'espace a déjà vérifié la connexion),
// il ne reste qu'à choisir le nouveau mot de passe.
export function NouveauMotDePasse() {
  const [fait, setFait] = useState(false);

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-900/60">
      <h2 className="mb-3 font-semibold">Choisis un nouveau mot de passe</h2>
      {fait ? (
        <p className="text-sm">
          C&apos;est fait.{" "}
          <Link href="/moi" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Retour à mon espace
          </Link>
        </p>
      ) : (
        <FormulaireMotDePasse apresSucces={() => setFait(true)} />
      )}
    </section>
  );
}
