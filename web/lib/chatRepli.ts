import { qualiteLabelGrandPublic } from "./synthese";
import type { TriageResultat } from "./triage";
import type { MatchClaimResult } from "./types";

// Repli documentaire du chat (lafi-v5.md P1.3) : quand la génération
// échoue ou dépasse le délai, on répond quand même, sans IA, avec ce qui
// est documenté — jamais une erreur brute, jamais un écran vide. Mêmes
// règles que le modèle : précautions avant préparations, pas de dose à
// l'impératif, pas de promesse d'efficacité.
export function composerRepli(triage: TriageResultat, resultats: MatchClaimResult[]): string {
  const lignes: string[] = [
    "_Lafi n'a pas pu rédiger de réponse complète cette fois-ci. Voici directement ce qui est documenté et qui correspond à ta question._",
  ];

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

  lignes.push("", "**Usages documentés :**");
  for (const r of resultats) {
    const prudence = r.contre_indication_forte
      ? " — ⚠️ une contre-indication a été signalée, demande un avis avant tout usage"
      : r.precautions
        ? ` — précaution : ${r.precautions}`
        : "";
    lignes.push(
      `- **${r.nom_principal}** (*${r.nom_scientifique}*), pour ${r.indication_nom.toLowerCase()} : ${r.partie_nom.toLowerCase()}, ${r.preparation_resume ?? r.preparation_mode}. Côté science : ${qualiteLabelGrandPublic(r.qualite_preuve_scientifique).toLowerCase()}${prudence}.`
    );
  }
  lignes.push("", "Tu peux renvoyer ta question dans un instant pour une réponse plus complète.");
  return lignes.join("\n");
}
