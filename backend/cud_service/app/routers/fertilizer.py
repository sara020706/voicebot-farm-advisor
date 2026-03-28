"""
Fertilizer recommendation routes
"""

from fastapi import APIRouter, Request, HTTPException
from app.models.fertilizer import FertilizerInput
from app.services.fertilizer_service import recommend_fertilizer
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/fertilizer")
async def fertilizer_endpoint(data: FertilizerInput, request: Request):
    user_id = getattr(request.state, "user_id", None)
    logger.info(f"POST /api/fertilizer — user_id={user_id} crop={data.crop}")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    try:
        result = recommend_fertilizer(
            data=data,
            user_id=user_id,
            scan_id=getattr(data, "scan_id", None)
        )
        return result
    except Exception as e:
        logger.error(f"Fertilizer endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
