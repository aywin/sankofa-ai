"use client";

import { supabaseBrowser } from "./supabase-browser";

// Authentification côté navigateur — un seul endroit pour l'inscription, la
// connexion, le mot de passe oublié, et la traduction des erreurs
// Supabase (renvoyées en anglais).
//
// Confirmation par e-mail : réglée dans Supabase (Authentication > Sign In
// / Providers > Email > "Confirm email"). Le code fonctionne dans les deux
// cas — si elle est désactivée, signUp renvoie directement une session.

const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou mot de passe incorrect."],
  [/email not confirmed/i, "Ton e-mail n'est pas encore confirmé : clique sur le lien reçu à l'inscription."],
  [/user already registered|already been registered/i, "Un compte existe déjà avec cet e-mail : connecte-toi."],
  [/password should be at least|password is too short/i, "Mot de passe trop court : 8 caractères minimum."],
  [/weak password|password is known to be weak/i, "Mot de passe trop facile à deviner : choisis-en un autre."],
  [/rate limit|too many requests|for security purposes/i, "Trop de tentatives : attends une minute avant de réessayer."],
  [/unable to validate email|invalid email|email address .* is invalid/i, "Adresse e-mail invalide."],
  [/new password should be different/i, "Le nouveau mot de passe doit être différent de l'ancien."],
  [/signups? not allowed|signup is disabled/i, "Les inscriptions sont fermées pour le moment."],
  [/failed to fetch|network/i, "Connexion impossible : vérifie ta connexion internet."],
];

export function messageAuth(message: string | undefined | null): string {
  if (!message) return "Une erreur est survenue. Réessaie.";
  return MESSAGES.find(([motif]) => motif.test(message))?.[1] ?? message;
}

function origine() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export async function inscrire(params: {
  email: string;
  motDePasse: string;
  nom: string;
  // Coché à l'inscription pour vendre ; sinon simple compte (qui peut
  // activer le statut plus tard depuis /moi).
  tradipraticien: boolean;
}): Promise<{ erreur: string | null; confirmationRequise: boolean }> {
  const { data, error } = await supabaseBrowser.auth.signUp({
    email: params.email.trim(),
    password: params.motDePasse,
    options: {
      // Lu par le trigger profil_creer_pour_nouvel_utilisateur (0002).
      data: { nom: params.nom.trim(), ...(params.tradipraticien ? { profil: "tradipraticien" } : {}) },
      // Après le clic sur le lien de confirmation : direction l'espace adapté.
      emailRedirectTo: `${origine()}${params.tradipraticien ? "/moi/boutique" : "/moi"}`,
    },
  });
  if (error) return { erreur: messageAuth(error.message), confirmationRequise: false };
  // Supabase ne révèle pas qu'un e-mail est déjà inscrit quand la
  // confirmation est active : il renvoie un utilisateur sans identité.
  if (data.user && data.user.identities?.length === 0) {
    return { erreur: "Un compte existe déjà avec cet e-mail : connecte-toi.", confirmationRequise: false };
  }
  return { erreur: null, confirmationRequise: !data.session };
}

export async function connecter(email: string, motDePasse: string): Promise<string | null> {
  const { error } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password: motDePasse });
  return error ? messageAuth(error.message) : null;
}

export async function renvoyerConfirmation(email: string): Promise<string | null> {
  const { error } = await supabaseBrowser.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${origine()}/moi` },
  });
  return error ? messageAuth(error.message) : null;
}

export async function demanderReinitialisation(email: string): Promise<string | null> {
  const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origine()}/moi/mot-de-passe`,
  });
  return error ? messageAuth(error.message) : null;
}

export async function changerMotDePasse(nouveau: string): Promise<string | null> {
  const { error } = await supabaseBrowser.auth.updateUser({ password: nouveau });
  return error ? messageAuth(error.message) : null;
}

export async function changerEmail(nouvel: string): Promise<string | null> {
  const { error } = await supabaseBrowser.auth.updateUser(
    { email: nouvel.trim() },
    { emailRedirectTo: `${origine()}/moi` }
  );
  return error ? messageAuth(error.message) : null;
}

export const MOT_DE_PASSE_MIN = 8;
