import type { AttestationStats, GradeTier } from "./types";

// Remplace lib/confidence.ts (v1-v3, un seul tier 🟢/🟡). Même principe :
// les comptages bruts viennent de SQL (vue claim_attestation_stats), la
// règle métier vit ici en TypeScript — un ajustement de seuil ne doit
// jamais nécessiter un DROP FUNCTION Postgres (schema_v3.sql en garde la
// trace), et cette même logique sera réutilisée telle quelle par le mode
// expert du futur laboratoire de simulation (curseurs recalculés côté
// client).

export type ForceAttestation =
  | "multi_traditions"
  | "convergente"
  | "tradition_unique"
  | "non_renseignee"
  | "contredite";

export type StatutSynthese =
  | "convergent"
  | "plausible"
  | "atteste_seul"
  | "divergent"
  | "non_soutenu"
  | "contre_indique";

export const FORCE_LABELS: Record<ForceAttestation, string> = {
  multi_traditions: "Multi-traditions",
  convergente: "Convergente",
  tradition_unique: "Tradition unique",
  non_renseignee: "Non renseignée",
  contredite: "Contredite",
};

export const GRADE_LABELS: Record<GradeTier, string> = {
  elevee: "Élevée",
  moderee: "Modérée",
  faible: "Faible",
  tres_faible: "Très faible",
};

export const STATUT_LABELS: Record<StatutSynthese, string> = {
  convergent: "Convergent",
  plausible: "Plausible",
  atteste_seul: "Attesté seul",
  divergent: "Divergent",
  non_soutenu: "Non soutenu",
  contre_indique: "Contre-indiqué",
};

// Vocabulaire grand public (lafi-best.md P2) — remplace le badge fusionné
// à 6 valeurs sur les écrans publics (Découverte, fiche, cartes du chat).
// Les deux axes restent affichés SÉPARÉMENT, jamais refusionnés en un
// mot : "Plausible" ne dit rien à quelqu'un sans le contexte GRADE, et
// un badge que toutes les cartes portent n'informe personne.
//
// Point de vigilance qui a déjà produit une erreur une fois (corrigée) :
// ne jamais laisser le langage simplifié grossir l'affirmation. GRADE
// "modérée" veut dire confiance modérée dans l'estimation de l'effet,
// PAS confirmation — donc "Étudié, résultats encourageants", jamais
// "Confirmé par la science". C'est la seule règle de ce fichier qui
// touche à la sécurité de l'utilisateur plutôt qu'à la clarté.
export function forceLabelGrandPublic(force: ForceAttestation): string {
  switch (force) {
    case "multi_traditions":
      return "Très utilisé";
    case "convergente":
      return "Utilisé dans plusieurs régions";
    case "tradition_unique":
      return "Usage local";
    case "contredite":
      return "Avis partagés";
    case "non_renseignee":
      return "Pas encore documenté";
  }
}

export function qualiteLabelGrandPublic(qualite: GradeTier | null): string {
  if (qualite === null) return "Pas encore étudié";
  if (qualite === "elevee") return "Bien étudié";
  if (qualite === "moderee") return "Étudié, résultats encourageants";
  return "Peu d'études";
}

// Styles partagés entre SyntheseBadge (fiche, cartes) et OutputPanel
// (laboratoire) — une seule source de vérité pour l'identité visuelle
// d'un statut.
export const STATUT_STYLES: Record<StatutSynthese, string> = {
  convergent: "bg-emerald-600 text-white",
  plausible: "bg-sky-600 text-white",
  atteste_seul: "bg-laterite-500 text-white",
  divergent: "bg-ink-800 text-laterite-300 ring-1 ring-laterite-700",
  non_soutenu: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  contre_indique: "bg-red-600 text-white",
};

// Règle explicite (choix produit, pas une évidence — documentée ici pour
// qu'elle reste traçable, comme l'était computeConfidence) :
// - ≥3 lignées distinctes -> "Multi-traditions".
// - 2 lignées distinctes -> "Convergente".
// - 1 lignée -> "Tradition unique". Simplification v1 assumée : le palier
//   "Isolée" du brief (une attestation unique et peu qualifiée) est fondu
//   ici dans "tradition_unique" — le distinguer proprement demanderait de
//   pondérer la qualité de CHAQUE attestation (consentement, méthode de
//   collecte...), ce que le nœud ② du futur laboratoire formalisera.
// - 0 attestation -> "Non renseignée" : jamais un badge dégradé sur une
//   absence de donnée, on nomme l'absence.
// - Une contradiction connue prime sur le comptage -> "Contredite".
export function computeForceAttestation(
  stats: Pick<AttestationStats, "attestations_count" | "lignees_distinctes">,
  aUneContradiction: boolean
): ForceAttestation {
  if (aUneContradiction) return "contredite";
  if (stats.attestations_count === 0) return "non_renseignee";
  if (stats.lignees_distinctes >= 3) return "multi_traditions";
  if (stats.lignees_distinctes === 2) return "convergente";
  return "tradition_unique";
}

// Dérive le statut à 6 valeurs (§6 du brief) à partir des deux axes GRADE
// (qualité scientifique) / force d'attestation, jamais fusionnés en un
// seul chiffre ou pourcentage.
// - Le contrôle sécurité prime toujours sur le reste de l'affichage.
// - Une divergence (contradiction entre sources ou traditions) est une
//   fonctionnalité, pas un échec : elle pointe une vraie question de
//   recherche, on ne la masque jamais derrière un statut plus flatteur.
// - "Convergent" exige à la fois une preuve scientifique au moins modérée
//   ET une attestation traditionnelle convergente/multi-traditions — les
//   deux axes doivent s'accorder, pas juste l'un des deux.
// - "Attesté seul" : aucune étude, mais une attestation traditionnelle
//   présente.
// - "Plausible" : au moins une étude existe (même de faible qualité),
//   quel que soit le niveau d'attestation traditionnelle.
// - "Non soutenu" : ni étude ni attestation traditionnelle solide.
export function computeSyntheseStatus(
  qualite: GradeTier | null,
  force: ForceAttestation,
  contreIndicationForte: boolean,
  divergenceNote: string | null
): StatutSynthese {
  return explainSyntheseStatus(qualite, force, contreIndicationForte, divergenceNote).statut;
}

// Nœud ⑩ Agrégation du laboratoire de simulation : "pondération explicite
// et affichée" (§5 du brief) — donc la même fonction qui décide du statut
// produit aussi la trace texte de la règle appliquée, pour que rien ne
// reste une boîte noire. computeSyntheseStatus délègue ici pour ne
// jamais dupliquer la logique.
export function explainSyntheseStatus(
  qualite: GradeTier | null,
  force: ForceAttestation,
  contreIndicationForte: boolean,
  divergenceNote: string | null
): { statut: StatutSynthese; raisonnement: string[] } {
  const raisonnement: string[] = [];

  if (contreIndicationForte) {
    raisonnement.push(
      "Le nœud sécurité a détecté une contre-indication forte pour cette préparation — cette sortie prime toujours sur le reste du pipeline."
    );
    return { statut: "contre_indique", raisonnement };
  }

  if (force === "contredite" || divergenceNote) {
    raisonnement.push(
      divergenceNote
        ? `Divergence relevée entre les sources : ${divergenceNote}`
        : "Les traditions ou les sources scientifiques se contredisent sur ce couple."
    );
    return { statut: "divergent", raisonnement };
  }

  raisonnement.push(
    `Qualité de la preuve scientifique (nœud Littérature) : ${qualite ? GRADE_LABELS[qualite] : "non évaluée"}.`
  );
  raisonnement.push(`Force de l'attestation traditionnelle (nœud Attestation) : ${FORCE_LABELS[force]}.`);

  if (
    qualite !== null &&
    ["elevee", "moderee"].includes(qualite) &&
    ["multi_traditions", "convergente"].includes(force)
  ) {
    raisonnement.push(
      "Règle appliquée : preuve scientifique au moins modérée ET attestation convergente ou multi-traditions ⇒ Convergent."
    );
    return { statut: "convergent", raisonnement };
  }

  if (qualite === null && ["multi_traditions", "convergente", "tradition_unique"].includes(force)) {
    raisonnement.push("Règle appliquée : aucune étude recensée, mais une attestation traditionnelle existe ⇒ Attesté seul.");
    return { statut: "atteste_seul", raisonnement };
  }

  if (qualite !== null) {
    raisonnement.push(
      "Règle appliquée : au moins une étude existe, mais la condition de convergence n'est pas remplie ⇒ Plausible."
    );
    return { statut: "plausible", raisonnement };
  }

  raisonnement.push("Règle appliquée : ni étude ni attestation traditionnelle solide ⇒ Non soutenu.");
  return { statut: "non_soutenu", raisonnement };
}

export function describeAttestationStats(stats: AttestationStats): string {
  if (stats.attestations_count === 0) return "";
  const traditions = stats.lignees_distinctes;
  return `${stats.attestations_count} attestation${stats.attestations_count > 1 ? "s" : ""}, ${traditions} tradition${traditions > 1 ? "s" : ""} indépendante${traditions > 1 ? "s" : ""}`;
}
