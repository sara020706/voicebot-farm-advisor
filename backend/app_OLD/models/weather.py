"""
Weather data Pydantic models
"""

from pydantic import BaseModel


class WeatherResult(BaseModel):
    """Model for weather data result"""
    location: str
    temperature: float
    humidity: float
    description: str
    wind_speed: float
    pressure: float
    icon: str
