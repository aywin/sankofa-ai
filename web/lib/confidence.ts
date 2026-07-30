import type { SourceCounts } from "./types";

export type ConfidenceTier = "fiable" | "limitee" | "non_renseignee";

export interface Confidence {
  tier: ConfidenceTier;
  label: string;
}

// Règle explicite (choix produit, pas une évidence — documentée ici pour
// qu'elle reste traçable) :
// - 0 source enregistrée -> jamais de badge de confiance. Un 🟡 affiché
//   sur un décompte à zéro serait aussi malhonnête qu'un pourcentage
//   inventé : on dit "non renseigné", pas "peu fiable".
// - Au moins 1 source scientifique ET au moins 2 tradipraticiens ->
//   "🟢 Fiable" (convergence entre deux types de preuve indépendants).
// - Sinon, dès qu'il y a au moins 1 source -> "🟡 Données limitées".
export function computeConfidence(counts: SourceCounts): Confidence {
  const total = counts.tradipraticien_count + counts.scientifique_count + counts.institution_count;

  if (total === 0) {
    return { tier: "non_renseignee", label: "Sources non renseignées" };
  }
  if (counts.scientifique_count >= 1 && counts.tradipraticien_count >= 2) {
    return { tier: "fiable", label: "🟢 Fiable" };
  }
  return { tier: "limitee", label: "🟡 Données limitées" };
}

export function describeSourceCounts(counts: SourceCounts): string {
  const parts: string[] = [];
  if (counts.tradipraticien_count > 0) {
    parts.push(
      `${counts.tradipraticien_count} tradipraticien${counts.tradipraticien_count > 1 ? "s" : ""}`
    );
  }
  if (counts.scientifique_count > 0) {
    parts.push(`${counts.scientifique_count} publication${counts.scientifique_count > 1 ? "s" : ""}`);
  }
  if (counts.institution_count > 0) {
    parts.push(`${counts.institution_count} institution${counts.institution_count > 1 ? "s" : ""}`);
  }
  return parts.join(", ");
}
