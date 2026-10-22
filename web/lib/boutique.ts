import crypto from "crypto";
import { supabaseServer } from "./supabase";
import { creerSessionCheckout, SasPayErreur, statutSession, verifierPaiement } from "./saspay";

// Boutiques des tradipraticiens — logique serveur (service role). Les
// lectures publiques sélectionnent leurs colonnes une à une : le numéro de
// reversement d'une boutique ne doit jamais sortir d'ici.

export interface ProduitPublic {
  id: string;
  nom: string;
  description: string | null;
  // Prix payé (réduit s'il y a une réduction) ; prixInitial = prix barré.
  prix: number;
  prixInitial: number | null;
  ville: string | null;
  planteOrigine: string | null;
  stock: number | null;
  image_url: string | null;
  plantes: { slug: string; nom_scientifique: string }[];
}

export interface BoutiquePublique {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ville: string | null;
  telephone_contact: string;
  produits: ProduitPublic[];
}

export async function getBoutiquePublique(slug: string): Promise<BoutiquePublique | null> {
  const { data: boutique, error } = await supabaseServer
    .from("boutique")
    .select("id, slug, nom, description, ville, telephone_contact")
    .eq("slug", slug)
    .eq("statut", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!boutique) return null;

  const { data: produits, error: errProduits } = await supabaseServer
    .from("produit")
    .select(
      "id, nom, description, prix, prix_reduit, ville, plante_origine_libre, stock, image_url, produit_taxon(taxon(slug, nom_scientifique))"
    )
    .eq("boutique_id", boutique.id)
    .eq("statut", "publie")
    .order("created_at", { ascending: false });
  if (errProduits) throw new Error(errProduits.message);

  type Ligne = {
    id: string;
    nom: string;
    description: string | null;
    prix: number | string;
    prix_reduit: number | string | null;
    ville: string | null;
    plante_origine_libre: string | null;
    stock: number | null;
    image_url: string | null;
    produit_taxon: { taxon: { slug: string; nom_scientifique: string } | null }[];
  };

  return {
    ...boutique,
    produits: ((produits ?? []) as unknown as Ligne[]).map((p) => ({
      id: p.id,
      nom: p.nom,
      description: p.description,
      prix: Number(p.prix_reduit ?? p.prix),
      prixInitial: p.prix_reduit !== null ? Number(p.prix) : null,
      ville: p.ville ?? boutique.ville,
      planteOrigine: p.plante_origine_libre,
      stock: p.stock,
      image_url: p.image_url,
      plantes: p.produit_taxon.flatMap((pt) => (pt.taxon ? [pt.taxon] : [])),
    })),
  };
}

// Vitrine générale : derniers produits en ligne, toutes boutiques actives
// confondues. Affichée dans l'espace d'un vendeur qui n'a pas encore de
// boutique, pour qu'il voie ce qui se vend déjà sur Lafi.
export interface ProduitDisponible {
  id: string;
  nom: string;
  prix: number;
  prixInitial: number | null;
  image_url: string | null;
  boutique: { nom: string; slug: string; ville: string | null };
}

export async function getProduitsDisponibles(limite = 12): Promise<ProduitDisponible[]> {
  const { data, error } = await supabaseServer
    .from("produit")
    .select("id, nom, prix, prix_reduit, image_url, boutique!inner(nom, slug, ville, statut)")
    .eq("statut", "publie")
    .eq("boutique.statut", "active")
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  type Ligne = {
    id: string;
    nom: string;
    prix: number | string;
    prix_reduit: number | string | null;
    image_url: string | null;
    boutique: { nom: string; slug: string; ville: string | null };
  };
  return ((data ?? []) as unknown as Ligne[]).map((p) => ({
    id: p.id,
    nom: p.nom,
    prix: Number(p.prix_reduit ?? p.prix),
    prixInitial: p.prix_reduit !== null ? Number(p.prix) : null,
    image_url: p.image_url,
    boutique: { nom: p.boutique.nom, slug: p.boutique.slug, ville: p.boutique.ville },
  }));
}

// ---------- Commandes ----------

export class CommandeErreur extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export interface NouvelleCommande {
  slug: string;
  lignes: { produitId: string; quantite: number }[];
  acheteur: { nom: string; telephone: string; email: string; note?: string };
}

// Référence courte à dicter au téléphone : sans 0/O ni 1/I.
function referenceCommande(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const octets = crypto.randomBytes(6);
  return "L" + Array.from(octets, (o) => alphabet[o % alphabet.length]).join("");
}

export async function creerCommande(entree: NouvelleCommande, origine: string): Promise<{ checkoutUrl: string }> {
  const { data: boutique } = await supabaseServer
    .from("boutique")
    .select("id, slug, nom")
    .eq("slug", entree.slug)
    .eq("statut", "active")
    .maybeSingle();
  if (!boutique) throw new CommandeErreur("Cette boutique n'existe pas ou n'est plus active.", 404);

  // Les prix viennent TOUJOURS de la base, jamais du navigateur.
  const ids = [...new Set(entree.lignes.map((l) => l.produitId))];
  const { data: produits } = await supabaseServer
    .from("produit")
    .select("id, nom, prix, prix_reduit, stock")
    .eq("boutique_id", boutique.id)
    .eq("statut", "publie")
    .in("id", ids);
  const parId = new Map((produits ?? []).map((p) => [p.id, p]));

  const lignes = entree.lignes.map((l) => {
    const produit = parId.get(l.produitId);
    if (!produit) throw new CommandeErreur("Un produit de ton panier n'est plus disponible : recharge la page.");
    if (produit.stock !== null && produit.stock < l.quantite) {
      throw new CommandeErreur(
        produit.stock === 0
          ? `« ${produit.nom} » est épuisé.`
          : `Il ne reste que ${produit.stock} « ${produit.nom} ».`
      );
    }
    return { produit_id: produit.id, nom_produit: produit.nom, prix_unitaire: Number(produit.prix_reduit ?? produit.prix), quantite: l.quantite };
  });
  const total = lignes.reduce((somme, l) => somme + l.prix_unitaire * l.quantite, 0);

  const reference = referenceCommande();
  const jeton = crypto.randomBytes(16).toString("hex");
  const { data: commande, error } = await supabaseServer
    .from("commande")
    .insert({
      reference,
      jeton_acces: jeton,
      boutique_id: boutique.id,
      acheteur_nom: entree.acheteur.nom,
      acheteur_telephone: entree.acheteur.telephone,
      acheteur_email: entree.acheteur.email,
      acheteur_note: entree.acheteur.note || null,
      montant_total: total,
      // Décision du 22/10 : aucune commission pendant le pilote.
      commission_taux: 0,
    })
    .select("id")
    .single();
  if (error || !commande) throw new CommandeErreur(`Commande impossible : ${error?.message ?? "erreur inconnue"}`, 500);

  const { error: errLignes } = await supabaseServer
    .from("commande_ligne")
    .insert(lignes.map((l) => ({ ...l, commande_id: commande.id })));
  if (errLignes) {
    await supabaseServer.from("commande").update({ statut: "annulee" }).eq("id", commande.id);
    throw new CommandeErreur(`Commande impossible : ${errLignes.message}`, 500);
  }

  try {
    const session = await creerSessionCheckout({
      montantFcfa: total,
      description: `Commande ${reference} — ${boutique.nom} (via Lafi)`,
      client: entree.acheteur,
      returnUrl: `${origine}/b/${boutique.slug}/commande/${commande.id}?j=${jeton}`,
      metadata: { commande_id: commande.id, reference },
    });
    await supabaseServer
      .from("commande")
      .update({ saspay_session_id: session.id, saspay_checkout_url: session.checkout_url })
      .eq("id", commande.id);
    return { checkoutUrl: session.checkout_url };
  } catch (error) {
    await supabaseServer.from("commande").update({ statut: "annulee" }).eq("id", commande.id);
    if (error instanceof SasPayErreur) {
      throw new CommandeErreur(
        error.code === "configuration"
          ? "Le paiement n'est pas encore configuré sur Lafi."
          : `Le paiement n'a pas pu démarrer : ${error.message}`,
        502
      );
    }
    throw error;
  }
}

interface CommandeSync {
  id: string;
  statut: string;
  saspay_session_id: string | null;
}

// Met la commande à jour depuis SasPay. Appelée par la page de retour de
// l'acheteur et par le webhook ; la confirmation SQL est idempotente, donc
// ces appels concurrents ne confirment jamais deux fois.
export async function synchroniserCommande(commande: CommandeSync): Promise<string> {
  if (!["en_attente_paiement", "echouee"].includes(commande.statut) || !commande.saspay_session_id) {
    return commande.statut;
  }

  const session = await statutSession(commande.saspay_session_id);
  if (!session.transaction_id) {
    if (["EXPIRED", "CANCELLED"].includes(session.status)) {
      await supabaseServer.from("commande").update({ statut: "expiree" }).eq("id", commande.id).eq("statut", commande.statut);
      return "expiree";
    }
    return commande.statut;
  }

  // Seul /verify/ autorise à considérer la commande payée.
  const paiement = await verifierPaiement(session.transaction_id);
  if (paiement.status === "SUCCESS") {
    const net = Number(paiement.net_amount);
    const frais = Number(paiement.requested_amount) - net;
    const { error } = await supabaseServer.rpc("commande_confirmer_paiement", {
      p_commande: commande.id,
      p_transaction_id: paiement.id,
      p_reference: paiement.reference,
      p_net: net,
      p_frais: frais,
    });
    if (error) throw new Error(`Confirmation de la commande ${commande.id} : ${error.message}`);
    return "payee";
  }
  if (paiement.status === "FAILED" && commande.statut !== "echouee") {
    await supabaseServer
      .from("commande")
      .update({ statut: "echouee", saspay_transaction_id: paiement.id })
      .eq("id", commande.id)
      .eq("statut", "en_attente_paiement");
    return "echouee";
  }
  return commande.statut;
}

export async function getCommandeAcheteur(id: string, jeton: string) {
  const { data } = await supabaseServer
    .from("commande")
    .select(
      "id, reference, jeton_acces, statut, montant_total, saspay_session_id, saspay_checkout_url, created_at, boutique(slug, nom, telephone_contact), commande_ligne(nom_produit, prix_unitaire, quantite)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  // Comparaison en temps constant : le jeton est le seul droit d'accès.
  const a = Buffer.from(data.jeton_acces);
  const b = Buffer.from(jeton);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return data;
}
