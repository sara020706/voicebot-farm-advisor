"""
Fertilizer recommendation routes
"""

from fastapi import APIRouter, Depends, Request
from app.models.fertilizer import FertilizerInput, FertilizerResult
from app.dependencies import get_current_user
from app.services import fertilizer_service

router = APIRouter()


@router.post("/fertilizer", response_model=dict)
async def recommend_fertilizer(
    fertilizer_data: FertilizerInput,
    request: Request
):
    """
    Recommend fertilizer based on soil and crop data
    """
    user_id = request.state.user_id
    result = fertilizer_service.recommend_fertilizer(fertilizer_data, user_id)
    return result