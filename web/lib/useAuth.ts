"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase-browser";

// Session courante. Les actions (inscription, connexion, mot de passe)
// sont dans lib/auth.ts.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Arrivée par le lien "mot de passe oublié" : Supabase ouvre une session
  // de récupération, la page doit alors proposer un nouveau mot de passe.
  const [recuperation, setRecuperation] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setRecuperation(true);
        // Si l'URL de redirection n'est pas autorisée dans Supabase, le lien
        // "mot de passe oublié" retombe sur l'URL du site (l'accueil) : on
        // renvoie vers la page qui permet de choisir le nouveau mot de passe.
        if (window.location.pathname !== "/moi/mot-de-passe") window.location.assign("/moi/mot-de-passe");
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
  };

  return { user, loading, recuperation, signOut };
}

export type StatutRole = "declare" | "verifie" | "refuse";

export interface Compte {
  nomAffichage: string | null;
  tradipraticien: StatutRole | null;
  admin: boolean;
}

// Profil et rôles du compte connecté (tables de 0001/0002). null tant que
// rien n'est chargé ; `recharger` après une modification.
export function useCompte(user: User | null) {
  const [compte, setCompte] = useState<Compte | null>(null);

  const recharger = useCallback(async () => {
    if (!user) {
      setCompte(null);
      return;
    }
    const [{ data: profil }, { data: roles }] = await Promise.all([
      supabaseBrowser.from("profil").select("nom_affichage").eq("id", user.id).maybeSingle(),
      supabaseBrowser.from("profil_role").select("role, statut").eq("profil_id", user.id),
    ]);
    const role = (nom: string) => roles?.find((r) => r.role === nom)?.statut as StatutRole | undefined;
    setCompte({
      nomAffichage: profil?.nom_affichage ?? (user.user_metadata?.nom as string | undefined) ?? null,
      tradipraticien: role("tradipraticien") ?? null,
      admin: role("admin") === "verifie",
    });
  }, [user]);

  useEffect(() => {
    // Chargement asynchrone : setState n'a lieu qu'après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recharger();
  }, [recharger]);

  return { compte, recharger };
}
