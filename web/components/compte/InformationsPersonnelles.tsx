"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { changerEmail, changerMotDePasse, messageAuth, MOT_DE_PASSE_MIN } from "@/lib/auth";
import { useEspace } from "./Espace";

const CHAMP =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
const BOUTON = "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50";

function Section({ titre, children, danger = false }: { titre: string; children: ReactNode; danger?: boolean }) {
  return (
    <section
      className={`rounded-3xl border bg-white p-5 dark:bg-neutral-900/60 ${
        danger ? "border-red-200 dark:border-red-900" : "border-neutral-200 dark:border-neutral-800/70"
      }`}
    >
      <h2 className={`mb-3 font-semibold ${danger ? "text-red-800 dark:text-red-300" : "text-neutral-900 dark:text-neutral-100"}`}>{titre}</h2>
      {children}
    </section>
  );
}

function Retour({ ok, message }: { ok: boolean; message: string | null }) {
  if (!message) return null;
  return <p className={`mt-2 text-sm ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-300"}`}>{message}</p>;
}

// Onglet "Informations personnelles" de l'espace (/moi).
export function InformationsPersonnelles() {
  const { user, compte, recharger, signOut } = useEspace();
  return (
    <div className="space-y-5">
      <SectionNom user={user} nomActuel={compte.nomAffichage} onChange={recharger} />
      <Section titre="Connexion et sécurité">
        <div className="space-y-6">
          <FormulaireEmail emailActuel={user.email ?? ""} />
          <FormulaireMotDePasse />
          <button type="button" onClick={() => signOut()} className="text-sm font-medium text-neutral-600 hover:underline dark:text-neutral-300">
            Se déconnecter
          </button>
        </div>
      </Section>
      <SectionSuppression onSupprime={signOut} />
    </div>
  );
}

function SectionNom({ user, nomActuel, onChange }: { user: User; nomActuel: string | null; onChange: () => void }) {
  const [nom, setNom] = useState(nomActuel ?? "");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    setOccupe(true);
    setMessage(null);
    const { error } = await supabaseBrowser.from("profil").update({ nom_affichage: nom.trim() || null }).eq("id", user.id);
    if (!error) await supabaseBrowser.auth.updateUser({ data: { nom: nom.trim() } });
    setOccupe(false);
    setMessage(error ? { ok: false, texte: messageAuth(error.message) } : { ok: true, texte: "Nom enregistré." });
    if (!error) onChange();
  };

  return (
    <Section titre="Mon nom">
      <form onSubmit={enregistrer} className="flex flex-wrap gap-2">
        <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} className={`${CHAMP} max-w-sm`} aria-label="Nom affiché" />
        <button type="submit" disabled={occupe || nom.trim() === (nomActuel ?? "")} className={BOUTON}>
          Enregistrer
        </button>
      </form>
      {message && <Retour ok={message.ok} message={message.texte} />}
    </Section>
  );
}

function FormulaireEmail({ emailActuel }: { emailActuel: string }) {
  const [email, setEmail] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setOccupe(true);
    const err = await changerEmail(email);
    setOccupe(false);
    setMessage(
      err
        ? { ok: false, texte: err }
        : { ok: true, texte: `Un lien de confirmation a été envoyé à ${email}. Le changement prend effet après ton clic.` }
    );
    if (!err) setEmail("");
  };

  return (
    <form onSubmit={envoyer}>
      <p className="mb-2 text-sm font-medium">Changer d&apos;e-mail</p>
      <div className="flex flex-wrap gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={emailActuel} className={`${CHAMP} max-w-sm`} autoComplete="email" />
        <button type="submit" disabled={occupe || !email} className={BOUTON}>
          Changer
        </button>
      </div>
      {message && <Retour ok={message.ok} message={message.texte} />}
    </form>
  );
}

export function FormulaireMotDePasse({ apresSucces }: { apresSucces?: () => void }) {
  const [mdp, setMdp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    if (mdp !== confirmation) {
      setMessage({ ok: false, texte: "Les deux mots de passe ne sont pas identiques." });
      return;
    }
    setOccupe(true);
    const err = await changerMotDePasse(mdp);
    setOccupe(false);
    setMessage(err ? { ok: false, texte: err } : { ok: true, texte: "Mot de passe changé." });
    if (!err) {
      setMdp("");
      setConfirmation("");
      apresSucces?.();
    }
  };

  return (
    <form onSubmit={envoyer}>
      <p className="mb-2 text-sm font-medium">Nouveau mot de passe</p>
      <div className="grid max-w-md gap-2">
        <input type="password" required minLength={MOT_DE_PASSE_MIN} value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder={`${MOT_DE_PASSE_MIN} caractères minimum`} className={CHAMP} autoComplete="new-password" />
        <input type="password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Confirme le mot de passe" className={CHAMP} autoComplete="new-password" />
        <button type="submit" disabled={occupe} className={`${BOUTON} justify-self-start`}>
          Changer le mot de passe
        </button>
      </div>
      {message && <Retour ok={message.ok} message={message.texte} />}
    </form>
  );
}

function SectionSuppression({ onSupprime }: { onSupprime: () => Promise<void> }) {
  const router = useRouter();
  const [saisie, setSaisie] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const supprimer = async (e: FormEvent) => {
    e.preventDefault();
    setOccupe(true);
    setErreur(null);
    const { error } = await supabaseBrowser.rpc("supprimer_mon_compte");
    if (error) {
      setOccupe(false);
      setErreur(error.message);
      return;
    }
    await onSupprime();
    router.push("/");
  };

  return (
    <Section titre="Supprimer mon compte" danger>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Ton compte, ton historique de conversations et tes plantes gardées sont effacés définitivement. Si tu as une
        boutique sans vente payée, elle est fermée.
      </p>
      <form onSubmit={supprimer} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Écris SUPPRIMER pour confirmer"
          className={`${CHAMP} max-w-xs`}
          aria-label="Écris SUPPRIMER pour confirmer"
        />
        <button
          type="submit"
          disabled={occupe || saisie !== "SUPPRIMER"}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
        >
          Supprimer définitivement
        </button>
      </form>
      {erreur && <Retour ok={false} message={erreur} />}
    </Section>
  );
}
