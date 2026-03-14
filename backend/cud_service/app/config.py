"""
Configuration settings loaded from environment variables
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    supabase_url: str = ""
    supabase_service_key: str = ""
    secret_key: str = "dev-secret"
    weather_api_key: str = ""
    access_token_expire_minutes: int = 10080
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()