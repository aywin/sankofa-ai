from fastapi import APIRouter, HTTPException
from app.models.schemas import PlanteOut, PlanteDetailOut
from app.services.supabase_service import get_toutes_plantes, get_plante_detail
from typing import List

router = APIRouter()


@router.get("/plantes", response_model=List[PlanteOut])
async def liste_plantes():
    plantes = await get_toutes_plantes()
    return plantes


@router.get("/plantes/{plante_id}", response_model=PlanteDetailOut)
async def detail_plante(plante_id: str):
    plante = await get_plante_detail(plante_id)
    if not plante:
        raise HTTPException(status_code=404, detail="Plante non trouvée.")
    return plante
