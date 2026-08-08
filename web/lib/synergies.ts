import { supabaseServer } from "./supabase";

// Espace expérimental "Explorer des synergies" — deuxième workflow, à ne
// jamais confondre avec le Laboratoire : celui-ci documente des usages
// déjà attestés, celui-là formule une hypothèse à partir de composés
// chimiques déjà en base pour deux plantes. Jamais un usage attesté,
// jamais un remède recommandé.

export interface TaxonEligible {
  id: string;
  slug: string;
  nomPrincipal: string;
  nomScientifique: string;
  composesCount: number;
}

interface RawTaxonRow {
  id: string;
  slug: string;
  nom_scientifique: string;
  noms_vernaculaires: { libelle: string; est_principal: boolean }[];
  composes: { id: string; cibles: { id: string }[] }[];
}

// Seules les plantes avec au moins un composé documenté ET au moins une
// cible moléculaire connue pour ce composé peuvent être croisées — sans
// ça, il n'y a rien de factuel à comparer (§ "si la base couvre mal un
// domaine, ce domaine n'apparaît pas comme une porte d'entrée").
export async function getEligibleTaxaForSynergies(): Promise<TaxonEligible[]> {
  const { data, error } = await supabaseServer
    .from("taxon")
    .select(
      `id, slug, nom_scientifique,
       noms_vernaculaires:nom_vernaculaire(libelle, est_principal),
       composes:compose(id, cibles:cible(id))`
    )
    .returns<RawTaxonRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((t) => {
      const composesAvecCible = t.composes.filter((c) => c.cibles.length > 0);
      const principal = t.noms_vernaculaires.find((n) => n.est_principal);
      return {
        id: t.id,
        slug: t.slug,
        nomPrincipal: principal?.libelle ?? t.nom_scientifique,
        nomScientifique: t.nom_scientifique,
        composesCount: composesAvecCible.length,
      };
    })
    .filter((t) => t.composesCount > 0)
    .sort((a, b) => a.nomPrincipal.localeCompare(b.nomPrincipal, "fr"));
}

export interface ProfilChimique {
  taxonId: string;
  nomPrincipal: string;
  nomScientifique: string;
  composes: { nom: string; concentration: string | null; cibles: { proteine: string; affinite: string | null; source: string | null }[] }[];
}

export interface SynergieData {
  taxonA: ProfilChimique;
  taxonB: ProfilChimique;
  // Recoupement : purement factuel, calculé en TS à partir des cibles
  // réellement en base — jamais une sortie du modèle. C'est ce qui
  // distingue "ce qu'on sait" (nœud 5) de "ce que l'IA en dit" (nœud 6).
  ciblesCommunes: string[];
}

async function getProfilChimique(taxonId: string): Promise<ProfilChimique | null> {
  const { data: taxon, error: taxonError } = await supabaseServer
    .from("taxon")
    .select("id, nom_scientifique, noms_vernaculaires:nom_vernaculaire(libelle, est_principal)")
    .eq("id", taxonId)
    .maybeSingle<{ id: string; nom_scientifique: string; noms_vernaculaires: { libelle: string; est_principal: boolean }[] }>();

  if (taxonError) throw new Error(taxonError.message);
  if (!taxon) return null;

  const { data: composes, error: composesError } = await supabaseServer
    .from("compose")
    .select("nom, concentration, cibles:cible(proteine, affinite, source)")
    .eq("taxon_id", taxonId)
    .returns<{ nom: string; concentration: string | null; cibles: { proteine: string; affinite: string | null; source: string | null }[] }[]>();

  if (composesError) throw new Error(composesError.message);

  const principal = taxon.noms_vernaculaires.find((n) => n.est_principal);

  return {
    taxonId: taxon.id,
    nomPrincipal: principal?.libelle ?? taxon.nom_scientifique,
    nomScientifique: taxon.nom_scientifique,
    composes: composes ?? [],
  };
}

// Deux protéines cibles sont "communes" si leur nom se recoupe
// exactement (comparaison insensible à la casse) — pas d'approximation
// floue qui inventerait un recoupement qui n'existe pas.
function trouverCiblesCommunes(a: ProfilChimique, b: ProfilChimique): string[] {
  const ciblesA = new Set(a.composes.flatMap((c) => c.cibles.map((t) => t.proteine.trim().toLowerCase())));
  const ciblesB = new Set(b.composes.flatMap((c) => c.cibles.map((t) => t.proteine.trim().toLowerCase())));
  const communes: string[] = [];
  for (const cible of ciblesA) {
    if (ciblesB.has(cible)) communes.push(cible);
  }
  return communes;
}

export async function getSynergieData(taxonAId: string, taxonBId: string): Promise<SynergieData | null> {
  const [taxonA, taxonB] = await Promise.all([getProfilChimique(taxonAId), getProfilChimique(taxonBId)]);
  if (!taxonA || !taxonB) return null;

  return {
    taxonA,
    taxonB,
    ciblesCommunes: trouverCiblesCommunes(taxonA, taxonB),
  };
}
