import { z } from "zod";
import { getSynergieData } from "@/lib/synergies";
import { construireEntrees, obtenirHypothese } from "@/lib/synergieAnalyse";

const BodySchema = z.object({
  taxonAId: z.string().uuid(),
  taxonBId: z.string().uuid(),
  noteLibre: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ message: parsed.error.message }, { status: 400 });
  }
  const { taxonAId, taxonBId, noteLibre } = parsed.data;
  if (taxonAId === taxonBId) {
    return Response.json({ message: "Les deux plantes doivent être différentes" }, { status: 400 });
  }

  const data = await getSynergieData(taxonAId, taxonBId);
  if (!data) {
    return Response.json({ message: "Plante introuvable" }, { status: 404 });
  }

  const entrees = construireEntrees(data.taxonA, data.taxonB, data.ciblesCommunes, noteLibre || null);
  const resultat = await obtenirHypothese(taxonAId, taxonBId, entrees, noteLibre || null);
  return Response.json(resultat);
}
