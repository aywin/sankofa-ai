import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

// Divulgation graduée (§7 du brief) : seuls plante_nom/maladie_nom sont
// obligatoires au niveau déclaratif — tout le reste dépend du niveau
// choisi côté formulaire, jamais forcé côté API.
const ContributionSchema = z.object({
  type: z.enum(["ajout", "contestation"]).default("ajout"),
  niveau_divulgation: z.enum(["declaratif", "documente", "complet"]).default("declaratif"),
  plante_nom: z.string().trim().min(1),
  maladie_nom: z.string().trim().min(1),
  preparation: z.string().trim().optional(),
  posologie: z.string().trim().optional(),
  associations: z.string().trim().optional(),
  region: z.string().trim().optional(),
  ethnie: z.string().trim().optional(),
  langue: z.string().trim().optional(),
  contributeur: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  // Consentement requis avant tout envoi — pas de capture silencieuse.
  consentement: z.literal(true),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ContributionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ message: parsed.error.message }, { status: 400 });
  }

  const { error } = await supabaseServer.from("contributions").insert(parsed.data);

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
