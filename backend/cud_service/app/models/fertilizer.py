"""
Fertilizer recommendation Pydantic models
"""

from pydantic import BaseModel


class FertilizerInput(BaseModel):
    """Model for fertilizer input data"""
    N: float
    P: float
    K: float
    crop: str


class FertilizerResult(BaseModel):
    """Model for fertilizer recommendation result"""
    fertilizer: str
    amount: str
    application_method: str
    recommendations: list[str] = []