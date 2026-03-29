"""
Weather service - business logic for weather data
"""

import requests
import os
import logging

logger = logging.getLogger(__name__)

MOCK_WEATHER = {
    "city": "Demo City",
    "temperature": 28.0,
    "humidity": 72.0,
    "rainfall": 5.2,
    "description": "Partly cloudy"
}

def get_weather(city: str) -> dict:
    api_key = os.getenv("WEATHER_API_KEY", "")
    if not api_key:
        logger.info("No WEATHER_API_KEY set — returning mock weather")
        return {**MOCK_WEATHER, "city": city}
    
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": api_key, "units": "metric"}
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code != 200:
            logger.warning(f"OWM returned {response.status_code} — using mock")
            return {**MOCK_WEATHER, "city": city}
        
        data = response.json()
        return {
            "city":        data["name"],
            "temperature": round(data["main"]["temp"], 1),
            "humidity":    round(data["main"]["humidity"], 1),
            "rainfall":    round(data.get("rain", {}).get("1h", 0.0), 1),
            "description": data["weather"][0]["description"].capitalize()
        }
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return {**MOCK_WEATHER, "city": city}
