"""
Weather data routes
"""

from fastapi import APIRouter, Depends, Query
from app.models.weather import WeatherResult
from app.dependencies import get_current_user
from app.services import weather_service

router = APIRouter()


@router.get("/weather", response_model=dict)
async def get_weather(
    city: str = Query(..., description="City name"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current weather data for a location
    """
    return {"message": "not implemented yet"}
