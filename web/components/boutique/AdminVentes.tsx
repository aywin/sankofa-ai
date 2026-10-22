"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/useAuth";
import { formatDate, formatFcfa } from "@/lib/format";
import { CHAMP } from "./Dialogue";

interface BoutiqueReversement {
  id: string;
  nom: string;
  slug: string;
  reversement_reseau: string | null;
  reversement_numero: string | null;
  reversement_nom: string | null;
  telephone_contact: string;
}
interface CommandeAReverser {
  id: string;
  reference: string;
  montant_total: string;
  frais_saspay: string | null;
  montant_a_reverser: string;
  payee_le: string;
  boutique: BoutiqueReversement;
}
interface Signalement {
  id: string;
  motif: string;
  contact: string | null;
  created_at: string;
  produit: { id: string; nom: string; statut: string; boutique: { nom: string; slug: string } } | null;
}
interface ProduitRetire {
  id: string;
  nom: string;
  retire_motif: string | null;
  boutique: { nom: string; slug: string };
}
interface Donnees {
  aReverser: CommandeAReverser[];
  signalements: Signalement[];
  retires: ProduitRetire[];
}

const RESEAUX: Record<string, string> = { orange_money: "Orange Money", moov_money: "Moov Money", autre: "Autre" };

async function appelAdmin(init?: RequestInit) {
  const { data } = await supabaseBrowser.auth.getSession();
  const res = await fetch("/api/admin/ventes", {
    ...init,
    headers: { "content-type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
  });
  const corps = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((corps as { message?: string }).message ?? `Erreur ${res.status}`);
  return corps;
}

export function AdminVentes() {
  const { user, loading } = useAuth();
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      setDonnees((await appelAdmin()) as Donnees);
      setErreur(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    // Chargement asynchrone : setState n'a lieu qu'après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) charger();
  }, [user, charger]);

  const agir = async (corps: object) => {
    try {
      await appelAdmin({ method: "POST", body: JSON.stringify(corps) });
      await charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) return <p className="text-sm text-neutral-500">Chargement…</p>;
  if (!user) return <p className="text-sm text-neutral-600">Connecte-toi avec un compte administrateur.</p>;
  if (erreur && !donnees) return <p className="text-sm text-red-700 dark:text-red-300">{erreur}</p>;
  if (!donnees) return <p className="text-sm text-neutral-500">Chargement…</p>;

  // Regroupe par boutique : un seul reversement SasPay par vendeur.
  const parBoutique = new Map<string, { boutique: BoutiqueReversement; commandes: CommandeAReverser[] }>();
  for (const c of donnees.aReverser) {
    const groupe = parBoutique.get(c.boutique.id) ?? { boutique: c.boutique, commandes: [] };
    groupe.commandes.push(c);
    parBoutique.set(c.boutique.id, groupe);
  }

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl font-semibold">Ventes et modération</h1>
      {erreur && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{erreur}</p>}

      <section>
        <h2 className="text-lg font-semibold">Reversements à faire</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Fais le reversement depuis le tableau de bord SasPay, puis enregistre sa référence ici. Montants déjà nets des
          frais de paiement (et de la commission, aujourd&apos;hui à 0 %).
        </p>
        {parBoutique.size === 0 && <p className="mt-4 text-sm text-neutral-500">Rien à reverser.</p>}
        <div className="mt-4 space-y-4">
          {[...parBoutique.values()].map((g) => (
            <GroupeReversement key={g.boutique.id} {...g} onReverse={(reference) => agir({ action: "marquer_reverse", commandeIds: g.commandes.map((c) => c.id), reference })} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Signalements ({donnees.signalements.length})</h2>
        <ul className="mt-4 space-y-2">
          {donnees.signalements.map((s) => (
            <li key={s.id} className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800/70 dark:bg-neutral-900/60">
              <p className="text-sm">
                <span className="font-medium">{s.produit?.nom ?? "Produit supprimé"}</span>
                {s.produit && (
                  <>
                    {" "}
                    — <Link href={`/b/${s.produit.boutique.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">{s.produit.boutique.nom}</Link>
                  </>
                )}
                <span className="ml-2 text-xs text-neutral-500">{formatDate(s.created_at)}</span>
              </p>
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">« {s.motif} »</p>
              {s.contact && <p className="text-xs text-neutral-500">Contact : {s.contact}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {s.produit && s.produit.statut !== "retire" && (
                  <button
                    type="button"
                    onClick={() => {
                      const motif = window.prompt("Motif du retrait (visible par le vendeur) :", s.motif);
                      if (motif && motif.trim().length >= 3) agir({ action: "retirer_produit", produitId: s.produit!.id, motif: motif.trim() });
                    }}
                    className="font-medium text-red-700 hover:underline dark:text-red-400"
                  >
                    Retirer le produit
                  </button>
                )}
                <button type="button" onClick={() => agir({ action: "signalement_traite", signalementId: s.id })} className="text-neutral-600 hover:underline dark:text-neutral-300">
                  Marquer traité
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Produits retirés</h2>
        <ul className="mt-4 space-y-2">
          {donnees.retires.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neutral-200/70 bg-white p-3 text-sm dark:border-neutral-800/70 dark:bg-neutral-900/60">
              <span>
                <span className="font-medium">{p.nom}</span> — {p.boutique.nom}
                {p.retire_motif && <span className="block text-xs text-neutral-500">{p.retire_motif}</span>}
              </span>
              <button type="button" onClick={() => agir({ action: "retablir_produit", produitId: p.id })} className="text-emerald-700 hover:underline dark:text-emerald-400">
                Rétablir (masqué)
              </button>
            </li>
          ))}
          {donnees.retires.length === 0 && <li className="text-sm text-neutral-500">Aucun.</li>}
        </ul>
      </section>
    </div>
  );
}

function GroupeReversement({
  boutique,
  commandes,
  onReverse,
}: {
  boutique: BoutiqueReversement;
  commandes: CommandeAReverser[];
  onReverse: (reference: string) => void;
}) {
  const [reference, setReference] = useState("");
  const total = commandes.reduce((s, c) => s + Number(c.montant_a_reverser), 0);

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800/70 dark:bg-neutral-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{boutique.nom}</p>
          {boutique.reversement_numero ? (
            <p className="text-sm">
              {RESEAUX[boutique.reversement_reseau ?? ""] ?? "Réseau ?"} · <span className="font-mono">{boutique.reversement_numero}</span>
              {boutique.reversement_nom && ` · ${boutique.reversement_nom}`}
            </p>
          ) : (
            <p className="text-sm text-red-700 dark:text-red-300">Numéro de reversement manquant — contacter {boutique.telephone_contact}</p>
          )}
        </div>
        <p className="text-xl font-semibold">{formatFcfa(total)}</p>
      </div>
      <ul className="mt-2 space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
        {commandes.map((c) => (
          <li key={c.id}>
            <span className="font-mono">{c.reference}</span> · payée {formatDate(c.payee_le)} · {formatFcfa(c.montant_total)}
            {c.frais_saspay && ` − frais ${formatFcfa(c.frais_saspay)}`} → {formatFcfa(c.montant_a_reverser)}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onReverse(reference.trim());
          setReference("");
        }}
        className="mt-3 flex flex-wrap gap-2"
      >
        <input
          required
          minLength={3}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className={`${CHAMP} max-w-xs`}
          placeholder="Référence du reversement SasPay"
          aria-label={`Référence du reversement pour ${boutique.nom}`}
        />
        <button type="submit" disabled={!boutique.reversement_numero} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          Marquer comme reversé
        </button>
      </form>
    </div>
  );
}
