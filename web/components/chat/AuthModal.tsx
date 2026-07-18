"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function AuthModal({
  onClose,
  onSignIn,
  onSignUp,
}: {
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    const result = mode === "signin" ? await onSignIn(email, password) : await onSignUp(email, password);

    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup") {
      setInfo("Compte créé — vérifie tes emails pour confirmer, puis connecte-toi.");
      setMode("signin");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-sand-50 p-5 shadow-lg dark:border-neutral-800 dark:bg-sand-950">
        <h2 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {mode === "signin" ? "Se connecter" : "Créer un compte"}
        </h2>
        <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
          Pour retrouver ton historique sur tous tes appareils. Sans compte, il reste
          seulement sur ce navigateur.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900"
          />

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          {info && <p className="text-xs text-emerald-700 dark:text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="mt-3 text-xs text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-400"
        >
          {mode === "signin" ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
