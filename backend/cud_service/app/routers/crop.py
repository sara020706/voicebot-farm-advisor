"""
Crop prediction routes
"""

from fastapi import APIRouter, Depends, Request
from app.models.crop import SoilInput, CropResult
from app.dependencies import get_current_user
from app.services import crop_service

router = APIRouter()


@router.post("/predict", response_model=dict)
async def predict_crop(soil_data: SoilInput, request: Request):
    """
    Predict best crop based on soil parameters
    """
    user_id = request.state.user_id
    result = crop_service.predict_crop(soil_data, user_id)
    return result