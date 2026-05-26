from fastapi import APIRouter, HTTPException
from app.models.schemas import RechercheRequest, RechercheResponse, OrientationItem, PlanteOut
from app.services.gemini_service import extraire_entites, MESSAGES_PROFIL, AVERTISSEMENT
from app.services.supabase_service import chercher_par_maladie, chercher_par_symptomes

router = APIRouter()


@router.post("/recherche", response_model=RechercheResponse)
async def recherche(req: RechercheRequest):
    if not req.texte or len(req.texte.strip()) < 3:
        raise HTTPException(status_code=400, detail="Texte trop court.")

    entites = await extraire_entites(req.texte)
    maladie_detectee = entites.get("maladie")
    symptomes_detectes = entites.get("symptomes", [])

    resultats_bruts = []
    if maladie_detectee:
        resultats_bruts = await chercher_par_maladie(maladie_detectee)

    if not resultats_bruts and symptomes_detectes:
        resultats_bruts = await chercher_par_symptomes(symptomes_detectes)

    orientations = []
    for r in resultats_bruts[:5]:
        plante_data = r.get("plantes")
        if not plante_data:
            continue

        orientations.append(OrientationItem(
            plante=PlanteOut(**plante_data),
            score_confiance=r.get("score_confiance", 0.0),
            nb_temoignages=r.get("nb_temoignages", 0),
            valide_moleculaire=r.get("valide_moleculaire", False),
            preparation=plante_data.get("mode_preparation"),
            precautions=plante_data.get("precautions")
        ))

    score_global = (
        sum(o.score_confiance for o in orientations) / len(orientations)
        if orientations else 0.0
    )

    return RechercheResponse(
        maladie_detectee=maladie_detectee,
        symptomes_detectes=symptomes_detectes,
        orientations=orientations,
        message_profil=MESSAGES_PROFIL.get(req.profil, MESSAGES_PROFIL["patient"]),
        avertissement=AVERTISSEMENT,
        score_global=round(score_global, 2)
    )
