// Import de la recherche documentaire (docs/recherche/lot-A et lot-B) dans
// la base. Par défaut : essai à blanc, qui écrit docs/recherche/import-rapport.md
// sans rien toucher. Avec --appliquer : écrit en base (migration 0004 requise).
//
//   npx tsx --env-file=.env.local scripts/import-recherche.ts
//   npx tsx --env-file=.env.local scripts/import-recherche.ts --appliquer
//
// Règle : on n'importe que ce qui est clair. Une ligne sans source, un nom
// local ambigu, un usage marqué ambigu, une plante ou un mal introuvable :
// la ligne est écartée et listée dans le rapport.
// Après --appliquer, lancer scripts/generate-embeddings.ts pour indexer les
// nouveaux usages dans la recherche du chat.

import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "../lib/slug";

const APPLIQUER = process.argv.includes("--appliquer");
// Lancé depuis web/.
const RACINE = path.resolve(process.cwd(), "../docs/recherche");
// --lot=lot-sedelan (répétable) : n'importe que ces lots. Par défaut, les
// lots A et B. Ne jamais réimporter un lot déjà importé : les usages et noms
// sont dédoublonnés, mais pas les produits homologués ni les remèdes non
// végétaux.
const LOTS = process.argv.filter((a) => a.startsWith("--lot=")).map((a) => a.slice(6));
if (LOTS.length === 0) LOTS.push("lot-A", "lot-B");

type Ligne = Record<string, string>;

// ---------- Lecture CSV (séparateur ;, champs entre guillemets) ----------

function lireCsv(fichier: string): Ligne[] {
  if (!fs.existsSync(fichier)) return [];
  const texte = fs.readFileSync(fichier, "utf8").replace(/^﻿/, "");
  const lignes: string[][] = [];
  let champ = "";
  let ligne: string[] = [];
  let entreGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entreGuillemets) {
      if (c === '"' && texte[i + 1] === '"') {
        champ += '"';
        i++;
      } else if (c === '"') entreGuillemets = false;
      else champ += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === ";") {
      ligne.push(champ);
      champ = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ);
      champ = "";
      if (ligne.some((x) => x.trim() !== "")) lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  ligne.push(champ);
  if (ligne.some((x) => x.trim() !== "")) lignes.push(ligne);
  const [entete, ...corps] = lignes;
  if (!entete) return [];
  return corps.map((cols) => Object.fromEntries(entete.map((h, j) => [h.trim(), (cols[j] ?? "").trim()])));
}

function lireLots(nom: string): (Ligne & { _lot: string })[] {
  return LOTS.flatMap((lot) => lireCsv(path.join(RACINE, lot, nom)).map((l) => ({ ...l, _lot: lot })));
}

// ---------- Normalisations ----------

const vide = (v?: string) => !v || v.trim() === "" || v === "non_documente";
const valeur = (v?: string) => (vide(v) ? null : v!.trim());

const PARTIES: Record<string, string> = {
  feuille: "feuille",
  ecorce: "écorce",
  racine: "racine",
  fruit: "fruit",
  graine: "graine",
  fleur: "fleur",
  calice: "calice",
  tige: "tige",
  "plante entiere": "plante entière",
  gomme: "gomme",
  seve: "sève",
  bulbe: "bulbe",
};

const LANGUES: Record<string, string> = {
  moore: "mooré",
  dioula: "dioula",
  bambara: "dioula",
  bamankan: "dioula",
  fulfulde: "fulfuldé",
  gourmantche: "gourmantché",
  bissa: "bissa",
  dagara: "dagara",
  lobiri: "lobiri",
  san: "san",
  gourounsi: "gourounsi",
  lyele: "lyélé",
  nuni: "nuni",
  "francais local": "français",
  turka: "turka",
  twi: "twi",
};

const MODES = new Set(["decoction", "infusion", "maceration", "poudre", "cataplasme", "application_directe", "autre"]);
const QUALITES = new Set(["elevee", "moderee", "faible", "tres_faible"]);
const TYPES_ETUDE = new Set([
  "preclinique_in_vitro",
  "preclinique_animal",
  "essai_clinique_humain",
  "revue_systematique",
  "revue_narrative",
  "etude_experimentale_humaine",
]);

// Dans la base, les noms gardent l'orthographe de Lafi : on n'impose pas
// les renommages POWO (Citrus × limon, Gymnanthemum…), ils vont en synonymes.
const sansAccent = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const cleNom = (t: string) => sansAccent(t.replace(/×/g, "x").replace(/\bx\s+/g, ""));

// ---------- Rapport ----------

const rapport: string[] = [];
const ecarts: string[] = [];
const ecarter = (quoi: string, raison: string) => ecarts.push(`- ${quoi} : ${raison}`);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
  const db = createClient(url, cle);

  if (APPLIQUER) {
    const { error } = await db.from("taxon").select("synonymes").limit(1);
    if (error) throw new Error("La migration 0004_recherche_documentaire.sql n'est pas appliquée : " + error.message);
  }

  // État actuel de la base.
  const { data: taxonsBase } = await db.from("taxon").select("id, slug, nom_scientifique, precautions, description, habitat_region");
  const { data: indicationsBase } = await db.from("indication").select("id, nom, symptomes");
  const { data: partiesBase } = await db.from("partie").select("id, nom");
  const { data: nomsBase } = await db.from("nom_vernaculaire").select("taxon_id, libelle, est_principal");
  const { data: claimsBase } = await db.from("claim").select("id, taxon_id, partie_id, indication_id, preparation:preparation_id(mode)");
  const { data: composesBase } = await db.from("compose").select("taxon_id, nom");
  const { data: mediasBase } = await db.from("taxon_media").select("url");

  // ---------- Plantes ----------
  const taxonsCsv = lireLots("taxons.csv");
  type Plante = { id: string | null; slug: string; nomBase: string; ligne: Ligne; nouvelle: boolean; principal: string | null };
  const plantes = new Map<string, Plante>(); // clé : nom scientifique du CSV
  const parNomBase = new Map((taxonsBase ?? []).map((t) => [cleNom(t.nom_scientifique), t]));

  for (const t of taxonsCsv) {
    const sci = t.nom_scientifique;
    if (!sci) continue;
    if (vide(t.sources)) {
      ecarter(`plante ${sci}`, "aucune source");
      continue;
    }
    const candidats = [t.nom_dans_lafi, sci, ...(t.synonymes ?? "").split("|")].filter(Boolean).map((x) => cleNom(x));
    const existante = candidats.map((c) => parNomBase.get(c)).find(Boolean);
    const cle = cleNom(sci);
    const deja = plantes.get(cle);
    if (deja) {
      // Même plante dans les deux lots : on complète les cases vides.
      for (const [k, v] of Object.entries(t)) if (vide(deja.ligne[k]) && !vide(v)) deja.ligne[k] = v;
      continue;
    }
    plantes.set(cle, {
      id: existante?.id ?? null,
      slug: existante?.slug ?? "",
      nomBase: existante?.nom_scientifique ?? sci,
      ligne: { ...t },
      nouvelle: !existante,
      principal: null,
    });
  }
  const trouverPlante = (sci: string) => {
    const cle = cleNom(sci);
    return plantes.get(cle) ?? [...plantes.values()].find((p) => cleNom(p.nomBase) === cle);
  };

  // ---------- Noms locaux ----------
  const nomsCsv = lireLots("noms_vernaculaires.csv");
  const nomsAImporter: { plante: Plante; libelle: string; langue: string; region: string | null; source: string }[] = [];
  const nomsExistants = new Set((nomsBase ?? []).map((n) => `${n.taxon_id}|${sansAccent(n.libelle)}`));
  for (const n of nomsCsv) {
    const p = trouverPlante(n.nom_scientifique);
    if (!p) {
      ecarter(`nom « ${n.libelle} »`, `plante ${n.nom_scientifique} absente de taxons.csv`);
      continue;
    }
    if (n.ambigu === "oui") {
      ecarter(`nom « ${n.libelle} » (${n.nom_scientifique})`, "ambigu : désigne aussi une autre espèce");
      continue;
    }
    if (vide(n.source) || !n.libelle) {
      ecarter(`nom « ${n.libelle} »`, "aucune source");
      continue;
    }
    const langue = LANGUES[sansAccent(n.langue)] ?? "autre";
    const cle = `${p.id ?? p.nomBase}|${sansAccent(n.libelle)}`;
    if (nomsExistants.has(cle)) continue;
    nomsExistants.add(cle);
    nomsAImporter.push({ plante: p, libelle: n.libelle, langue, region: valeur(n.region), source: n.source });
  }

  // Nom affiché d'une nouvelle plante : le nom français s'il existe, sinon
  // le nom scientifique. Les noms en langues locales restent des précisions.
  for (const p of plantes.values()) {
    if (!p.nouvelle) continue;
    p.principal = nomsAImporter.find((n) => n.plante === p && n.langue === "français")?.libelle ?? null;
    const base = slugify(p.principal ?? p.nomBase).slice(0, 60) || slugify(p.nomBase);
    const pris = new Set([...(taxonsBase ?? []).map((t) => t.slug), ...[...plantes.values()].map((x) => x.slug)]);
    let slug = base;
    for (let i = 2; pris.has(slug); i++) slug = `${base}-${i}`;
    p.slug = slug;
  }

  // ---------- Maux ----------
  const indicationsCsv = lireLots("indications.csv");
  const maux = new Map((indicationsBase ?? []).map((i) => [i.nom, { id: i.id as string | null, symptomes: i.symptomes as string | null, ligne: null as Ligne | null }]));
  for (const i of indicationsCsv) {
    if (!i.nom) continue;
    if (!maux.has(i.nom)) maux.set(i.nom, { id: null, symptomes: valeur(i.symptomes), ligne: i });
    else if (!maux.get(i.nom)!.ligne) maux.get(i.nom)!.ligne = i;
  }

  // ---------- Usages ----------
  const usagesCsv = lireLots("usages.csv");
  const cleUsageBase = new Set(
    (claimsBase ?? []).map((c) => {
      const mode = (c.preparation as unknown as { mode: string } | null)?.mode;
      return `${c.taxon_id}|${c.partie_id}|${mode}|${c.indication_id}`;
    })
  );
  const partieId = new Map((partiesBase ?? []).map((p) => [p.nom, p.id as string]));
  type Usage = { plante: Plante; partie: string; mal: string; ligne: Ligne };
  const usages: Usage[] = [];
  const clesVues = new Set<string>();
  for (const u of usagesCsv) {
    const quoi = `usage ${u.nom_scientifique} / ${u.partie} / ${u.mode} → ${u.indication} (${u._lot})`;
    const p = trouverPlante(u.nom_scientifique);
    if (!p) {
      ecarter(quoi, "plante absente de taxons.csv");
      continue;
    }
    if (!maux.has(u.indication)) {
      ecarter(quoi, "mal hors de la liste fermée");
      continue;
    }
    if (vide(u.sources_tradition)) {
      ecarter(quoi, "aucune source");
      continue;
    }
    if (u.ambigu === "oui") {
      ecarter(quoi, "marqué ambigu par la source");
      continue;
    }
    const partie = PARTIES[sansAccent(u.partie)];
    if (!partie || !MODES.has(u.mode)) {
      ecarter(quoi, "partie ou mode de préparation non reconnus");
      continue;
    }
    const cle = `${p.id ?? p.nomBase}|${partie}|${u.mode}|${u.indication}`;
    const cleBase = `${p.id}|${partieId.get(partie)}|${u.mode}|${maux.get(u.indication)!.id}`;
    if (clesVues.has(cle) || (p.id && cleUsageBase.has(cleBase))) {
      ecarter(quoi, "déjà présent (même plante, partie, préparation et mal)");
      continue;
    }
    clesVues.add(cle);
    usages.push({ plante: p, partie, mal: u.indication, ligne: u });
  }

  // ---------- Études, composés, photos, références ----------
  const etudes = lireLots("etudes.csv").filter((e) => {
    if (!e.titre || (vide(e.url) && vide(e.doi))) return ecarter(`étude « ${e.titre?.slice(0, 50)} »`, "sans titre ou sans lien"), false;
    if (!TYPES_ETUDE.has(e.type)) return ecarter(`étude « ${e.titre.slice(0, 50)} »`, `type « ${e.type} » inconnu`), false;
    return true;
  });
  const composesVus = new Set((composesBase ?? []).map((c) => `${c.taxon_id}|${sansAccent(c.nom)}`));
  const composes = lireLots("composes.csv").filter((c) => {
    const p = trouverPlante(c.nom_scientifique);
    if (!p || vide(c.source) || !c.nom) return ecarter(`composé ${c.nom} (${c.nom_scientifique})`, "plante absente ou sans source"), false;
    const cle = `${p.id ?? p.nomBase}|${sansAccent(c.nom)}`;
    if (composesVus.has(cle)) return false;
    composesVus.add(cle);
    return true;
  });
  const mediasVus = new Set((mediasBase ?? []).map((m) => m.url));
  const medias = lireLots("medias.csv").filter((m) => {
    if (!trouverPlante(m.nom_scientifique) || !m.url || mediasVus.has(m.url)) return false;
    if (!/^CC|domaine public|public domain/i.test(m.licence) || /NC|ND/.test(m.licence)) return ecarter(`photo ${m.url}`, `licence « ${m.licence} » non libre`), false;
    mediasVus.add(m.url);
    return true;
  });
  const structures = lireLots("structures.csv").filter((s) => s.nom && !vide(s.sources));
  const produits = lireLots("produits_homologues.csv").filter((p) => p.nom_produit && !vide(p.sources));
  const nonVegetaux = lireLots("remedes_non_vegetaux.csv").filter((r) => {
    if (!r.nom || vide(r.sources)) return false;
    if (!maux.has(r.indication)) return ecarter(`remède ${r.nom}`, "mal hors de la liste fermée"), false;
    return true;
  });

  // ---------- Rapport ----------
  const nouvelles = [...plantes.values()].filter((p) => p.nouvelle);
  const nouveauxMaux = [...maux.entries()].filter(([, m]) => !m.id);
  rapport.push(
    `# Import de la recherche documentaire`,
    ``,
    `${APPLIQUER ? "Appliqué" : "Essai à blanc (rien n'est écrit en base)"} le ${new Date().toLocaleString("fr-FR")}.`,
    ``,
    `| Élément | À importer |`,
    `|---|---|`,
    `| Plantes nouvelles | ${nouvelles.length} |`,
    `| Plantes existantes complétées | ${plantes.size - nouvelles.length} |`,
    `| Noms locaux | ${nomsAImporter.length} |`,
    `| Maux nouveaux | ${nouveauxMaux.length} |`,
    `| Usages | ${usages.length} |`,
    `| Études | ${etudes.length} |`,
    `| Composés | ${composes.length} |`,
    `| Photos | ${medias.length} |`,
    `| Structures | ${structures.length} |`,
    `| Produits homologués | ${produits.length} |`,
    `| Remèdes non végétaux | ${nonVegetaux.length} |`,
    ``,
    `## Plantes nouvelles`,
    ``,
    ...nouvelles.map((p) => `- ${p.principal ?? "(pas de nom français)"} : *${p.nomBase}* → /plants/${p.slug}`),
    ``,
    `## Maux nouveaux`,
    ``,
    ...nouveauxMaux.map(([nom]) => `- ${nom}`),
    ``,
    `## Usages par mal`,
    ``,
    ...[...new Set(usages.map((u) => u.mal))].sort().map((m) => `- ${m} : ${usages.filter((u) => u.mal === m).length}`),
    ``,
    `## Lignes écartées (${ecarts.length})`,
    ``,
    ...ecarts
  );

  if (APPLIQUER) await appliquer(db, { plantes, nomsAImporter, maux, usages, etudes, composes, medias, structures, produits, nonVegetaux, partieId });

  fs.writeFileSync(path.join(RACINE, "import-rapport.md"), rapport.join("\n") + "\n");
  console.log(rapport.slice(0, 20).join("\n"));
  console.log(`\n${ecarts.length} ligne(s) écartée(s). Rapport : docs/recherche/import-rapport.md`);
}

// ---------- Écriture en base ----------

async function appliquer(
  db: SupabaseClient,
  d: {
    plantes: Map<string, { id: string | null; slug: string; nomBase: string; ligne: Ligne; nouvelle: boolean; principal: string | null }>;
    nomsAImporter: { plante: { id: string | null; nomBase: string }; libelle: string; langue: string; region: string | null; source: string }[];
    maux: Map<string, { id: string | null; symptomes: string | null; ligne: Ligne | null }>;
    usages: { plante: { id: string | null; nomBase: string; principal: string | null }; partie: string; mal: string; ligne: Ligne }[];
    etudes: Ligne[];
    composes: Ligne[];
    medias: Ligne[];
    structures: Ligne[];
    produits: Ligne[];
    nonVegetaux: Ligne[];
    partieId: Map<string, string>;
  }
) {
  const verifier = (error: { message: string } | null, quoi: string) => {
    if (error) throw new Error(`${quoi} : ${error.message}`);
  };

  // Plantes : création, ou complément des cases vides d'une plante existante.
  for (const p of d.plantes.values()) {
    const l = p.ligne;
    const champs = {
      synonymes: [l.nom_scientifique !== p.nomBase ? l.nom_scientifique : null, valeur(l.synonymes)].filter(Boolean).join(" | ") || null,
      regions_burkina: valeur(l.regions_burkina),
      localites: valeur(l.localites),
      pays_presence: valeur(l.pays_presence),
      ou_la_trouver: valeur(l.ou_la_trouver),
      saison_recolte: valeur(l.saison_recolte),
      conservation: valeur(l.conservation),
      confusions_possibles: valeur(l.confusions_possibles),
      statut_protection: valeur(l.statut_protection),
      toxicite_connue: valeur(l.toxicite_connue),
      interactions_medicaments: valeur(l.interactions_medicaments),
      sources: valeur(l.sources),
    };
    if (p.nouvelle) {
      const { data, error } = await db
        .from("taxon")
        .insert({
          slug: p.slug,
          nom_scientifique: p.nomBase,
          autorite: valeur(l.autorite),
          famille: valeur(l.famille),
          description: valeur(l.description),
          precautions: valeur(l.precautions),
          habitat_region: valeur(l.habitat_region),
          ...champs,
        })
        .select("id")
        .single();
      verifier(error, `plante ${p.nomBase}`);
      p.id = (data as { id: string }).id;
    } else {
      const { data: actuel } = await db.from("taxon").select("*").eq("id", p.id!).single();
      const maj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries({ ...champs, precautions: valeur(l.precautions), description: valeur(l.description), habitat_region: valeur(l.habitat_region) })) {
        if (v && !(actuel as Record<string, unknown>)?.[k]) maj[k] = v;
      }
      if (Object.keys(maj).length) verifier((await db.from("taxon").update(maj).eq("id", p.id!)).error, `plante ${p.nomBase}`);
    }
  }

  // Noms locaux (le nom affiché d'une plante existante ne change pas).
  for (const n of d.nomsAImporter) {
    const plante = [...d.plantes.values()].find((p) => p === n.plante)!;
    const { error } = await db.from("nom_vernaculaire").insert({
      taxon_id: plante.id,
      libelle: n.libelle,
      langue: n.langue,
      region: n.region,
      est_principal: plante.nouvelle && plante.principal === n.libelle,
      source: n.source,
    });
    if (error && !error.message.includes("duplicate")) throw new Error(`nom ${n.libelle} : ${error.message}`);
  }

  // Maux nouveaux, et signes de gravité des maux existants.
  for (const [nom, m] of d.maux) {
    if (!m.ligne) continue;
    const champs = {
      categorie: valeur(m.ligne.categorie),
      symptomes: valeur(m.ligne.symptomes),
      description: valeur(m.ligne.description),
      signes_de_gravite: valeur(m.ligne.signes_de_gravite),
      source: valeur(m.ligne.source),
    };
    if (!m.id) {
      const { data, error } = await db.from("indication").insert({ nom, ...champs }).select("id").single();
      verifier(error, `mal ${nom}`);
      m.id = (data as { id: string }).id;
    }
  }

  // Parties manquantes (tige, gomme, sève…).
  for (const u of d.usages) {
    if (!d.partieId.has(u.partie)) {
      const { data, error } = await db.from("partie").insert({ nom: u.partie }).select("id").single();
      verifier(error, `partie ${u.partie}`);
      d.partieId.set(u.partie, (data as { id: string }).id);
    }
  }

  // Usages : une préparation, puis l'usage.
  const claimParPlanteMal = new Map<string, string>();
  for (const u of d.usages) {
    const l = u.ligne;
    const mal = d.maux.get(u.mal)!;
    const ciDocumentee = l.contre_indication_forte === "oui" || l.contre_indication_forte === "non";
    const precautions = [
      valeur(l.precautions_specifiques),
      ciDocumentee ? null : "La sécurité de cet usage n'est pas documentée : demander un avis avant usage.",
    ]
      .filter(Boolean)
      .join(" ");
    const { data: prep, error: errPrep } = await db
      .from("preparation")
      .insert({
        partie_id: d.partieId.get(u.partie),
        mode: l.mode,
        solvant: valeur(l.solvant),
        description_libre: valeur(l.preparation_description),
        precautions_specifiques: precautions || null,
        etapes: valeur(l.etapes_preparation),
        voie: valeur(l.voie),
        mode_usage_rapporte: valeur(l.mode_usage_rapporte),
        public_deconseille: valeur(l.public_deconseille),
        signes_arret: valeur(l.signes_arret),
      })
      .select("id")
      .single();
    verifier(errPrep, `préparation ${u.plante.nomBase}`);
    const nom = u.plante.principal ?? u.plante.nomBase;
    const { data: claim, error } = await db
      .from("claim")
      .insert({
        taxon_id: u.plante.id,
        partie_id: d.partieId.get(u.partie),
        preparation_id: (prep as { id: string }).id,
        indication_id: mal.id,
        qualite_preuve_scientifique: QUALITES.has(l.qualite_preuve_scientifique) ? l.qualite_preuve_scientifique : null,
        contre_indication_forte: l.contre_indication_forte === "oui",
        est_pilote: false,
        origine: "documentaire",
        pays_region_usage: valeur(l.pays_region_usage),
        nombre_sources_tradition: Number(l.nombre_sources_tradition) || null,
        resume_science: valeur(l.resume_science),
        sources_tradition: valeur(l.sources_tradition),
        contenu_pour_recherche: `${u.mal}${mal.symptomes ? ` : ${mal.symptomes}` : ""}. Usage traditionnel de ${nom} (${u.plante.nomBase}). ${valeur(l.preparation_description) ?? ""}`.trim(),
      })
      .select("id")
      .single();
    verifier(error, `usage ${u.plante.nomBase} → ${u.mal}`);
    const cle = `${cleNom(u.plante.nomBase)}|${u.mal}`;
    if (!claimParPlanteMal.has(cle)) claimParPlanteMal.set(cle, (claim as { id: string }).id);
  }

  // Études : rattachées au premier usage importé de la même plante et du même mal.
  for (const e of d.etudes) {
    const p = [...d.plantes.values()].find((x) => cleNom(x.ligne.nom_scientifique) === cleNom(e.nom_scientifique));
    const claimId = p && claimParPlanteMal.get(`${cleNom(p.nomBase)}|${e.indication}`);
    if (!claimId) {
      ecarter(`étude « ${e.titre.slice(0, 50)} »`, "aucun usage importé de cette plante pour ce mal");
      continue;
    }
    const { error } = await db.from("etude").insert({
      claim_id: claimId,
      titre: e.titre,
      doi: valeur(e.doi),
      url: valeur(e.url),
      annee: Number(e.annee) || null,
      type: e.type,
      resume: valeur(e.resume),
    });
    verifier(error, `étude ${e.titre}`);
  }

  for (const c of d.composes) {
    const p = [...d.plantes.values()].find((x) => cleNom(x.ligne.nom_scientifique) === cleNom(c.nom_scientifique) || cleNom(x.nomBase) === cleNom(c.nom_scientifique))!;
    verifier(
      (
        await db.from("compose").insert({
          taxon_id: p.id,
          nom: c.nom,
          concentration: valeur(c.concentration),
          methode_identification: valeur(c.methode_identification),
          source_base: valeur(c.source_base),
          source: valeur(c.source),
        })
      ).error,
      `composé ${c.nom}`
    );
  }

  for (const m of d.medias) {
    const p = [...d.plantes.values()].find((x) => cleNom(x.ligne.nom_scientifique) === cleNom(m.nom_scientifique) || cleNom(x.nomBase) === cleNom(m.nom_scientifique))!;
    const partie = PARTIES[sansAccent(m.partie ?? "")];
    verifier(
      (
        await db.from("taxon_media").insert({
          taxon_id: p.id,
          partie_id: partie ? d.partieId.get(partie) ?? null : null,
          url: m.url,
          label: m.label || "Photo",
          credit_auteur: m.credit_auteur,
          licence: m.licence,
          source_url: m.source_url || m.url,
        })
      ).error,
      `photo ${m.url}`
    );
  }

  for (const s of d.structures) {
    const { error } = await db.from("structure_reference").upsert(
      { nom: s.nom, type: valeur(s.type), ville: valeur(s.ville), role: valeur(s.role), contact_public: valeur(s.contact_public), sources: s.sources },
      { onConflict: "nom" }
    );
    verifier(error, `structure ${s.nom}`);
  }
  for (const p of d.produits) {
    verifier(
      (
        await db.from("produit_homologue").insert({
          nom_produit: p.nom_produit,
          plantes: valeur(p.plantes),
          indication: valeur(p.indication),
          fabricant_ou_structure: valeur(p.fabricant_ou_structure),
          statut: valeur(p.statut),
          annee: Number(p.annee) || null,
          pays: valeur(p.pays),
          sources: p.sources,
        })
      ).error,
      `produit ${p.nom_produit}`
    );
  }
  for (const r of d.nonVegetaux) {
    verifier(
      (
        await db.from("remede_non_vegetal").insert({
          nom: r.nom,
          origine: ["animale", "minerale", "eau"].includes(r.origine) ? r.origine : null,
          matiere: valeur(r.matiere),
          indication_id: d.maux.get(r.indication)?.id ?? null,
          preparation_description: valeur(r.preparation_description),
          risques: valeur(r.risques),
          pays_region_usage: valeur(r.pays_region_usage),
          sources: r.sources,
        })
      ).error,
      `remède ${r.nom}`
    );
  }
}

main().catch((e) => {
  console.error("Échec :", e instanceof Error ? e.message : e);
  process.exit(1);
});
