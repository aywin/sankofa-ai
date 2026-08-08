import { z } from "zod";
import { getSynergieData } from "@/lib/synergies";

const QuerySchema = z.object({ taxonAId: z.string().uuid(), taxonBId: z.string().uuid() });

// Permet au canvas de changer l'une ou l'autre plante sans recharger la
// page (nœuds 1/2 cliquables), même principe que
// /api/laboratoire/data.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    taxonAId: searchParams.get("taxonAId"),
    taxonBId: searchParams.get("taxonBId"),
  });
  if (!parsed.success) {
    return Response.json({ message: "Identifiants invalides" }, { status: 400 });
  }
  if (parsed.data.taxonAId === parsed.data.taxonBId) {
    return Response.json({ message: "Les deux plantes doivent être différentes" }, { status: 400 });
  }

  const data = await getSynergieData(parsed.data.taxonAId, parsed.data.taxonBId);
  if (!data) {
    return Response.json({ message: "Plante introuvable" }, { status: 404 });
  }

  return Response.json(data);
}
