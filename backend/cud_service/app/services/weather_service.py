"""
Weather service - business logic for OpenWeatherMap API calls
"""

import requests
from app.models.weather import WeatherResult
import os
from dotenv import load_dotenv

load_dotenv()


def get_weather_data(location: str) -> WeatherResult:
    """
    Fetch weather data from OpenWeatherMap API
    """
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        # Return mock data if no API key
        return WeatherResult(
            location=location,
            temperature=25.0,
            humidity=65.0,
            description="Clear sky",
            wind_speed=5.2,
            pressure=1013.25,
            icon="01d"
        )
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": location,
            "appid": api_key,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return parse_weather_response(data)
        
    except Exception as e:
        # Return mock data on error
        return WeatherResult(
            location=location,
            temperature=25.0,
            humidity=65.0,
            description="Weather data unavailable",
            wind_speed=0.0,
            pressure=1013.25,
            icon="01d"
        )


def parse_weather_response(response: dict) -> WeatherResult:
    """
    Parse OpenWeatherMap API response into WeatherResult model
    """
    main = response.get("main", {})
    weather = response.get("weather", [{}])[0]
    wind = response.get("wind", {})
    
    return WeatherResult(
        location=response.get("name", "Unknown"),
        temperature=main.get("temp", 0.0),
        humidity=main.get("humidity", 0.0),
        description=weather.get("description", "No description"),
        wind_speed=wind.get("speed", 0.0),
        pressure=main.get("pressure", 0.0),
        icon=weather.get("icon", "01d")
    )