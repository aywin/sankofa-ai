"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { AuthModal } from "./AuthModal";

// Entrée du compte dans l'en-tête du site : connexion pour un visiteur,
// accès à "Mon compte" sinon.
export function BoutonCompte() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);

  // Rien pendant le chargement : évite un "Se connecter" qui clignote.
  if (loading) return <span className="inline-block h-8 w-8" aria-hidden />;

  if (user) {
    return (
      <Link
        href="/moi"
        aria-label="Mon compte"
        title={user.email ?? "Mon compte"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold uppercase text-white transition hover:bg-emerald-700"
      >
        {(user.user_metadata?.nom as string | undefined)?.[0] ?? user.email?.[0] ?? "?"}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-lg px-1 outline-none hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-emerald-400"
      >
        Se connecter
      </button>
      {ouvert && (
        <AuthModal
          onClose={() => setOuvert(false)}
          onConnecte={(tradipraticien) => tradipraticien && router.push("/moi/boutique")}
        />
      )}
    </>
  );
}
