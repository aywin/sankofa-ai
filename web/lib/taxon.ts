import { supabaseServer } from "./supabase";
import type {
  Taxon,
  NomVernaculaire,
  TaxonMedia,
  GradeTier,
  ModePreparation,
  NiveauDivulgation,
  PreferenceAttribution,
  Etude,
  Compose,
  Cible,
  AttestationStats,
} from "./types";

// Requêtes centralisées sur le modèle claim/attestation, réutilisées par
// la fiche plante (web/app/plants/[slug]/page.tsx), le chat
// (web/app/api/chat/route.ts) et, plus tard, la page découverte. Server
// only — ne jamais importer dans un composant "use client" (même
// contrainte que lib/supabase.ts).

export interface TaxonWithNoms extends Taxon {
  noms_vernaculaires: NomVernaculaire[];
  media: TaxonMedia[];
}

export async function getTaxonBySlug(slug: string): Promise<TaxonWithNoms | null> {
  const { data, error } = await supabaseServer
    .from("taxon")
    .select("*, noms_vernaculaires:nom_vernaculaire(*), media:taxon_media(*)")
    .eq("slug", slug)
    .maybeSingle<TaxonWithNoms>();

  if (error) throw new Error(error.message);
  return data;
}

// Utilisé par l'outil "obtenir_details_plante" du chat : nom local exact
// tel que retourné par rechercher_par_symptome (même contrat qu'avant).
export async function getTaxonByVernacularName(nom: string): Promise<Taxon | null> {
  const { data, error } = await supabaseServer
    .from("nom_vernaculaire")
    .select("taxon(*)")
    .eq("libelle", nom)
    .maybeSingle<{ taxon: Taxon }>();

  if (error) throw new Error(error.message);
  return data?.taxon ?? null;
}

export interface ClaimDetail {
  id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  divergence_note: string | null;
  est_pilote: boolean;
  indication: { id: string; nom: string };
  partie: { id: string; nom: string };
  preparation: {
    id: string;
    mode: ModePreparation;
    solvant: string | null;
    duree: string | null;
    temperature: string | null;
    description_libre: string | null;
    precautions_specifiques: string | null;
  };
  etudes: Etude[];
  attestations: Array<{
    id: string;
    region: string | null;
    langue: string | null;
    niveau_divulgation: NiveauDivulgation;
    contributeur: { nom_affichage: string | null; preference_attribution: PreferenceAttribution } | null;
  }>;
  stats: AttestationStats;
}

interface RawAttestation {
  id: string;
  region: string | null;
  langue: string | null;
  niveau_divulgation: NiveauDivulgation;
  lignee_id: string;
  contributeur: { nom_affichage: string | null; preference_attribution: PreferenceAttribution } | null;
}

interface RawClaimRow {
  id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  divergence_note: string | null;
  est_pilote: boolean;
  indication: { id: string; nom: string };
  partie: { id: string; nom: string };
  preparation: ClaimDetail["preparation"];
  etudes: Etude[] | null;
  attestations: RawAttestation[] | null;
}

// Une plante peut traiter plusieurs indications ; chaque claim porte son
// propre niveau de preuve — jamais agrégé en un score global par plante
// (§4 du brief : "une plante bien attestée pour un usage peut être
// douteuse pour un autre").
export async function getClaimsForTaxon(taxonId: string): Promise<ClaimDetail[]> {
  const { data, error } = await supabaseServer
    .from("claim")
    .select(
      `id, qualite_preuve_scientifique, contre_indication_forte, divergence_note, est_pilote,
       indication(id, nom),
       partie(id, nom),
       preparation(id, mode, solvant, duree, temperature, description_libre, precautions_specifiques),
       etudes:etude(id, claim_id, doi, titre, type, annee, resume, url),
       attestations:attestation(id, region, langue, niveau_divulgation, lignee_id, contributeur(nom_affichage, preference_attribution))`
    )
    .eq("taxon_id", taxonId)
    .returns<RawClaimRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const attestations = row.attestations ?? [];
    const lignees = new Set(attestations.map((a) => a.lignee_id));
    const regions = new Set(attestations.map((a) => a.region).filter((r): r is string => !!r));
    const langues = new Set(attestations.map((a) => a.langue).filter((l): l is string => !!l));

    return {
      id: row.id,
      qualite_preuve_scientifique: row.qualite_preuve_scientifique,
      contre_indication_forte: row.contre_indication_forte,
      divergence_note: row.divergence_note,
      est_pilote: row.est_pilote,
      indication: row.indication,
      partie: row.partie,
      preparation: row.preparation,
      etudes: row.etudes ?? [],
      attestations: attestations.map((a) => ({
        id: a.id,
        region: a.region,
        langue: a.langue,
        niveau_divulgation: a.niveau_divulgation,
        contributeur: a.contributeur,
      })),
      stats: {
        attestations_count: attestations.length,
        lignees_distinctes: lignees.size,
        regions_distinctes: regions.size,
        langues_distinctes: langues.size,
      },
    };
  });
}

export async function getComposesForTaxon(taxonId: string): Promise<Array<Compose & { cibles: Cible[] }>> {
  const { data, error } = await supabaseServer
    .from("compose")
    .select("*, cibles:cible(*)")
    .eq("taxon_id", taxonId)
    .returns<Array<Compose & { cibles: Cible[] }>>();

  if (error) throw new Error(error.message);
  return data ?? [];
}
