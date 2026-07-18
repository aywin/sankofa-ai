export type NiveauDePreuve = "traditionnel" | "scientifique" | "les_deux";

export interface Maladie {
  id: string;
  nom: string;
  symptomes: string;
  description: string | null;
}

export interface Plante {
  id: string;
  nom_local: string;
  nom_scientifique: string | null;
  description: string | null;
  precautions: string | null;
}

export interface Usage {
  id: string;
  plante_id: string;
  maladie_id: string;
  preparation: string;
  posologie: string | null;
  niveau_de_preuve: NiveauDePreuve;
}

export interface MatchUsageResult {
  usage_id: string;
  plante_nom: string;
  plante_precautions: string | null;
  maladie_nom: string;
  preparation: string;
  posologie: string | null;
  niveau_de_preuve: NiveauDePreuve;
  similarity: number;
}
