import { z } from "zod";
import { CommandeErreur, creerCommande } from "@/lib/boutique";

const TELEPHONE = /^\+?[0-9 ]{8,20}$/;

const CommandeSchema = z.object({
  slug: z.string().trim().min(3).max(40),
  lignes: z
    .array(z.object({ produitId: z.uuid(), quantite: z.number().int().min(1).max(99) }))
    .min(1, "Ton panier est vide.")
    .max(30),
  acheteur: z.object({
    nom: z.string().trim().min(2, "Indique ton nom.").max(80),
    telephone: z.string().trim().regex(TELEPHONE, "Numéro de téléphone invalide."),
    // Exigé par SasPay pour un paiement hébergé (customer_email) : le reçu
    // y est envoyé.
    email: z.email("Adresse e-mail invalide."),
    note: z.string().trim().max(500).optional(),
  }),
});

export async function POST(req: Request) {
  const parsed = CommandeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Commande invalide." }, { status: 400 });
  }

  const origine = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  try {
    const { checkoutUrl } = await creerCommande(parsed.data, origine);
    return Response.json({ checkoutUrl });
  } catch (error) {
    if (error instanceof CommandeErreur) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    console.error(JSON.stringify({ scope: "boutique", evenement: "commande_echec", erreur: String(error) }));
    return Response.json({ message: "La commande n'a pas pu être créée. Réessaie dans un instant." }, { status: 500 });
  }
}
