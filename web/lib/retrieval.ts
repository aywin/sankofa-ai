import { embedQuery } from "./embedding";
import { supabaseServer } from "./supabase";
import type { MatchClaimResult } from "./types";

// Recherche d'usages pour le chat (lafi-v5.md P1.2). Une similarité
// vectorielle n'est pas une validation de pertinence : sur "baisser la
// tension", les maux de tête et l'insomnie remontent à 0,63-0,64 juste
// derrière l'hypertension à 0,68-0,69, et "Bonjour" remonte n'importe
// quoi à 0,55. Mesures du 22/10/2026 sur le corpus actuel :
// un seuil absolu ne sépare rien, un écart au meilleur résultat sépare
// bien. On garde donc ce qui est proche du meilleur, à condition que le
// meilleur soit lui-même assez proche de la question.
const SEUIL_MEILLEUR = 0.6;
const ECART_MAX = 0.03;
const CANDIDATS = 8;
const RETENUS_MAX = 5;

export interface RechercheUsages {
  resultats: MatchClaimResult[];
  // Gardés pour les journaux et l'évaluation, jamais affichés comme
  // appuyant une réponse.
  ecartes: number;
}

export async function rechercherUsages(description: string): Promise<RechercheUsages> {
  const queryEmbedding = await embedQuery(description);

  // Envoyé en JSON stringifié (text) et casté en vector() côté SQL :
  // PostgREST ne lie pas toujours correctement un paramètre RPC de type
  // extension (vector) — voir supabase/schema.sql.
  const { data, error } = await supabaseServer.rpc("match_claims", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: CANDIDATS,
    match_threshold: 0,
  });
  if (error) throw new Error(`match_claims : ${error.message}`);

  const candidats = (data ?? []) as MatchClaimResult[];
  if (candidats.length === 0 || candidats[0].similarity < SEUIL_MEILLEUR) {
    return { resultats: [], ecartes: candidats.length };
  }
  const plancher = candidats[0].similarity - ECART_MAX;
  const resultats = candidats.filter((c) => c.similarity >= plancher).slice(0, RETENUS_MAX);
  return { resultats, ecartes: candidats.length - resultats.length };
}

// Ce que le modèle reçoit pour chaque usage — uniquement des champs
// documentés, jamais d'interprétation ajoutée ici.
export function usagesPourModele(resultats: MatchClaimResult[]) {
  return resultats.map((r) => ({
    plante: r.nom_principal,
    nom_scientifique: r.nom_scientifique,
    indication: r.indication_nom,
    partie: r.partie_nom,
    preparation: r.preparation_resume ?? r.preparation_mode,
    precautions: r.precautions,
    precautions_de_cet_usage: r.precautions_specifiques ?? null,
    deconseille_a: r.public_deconseille ?? null,
    arreter_et_consulter_si: r.signes_arret ?? null,
    contre_indication_forte: r.contre_indication_forte,
    qualite_preuve_scientifique: r.qualite_preuve_scientifique ?? "aucune étude recensée",
    attestations_terrain_verifiees: r.attestations_count,
    traditions_distinctes: r.lignees_distinctes,
    // Une source documentaire (publication) est réelle, même sans terrain.
    donnee_de_demonstration: !r.est_pilote && r.origine !== "documentaire",
    origine: r.origine === "documentaire" ? "publication scientifique ou ethnobotanique" : "terrain",
  }));
}
