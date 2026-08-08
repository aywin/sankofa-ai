import { z } from "zod";
import { getLaboratoireData } from "@/lib/laboratoire";
import { computeForceAttestation } from "@/lib/synthese";
import { obtenirAnalyse, type EntreesAnalyse } from "@/lib/laboratoireAnalyse";

const MODE_LABELS: Record<string, string> = {
  decoction: "décoction",
  infusion: "infusion",
  maceration: "macération",
  poudre: "poudre",
  cataplasme: "cataplasme",
  application_directe: "application directe",
  autre: "préparation",
};

const BodySchema = z.object({
  claimId: z.string().uuid(),
  noteLibre: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ message: parsed.error.message }, { status: 400 });
  }
  const { claimId, noteLibre } = parsed.data;

  const data = await getLaboratoireData(claimId);
  if (!data) {
    return Response.json({ message: "Claim introuvable" }, { status: 404 });
  }

  const force = computeForceAttestation(data.stats, false);
  const entrees: EntreesAnalyse = {
    nomPrincipal: data.nomPrincipal,
    nomScientifique: data.taxon.nomScientifique,
    indicationNom: data.indication.nom,
    partieNom: data.partie.nom,
    preparationResume: `${MODE_LABELS[data.preparation.mode] ?? data.preparation.mode} de ${data.partie.nom}`,
    forceAttestation: force,
    qualitePreuve: data.qualitePreuveScientifique,
    attestationsCount: data.stats.attestations_count,
    etudesTitres: data.etudes.map((e) => e.titre),
    contreIndicationForte: data.contreIndicationForte,
    precautions: data.precautions,
    noteLibre: noteLibre || null,
  };

  const resultat = await obtenirAnalyse(claimId, entrees, noteLibre || null);
  return Response.json(resultat);
}
