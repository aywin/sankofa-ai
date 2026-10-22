import { supabaseServer } from "@/lib/supabase";
import { signatureWebhookValide } from "@/lib/saspay";
import { synchroniserCommande } from "@/lib/boutique";

// Webhook SasPay (événements transaction.*), configuré depuis le tableau de
// bord SasPay vers https://<domaine>/api/saspay/webhook.
//
// Le corps du webhook ne fait jamais foi : il sert seulement à savoir
// QUELLE commande revérifier. La confirmation passe toujours par
// GET /payments/{id}/verify/ (synchroniserCommande).
export async function POST(req: Request) {
  // Signature calculée sur le corps BRUT : jamais re-sérialiser avant.
  const corpsBrut = await req.text();
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  const valide =
    !!secret &&
    signatureWebhookValide(
      corpsBrut,
      req.headers.get("x-webhook-signature"),
      req.headers.get("x-webhook-timestamp"),
      secret
    );

  let corps: { event?: string; data?: { id?: string } } | null = null;
  try {
    corps = JSON.parse(corpsBrut);
  } catch {
    // journalisé tel quel ci-dessous
  }

  const { data: journal } = await supabaseServer
    .from("saspay_evenement")
    .insert({
      evenement: corps?.event ?? req.headers.get("x-webhook-event"),
      transaction_id: corps?.data?.id ?? null,
      signature_valide: valide,
      corps: valide ? corps : null,
      erreur: secret ? (valide ? null : "signature ou horodatage invalide") : "SASPAY_WEBHOOK_SECRET absente",
    })
    .select("id")
    .single();

  if (!valide) return Response.json({ message: "Signature invalide." }, { status: 403 });

  if (corps?.event?.startsWith("transaction.")) {
    try {
      // Commande déjà reliée à cette transaction, sinon toutes les commandes
      // récentes en attente (la transaction n'est connue qu'après le
      // premier passage par le statut de session).
      const { data: liee } = await supabaseServer
        .from("commande")
        .select("id, statut, saspay_session_id")
        .eq("saspay_transaction_id", corps.data?.id ?? "")
        .maybeSingle();
      const depuis = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const aVerifier = liee
        ? [liee]
        : ((
            await supabaseServer
              .from("commande")
              .select("id, statut, saspay_session_id")
              .in("statut", ["en_attente_paiement", "echouee"])
              .not("saspay_session_id", "is", null)
              .gte("created_at", depuis)
              .limit(50)
          ).data ?? []);
      for (const commande of aVerifier) await synchroniserCommande(commande);
      if (journal) await supabaseServer.from("saspay_evenement").update({ traite_le: new Date().toISOString() }).eq("id", journal.id);
    } catch (error) {
      if (journal) await supabaseServer.from("saspay_evenement").update({ erreur: String(error).slice(0, 500) }).eq("id", journal.id);
      // 500 : SasPay retentera (5 tentatives sur 2 h), la synchro est idempotente.
      return Response.json({ message: "Traitement différé." }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
