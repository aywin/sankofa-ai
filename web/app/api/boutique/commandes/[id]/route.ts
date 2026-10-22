import { getCommandeAcheteur, synchroniserCommande } from "@/lib/boutique";

// Suivi d'une commande par l'acheteur (sans compte) : l'accès se fait avec
// le jeton reçu dans l'URL de retour du paiement. Chaque consultation d'une
// commande non finalisée revérifie l'état réel auprès de SasPay.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jeton = new URL(req.url).searchParams.get("j") ?? "";
  const commande = await getCommandeAcheteur(id, jeton);
  if (!commande) return Response.json({ message: "Commande introuvable." }, { status: 404 });

  let statut = commande.statut;
  try {
    statut = await synchroniserCommande(commande);
  } catch (error) {
    // SasPay injoignable : on renvoie l'état connu, la page réessaiera.
    console.error(JSON.stringify({ scope: "boutique", evenement: "sync_echec", commande: id, erreur: String(error) }));
  }

  // Champs choisis un à un : ni le jeton, ni les identifiants SasPay.
  return Response.json({
    commande: {
      reference: commande.reference,
      statut,
      montant_total: commande.montant_total,
      created_at: commande.created_at,
      boutique: commande.boutique,
      commande_ligne: commande.commande_ligne,
    },
  });
}
