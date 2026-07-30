"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const FIELD_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900";

export function ContributeModal({ onClose }: { onClose: () => void }) {
  const [planteNom, setPlanteNom] = useState("");
  const [maladieNom, setMaladieNom] = useState("");
  const [preparation, setPreparation] = useState("");
  const [posologie, setPosologie] = useState("");
  const [region, setRegion] = useState("");
  const [ethnie, setEthnie] = useState("");
  const [langue, setLangue] = useState("");
  const [contributeur, setContributeur] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plante_nom: planteNom,
          maladie_nom: maladieNom,
          preparation,
          posologie: posologie || undefined,
          region: region || undefined,
          ethnie: ethnie || undefined,
          langue: langue || undefined,
          contributeur: contributeur || undefined,
          contact: contact || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Une erreur est survenue.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-sand-50 p-5 shadow-lg dark:border-neutral-800 dark:bg-sand-950">
        {done ? (
          <>
            <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Merci !
            </h2>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              On vérifie ça avant de l&apos;ajouter au savoir traditionnel de Lafi.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Fermer
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Signaler un remède
            </h2>
            <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
              Un usage traditionnel que tu connais et qui ne figure pas encore dans les réponses
              de Lafi ? Décris-le, on le vérifie avant de l&apos;ajouter.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                required
                value={planteNom}
                onChange={(e) => setPlanteNom(e.target.value)}
                placeholder="Plante (nom local)"
                className={FIELD_CLASS}
              />
              <input
                required
                value={maladieNom}
                onChange={(e) => setMaladieNom(e.target.value)}
                placeholder="Maladie ou symptôme"
                className={FIELD_CLASS}
              />
              <textarea
                required
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
                placeholder="Préparation"
                rows={2}
                className={`${FIELD_CLASS} resize-none`}
              />
              <input
                value={posologie}
                onChange={(e) => setPosologie(e.target.value)}
                placeholder="Posologie (optionnel)"
                className={FIELD_CLASS}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Région (optionnel)"
                  className={FIELD_CLASS}
                />
                <input
                  value={ethnie}
                  onChange={(e) => setEthnie(e.target.value)}
                  placeholder="Ethnie (optionnel)"
                  className={FIELD_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={langue}
                  onChange={(e) => setLangue(e.target.value)}
                  placeholder="Langue (optionnel)"
                  className={FIELD_CLASS}
                />
                <input
                  value={contributeur}
                  onChange={(e) => setContributeur(e.target.value)}
                  placeholder="Qui te l'a appris ? (optionnel)"
                  className={FIELD_CLASS}
                />
              </div>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact, si tu veux qu'on te recontacte (optionnel)"
                className={FIELD_CLASS}
              />

              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
