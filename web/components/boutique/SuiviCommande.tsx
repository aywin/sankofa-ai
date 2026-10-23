"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatFcfa } from "@/lib/format";

interface Commande {
  reference: string;
  statut: "en_attente_paiement" | "payee" | "echouee" | "expiree" | "remise" | "annulee";
  montant_total: string;
  boutique: { slug: string; nom: string; telephone_contact: string } | null;
  commande_ligne: { nom_produit: string; prix_unitaire: string; quantite: number }[];
}

const MESSAGES: Record<Commande["statut"], { titre: string; texte: string; ton: "ok" | "attente" | "echec" }> = {
  en_attente_paiement: {
    titre: "Paiement en cours de confirmation",
    texte: "Valide la demande de paiement sur ton téléphone si ce n'est pas déjà fait. Cette page se met à jour toute seule.",
    ton: "attente",
  },
  payee: {
    titre: "Paiement reçu",
    texte: "Le vendeur a reçu ta commande et va te contacter pour la remise.",
    ton: "ok",
  },
  remise: { titre: "Commande remise", texte: "Le vendeur a indiqué t'avoir remis la commande.", ton: "ok" },
  echouee: {
    titre: "Le paiement n'a pas abouti",
    texte: "Aucun montant n'a été encaissé pour cette commande. Tu peux la repasser depuis la boutique.",
    ton: "echec",
  },
  expiree: { titre: "Le délai de paiement est dépassé", texte: "Aucun montant n'a été encaissé. Repasse une commande depuis la boutique.", ton: "echec" },
  annulee: { titre: "Commande annulée", texte: "Aucun montant n'a été encaissé.", ton: "echec" },
};

const TONS = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  attente: "border-laterite-200 bg-laterite-50 text-laterite-900 dark:border-laterite-900 dark:bg-laterite-950/50 dark:text-laterite-100",
  echec: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100",
};

export function SuiviCommande({ id, jeton }: { id: string; jeton: string }) {
  const [commande, setCommande] = useState<Commande | null>(null);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let actif = true;
    let essais = 0;
    let minuteur: ReturnType<typeof setTimeout>;

    const charger = async () => {
      const res = await fetch(`/api/boutique/commandes/${id}?j=${encodeURIComponent(jeton)}`, { cache: "no-store" });
      if (!actif) return;
      if (res.status === 404) {
        setIntrouvable(true);
        return;
      }
      if (res.ok) {
        const { commande: c } = (await res.json()) as { commande: Commande };
        setCommande(c);
        if (c.statut !== "en_attente_paiement") return;
      }
      // Revérifie pendant ~5 minutes : 5 s, puis de plus en plus espacé
      // (SasPay limite le débit de l'API).
      essais += 1;
      if (essais < 30) minuteur = setTimeout(charger, Math.min(5000 + essais * 1000, 20000));
    };
    charger();
    return () => {
      actif = false;
      clearTimeout(minuteur);
    };
  }, [id, jeton]);

  if (introuvable) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-neutral-600 dark:text-neutral-300">
        Commande introuvable. Vérifie le lien reçu après le paiement.
      </main>
    );
  }
  if (!commande) {
    return <main className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-neutral-500">Chargement de ta commande…</main>;
  }

  const message = MESSAGES[commande.statut];
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className={`rounded-2xl border px-5 py-4 ${TONS[message.ton]}`} role="status" aria-live="polite">
        <p className="font-semibold">{message.titre}</p>
        <p className="mt-1 text-sm">{message.texte}</p>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-900/60">
        <p className="text-xs text-neutral-500">Commande</p>
        <p className="font-mono text-xl font-semibold tracking-wider">{commande.reference}</p>
        <p className="mt-1 text-xs text-neutral-500">Garde cette référence : le vendeur peut te la demander.</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {commande.commande_ligne.map((l) => (
            <li key={l.nom_produit} className="flex justify-between gap-2">
              <span>
                {l.nom_produit} × {l.quantite}
              </span>
              <span>{formatFcfa(Number(l.prix_unitaire) * l.quantite)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-neutral-200 pt-3 font-semibold dark:border-neutral-800">
          <span>Total</span>
          <span>{formatFcfa(commande.montant_total)}</span>
        </p>
      </section>

      {commande.boutique && (
        <p className="mt-5 text-sm text-neutral-600 dark:text-neutral-300">
          Vendeur : <span className="font-medium">{commande.boutique.nom}</span> · {commande.boutique.telephone_contact}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {commande.boutique && (
          <Link href={`/b/${commande.boutique.slug}`} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
            {["echouee", "expiree", "annulee"].includes(commande.statut) ? "Repasser la commande" : "Retour à la boutique"}
          </Link>
        )}
      </div>
    </main>
  );
}
