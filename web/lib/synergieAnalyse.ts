import crypto from "crypto";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabaseServer } from "./supabase";
import type { ProfilChimique } from "./synergies";

// Nœud 6 "Hypothèse IA" de l'espace expérimental — le nœud le plus
// sensible du produit : contrairement au Laboratoire (qui résume des
// usages déjà attestés), ceci génère une hypothèse sur une combinaison
// qui n'a jamais été documentée comme telle. Garde-fous, dans l'ordre :
// (1) le modèle ne reçoit QUE les profils chimiques structurés des deux
// plantes + le recoupement calculé, jamais d'autre donnée ; (2) sa
// sortie est validée avant affichage — rejet de tout langage qui
// affirmerait une efficacité, pas seulement des pourcentages ; (3) un
// repli déterministe, sans IA, prend le relais si la génération échoue
// ou est rejetée ; (4) le disclaimer "piste de recherche non vérifiée"
// est un bloc d'interface fixe, jamais généré par le modèle — même si
// le modèle "oubliait" de le dire, l'utilisateur le voit quand même.

export interface EntreesSynergie {
  taxonA: { nom: string; nomScientifique: string; composes: string[] };
  taxonB: { nom: string; nomScientifique: string; composes: string[] };
  ciblesCommunes: string[];
  noteLibre: string | null;
}

export function construireEntrees(a: ProfilChimique, b: ProfilChimique, ciblesCommunes: string[], noteLibre: string | null): EntreesSynergie {
  return {
    taxonA: { nom: a.nomPrincipal, nomScientifique: a.nomScientifique, composes: a.composes.map((c) => c.nom) },
    taxonB: { nom: b.nomPrincipal, nomScientifique: b.nomScientifique, composes: b.composes.map((c) => c.nom) },
    ciblesCommunes,
    noteLibre,
  };
}

export function calculerVersionDonnees(entrees: EntreesSynergie): string {
  const canonique = JSON.stringify({
    composesA: [...entrees.taxonA.composes].sort(),
    composesB: [...entrees.taxonB.composes].sort(),
    ciblesCommunes: [...entrees.ciblesCommunes].sort(),
  });
  return crypto.createHash("sha256").update(canonique).digest("hex").slice(0, 16);
}

// Repli déterministe : décrit les deux profils et le recoupement
// factuel, sans jamais suggérer un effet combiné — c'est au texte du
// modèle, s'il passe la validation, d'apporter cette lecture, jamais au
// repli.
export function composerTexteDeterministe(e: EntreesSynergie): string {
  const phrases: string[] = [];

  phrases.push(
    `${e.taxonA.nom} (${e.taxonA.nomScientifique}) et ${e.taxonB.nom} (${e.taxonB.nomScientifique}) ont chacun un profil chimique partiellement documenté dans la base de Lafi.`
  );

  phrases.push(
    `Composés connus pour ${e.taxonA.nom} : ${e.taxonA.composes.join(", ") || "aucun listé"}. Composés connus pour ${e.taxonB.nom} : ${e.taxonB.composes.join(", ") || "aucun listé"}.`
  );

  phrases.push(
    e.ciblesCommunes.length > 0
      ? `Cible moléculaire commune identifiée entre les deux profils : ${e.ciblesCommunes.join(", ")}.`
      : "Aucune cible moléculaire commune n'a été identifiée entre les deux profils connus à ce jour."
  );

  if (e.noteLibre) {
    phrases.push("Le point que tu as signalé n'est pas encore une donnée que Lafi peut croiser automatiquement.");
  }

  phrases.push(
    "Ceci reste une lecture de données chimiques déjà publiées, pas un usage attesté ni une combinaison recommandée."
  );

  return phrases.join(" ");
}

const MOTS_INTERDITS = [
  "guérit",
  "guérir",
  "guérison",
  "traite",
  "traitement",
  "soigne",
  "soigner",
  "efficace contre",
  "efficacité",
  "prouvé",
  "prouve",
  "remède contre",
  "recommand",
  "il est démontré",
];

// Plus strict que le validateur du Laboratoire (lib/laboratoireAnalyse.ts) :
// ici, aucune affirmation d'efficacité n'est tolérée, même formulée
// prudemment — c'est une hypothèse sur une combinaison jamais
// documentée, pas un résumé de données déjà attestées.
export function validerTexteHypothese(texte: string): boolean {
  if (/\d+\s*%/.test(texte)) return false;
  if (/\bsur\s+10\b/i.test(texte)) return false;
  const bas = texte.toLowerCase();
  if (MOTS_INTERDITS.some((mot) => bas.includes(mot))) return false;
  if (texte.trim().length < 40 || texte.trim().length > 900) return false;
  return true;
}

const SYSTEM_PROMPT_SYNERGIE = `Tu explores une hypothèse de recherche pour Lafi, à partir de deux profils chimiques déjà publiés. Ce n'est PAS un usage attesté et tu ne recommandes jamais une combinaison.

Règles strictes :
- Tu commentes uniquement le chevauchement ou la complémentarité des composés/cibles moléculaires donnés — tu n'inventes aucun composé, aucune cible, aucune plante qui n'est pas dans les données fournies.
- 3 à 5 phrases, français courant, sans jargon.
- Interdiction absolue d'affirmer une efficacité, un effet thérapeutique, ou de recommander la combinaison : pas de "guérit", "traite", "soigne", "efficace contre", "prouvé", "remède contre", pas de pourcentage, pas de dose.
- Tu formules une observation prudente ("ces deux profils partagent...", "rien dans les données ne suggère...", "cela pourrait justifier une exploration plus poussée, mais aucune donnée actuelle ne le confirme").
- Tu ne conclus jamais au-delà des données fournies.`;

async function genererAvecModele(entrees: EntreesSynergie): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: google("gemini-3.6-flash"),
      system: SYSTEM_PROMPT_SYNERGIE,
      prompt: JSON.stringify(entrees),
    });
    return text;
  } catch {
    return null;
  }
}

export interface ResultatSynergie {
  texte: string;
  origine: "ia" | "repli_deterministe";
  versionDonnees: string;
  executionId: string;
}

function cleTaxons(taxonAId: string, taxonBId: string): [string, string] {
  return taxonAId < taxonBId ? [taxonAId, taxonBId] : [taxonBId, taxonAId];
}

export async function obtenirHypothese(
  taxonAId: string,
  taxonBId: string,
  entrees: EntreesSynergie,
  noteLibre: string | null
): Promise<ResultatSynergie> {
  const [idA, idB] = cleTaxons(taxonAId, taxonBId);
  const versionDonnees = calculerVersionDonnees(entrees);

  const { data: existante } = await supabaseServer
    .from("synergie_execution")
    .select("id, hypothese_texte, hypothese_origine")
    .eq("taxon_a_id", idA)
    .eq("taxon_b_id", idB)
    .eq("version_donnees", versionDonnees)
    .eq("note_libre", noteLibre ?? "")
    .maybeSingle<{ id: string; hypothese_texte: string; hypothese_origine: "ia" | "repli_deterministe" }>();

  if (existante) {
    return {
      texte: existante.hypothese_texte,
      origine: existante.hypothese_origine,
      versionDonnees,
      executionId: existante.id,
    };
  }

  const genere = await genererAvecModele(entrees);
  const texteRetenu = genere && validerTexteHypothese(genere) ? genere : composerTexteDeterministe(entrees);
  const origine: "ia" | "repli_deterministe" = genere && validerTexteHypothese(genere) ? "ia" : "repli_deterministe";

  const { data: inseree, error } = await supabaseServer
    .from("synergie_execution")
    .insert({
      taxon_a_id: idA,
      taxon_b_id: idB,
      note_libre: noteLibre,
      version_donnees: versionDonnees,
      entrees,
      hypothese_texte: texteRetenu,
      hypothese_origine: origine,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !inseree) {
    return { texte: texteRetenu, origine, versionDonnees, executionId: "" };
  }

  return { texte: texteRetenu, origine, versionDonnees, executionId: inseree.id };
}
