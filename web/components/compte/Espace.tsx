"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth, useCompte, type Compte } from "@/lib/useAuth";
import { AuthModal } from "./AuthModal";

// Espace personnel (/moi/*) : un seul gabarit pour tous les onglets —
// contrôle de connexion, en-tête du profil, barre d'onglets. Les pages
// reçoivent l'utilisateur et son compte par contexte, chargés une fois.

interface EspaceValeur {
  user: User;
  compte: Compte;
  recharger: () => Promise<void>;
  signOut: () => Promise<void>;
}

const EspaceContexte = createContext<EspaceValeur | null>(null);

export function useEspace(): EspaceValeur {
  const valeur = useContext(EspaceContexte);
  if (!valeur) throw new Error("useEspace() hors de l'espace /moi");
  return valeur;
}

const ONGLETS = [
  { href: "/moi", libelle: "Informations personnelles" },
  { href: "/moi/boutique", libelle: "Ma boutique" },
  { href: "/moi/plantes", libelle: "Mes plantes" },
];

export function Espace({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { compte, recharger } = useCompte(user);
  const pathname = usePathname();
  const [authOuverte, setAuthOuverte] = useState(false);

  if (loading || (user && !compte)) {
    return <p className="py-16 text-center text-sm text-neutral-500">Chargement…</p>;
  }

  if (!user || !compte) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800/70 dark:bg-neutral-900/60">
        <h1 className="text-2xl font-semibold">Mon espace</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Connecte-toi pour retrouver tes plantes, tes informations et, si tu es tradipraticien, ta boutique.
        </p>
        <button
          type="button"
          onClick={() => setAuthOuverte(true)}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Se connecter ou créer un compte
        </button>
        {authOuverte && <AuthModal onClose={() => setAuthOuverte(false)} />}
      </div>
    );
  }

  const onglets = compte.admin ? [...ONGLETS, { href: "/admin/ventes", libelle: "Administration" }] : ONGLETS;
  const nom = compte.nomAffichage ?? user.email ?? "";

  return (
    <EspaceContexte.Provider value={{ user, compte, recharger, signOut }}>
      <header className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold uppercase text-white" aria-hidden>
          {nom[0] ?? "?"}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{compte.nomAffichage ?? "Mon espace"}</h1>
          <p className="truncate text-sm text-neutral-500">
            {user.email}
            {compte.tradipraticien && <span className="ml-2 text-emerald-700 dark:text-emerald-400">· Tradipraticien</span>}
          </p>
        </div>
      </header>

      <nav aria-label="Mon espace" className="mt-6 flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
        {onglets.map((o) => {
          const actif = pathname === o.href;
          return (
            <Link
              key={o.href}
              href={o.href}
              aria-current={actif ? "page" : undefined}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                actif
                  ? "border-emerald-600 text-emerald-800 dark:text-emerald-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {o.libelle}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </EspaceContexte.Provider>
  );
}
