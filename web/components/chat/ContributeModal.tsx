"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const FIELD_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900";

type ContributionType = "ajout" | "contestation";
type NiveauDivulgation = "declaratif" | "documente" | "complet";

const NIVEAU_OPTIONS: { value: NiveauDivulgation; label: string; description: string }[] = [
  { value: "declaratif", label: "Déclaratif", description: "Juste la plante et le mal — rien d'autre à remplir." },
  { value: "documente", label: "Documenté", description: "+ la préparation utilisée." },
  { value: "complet", label: "Complet", description: "+ région, langue, associations de plantes." },
];

// Deux entrées de force égale (§7 du brief) : "ajouter" et "contester"
// sont le même formulaire, juste un état différent — jamais l'un plus
// difficile d'accès que l'autre, sinon la base ne s'auto-corrige jamais.
// Divulgation graduée : le niveau déclaratif n'exige que deux champs,
// sans engagement — chaque niveau au-dessus est un choix explicite, pas
// un défaut.
export function ContributeModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<ContributionType>("ajout");
  const [niveau, setNiveau] = useState<NiveauDivulgation>("declaratif");
  const [planteNom, setPlanteNom] = useState("");
  const [maladieNom, setMaladieNom] = useState("");
  const [preparation, setPreparation] = useState("");
  const [posologie, setPosologie] = useState("");
  const [associations, setAssociations] = useState("");
  const [region, setRegion] = useState("");
  const [ethnie, setEthnie] = useState("");
  const [langue, setLangue] = useState("");
  const [contributeur, setContributeur] = useState("");
  const [contact, setContact] = useState("");
  const [consentement, setConsentement] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const showDetail = type === "contestation" || niveau !== "declaratif";
  const showRegionLangue = niveau !== "declaratif";
  const showAssociations = niveau === "complet" && type === "ajout";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentement) {
      setError("Le consentement est nécessaire avant l'envoi.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          niveau_divulgation: niveau,
          plante_nom: planteNom,
          maladie_nom: maladieNom,
          preparation: preparation || undefined,
          posologie: posologie || undefined,
          associations: associations || undefined,
          region: region || undefined,
          ethnie: ethnie || undefined,
          langue: langue || undefined,
          contributeur: contributeur || undefined,
          contact: contact || undefined,
          consentement,
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
            <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Merci !</h2>
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
              On vérifie ça avant de l&apos;ajouter au savoir traditionnel de Lafi.
            </p>
            <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-500">
              Envie de compléter cette info plus tard (préparation, région...) ? Ressoumets le formulaire en le
              précisant — on ne sait pas encore relier deux envois entre eux automatiquement.
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
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setType("ajout")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  type === "ajout"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                ➕ Ajouter un remède
              </button>
              <button
                type="button"
                onClick={() => setType("contestation")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  type === "contestation"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                ⚠️ Signaler un désaccord
              </button>
            </div>

            <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
              {type === "ajout"
                ? "Un usage traditionnel que tu connais et qui ne figure pas encore dans les réponses de Lafi ? On le vérifie avant de l'ajouter."
                : "Une information qui te semble fausse, incomplète, ou qui contredit ce que tu sais ? Dis-le — un désaccord documenté est aussi utile qu'un ajout."}
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

              <div className="flex gap-1.5 rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
                {NIVEAU_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNiveau(opt.value)}
                    title={opt.description}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                      niveau === opt.value
                        ? "bg-emerald-600 text-white"
                        : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                {NIVEAU_OPTIONS.find((o) => o.value === niveau)?.description}
              </p>

              {showDetail && (
                <textarea
                  required={type === "contestation"}
                  value={preparation}
                  onChange={(e) => setPreparation(e.target.value)}
                  placeholder={type === "contestation" ? "Ce qui te semble faux ou incomplet" : "Préparation"}
                  rows={2}
                  className={`${FIELD_CLASS} resize-none`}
                />
              )}

              {niveau !== "declaratif" && type === "ajout" && (
                <input
                  value={posologie}
                  onChange={(e) => setPosologie(e.target.value)}
                  placeholder="Posologie (optionnel)"
                  className={FIELD_CLASS}
                />
              )}

              {showAssociations && (
                <input
                  value={associations}
                  onChange={(e) => setAssociations(e.target.value)}
                  placeholder="Autres plantes associées dans cette préparation (optionnel)"
                  className={FIELD_CLASS}
                />
              )}

              {showRegionLangue && (
                <>
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
                  <input
                    value={langue}
                    onChange={(e) => setLangue(e.target.value)}
                    placeholder="Langue (optionnel)"
                    className={FIELD_CLASS}
                  />
                </>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={contributeur}
                  onChange={(e) => setContributeur(e.target.value)}
                  placeholder="Qui te l'a appris ? (optionnel)"
                  className={FIELD_CLASS}
                />
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact (optionnel)"
                  className={FIELD_CLASS}
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={consentement}
                  onChange={(e) => setConsentement(e.target.checked)}
                  className="mt-0.5 accent-emerald-600"
                />
                J&apos;accepte que cette information soit partagée avec Lafi et vérifiée avant publication.
              </label>

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
                  disabled={busy || !consentement}
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
