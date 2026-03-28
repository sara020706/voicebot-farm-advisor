"""
Weather data routes
"""

from fastapi import APIRouter, Request, HTTPException, Query
from app.services.weather_service import get_weather
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/weather")
async def weather_endpoint(city: str = Query(..., description="City name"), request: Request = None):
    user_id = getattr(request.state, "user_id", None)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not city:
        raise HTTPException(status_code=400, detail="City parameter is required")
    
    logger.info(f"GET /api/weather — user_id={user_id} city={city}")
    
    try:
        result = get_weather(city)
        return result
    except Exception as e:
        logger.error(f"Weather endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
