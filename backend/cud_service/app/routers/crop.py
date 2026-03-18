"""
Crop prediction routes
"""

from fastapi import APIRouter, Request, HTTPException
from app.models.crop import SoilInput
from app.services.crop_service import predict_crop
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/predict")
async def predict_crop_endpoint(soil_data: SoilInput, request: Request):
    user_id = getattr(request.state, "user_id", None)

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        result = predict_crop(soil_data, user_id)
        return result
    except ValueError as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
