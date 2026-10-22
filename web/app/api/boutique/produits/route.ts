import { getProduitsDisponibles } from "@/lib/boutique";

// Produits en ligne sur Lafi (toutes boutiques) — lecture publique.
export async function GET() {
  try {
    return Response.json({ produits: await getProduitsDisponibles() });
  } catch (error) {
    console.error(JSON.stringify({ scope: "boutique", evenement: "produits_echec", erreur: String(error) }));
    return Response.json({ produits: [] });
  }
}
