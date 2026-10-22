import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import { estAdmin, utilisateurDeLaRequete } from "@/lib/authServeur";

// Administration des ventes : reversements manuels (décision du 22/10 —
// les reversements se font depuis le tableau de bord SasPay, puis sont
// enregistrés ici) et modération a posteriori des produits.

async function adminOuRefus(req: Request) {
  const user = await utilisateurDeLaRequete(req);
  if (!user) return { refus: Response.json({ message: "Connecte-toi." }, { status: 401 }) };
  if (!(await estAdmin(user.id))) return { refus: Response.json({ message: "Accès réservé à l'équipe Lafi." }, { status: 403 }) };
  return { user };
}

export async function GET(req: Request) {
  const { refus } = await adminOuRefus(req);
  if (refus) return refus;

  const [aReverser, signalements, retires] = await Promise.all([
    supabaseServer
      .from("commande")
      .select(
        "id, reference, statut, montant_total, frais_saspay, montant_net, montant_a_reverser, payee_le, boutique(id, nom, slug, reversement_reseau, reversement_numero, reversement_nom, telephone_contact)"
      )
      .eq("reversement_statut", "a_reverser")
      .order("payee_le", { ascending: true }),
    supabaseServer
      .from("signalement_produit")
      .select("id, motif, contact, created_at, produit(id, nom, statut, boutique(nom, slug))")
      .eq("traite", false)
      .order("created_at", { ascending: true }),
    supabaseServer
      .from("produit")
      .select("id, nom, retire_motif, updated_at, boutique(nom, slug)")
      .eq("statut", "retire")
      .order("updated_at", { ascending: false })
      .limit(50),
  ]);

  const erreur = aReverser.error ?? signalements.error ?? retires.error;
  if (erreur) return Response.json({ message: erreur.message }, { status: 500 });
  return Response.json({ aReverser: aReverser.data, signalements: signalements.data, retires: retires.data });
}

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("marquer_reverse"),
    commandeIds: z.array(z.uuid()).min(1),
    // Référence du reversement dans le tableau de bord SasPay : sans elle,
    // impossible de rapprocher en cas de litige.
    reference: z.string().trim().min(3, "Indique la référence du reversement SasPay.").max(120),
  }),
  z.object({ action: z.literal("retirer_produit"), produitId: z.uuid(), motif: z.string().trim().min(3).max(500) }),
  z.object({ action: z.literal("retablir_produit"), produitId: z.uuid() }),
  z.object({ action: z.literal("signalement_traite"), signalementId: z.uuid() }),
]);

export async function POST(req: Request) {
  const { user, refus } = await adminOuRefus(req);
  if (refus) return refus;

  const parsed = ActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Action invalide." }, { status: 400 });
  }
  const a = parsed.data;

  let resultat;
  switch (a.action) {
    case "marquer_reverse":
      resultat = await supabaseServer
        .from("commande")
        .update({
          reversement_statut: "reverse",
          reversement_reference: a.reference,
          reverse_le: new Date().toISOString(),
          reverse_par: user.id,
        })
        .in("id", a.commandeIds)
        .eq("reversement_statut", "a_reverser");
      break;
    case "retirer_produit":
      resultat = await supabaseServer.from("produit").update({ statut: "retire", retire_motif: a.motif }).eq("id", a.produitId);
      break;
    case "retablir_produit":
      // Rétabli en "masqué" : le vendeur choisit lui-même de republier.
      resultat = await supabaseServer.from("produit").update({ statut: "masque", retire_motif: null }).eq("id", a.produitId);
      break;
    case "signalement_traite":
      resultat = await supabaseServer.from("signalement_produit").update({ traite: true }).eq("id", a.signalementId);
      break;
  }
  if (resultat.error) return Response.json({ message: resultat.error.message }, { status: 500 });
  return Response.json({ ok: true });
}
