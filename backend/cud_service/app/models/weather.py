"""
Weather data Pydantic models
"""

from pydantic import BaseModel


class WeatherResult(BaseModel):
    """Model for weather data result"""
    city: str
    temperature: float
    humidity: float
    rainfall: float
    description: str
