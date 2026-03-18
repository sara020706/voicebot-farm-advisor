"""
Fertilizer recommendation routes
"""

from fastapi import APIRouter, Request, HTTPException
from app.models.fertilizer import FertilizerInput, FertilizerResult
from app.services import fertilizer_service

router = APIRouter()


@router.post("/fertilizer", response_model=dict)
async def recommend_fertilizer(fertilizer_data: FertilizerInput, request: Request):
    """Recommend fertilizer based on soil and crop data"""
    user_id = getattr(request.state, "user_id", None)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = fertilizer_service.recommend_fertilizer(fertilizer_data, user_id)
    return result
