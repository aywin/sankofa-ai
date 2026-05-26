from fastapi import APIRouter
from app.models.schemas import MaladieOut
from app.services.supabase_service import get_toutes_maladies
from typing import List

router = APIRouter()


@router.get("/maladies", response_model=List[MaladieOut])
async def liste_maladies():
    return await get_toutes_maladies()
