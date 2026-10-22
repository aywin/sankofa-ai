"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  connecter,
  demanderReinitialisation,
  inscrire,
  MOT_DE_PASSE_MIN,
  renvoyerConfirmation,
} from "@/lib/auth";

type Mode = "connexion" | "inscription" | "oubli" | "verifier";

const CHAMP =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export function AuthModal({
  onClose,
  modeInitial = "connexion",
  tradipraticienParDefaut = false,
  onConnecte,
}: {
  onClose: () => void;
  modeInitial?: "connexion" | "inscription";
  tradipraticienParDefaut?: boolean;
  // Appelé quand une session est ouverte (connexion, ou inscription sans
  // confirmation par e-mail). `tradipraticien` vaut true seulement pour
  // une inscription où la case est cochée — pour aller à la boutique.
  onConnecte?: (tradipraticien: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>(modeInitial);
  const [tradipraticien, setTradipraticien] = useState(tradipraticienParDefaut);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [nonConfirme, setNonConfirme] = useState(false);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onClose]);

  const changerMode = (m: Mode) => {
    setMode(m);
    setErreur(null);
    setInfo(null);
    setNonConfirme(false);
  };

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setOccupe(true);
    setErreur(null);
    setInfo(null);
    setNonConfirme(false);

    if (mode === "connexion") {
      const err = await connecter(email, motDePasse);
      setOccupe(false);
      if (err) {
        setErreur(err);
        setNonConfirme(err.includes("pas encore confirmé"));
        return;
      }
      onConnecte?.(false);
      onClose();
      return;
    }

    if (mode === "inscription") {
      const { erreur: err, confirmationRequise } = await inscrire({ email, motDePasse, nom, tradipraticien });
      setOccupe(false);
      if (err) {
        setErreur(err);
        return;
      }
      if (confirmationRequise) {
        changerMode("verifier");
        return;
      }
      onConnecte?.(tradipraticien);
      onClose();
      return;
    }

    if (mode === "oubli") {
      const err = await demanderReinitialisation(email);
      setOccupe(false);
      if (err) setErreur(err);
      else setInfo("Si un compte existe avec cet e-mail, un lien pour choisir un nouveau mot de passe vient d'y être envoyé.");
    }
  };

  const renvoyer = async () => {
    setOccupe(true);
    setErreur(null);
    const err = await renvoyerConfirmation(email);
    setOccupe(false);
    if (err) setErreur(err);
    else setInfo("Lien renvoyé. Pense à regarder dans les courriers indésirables.");
  };

  const titres: Record<Mode, string> = {
    connexion: "Se connecter",
    inscription: "Créer un compte",
    oubli: "Mot de passe oublié",
    verifier: "Vérifie ta boîte mail",
  };

  // Portail vers <body> : ouverte depuis l'en-tête (backdrop-blur), une
  // fenêtre "fixed" serait positionnée par rapport à l'en-tête, pas à
  // l'écran — elle s'affichait coupée en haut de page.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={titres[mode]}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-sand-50 p-5 shadow-xl sm:max-w-md sm:rounded-3xl dark:bg-sand-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{titres[mode]}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            ✕
          </button>
        </div>

        {mode === "verifier" ? (
          <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
            <p>
              Un lien de confirmation a été envoyé à <span className="font-medium">{email}</span>. Clique dessus pour
              activer ton compte : tu seras connecté directement.
            </p>
            {info && <p className="text-emerald-700 dark:text-emerald-400">{info}</p>}
            {erreur && <p className="text-red-700 dark:text-red-300">{erreur}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={occupe} onClick={renvoyer} className="rounded-xl border border-neutral-300 px-3 py-2 font-medium hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
                Renvoyer le lien
              </button>
              <button type="button" onClick={() => changerMode("connexion")} className="px-1 py-2 text-emerald-700 hover:underline dark:text-emerald-400">
                J&apos;ai confirmé, me connecter
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={envoyer} className="space-y-3">
            {mode === "inscription" && (
              <input required minLength={2} maxLength={80} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ton nom ou ton prénom" className={CHAMP} autoComplete="name" />
            )}

            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={CHAMP} autoComplete="email" />

            {mode !== "oubli" && (
              <div className="relative">
                <input
                  type={voirMotDePasse ? "text" : "password"}
                  required
                  minLength={mode === "inscription" ? MOT_DE_PASSE_MIN : 6}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder={mode === "inscription" ? `Mot de passe (${MOT_DE_PASSE_MIN} caractères minimum)` : "Mot de passe"}
                  className={`${CHAMP} pr-20`}
                  autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setVoirMotDePasse((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {voirMotDePasse ? "Masquer" : "Afficher"}
                </button>
              </div>
            )}

            {mode === "inscription" && (
              <label className="flex items-start gap-2.5 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                <input type="checkbox" checked={tradipraticien} onChange={(e) => setTradipraticien(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
                <span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">Je suis tradipraticien</span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    Pour vendre mes préparations dans ma boutique Lafi. Tu peux aussi l&apos;activer plus tard.
                  </span>
                </span>
              </label>
            )}

            {mode === "connexion" && (
              <button type="button" onClick={() => changerMode("oubli")} className="text-xs text-neutral-500 hover:underline">
                Mot de passe oublié ?
              </button>
            )}

            {erreur && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
                {erreur}
                {nonConfirme && (
                  <button type="button" onClick={renvoyer} disabled={occupe} className="ml-1 font-medium underline">
                    Renvoyer le lien
                  </button>
                )}
              </div>
            )}
            {info && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{info}</p>}

            <button
              type="submit"
              disabled={occupe}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {occupe ? "Un instant…" : mode === "connexion" ? "Se connecter" : mode === "inscription" ? "Créer mon compte" : "Recevoir le lien"}
            </button>
          </form>
        )}

        {mode !== "verifier" && (
          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {mode === "connexion" ? (
              <>
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => changerMode("inscription")} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                  Créer un compte
                </button>
              </>
            ) : (
              <button type="button" onClick={() => changerMode("connexion")} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                J&apos;ai déjà un compte
              </button>
            )}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
