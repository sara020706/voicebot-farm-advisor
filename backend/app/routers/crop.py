"""
Crop prediction routes
"""

from fastapi import APIRouter, Depends
from app.models.crop import SoilInput, CropResult
from app.dependencies import get_current_user
from app.services import crop_service

router = APIRouter()


@router.post("/predict", response_model=dict)
async def predict_crop(soil_data: SoilInput, current_user: dict = Depends(get_current_user)):
    """
    Predict best crop based on soil parameters
    """
    return {"message": "not implemented yet"}
