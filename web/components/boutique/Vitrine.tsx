"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { BoutiquePublique, ProduitPublic } from "@/lib/boutique";
import { formatFcfa } from "@/lib/format";
import { CHAMP, Dialogue } from "./Dialogue";

type Panier = Record<string, number>;

function lienWhatsApp(telephone: string, texte: string) {
  return `https://wa.me/${telephone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(texte)}`;
}

function CarteProduit({
  produit,
  quantite,
  onChanger,
  onSignaler,
}: {
  produit: ProduitPublic;
  quantite: number;
  onChanger: (q: number) => void;
  onSignaler: () => void;
}) {
  const epuise = produit.stock === 0;
  const max = Math.min(produit.stock ?? 99, 99);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-900/60">
      {produit.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={produit.image_url} alt={produit.nom} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-emerald-50 text-3xl dark:bg-emerald-950/40" aria-hidden>
          🌿
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{produit.nom}</h3>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">{formatFcfa(produit.prix)}</span>
          {produit.prixInitial && (
            <>
              <span className="text-sm text-neutral-400 line-through">{formatFcfa(produit.prixInitial)}</span>
              <span className="rounded-full bg-laterite-100 px-2 py-0.5 text-xs font-semibold text-laterite-800 dark:bg-laterite-950 dark:text-laterite-200">
                −{Math.round((1 - produit.prix / produit.prixInitial) * 100)} %
              </span>
            </>
          )}
        </p>
        {(produit.ville || produit.planteOrigine) && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {[produit.ville, produit.planteOrigine && `Plante : ${produit.planteOrigine}`].filter(Boolean).join(" · ")}
          </p>
        )}
        {produit.description && (
          <p className="mt-2 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">{produit.description}</p>
        )}
        {produit.plantes.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Plantes :{" "}
            {produit.plantes.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && ", "}
                <Link href={`/plants/${p.slug}`} className="italic text-emerald-700 hover:underline dark:text-emerald-400">
                  {p.nom_scientifique}
                </Link>
              </span>
            ))}
            <span className="block text-[11px]">La fiche de chaque plante dit ce qui est documenté, et ce qui ne l&apos;est pas.</span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {epuise ? (
            <span className="text-sm font-medium text-neutral-500">Épuisé</span>
          ) : quantite === 0 ? (
            <button
              type="button"
              onClick={() => onChanger(1)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Ajouter
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl border border-emerald-200 dark:border-emerald-900" role="group" aria-label={`Quantité de ${produit.nom}`}>
              <button type="button" onClick={() => onChanger(quantite - 1)} aria-label="Retirer un" className="px-3 py-1.5 text-lg leading-none text-emerald-700 dark:text-emerald-400">
                −
              </button>
              <span className="min-w-6 text-center text-sm font-semibold" aria-live="polite">
                {quantite}
              </span>
              <button
                type="button"
                onClick={() => onChanger(Math.min(quantite + 1, max))}
                disabled={quantite >= max}
                aria-label="Ajouter un"
                className="px-3 py-1.5 text-lg leading-none text-emerald-700 disabled:opacity-40 dark:text-emerald-400"
              >
                +
              </button>
            </div>
          )}
          <button type="button" onClick={onSignaler} className="text-xs text-neutral-400 hover:text-neutral-600 hover:underline dark:hover:text-neutral-300">
            Signaler
          </button>
        </div>
      </div>
    </article>
  );
}

export function Vitrine({ boutique }: { boutique: BoutiquePublique }) {
  const [panier, setPanier] = useState<Panier>({});
  const [commandeOuverte, setCommandeOuverte] = useState(false);
  const [aSignaler, setASignaler] = useState<ProduitPublic | null>(null);

  const lignes = useMemo(
    () =>
      boutique.produits
        .filter((p) => (panier[p.id] ?? 0) > 0)
        .map((p) => ({ produit: p, quantite: panier[p.id] })),
    [boutique.produits, panier]
  );
  const total = lignes.reduce((s, l) => s + l.produit.prix * l.quantite, 0);
  const articles = lignes.reduce((s, l) => s + l.quantite, 0);

  const changer = (id: string, q: number) =>
    setPanier((p) => {
      const suivant = { ...p };
      if (q <= 0) delete suivant[id];
      else suivant[id] = q;
      return suivant;
    });

  return (
    <main className="mx-auto max-w-[1100px] px-4 pb-32 pt-8">
      <header className="rounded-3xl border border-neutral-200/70 bg-white p-5 sm:p-7 dark:border-neutral-800/70 dark:bg-neutral-900/60">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Boutique de tradipraticien</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">{boutique.nom}</h1>
        {boutique.ville && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{boutique.ville}</p>}
        {boutique.description && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{boutique.description}</p>
        )}
        <a
          href={lienWhatsApp(boutique.telephone_contact, `Bonjour, je vous contacte depuis votre boutique Lafi (${boutique.nom}).`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          Écrire sur WhatsApp · {boutique.telephone_contact}
        </a>
        <p className="mt-4 rounded-xl bg-emerald-50/70 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
          Ces préparations sont fabriquées et vendues par {boutique.nom}, sous sa responsabilité. Lafi encaisse le paiement
          pour le compte du vendeur mais ne contrôle pas les produits. Elles ne remplacent pas une consultation : en cas
          de fièvre, de grossesse, chez un jeune enfant ou si tu suis un traitement, demande d&apos;abord un avis au centre de santé.
        </p>
      </header>

      {boutique.produits.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-500">Aucun produit en vente pour le moment.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boutique.produits.map((p) => (
            <CarteProduit
              key={p.id}
              produit={p}
              quantite={panier[p.id] ?? 0}
              onChanger={(q) => changer(p.id, q)}
              onSignaler={() => setASignaler(p)}
            />
          ))}
        </div>
      )}

      {articles > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-sand-50/95 px-4 py-3 backdrop-blur dark:border-neutral-800/70 dark:bg-sand-950/95">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {articles} article{articles > 1 ? "s" : ""} · <span className="font-semibold">{formatFcfa(total)}</span>
            </p>
            <button
              type="button"
              onClick={() => setCommandeOuverte(true)}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Commander
            </button>
          </div>
        </div>
      )}

      {commandeOuverte && (
        <FormulaireCommande
          slug={boutique.slug}
          lignes={lignes}
          total={total}
          onChanger={changer}
          onFermer={() => setCommandeOuverte(false)}
        />
      )}
      {aSignaler && <FormulaireSignalement produit={aSignaler} onFermer={() => setASignaler(null)} />}
    </main>
  );
}

function FormulaireCommande({
  slug,
  lignes,
  total,
  onChanger,
  onFermer,
}: {
  slug: string;
  lignes: { produit: ProduitPublic; quantite: number }[];
  total: number;
  onChanger: (id: string, q: number) => void;
  onFermer: () => void;
}) {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch("/api/boutique/commandes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          lignes: lignes.map((l) => ({ produitId: l.produit.id, quantite: l.quantite })),
          acheteur: { nom, telephone, email, note: note || undefined },
        }),
      });
      const corps = (await res.json()) as { checkoutUrl?: string; message?: string };
      if (!res.ok || !corps.checkoutUrl) throw new Error(corps.message ?? "La commande n'a pas pu être créée.");
      // Page de paiement SasPay : choix du réseau (Orange, Moov…) et du numéro.
      window.location.href = corps.checkoutUrl;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
      setEnvoi(false);
    }
  };

  return (
    <Dialogue titre="Ta commande" onFermer={onFermer}>
      <ul className="space-y-2">
        {lignes.map(({ produit, quantite }) => (
          <li key={produit.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-neutral-800 dark:text-neutral-200">
              {produit.nom} <span className="text-neutral-500">× {quantite}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-medium">{formatFcfa(produit.prix * quantite)}</span>
              <button type="button" onClick={() => onChanger(produit.id, 0)} className="text-xs text-neutral-400 hover:underline" aria-label={`Retirer ${produit.nom}`}>
                retirer
              </button>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
        <span>Total</span>
        <span>{formatFcfa(total)}</span>
      </p>

      <form onSubmit={envoyer} className="mt-5 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">Ton nom</span>
          <input required minLength={2} maxLength={80} value={nom} onChange={(e) => setNom(e.target.value)} className={CHAMP} autoComplete="name" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">Téléphone</span>
          <input
            required
            type="tel"
            inputMode="tel"
            pattern="\+?[0-9 ]{8,20}"
            placeholder="70 00 00 00"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className={CHAMP}
            autoComplete="tel"
          />
          <span className="mt-1 block text-xs text-neutral-500">Le vendeur t&apos;appelle sur ce numéro pour la remise.</span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">E-mail</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CHAMP} autoComplete="email" />
          <span className="mt-1 block text-xs text-neutral-500">Demandé par le service de paiement pour t&apos;envoyer le reçu.</span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700 dark:text-neutral-300">Un mot pour le vendeur (facultatif)</span>
          <textarea maxLength={500} rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={CHAMP} placeholder="Quartier, horaire de passage…" />
        </label>

        {erreur && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi || lignes.length === 0}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {envoi ? "Ouverture du paiement…" : `Payer ${formatFcfa(total)} par mobile money`}
        </button>
        <p className="text-center text-xs text-neutral-500">
          Paiement sécurisé par SasPay. Tes coordonnées sont transmises au vendeur pour la remise.
        </p>
      </form>
    </Dialogue>
  );
}

function FormulaireSignalement({ produit, onFermer }: { produit: ProduitPublic; onFermer: () => void }) {
  const [motif, setMotif] = useState("");
  const [contact, setContact] = useState("");
  const [etat, setEtat] = useState<"saisie" | "envoi" | "envoye">("saisie");
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setEtat("envoi");
    setErreur(null);
    const res = await fetch("/api/boutique/signalements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ produitId: produit.id, motif, contact: contact || undefined }),
    });
    if (res.ok) setEtat("envoye");
    else {
      setErreur(((await res.json().catch(() => ({}))) as { message?: string }).message ?? "Envoi impossible.");
      setEtat("saisie");
    }
  };

  return (
    <Dialogue titre={`Signaler « ${produit.nom} »`} onFermer={onFermer}>
      {etat === "envoye" ? (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">Merci. L&apos;équipe de Lafi va examiner ce produit.</p>
      ) : (
        <form onSubmit={envoyer} className="space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Promesse de guérison, produit dangereux, arnaque… Dis-nous ce qui pose problème.
          </p>
          <textarea required minLength={3} maxLength={500} rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} className={CHAMP} />
          <input
            maxLength={120}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={CHAMP}
            placeholder="Ton contact, si on peut te répondre (facultatif)"
          />
          {erreur && <p className="text-sm text-red-700 dark:text-red-300">{erreur}</p>}
          <button type="submit" disabled={etat === "envoi"} className="w-full rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-200 dark:text-neutral-900">
            Envoyer le signalement
          </button>
        </form>
      )}
    </Dialogue>
  );
}
