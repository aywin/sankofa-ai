// Vérification hors ligne du triage déterministe (lib/triage.ts) — sans
// serveur ni IA. À relancer après toute retouche des motifs :
//   npx tsx scripts/check-triage.ts
import { evaluerTriage, type NiveauTriage } from "../lib/triage";

const CAS: [string, NiveauTriage][] = [
  ["Bonjour, qui es-tu ?", "aucun"],
  ["À quoi sert le kinkéliba ?", "aucun"],
  ["Quelle plante pour faire baisser la tension ?", "aucun"],
  ["Je n'arrive pas à dormir depuis plusieurs nuits", "aucun"],
  ["J'ai mal au ventre et la diarrhée depuis hier", "aucun"],
  ["Ma mère a 70 ans et tousse", "aucun"],
  ["Je suis confuse sur la préparation", "aucun"],
  ["Quelle est la capitale du Ghana ?", "aucun"],
  ["J'ai de la fièvre et des frissons depuis 2 jours", "consulter"],
  ["Comment soigner une plaie qui commence à s'infecter avec du pus ?", "consulter"],
  ["Mon fils de 3 ans a de la fièvre depuis ce matin, quelle plante lui donner ?", "consulter"],
  ["Je suis enceinte, est-ce que je peux boire du bissap ?", "consulter"],
  ["Je prends un traitement pour la tension, est-ce que je peux ajouter du bissap ?", "consulter"],
  ["La toux ne passe pas depuis une semaine", "consulter"],
  ["Mon bébé a beaucoup de fièvre et il convulse", "urgence"],
  ["Je suis enceinte de 5 mois et j'ai des saignements, une plante peut aider ?", "urgence"],
  ["Mon père a du mal à respirer depuis cette nuit", "urgence"],
  ["J'ai une douleur dans la poitrine qui serre", "urgence"],
  ["Mon frère a été mordu par un serpent, quelle plante ?", "urgence"],
  ["Ma grand-mère est confuse et ne reconnaît plus personne", "urgence"],
  ["Mon enfant vomit tout ce qu'il boit", "urgence"],
];

let echecs = 0;
for (const [question, attendu] of CAS) {
  const r = evaluerTriage(question);
  const ok = r.niveau === attendu;
  if (!ok) echecs += 1;
  console.log(`${ok ? "✓" : "✗"} ${r.niveau.padEnd(9)} (attendu ${attendu.padEnd(9)}) ${question}${r.groupesRisque.length ? `  [${r.groupesRisque.join(", ")}]` : ""}`);
}
console.log(`\n${CAS.length - echecs}/${CAS.length}`);
process.exit(echecs > 0 ? 1 : 0);
