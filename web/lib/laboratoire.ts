import { supabaseServer } from "./supabase";
import type {
  GradeTier,
  ModePreparation,
  NiveauDivulgation,
  PreferenceAttribution,
  Etude,
  Compose,
  Cible,
  AttestationStats,
} from "./types";

// Données d'un claim pour le laboratoire de simulation (§5 du brief) —
// même esprit que web/lib/taxon.ts (getClaimsForTaxon) mais centré sur
// UN couple précis, avec en plus tout ce que chaque nœud du pipeline a
// besoin d'afficher comme entrée/sortie réelle.

export interface LaboratoireData {
  claimId: string;
  taxon: {
    id: string;
    slug: string;
    nomScientifique: string;
    autorite: string | null;
    famille: string | null;
  };
  nomPrincipal: string;
  autresNoms: { libelle: string; langue: string }[];
  indication: { id: string; nom: string };
  partie: { nom: string };
  preparation: {
    mode: ModePreparation;
    solvant: string | null;
    duree: string | null;
    temperature: string | null;
    descriptionLibre: string | null;
    precautionsSpecifiques: string | null;
  };
  precautions: string | null;
  contreIndicationForte: boolean;
  divergenceNote: string | null;
  qualitePreuveScientifique: GradeTier | null;
  estPilote: boolean;
  etudes: Etude[];
  attestations: {
    id: string;
    region: string | null;
    langue: string | null;
    niveauDivulgation: NiveauDivulgation;
    contributeur: { nomAffichage: string | null; preferenceAttribution: PreferenceAttribution } | null;
  }[];
  stats: AttestationStats;
  composes: Array<Compose & { cibles: Cible[] }>;
}

interface RawRow {
  id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  divergence_note: string | null;
  est_pilote: boolean;
  taxon: {
    id: string;
    slug: string;
    nom_scientifique: string;
    autorite: string | null;
    famille: string | null;
    precautions: string | null;
    noms_vernaculaires: { libelle: string; langue: string; est_principal: boolean }[];
  };
  indication: { id: string; nom: string };
  partie: { nom: string };
  preparation: {
    mode: ModePreparation;
    solvant: string | null;
    duree: string | null;
    temperature: string | null;
    description_libre: string | null;
    precautions_specifiques: string | null;
  };
  etudes: Etude[] | null;
  attestations:
    | {
        id: string;
        region: string | null;
        langue: string | null;
        niveau_divulgation: NiveauDivulgation;
        lignee_id: string;
        contributeur: { nom_affichage: string | null; preference_attribution: PreferenceAttribution } | null;
      }[]
    | null;
}

export async function getLaboratoireData(claimId: string): Promise<LaboratoireData | null> {
  const { data, error } = await supabaseServer
    .from("claim")
    .select(
      `id, qualite_preuve_scientifique, contre_indication_forte, divergence_note, est_pilote,
       taxon(id, slug, nom_scientifique, autorite, famille, precautions,
             noms_vernaculaires:nom_vernaculaire(libelle, langue, est_principal)),
       indication(id, nom),
       partie(nom),
       preparation(mode, solvant, duree, temperature, description_libre, precautions_specifiques),
       etudes:etude(id, claim_id, doi, titre, type, annee, resume, url),
       attestations:attestation(id, region, langue, niveau_divulgation, lignee_id, contributeur(nom_affichage, preference_attribution))`
    )
    .eq("id", claimId)
    .maybeSingle<RawRow>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: composesData, error: composesError } = await supabaseServer
    .from("compose")
    .select("*, cibles:cible(*)")
    .eq("taxon_id", data.taxon.id)
    .returns<Array<Compose & { cibles: Cible[] }>>();

  if (composesError) throw new Error(composesError.message);

  const attestations = data.attestations ?? [];
  const principal = data.taxon.noms_vernaculaires.find((n) => n.est_principal);
  const lignees = new Set(attestations.map((a) => a.lignee_id));
  const regions = new Set(attestations.map((a) => a.region).filter((r): r is string => !!r));
  const langues = new Set(attestations.map((a) => a.langue).filter((l): l is string => !!l));

  return {
    claimId: data.id,
    taxon: {
      id: data.taxon.id,
      slug: data.taxon.slug,
      nomScientifique: data.taxon.nom_scientifique,
      autorite: data.taxon.autorite,
      famille: data.taxon.famille,
    },
    nomPrincipal: principal?.libelle ?? data.taxon.nom_scientifique,
    autresNoms: data.taxon.noms_vernaculaires.filter((n) => !n.est_principal).map((n) => ({ libelle: n.libelle, langue: n.langue })),
    indication: data.indication,
    partie: data.partie,
    preparation: {
      mode: data.preparation.mode,
      solvant: data.preparation.solvant,
      duree: data.preparation.duree,
      temperature: data.preparation.temperature,
      descriptionLibre: data.preparation.description_libre,
      precautionsSpecifiques: data.preparation.precautions_specifiques,
    },
    precautions: data.taxon.precautions,
    contreIndicationForte: data.contre_indication_forte,
    divergenceNote: data.divergence_note,
    qualitePreuveScientifique: data.qualite_preuve_scientifique,
    estPilote: data.est_pilote,
    etudes: data.etudes ?? [],
    attestations: attestations.map((a) => ({
      id: a.id,
      region: a.region,
      langue: a.langue,
      niveauDivulgation: a.niveau_divulgation,
      contributeur: a.contributeur
        ? { nomAffichage: a.contributeur.nom_affichage, preferenceAttribution: a.contributeur.preference_attribution }
        : null,
    })),
    stats: {
      attestations_count: attestations.length,
      lignees_distinctes: lignees.size,
      regions_distinctes: regions.size,
      langues_distinctes: langues.size,
    },
    composes: composesData ?? [],
  };
}
