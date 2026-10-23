import type { TriageResultat } from "./triage";
import type { MatchClaimResult } from "./types";

// Repli documentaire du chat (lafi-v5.md P1.3) : quand la génération
// échoue ou dépasse le délai, on répond quand même, sans IA, avec ce qui
// est documenté — jamais une erreur brute, jamais un écran vide. Mêmes
// règles que le modèle : précautions avant préparations, pas de dose à
// l'impératif, pas de promesse d'efficacité.
export function composerRepli(triage: TriageResultat, resultats: MatchClaimResult[]): string {
  const lignes: string[] = ["Je n'ai pas pu rédiger de réponse complète cette fois-ci. Voici ce qui est documenté pour ta question."];

  if (triage.niveau !== "aucun") {
    lignes.push("", `**${triage.titre}.** ${triage.conseils[0] ?? ""}`);
  }

  if (resultats.length === 0) {
    lignes.push(
      "",
      "Aucun usage documenté ne correspond clairement à ta question pour l'instant. Réessaie dans un moment, ou reformule avec le nom d'une plante ou d'un mal précis."
    );
    return lignes.join("\n");
  }

  lignes.push("");
  for (const r of resultats) {
    const preparation = (r.preparation_resume ?? "").replace(/\.+$/, "");
    const prudence = r.contre_indication_forte
      ? "Une contre-indication a été signalée : demande un avis avant tout usage."
      : r.precautions_specifiques || r.precautions
        ? `Précaution : ${(r.precautions_specifiques || r.precautions)!.replace(/\.+$/, "")}.`
        : "";
    lignes.push(
      `- **${r.nom_principal}**, ${r.partie_nom.toLowerCase()}${preparation ? ` : ${preparation}` : ""}. ${prudence}`.trim()
    );
  }
  lignes.push("", "Les détails sont dans les sources à côté. Renvoie ta question dans un instant pour une réponse complète.");
  return lignes.join("\n");
}
