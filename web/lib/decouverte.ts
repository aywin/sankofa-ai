import { supabaseServer } from "./supabase";
import type { GradeTier } from "./types";

// Page découverte (§3 du brief) : grille filtrable, tri par défaut =
// niveau de preuve, jamais popularité. ~24 claims aujourd'hui — pas
// besoin de pagination/filtrage côté SQL, on charge tout et on filtre en
// mémoire (même logique que le commentaire sur l'absence d'index
// vectoriel dans schema.sql : au-delà de quelques milliers de lignes,
// à revoir).

export interface DiscoveryResult {
  claimId: string;
  taxonSlug: string;
  nomPrincipal: string;
  langue: string;
  nomScientifique: string;
  famille: string | null;
  indicationId: string;
  indicationNom: string;
  partieNom: string;
  qualitePreuveScientifique: GradeTier | null;
  contreIndicationForte: boolean;
  estPilote: boolean;
  attestationsCount: number;
  lignéesDistinctes: number;
  regions: string[];
}

interface RawRow {
  id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  est_pilote: boolean;
  taxon: {
    slug: string;
    nom_scientifique: string;
    famille: string | null;
    noms_vernaculaires: { libelle: string; langue: string; est_principal: boolean }[];
  };
  indication: { id: string; nom: string };
  partie: { nom: string };
  attestations: { region: string | null; lignee_id: string }[];
}

async function fetchAllClaims(): Promise<DiscoveryResult[]> {
  const { data, error } = await supabaseServer
    .from("claim")
    .select(
      `id, qualite_preuve_scientifique, contre_indication_forte, est_pilote,
       taxon(slug, nom_scientifique, famille, noms_vernaculaires:nom_vernaculaire(libelle, langue, est_principal)),
       indication(id, nom),
       partie(nom),
       attestations:attestation(region, lignee_id)`
    )
    .returns<RawRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const principal = row.taxon.noms_vernaculaires.find((n) => n.est_principal);
    const regions = [...new Set(row.attestations.map((a) => a.region).filter((r): r is string => !!r))];
    const lignees = new Set(row.attestations.map((a) => a.lignee_id));

    return {
      claimId: row.id,
      taxonSlug: row.taxon.slug,
      nomPrincipal: principal?.libelle ?? row.taxon.nom_scientifique,
      langue: principal?.langue ?? "",
      nomScientifique: row.taxon.nom_scientifique,
      famille: row.taxon.famille,
      indicationId: row.indication.id,
      indicationNom: row.indication.nom,
      partieNom: row.partie.nom,
      qualitePreuveScientifique: row.qualite_preuve_scientifique,
      contreIndicationForte: row.contre_indication_forte,
      estPilote: row.est_pilote,
      attestationsCount: row.attestations.length,
      lignéesDistinctes: lignees.size,
      regions,
    };
  });
}

// Ordre "meilleure preuve d'abord" — jamais de tri par popularité.
const QUALITE_ORDER: Record<string, number> = { elevee: 0, moderee: 1, faible: 2, tres_faible: 3 };

function sortByEvidence(results: DiscoveryResult[]): DiscoveryResult[] {
  return [...results].sort((a, b) => {
    const qa = a.qualitePreuveScientifique ? QUALITE_ORDER[a.qualitePreuveScientifique] : 4;
    const qb = b.qualitePreuveScientifique ? QUALITE_ORDER[b.qualitePreuveScientifique] : 4;
    if (qa !== qb) return qa - qb;
    return b.lignéesDistinctes - a.lignéesDistinctes;
  });
}

export interface DiscoveryFilters {
  indicationId?: string;
  partieNom?: string;
  qualite?: string; // GradeTier | "non_evaluee"
  region?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface DiscoveryData {
  results: DiscoveryResult[];
  totalCount: number;
  options: {
    indications: FilterOption[];
    parties: FilterOption[];
    qualites: FilterOption[];
    regions: FilterOption[];
  };
}

const QUALITE_LABELS: Record<string, string> = {
  elevee: "Élevée",
  moderee: "Modérée",
  faible: "Faible",
  tres_faible: "Très faible",
  non_evaluee: "Non évaluée",
};

// On ne propose que des filtres remplissables (§3 du brief : "si la base
// couvre mal un domaine, ce domaine n'apparaît pas comme une porte
// d'entrée") — les options viennent des données réelles, jamais d'une
// liste figée.
function buildOptions(all: DiscoveryResult[]): DiscoveryData["options"] {
  const count = <T,>(items: T[], key: (item: T) => string) => {
    const map = new Map<string, number>();
    for (const item of items) map.set(key(item), (map.get(key(item)) ?? 0) + 1);
    return map;
  };

  const indicationCounts = count(all, (r) => r.indicationId);
  const indications = [...indicationCounts.entries()]
    .map(([id, c]) => {
      const match = all.find((r) => r.indicationId === id)!;
      return { value: id, label: match.indicationNom, count: c };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));

  const partieCounts = count(all, (r) => r.partieNom);
  const parties = [...partieCounts.entries()]
    .map(([nom, c]) => ({ value: nom, label: nom, count: c }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));

  const qualiteCounts = count(all, (r) => r.qualitePreuveScientifique ?? "non_evaluee");
  const qualites = [...qualiteCounts.entries()]
    .map(([q, c]) => ({ value: q, label: QUALITE_LABELS[q] ?? q, count: c }))
    .sort((a, b) => (QUALITE_ORDER[a.value] ?? 4) - (QUALITE_ORDER[b.value] ?? 4));

  const regionCounts = count(
    all.flatMap((r) => r.regions.map((region) => ({ region }))),
    (r) => r.region
  );
  const regions = [...regionCounts.entries()]
    .map(([region, c]) => ({ value: region, label: region, count: c }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return { indications, parties, qualites, regions };
}

export async function getDiscoveryData(filters: DiscoveryFilters): Promise<DiscoveryData> {
  const all = await fetchAllClaims();
  const options = buildOptions(all);

  let filtered = all;
  if (filters.indicationId) filtered = filtered.filter((r) => r.indicationId === filters.indicationId);
  if (filters.partieNom) filtered = filtered.filter((r) => r.partieNom === filters.partieNom);
  if (filters.qualite) {
    filtered = filtered.filter((r) =>
      filters.qualite === "non_evaluee"
        ? r.qualitePreuveScientifique === null
        : r.qualitePreuveScientifique === filters.qualite
    );
  }
  if (filters.region) filtered = filtered.filter((r) => r.regions.includes(filters.region!));

  return { results: sortByEvidence(filtered), totalCount: all.length, options };
}
