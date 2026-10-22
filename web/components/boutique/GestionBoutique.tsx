"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEspace } from "@/components/compte/Espace";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { slugify } from "@/lib/slug";
import { allegationsTrouvees } from "@/lib/allegations";
import { formatDate, formatFcfa } from "@/lib/format";
import { ProduitsDisponibles } from "./ProduitsDisponibles";
import { CHAMP } from "./Dialogue";
import { FormulaireProduit, messageBase, type ProduitGere } from "./FormulaireProduit";

interface Boutique {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ville: string | null;
  telephone_contact: string;
  reversement_reseau: "orange_money" | "moov_money" | "autre" | null;
  reversement_numero: string | null;
  reversement_nom: string | null;
  statut: "active" | "suspendue";
}

type Onglet = "produits" | "commandes" | "reglages";

// Onglet "Ma boutique" de l'espace (/moi/boutique). Trois états :
// pas encore tradipraticien -> activer le statut ; tradipraticien sans
// boutique -> état vide + création ; boutique -> gestion. Dans les deux
// premiers cas, on montre ce qui se vend déjà sur Lafi.
export function GestionBoutique() {
  const { user, compte, recharger } = useEspace();
  const router = useRouter();
  const [boutique, setBoutique] = useState<Boutique | null | undefined>(undefined);
  const [creation, setCreation] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const { data } = await supabaseBrowser.from("boutique").select("*").eq("proprietaire_id", user.id).maybeSingle();
    setBoutique((data as Boutique | null) ?? null);
  }, [user.id]);

  useEffect(() => {
    // Chargement asynchrone : setState n'a lieu qu'après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  const activerStatut = async () => {
    setOccupe(true);
    setErreur(null);
    const { error } = await supabaseBrowser.from("profil_role").insert({ profil_id: user.id, role: "tradipraticien", statut: "declare" });
    setOccupe(false);
    // 23505 : déjà actif.
    if (error && error.code !== "23505") {
      setErreur(error.message);
      return;
    }
    await recharger();
    setCreation(true);
    router.refresh();
  };

  if (boutique === undefined) return <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>;
  if (boutique) return <TableauBoutique user={user} boutique={boutique} onBoutiqueChange={charger} />;
  if (creation) {
    return (
      <FormulaireBoutique
        user={user}
        boutique={null}
        onEnregistre={charger}
        onAnnuler={() => setCreation(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-10 text-center dark:border-neutral-700">
        <p className="text-3xl" aria-hidden>
          🫙
        </p>
        {compte.tradipraticien ? (
          <>
            <h2 className="mt-2 text-lg font-semibold">Tu n&apos;as pas encore de boutique</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
              Crée-la en une minute, ajoute tes produits, puis partage son lien : tes clients paient par mobile money.
            </p>
            <button type="button" onClick={() => setCreation(true)} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Créer ma boutique
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-lg font-semibold">Vendre tes préparations sur Lafi</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
              Tu es tradipraticien ? Active ton statut pour ouvrir ta boutique et vendre tes préparations.
            </p>
            <button type="button" disabled={occupe} onClick={activerStatut} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              Activer le statut tradipraticien
            </button>
          </>
        )}
        {erreur && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{erreur}</p>}
      </div>
      <ProduitsDisponibles />
    </div>
  );
}

// ---------- Création et réglages ----------

function FormulaireBoutique({
  user,
  boutique,
  onEnregistre,
  onAnnuler,
}: {
  user: User;
  boutique: Boutique | null;
  onEnregistre: () => void;
  onAnnuler?: () => void;
}) {
  const [nom, setNom] = useState(boutique?.nom ?? "");
  const [slug, setSlug] = useState(boutique?.slug ?? "");
  const [slugTouche, setSlugTouche] = useState(!!boutique);
  const [description, setDescription] = useState(boutique?.description ?? "");
  const [ville, setVille] = useState(boutique?.ville ?? "");
  const [telephone, setTelephone] = useState(boutique?.telephone_contact ?? "");
  const [reseau, setReseau] = useState(boutique?.reversement_reseau ?? "orange_money");
  const [numero, setNumero] = useState(boutique?.reversement_numero ?? "");
  const [nomCompte, setNomCompte] = useState(boutique?.reversement_nom ?? "");
  const [declaration, setDeclaration] = useState(!!boutique);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);

  const allegations = allegationsTrouvees(nom, description);
  const slugFinal = slugTouche ? slug : slugify(nom).slice(0, 40);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    if (allegations.length > 0) return;
    setEnvoi(true);
    setErreur(null);
    setEnregistre(false);
    const valeurs = {
      nom: nom.trim(),
      slug: slugFinal,
      description: description.trim() || null,
      ville: ville.trim() || null,
      telephone_contact: telephone.trim(),
      reversement_reseau: reseau,
      reversement_numero: numero.trim() || null,
      reversement_nom: nomCompte.trim() || null,
    };

    if (!boutique) {
      // Déclaration du rôle (cumulable avec le reste du compte). Déjà
      // déclaré = conflit de clé, sans importance.
      const { error: errRole } = await supabaseBrowser
        .from("profil_role")
        .insert({ profil_id: user.id, role: "tradipraticien", statut: "declare" });
      if (errRole && errRole.code !== "23505") {
        setErreur(errRole.message);
        setEnvoi(false);
        return;
      }
    }

    const { error } = boutique
      ? await supabaseBrowser.from("boutique").update(valeurs).eq("id", boutique.id)
      : await supabaseBrowser.from("boutique").insert({ ...valeurs, proprietaire_id: user.id });
    setEnvoi(false);
    if (error) {
      setErreur(messageBase(error.message));
      return;
    }
    setEnregistre(true);
    onEnregistre();
  };

  return (
    <form
      onSubmit={enregistrer}
      className="mx-auto max-w-xl space-y-4 rounded-3xl border border-neutral-200/70 bg-white p-5 sm:p-7 dark:border-neutral-800/70 dark:bg-neutral-900/60"
    >
      {!boutique && (
        <div>
          <h2 className="font-serif text-2xl font-semibold">Créer ta boutique</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Tu pourras ajouter tes produits juste après. Tout reste modifiable.
          </p>
        </div>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Nom de la boutique</span>
        <input required minLength={2} maxLength={80} value={nom} onChange={(e) => setNom(e.target.value)} className={CHAMP} placeholder="Ex. Plantes de Tenkodogo" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Adresse de ta boutique</span>
        <div className="flex items-center gap-1">
          <span className="shrink-0 text-neutral-500">{window.location.host}/b/</span>
          <input
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            minLength={3}
            maxLength={40}
            value={slugFinal}
            placeholder="plantes-de-tenkodogo"
            onChange={(e) => {
              setSlugTouche(true);
              setSlug(slugify(e.target.value));
            }}
            className={CHAMP}
          />
        </div>
        <span className="mt-1 block text-xs text-neutral-500">
          C&apos;est le lien que tu partageras à tes clients. Il se remplit tout seul avec le nom de ta boutique ; tu
          peux le changer. Exemple : <span className="font-mono">plantes-de-tenkodogo</span> (minuscules, chiffres et tirets).
        </span>
        {boutique && slugFinal !== boutique.slug && (
          <span className="mt-1 block text-xs text-laterite-700 dark:text-laterite-300">
            Attention : les liens déjà partagés avec l&apos;ancienne adresse ne marcheront plus.
          </span>
        )}
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Présentation (facultatif)</span>
        <textarea maxLength={1000} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={CHAMP} placeholder="Qui tu es, ta tradition, depuis quand tu pratiques…" />
      </label>
      {allegations.length > 0 && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
          À retirer : {allegations.join(" ; ")}.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Ville</span>
          <input maxLength={80} value={ville} onChange={(e) => setVille(e.target.value)} className={CHAMP} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Téléphone / WhatsApp public</span>
          <input required type="tel" inputMode="tel" pattern="\+?[0-9 ]{8,20}" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={CHAMP} placeholder="+226 70 00 00 00" />
        </label>
      </div>

      <fieldset className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
        <legend className="px-1 text-sm font-medium">Où Lafi te reverse l&apos;argent des ventes</legend>
        <p className="mb-3 text-xs text-neutral-500">Privé : seule l&apos;équipe de Lafi voit ce numéro.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block">Réseau</span>
            <select value={reseau} onChange={(e) => setReseau(e.target.value as Boutique["reversement_reseau"] & string)} className={CHAMP}>
              <option value="orange_money">Orange Money</option>
              <option value="moov_money">Moov Money</option>
              <option value="autre">Autre</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Numéro mobile money</span>
            <input type="tel" inputMode="tel" pattern="\+?[0-9 ]{8,20}" value={numero} onChange={(e) => setNumero(e.target.value)} className={CHAMP} />
          </label>
        </div>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block">Nom du titulaire du compte</span>
          <input maxLength={80} value={nomCompte} onChange={(e) => setNomCompte(e.target.value)} className={CHAMP} />
        </label>
      </fieldset>

      {!boutique && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} className="mt-1" />
          <span>
            Je suis tradipraticien et je vends des préparations que je fabrique ou dont je réponds. Je ne promets pas de
            guérison et j&apos;indique les précautions connues.
          </span>
        </label>
      )}

      {erreur && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{erreur}</p>}
      {enregistre && boutique && <p className="text-sm text-emerald-700 dark:text-emerald-400">Modifications enregistrées.</p>}

      <button type="submit" disabled={envoi || allegations.length > 0} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
        {envoi ? "Enregistrement…" : boutique ? "Enregistrer" : "Créer ma boutique"}
      </button>
      {onAnnuler && (
        <button type="button" onClick={onAnnuler} className="w-full text-sm text-neutral-500 hover:underline">
          Annuler
        </button>
      )}
    </form>
  );
}

// ---------- Tableau de bord ----------

function Partage({ slug, nom }: { slug: string; nom: string }) {
  const [copie, setCopie] = useState(false);
  // Jamais rendu côté serveur (le tableau attend la session) : window existe.
  const url = `${window.location.origin}/b/${slug}`;

  const copier = async () => {
    await navigator.clipboard.writeText(url);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Le lien de ta boutique</p>
      <p className="mt-1 break-all font-mono text-sm text-emerald-800 dark:text-emerald-200">{url}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copier} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
          {copie ? "Copié ✓" : "Copier le lien"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique ${nom} sur Lafi : ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900"
        >
          Partager sur WhatsApp
        </a>
        <Link href={`/b/${slug}`} className="rounded-xl px-3 py-1.5 text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-200">
          Voir ma boutique →
        </Link>
      </div>
    </div>
  );
}

function TableauBoutique({ user, boutique, onBoutiqueChange }: { user: User; boutique: Boutique; onBoutiqueChange: () => void }) {
  const [onglet, setOnglet] = useState<Onglet>("produits");

  // Onglet dans l'URL (#commandes…) : retour et partage gardent la vue.
  useEffect(() => {
    const depuisUrl = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (depuisUrl === "commandes" || depuisUrl === "reglages") setOnglet(depuisUrl);
  }, []);
  const choisir = (o: Onglet) => {
    setOnglet(o);
    window.history.replaceState(null, "", `#${o}`);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-xl font-semibold">{boutique.nom}</h2>

      {boutique.statut === "suspendue" && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
          Ta boutique est suspendue par l&apos;équipe de Lafi : elle n&apos;est plus visible. Contacte l&apos;équipe pour en savoir plus.
        </p>
      )}
      {!boutique.reversement_numero && (
        <p className="rounded-xl bg-laterite-50 px-4 py-3 text-sm text-laterite-900 dark:bg-laterite-950/50 dark:text-laterite-100">
          Indique ton numéro mobile money dans les réglages : sans lui, Lafi ne peut pas te reverser tes ventes.
        </p>
      )}

      <Partage slug={boutique.slug} nom={boutique.nom} />

      <div role="tablist" aria-label="Gestion de la boutique" className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
        {(
          [
            ["produits", "Produits"],
            ["commandes", "Commandes"],
            ["reglages", "Réglages"],
          ] as [Onglet, string][]
        ).map(([id, libelle]) => (
          <button
            key={id}
            role="tab"
            aria-selected={onglet === id}
            type="button"
            onClick={() => choisir(id)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
              onglet === id
                ? "border-emerald-600 text-emerald-800 dark:text-emerald-300"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      {onglet === "produits" && <OngletProduits user={user} boutique={boutique} />}
      {onglet === "commandes" && <OngletCommandes boutiqueId={boutique.id} />}
      {onglet === "reglages" && <FormulaireBoutique user={user} boutique={boutique} onEnregistre={onBoutiqueChange} />}
    </div>
  );
}

const STATUTS_PRODUIT: Record<ProduitGere["statut"], { libelle: string; classe: string }> = {
  publie: { libelle: "En ligne", classe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  masque: { libelle: "Masqué", classe: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
  retire: { libelle: "Retiré par Lafi", classe: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
};

function OngletProduits({ user, boutique }: { user: User; boutique: Boutique }) {
  const [produits, setProduits] = useState<ProduitGere[] | null>(null);
  const [edition, setEdition] = useState<ProduitGere | "nouveau" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const { data, error } = await supabaseBrowser
      .from("produit")
      .select(
        "id, nom, description, prix, prix_reduit, ville, plante_origine_libre, stock, image_url, statut, retire_motif, produit_taxon(taxon_id)"
      )
      .eq("boutique_id", boutique.id)
      .order("created_at", { ascending: false });
    if (error) {
      setErreur(error.message);
      return;
    }
    setProduits(
      (data ?? []).map((p) => ({
        ...p,
        prix: Number(p.prix),
        prix_reduit: p.prix_reduit === null ? null : Number(p.prix_reduit),
        taxonIds: (p.produit_taxon as { taxon_id: string }[]).map((t) => t.taxon_id),
      })) as ProduitGere[]
    );
  }, [boutique.id]);

  useEffect(() => {
    // Chargement asynchrone : setState n'a lieu qu'après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  const basculer = async (p: ProduitGere) => {
    setErreur(null);
    const { error } = await supabaseBrowser
      .from("produit")
      .update({ statut: p.statut === "publie" ? "masque" : "publie" })
      .eq("id", p.id);
    if (error) setErreur(error.message);
    charger();
  };

  const supprimer = async (p: ProduitGere) => {
    if (!window.confirm(`Supprimer « ${p.nom} » ? Les commandes déjà passées restent dans ton historique.`)) return;
    const { error } = await supabaseBrowser.from("produit").delete().eq("id", p.id);
    if (error) setErreur(error.message);
    charger();
  };

  if (!produits) return <p className="text-sm text-neutral-500">Chargement des produits…</p>;

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setEdition("nouveau")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
        + Ajouter un produit
      </button>
      {erreur && <p className="text-sm text-red-700 dark:text-red-300">{erreur}</p>}
      {produits.length === 0 && (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Aucun produit pour l&apos;instant. Ajoute ton premier produit : il sera en ligne tout de suite.
        </p>
      )}
      <ul className="space-y-2">
        {produits.map((p) => (
          <li key={p.id} className="flex gap-3 rounded-2xl border border-neutral-200/70 bg-white p-3 dark:border-neutral-800/70 dark:bg-neutral-900/60">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950/40" aria-hidden>
                🌿
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{p.nom}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUTS_PRODUIT[p.statut].classe}`}>{STATUTS_PRODUIT[p.statut].libelle}</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {p.prix_reduit !== null ? (
                  <>
                    {formatFcfa(p.prix_reduit)} <span className="text-neutral-400 line-through">{formatFcfa(p.prix)}</span>
                  </>
                ) : (
                  formatFcfa(p.prix)
                )}
                {p.ville && ` · ${p.ville}`}
                {p.stock !== null && ` · ${p.stock === 0 ? "épuisé" : `${p.stock} en stock`}`}
              </p>
              {p.statut === "retire" && p.retire_motif && <p className="mt-1 text-xs text-red-700 dark:text-red-300">Motif : {p.retire_motif}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
                <button type="button" onClick={() => setEdition(p)} className="text-emerald-700 hover:underline dark:text-emerald-400">
                  Modifier
                </button>
                {p.statut !== "retire" && (
                  <button type="button" onClick={() => basculer(p)} className="text-neutral-600 hover:underline dark:text-neutral-300">
                    {p.statut === "publie" ? "Masquer" : "Remettre en ligne"}
                  </button>
                )}
                <button type="button" onClick={() => supprimer(p)} className="text-red-700 hover:underline dark:text-red-400">
                  Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {edition && (
        <FormulaireProduit
          boutiqueId={boutique.id}
          villeBoutique={boutique.ville}
          userId={user.id}
          produit={edition === "nouveau" ? null : edition}
          onFermer={() => setEdition(null)}
          onEnregistre={() => {
            setEdition(null);
            charger();
          }}
        />
      )}
    </div>
  );
}

interface CommandeVendeur {
  id: string;
  reference: string;
  statut: "en_attente_paiement" | "payee" | "echouee" | "expiree" | "remise" | "annulee";
  acheteur_nom: string;
  acheteur_telephone: string;
  acheteur_note: string | null;
  montant_total: string;
  montant_a_reverser: string | null;
  reversement_statut: "non_du" | "a_reverser" | "reverse";
  reverse_le: string | null;
  created_at: string;
  commande_ligne: { nom_produit: string; quantite: number }[];
}

function OngletCommandes({ boutiqueId }: { boutiqueId: string }) {
  const [commandes, setCommandes] = useState<CommandeVendeur[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    // Les commandes jamais payées (abandonnées, expirées) n'intéressent pas
    // le vendeur : rien n'a été encaissé.
    const { data, error } = await supabaseBrowser
      .from("commande")
      .select(
        "id, reference, statut, acheteur_nom, acheteur_telephone, acheteur_note, montant_total, montant_a_reverser, reversement_statut, reverse_le, created_at, commande_ligne(nom_produit, quantite)"
      )
      .eq("boutique_id", boutiqueId)
      .in("statut", ["payee", "remise"])
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErreur(error.message);
    else setCommandes(data as CommandeVendeur[]);
  }, [boutiqueId]);

  useEffect(() => {
    // Chargement asynchrone : setState n'a lieu qu'après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  const marquerRemise = async (c: CommandeVendeur) => {
    const { error } = await supabaseBrowser.rpc("commande_marquer_remise", { p_commande: c.id });
    if (error) setErreur(error.message);
    charger();
  };

  if (erreur) return <p className="text-sm text-red-700 dark:text-red-300">{erreur}</p>;
  if (!commandes) return <p className="text-sm text-neutral-500">Chargement des commandes…</p>;
  if (commandes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        Pas encore de commande payée. Partage le lien de ta boutique pour te faire connaître.
      </p>
    );
  }

  const aRemettre = commandes.filter((c) => c.statut === "payee");
  const aReverser = commandes.filter((c) => c.reversement_statut === "a_reverser").reduce((s, c) => s + Number(c.montant_a_reverser ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 dark:bg-neutral-900/60">
          <p className="text-xs text-neutral-500">À remettre aux acheteurs</p>
          <p className="text-2xl font-semibold">{aRemettre.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 dark:bg-neutral-900/60">
          <p className="text-xs text-neutral-500">En attente de reversement par Lafi</p>
          <p className="text-2xl font-semibold">{formatFcfa(aReverser)}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {commandes.map((c) => (
          <li key={c.id} className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800/70 dark:bg-neutral-900/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono font-semibold tracking-wider">{c.reference}</p>
              <span className="text-xs text-neutral-500">{formatDate(c.created_at)}</span>
            </div>
            <p className="mt-1 text-sm">{c.commande_ligne.map((l) => `${l.nom_produit} × ${l.quantite}`).join(", ")}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              {c.acheteur_nom} ·{" "}
              <a href={`tel:${c.acheteur_telephone.replace(/\s/g, "")}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                {c.acheteur_telephone}
              </a>
            </p>
            {c.acheteur_note && <p className="mt-1 text-sm italic text-neutral-500">« {c.acheteur_note} »</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span>
                Payé {formatFcfa(c.montant_total)}
                {c.montant_a_reverser && <span className="text-neutral-500"> · pour toi {formatFcfa(c.montant_a_reverser)}</span>}
              </span>
              <span className="text-xs text-neutral-500">
                {c.reversement_statut === "reverse" && c.reverse_le ? `Reversé le ${formatDate(c.reverse_le)}` : "Reversement à venir"}
              </span>
            </div>
            {c.statut === "payee" ? (
              <button type="button" onClick={() => marquerRemise(c)} className="mt-3 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                J&apos;ai remis la commande
              </button>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">Remise ✓</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
