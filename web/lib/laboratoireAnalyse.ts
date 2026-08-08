import crypto from "crypto";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabaseServer } from "./supabase";
import { forceLabelGrandPublic, qualiteLabelGrandPublic, type ForceAttestation } from "./synthese";
import type { GradeTier } from "./types";

// Nœud 5 "Analyse" du laboratoire (lafi-best.md P8) — le nœud le plus
// risqué du produit : un modèle qui rédige une explication en santé à
// partir de données rares. Trois garde-fous non négociables, dans
// l'ordre où ils s'appliquent : (1) le modèle ne reçoit QUE les sorties
// structurées des nœuds 1-4, jamais d'autre donnée ; (2) sa sortie est
// validée avant affichage, jamais montrée telle quelle ; (3) un repli
// déterministe, sans IA, prend le relais si la génération échoue ou est
// rejetée — la page n'est jamais vide, jamais en erreur brute.

export interface EntreesAnalyse {
  nomPrincipal: string;
  nomScientifique: string;
  indicationNom: string;
  partieNom: string;
  preparationResume: string;
  forceAttestation: ForceAttestation;
  qualitePreuve: GradeTier | null;
  attestationsCount: number;
  etudesTitres: string[];
  contreIndicationForte: boolean;
  precautions: string | null;
  noteLibre: string | null;
}

// Empreinte des entrées — clé de cache. Change si et seulement si une
// donnée qui influence la synthèse change (nouvelle étude, contre-
// indication ajoutée, etc.) ; une exécution existante avec la même
// empreinte est reproductible à l'identique, six mois plus tard comme
// aujourd'hui (§10 du brief d'origine).
export function calculerVersionDonnees(entrees: EntreesAnalyse): string {
  const canonique = JSON.stringify({
    force: entrees.forceAttestation,
    qualite: entrees.qualitePreuve,
    attestations: entrees.attestationsCount,
    etudes: [...entrees.etudesTitres].sort(),
    contreIndication: entrees.contreIndicationForte,
    precautions: entrees.precautions,
  });
  return crypto.createHash("sha256").update(canonique).digest("hex").slice(0, 16);
}

// Repli déterministe (§8.4) : jamais de pourcentage, jamais de dose à
// l'impératif — les mêmes règles que le modèle, mais appliquées sans
// modèle. Sert aussi de base de comparaison pour juger si le texte du
// modèle "sonne juste".
export function composerTexteDeterministe(e: EntreesAnalyse): string {
  const phrases: string[] = [];

  phrases.push(
    `${e.nomPrincipal} (${e.nomScientifique}) est traditionnellement utilisé, en ${e.preparationResume}, pour ${e.indicationNom.toLowerCase()}.`
  );

  phrases.push(
    `Côté tradipraticiens : ${forceLabelGrandPublic(e.forceAttestation).toLowerCase()}. Côté science : ${qualiteLabelGrandPublic(e.qualitePreuve).toLowerCase()}${
      e.etudesTitres.length > 0 ? `, avec ${e.etudesTitres.length} étude${e.etudesTitres.length > 1 ? "s" : ""} recensée${e.etudesTitres.length > 1 ? "s" : ""}` : ""
    }.`
  );

  if (e.contreIndicationForte) {
    phrases.push("Point de vigilance important : une contre-indication a été signalée pour cette préparation.");
  } else if (e.precautions) {
    phrases.push(`Précaution à connaître : ${e.precautions}`);
  }

  if (e.noteLibre) {
    phrases.push(`Sur le point que tu as signalé : ce n'est pas encore une donnée que Lafi peut croiser automatiquement, garde-le en tête en lisant ce qui précède.`);
  }

  phrases.push(
    "Ces deux informations répondent à des questions différentes et ne se remplacent pas l'une l'autre : une tradition bien attestée n'est pas forcément étudiée, et une étude solide n'efface pas l'absence de collecte de terrain."
  );

  return phrases.join(" ");
}

// Rejette toute sortie qui violerait les règles non négociables du
// projet — jamais un pourcentage, même déguisé. On préfère un texte
// déterministe honnête à un texte séduisant mais non conforme.
export function validerTexteAnalyse(texte: string): boolean {
  if (/\d+\s*%/.test(texte)) return false;
  if (/\bsur\s+10\b/i.test(texte)) return false;
  if (texte.trim().length < 40 || texte.trim().length > 1200) return false;
  return true;
}

const SYSTEM_PROMPT_ANALYSE = `Tu rédiges la synthèse finale du laboratoire Lafi pour un particulier sans vocabulaire médical.

Règles strictes :
- Tu reformules les données qu'on te donne, tu ne conclus jamais au-delà.
- Tu ne mentionnes AUCUNE plante, indication ou étude qui n'est pas explicitement dans les données fournies.
- 3 à 5 phrases, français courant, jamais de jargon (pas de "GRADE", pas de "attestation traditionnelle" au sens technique).
- Tu énonces toujours DEUX informations séparées : ce que disent les tradipraticiens, et ce que dit la science. Ne les fusionne jamais en un seul jugement.
- Si une contre-indication forte est signalée, tu la rappelles clairement, en premier.
- Interdiction absolue : aucun pourcentage, aucun chiffre de type "X sur 10", aucune dose ou fréquence à l'impératif.`;

async function genererAvecModele(entrees: EntreesAnalyse): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: google("gemini-3.6-flash"),
      system: SYSTEM_PROMPT_ANALYSE,
      prompt: JSON.stringify({
        plante: entrees.nomPrincipal,
        nom_scientifique: entrees.nomScientifique,
        indication: entrees.indicationNom,
        preparation: entrees.preparationResume,
        force_attestation_traditionnelle: forceLabelGrandPublic(entrees.forceAttestation),
        qualite_preuve_scientifique: qualiteLabelGrandPublic(entrees.qualitePreuve),
        nombre_etudes: entrees.etudesTitres.length,
        contre_indication_forte: entrees.contreIndicationForte,
        precautions: entrees.precautions,
        note_utilisateur: entrees.noteLibre,
      }),
    });
    return text;
  } catch {
    return null;
  }
}

export interface ResultatAnalyse {
  texte: string;
  origine: "ia" | "repli_deterministe";
  versionDonnees: string;
  executionId: string;
}

// Point d'entrée du nœud 5 : cache -> modèle -> validation -> repli,
// dans cet ordre. Toujours un résultat, jamais une exception qui remonte
// jusqu'à la page.
export async function obtenirAnalyse(
  claimId: string,
  entrees: EntreesAnalyse,
  noteLibre: string | null
): Promise<ResultatAnalyse> {
  const versionDonnees = calculerVersionDonnees(entrees);

  const { data: existante } = await supabaseServer
    .from("execution")
    .select("id, synthese_texte, synthese_origine")
    .eq("claim_id", claimId)
    .eq("version_donnees", versionDonnees)
    .eq("note_libre", noteLibre ?? "")
    .maybeSingle<{ id: string; synthese_texte: string; synthese_origine: "ia" | "repli_deterministe" }>();

  if (existante) {
    return {
      texte: existante.synthese_texte,
      origine: existante.synthese_origine,
      versionDonnees,
      executionId: existante.id,
    };
  }

  const genere = await genererAvecModele(entrees);
  const texteRetenu = genere && validerTexteAnalyse(genere) ? genere : composerTexteDeterministe(entrees);
  const origine: "ia" | "repli_deterministe" = genere && validerTexteAnalyse(genere) ? "ia" : "repli_deterministe";

  const { data: inseree, error } = await supabaseServer
    .from("execution")
    .insert({
      claim_id: claimId,
      note_libre: noteLibre,
      version_donnees: versionDonnees,
      entrees,
      synthese_texte: texteRetenu,
      synthese_origine: origine,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !inseree) {
    // Même en cas d'échec d'écriture (rare), on ne bloque jamais
    // l'affichage — on retourne le texte sans persistance plutôt que de
    // faire planter la page.
    return { texte: texteRetenu, origine, versionDonnees, executionId: "" };
  }

  return { texte: texteRetenu, origine, versionDonnees, executionId: inseree.id };
}

export async function obtenirExecution(executionId: string) {
  const { data, error } = await supabaseServer
    .from("execution")
    .select("*")
    .eq("id", executionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
