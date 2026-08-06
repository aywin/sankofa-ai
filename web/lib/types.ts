// Modèle "claim/attestation" (v4, voir LafiIabrief.md §10). Remplace le
// modèle plat plantes/maladies/usages/sources des versions précédentes.

export type GradeTier = "elevee" | "moderee" | "faible" | "tres_faible";
export type NiveauDivulgation = "declaratif" | "documente" | "complet";
export type StatutContributeur = "tradipraticien" | "chercheur" | "particulier" | "institution" | "corpus_initial";
export type PreferenceAttribution = "nommement" | "anonyme";
export type ModePreparation =
  | "decoction"
  | "infusion"
  | "maceration"
  | "poudre"
  | "cataplasme"
  | "application_directe"
  | "autre";
export type TypeEtude =
  | "preclinique_in_vitro"
  | "preclinique_animal"
  | "essai_clinique_humain"
  | "revue_systematique"
  | "revue_narrative"
  | "etude_experimentale_humaine"
  | "autre";

export interface Taxon {
  id: string;
  slug: string;
  nom_scientifique: string;
  autorite: string | null;
  famille: string | null;
  voucher_reference: string | null;
  herbier: string | null;
  description: string | null;
  precautions: string | null;
  habitat_region: string | null;
  photo_url: string | null;
}

export interface NomVernaculaire {
  id: string;
  taxon_id: string;
  libelle: string;
  langue: string;
  region: string | null;
  est_principal: boolean;
}

export interface TaxonMedia {
  id: string;
  taxon_id: string;
  partie_id: string | null;
  url: string;
  label: string;
}

export interface Partie {
  id: string;
  nom: string;
  description: string | null;
}

export interface Preparation {
  id: string;
  partie_id: string;
  mode: ModePreparation;
  solvant: string | null;
  duree: string | null;
  temperature: string | null;
  description_libre: string | null;
  precautions_specifiques: string | null;
}

export interface Indication {
  id: string;
  nom: string;
  categorie: string | null;
  symptomes: string | null;
  description: string | null;
}

export interface Claim {
  id: string;
  taxon_id: string;
  partie_id: string;
  preparation_id: string;
  indication_id: string;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  divergence_note: string | null;
  est_pilote: boolean;
}

export interface Lignee {
  id: string;
  nom: string;
  description: string | null;
  est_demo: boolean;
}

export interface Contributeur {
  id: string;
  nom_affichage: string | null;
  statut: StatutContributeur;
  lignee_id: string | null;
  preference_attribution: PreferenceAttribution;
}

export interface Attestation {
  id: string;
  claim_id: string;
  contributeur_id: string | null;
  lignee_id: string;
  region: string | null;
  langue: string | null;
  niveau_divulgation: NiveauDivulgation;
  consentement: boolean;
}

export interface Compose {
  id: string;
  taxon_id: string;
  nom: string;
  concentration: string | null;
  methode_identification: string | null;
}

export interface Cible {
  id: string;
  compose_id: string;
  proteine: string;
  affinite: string | null;
  source: string | null;
}

export interface Etude {
  id: string;
  claim_id: string;
  doi: string | null;
  titre: string;
  type: TypeEtude;
  annee: number | null;
  resume: string | null;
  url: string | null;
}

// Comptages bruts calculés en SQL (vue claim_attestation_stats) — le
// tiering (force d'attestation, statut de synthèse) vit en TypeScript,
// voir web/lib/synthese.ts.
export interface AttestationStats {
  attestations_count: number;
  lignees_distinctes: number;
  regions_distinctes: number;
  langues_distinctes: number;
}

// Sortie de la fonction RPC match_claims (recherche sémantique).
export interface MatchClaimResult extends AttestationStats {
  claim_id: string;
  taxon_id: string;
  taxon_slug: string;
  nom_principal: string;
  nom_scientifique: string;
  precautions: string | null;
  indication_nom: string;
  partie_nom: string;
  preparation_mode: string;
  preparation_resume: string | null;
  qualite_preuve_scientifique: GradeTier | null;
  contre_indication_forte: boolean;
  est_pilote: boolean;
  similarity: number;
}
