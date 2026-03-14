"""
Crop prediction Pydantic models
"""

from pydantic import BaseModel


class SoilInput(BaseModel):
    """Model for soil input data"""
    N: float
    P: float
    K: float
    pH: float
    temperature: float
    humidity: float
    rainfall: float


class CropResult(BaseModel):
    """Model for crop prediction result"""
    crop: str
    confidence: float
    recommendations: list[str] = []