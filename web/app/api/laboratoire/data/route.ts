import { z } from "zod";
import { getLaboratoireData } from "@/lib/laboratoire";

const QuerySchema = z.object({ claimId: z.string().uuid() });

// Permet au canvas de changer de couple plante × indication sans
// recharger la page (nœuds 1/2 cliquables) — même donnée que la page
// serveur, exposée en GET pour un fetch client simple.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ claimId: searchParams.get("claimId") });
  if (!parsed.success) {
    return Response.json({ message: "claimId invalide" }, { status: 400 });
  }

  const data = await getLaboratoireData(parsed.data.claimId);
  if (!data) {
    return Response.json({ message: "Claim introuvable" }, { status: 404 });
  }

  return Response.json(data);
}
