"""
Weather data routes
"""

from fastapi import APIRouter, Depends, Query, Request
from app.models.weather import WeatherResult
from app.dependencies import get_current_user
from app.services import weather_service

router = APIRouter()


@router.get("/weather", response_model=dict)
async def get_weather(
    city: str = Query(..., description="City name"),
    request: Request = None
):
    """
    Get current weather data for a location
    """
    result = weather_service.get_weather_data(city)
    return {
        "location": result.location,
        "temperature": result.temperature,
        "humidity": result.humidity,
        "description": result.description,
        "wind_speed": result.wind_speed,
        "pressure": result.pressure,
        "icon": result.icon
    }