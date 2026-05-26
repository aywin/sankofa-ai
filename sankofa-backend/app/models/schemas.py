from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class RechercheRequest(BaseModel):
    texte: str
    profil: Optional[str] = "patient"  # patient | tradipraticien | chercheur


class MoleculeOut(BaseModel):
    id: UUID
    nom: str
    formule_chimique: Optional[str]
    mecanisme_action: Optional[str]
    proprietes: Optional[List[str]]
    source_base: Optional[str]


class PlanteOut(BaseModel):
    id: UUID
    nom_local: str
    noms_locaux: Optional[list]
    nom_scientifique: str
    famille: Optional[str]
    region_burkina: Optional[List[str]]
    description: Optional[str]
    mode_preparation: Optional[str]
    precautions: Optional[str]
    score_confiance: Optional[float]


class PlanteDetailOut(PlanteOut):
    molecules: List[MoleculeOut] = []


class OrientationItem(BaseModel):
    plante: PlanteOut
    score_confiance: float
    nb_temoignages: int
    valide_moleculaire: bool
    preparation: Optional[str]
    precautions: Optional[str]


class RechercheResponse(BaseModel):
    maladie_detectee: Optional[str]
    symptomes_detectes: List[str]
    orientations: List[OrientationItem]
    message_profil: str
    avertissement: str
    score_global: float


class MaladieOut(BaseModel):
    id: UUID
    nom: str
    categorie: Optional[str]
    symptomes: Optional[List[str]]
    description: Optional[str]
