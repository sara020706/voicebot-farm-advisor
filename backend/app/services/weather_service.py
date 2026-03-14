"""
Weather service - business logic for OpenWeatherMap API calls
"""

import requests
from app.config import get_settings
from app.models.weather import WeatherResult


def get_weather_data(location: str) -> WeatherResult:
    """
    Fetch weather data from OpenWeatherMap API
    """
    raise NotImplementedError("coming soon")


def parse_weather_response(response: dict) -> WeatherResult:
    """
    Parse OpenWeatherMap API response into WeatherResult model
    """
    raise NotImplementedError("coming soon")
