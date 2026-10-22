// Vérifications hors ligne de la boutique — aucun appel à SasPay ni à la
// base :  npx tsx scripts/check-boutique.ts
import crypto from "crypto";
import { montantSasPay, signatureWebhookValide } from "../lib/saspay";
import { allegationsTrouvees } from "../lib/allegations";

let echecs = 0;
function verifier(nom: string, ok: boolean) {
  if (!ok) echecs += 1;
  console.log(`${ok ? "✓" : "✗"} ${nom}`);
}

// --- Signature des webhooks (doc SasPay : HMAC-SHA256 de "<ts>.<corps>") ---
const secret = "whsec_test";
const corps = '{"event":"transaction.success","data":{"id":"9c3f"}}';
const maintenant = String(Math.floor(Date.now() / 1000));
const signer = (ts: string, c: string) => crypto.createHmac("sha256", secret).update(`${ts}.${c}`).digest("hex");

verifier("signature valide acceptée", signatureWebhookValide(corps, signer(maintenant, corps), maintenant, secret));
verifier("signature en majuscules acceptée", signatureWebhookValide(corps, signer(maintenant, corps).toUpperCase(), maintenant, secret));
verifier("corps modifié refusé", !signatureWebhookValide(corps.replace("9c3f", "0000"), signer(maintenant, corps), maintenant, secret));
verifier("mauvais secret refusé", !signatureWebhookValide(corps, signer(maintenant, corps), maintenant, "autre"));
const vieux = String(Math.floor(Date.now() / 1000) - 301);
verifier("horodatage de plus de 300 s refusé", !signatureWebhookValide(corps, signer(vieux, corps), vieux, secret));
const futur = String(Math.floor(Date.now() / 1000) + 301);
verifier("horodatage futur de plus de 300 s refusé", !signatureWebhookValide(corps, signer(futur, corps), futur, secret));
verifier("en-têtes absents refusés", !signatureWebhookValide(corps, null, null, secret));
verifier("horodatage non numérique refusé", !signatureWebhookValide(corps, signer("abc", corps), "abc", secret));

// --- Montants : chaînes décimales, jamais de flottants ---
verifier('2500 -> "2500.00"', montantSasPay(2500) === "2500.00");
let refuse = false;
try {
  montantSasPay(12.5);
} catch {
  refuse = true;
}
verifier("montant non entier refusé", refuse);

// --- Allégations ---
const interdits = [
  "Tisane qui guérit le paludisme",
  "Remède miracle",
  "Efficace à 100 %",
  "Résultat garanti",
  "Sans danger pour tous",
  "Remplace ton traitement contre la tension",
  "Soigne le diabète",
  "Contre le VIH",
];
for (const t of interdits) verifier(`refusé : « ${t} »`, allegationsTrouvees(t).length > 0);
const autorises = [
  "Tisane de kinkéliba, 100 g, feuilles séchées",
  "Infusion traditionnelle de calices de bissap. Déconseillée si la tension est basse.",
  "Beurre de karité non raffiné pour la peau",
];
for (const t of autorises) verifier(`accepté : « ${t} »`, allegationsTrouvees(t).length === 0);

console.log(echecs === 0 ? "\nTout passe." : `\n${echecs} échec(s).`);
process.exit(echecs > 0 ? 1 : 0);
