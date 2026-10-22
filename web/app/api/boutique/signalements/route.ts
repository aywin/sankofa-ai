import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

// Signalement d'un produit par n'importe quel visiteur — la publication
// étant immédiate, c'est le filet a posteriori de la modération.
const SignalementSchema = z.object({
  produitId: z.uuid(),
  motif: z.string().trim().min(3, "Explique en quelques mots ce qui pose problème.").max(500),
  contact: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
  const parsed = SignalementSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Signalement invalide." }, { status: 400 });
  }
  const { error } = await supabaseServer.from("signalement_produit").insert({
    produit_id: parsed.data.produitId,
    motif: parsed.data.motif,
    contact: parsed.data.contact || null,
  });
  if (error) return Response.json({ message: "Signalement impossible pour le moment." }, { status: 500 });
  return Response.json({ ok: true });
}
