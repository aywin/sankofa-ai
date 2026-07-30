import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

const ContributionSchema = z.object({
  plante_nom: z.string().trim().min(1),
  maladie_nom: z.string().trim().min(1),
  preparation: z.string().trim().min(1),
  posologie: z.string().trim().optional(),
  region: z.string().trim().optional(),
  ethnie: z.string().trim().optional(),
  langue: z.string().trim().optional(),
  contributeur: z.string().trim().optional(),
  contact: z.string().trim().optional(),
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
