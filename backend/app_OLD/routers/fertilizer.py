"""
Fertilizer recommendation routes
"""

from fastapi import APIRouter, Depends
from app.models.fertilizer import FertilizerInput, FertilizerResult
from app.dependencies import get_current_user
from app.services import fertilizer_service

router = APIRouter()


@router.post("/fertilizer", response_model=dict)
async def recommend_fertilizer(
    fertilizer_data: FertilizerInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Recommend fertilizer based on soil and crop data
    """
    return {"message": "not implemented yet"}
