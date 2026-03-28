"""
Fertilizer recommendation Pydantic models
"""

from pydantic import BaseModel
from typing import Optional, List


class FertilizerInput(BaseModel):
    """Model for fertilizer input data"""
    N: float
    P: float
    K: float
    crop: str
    scan_id: Optional[str] = None


class DeficiencyItem(BaseModel):
    """Model for individual nutrient deficiency"""
    nutrient: str
    fertilizer: str
    dosage: str
    status: str
    actual_value: float
    ideal_value: float


class FertilizerResult(BaseModel):
    """Model for fertilizer recommendation result"""
    deficiencies: List[DeficiencyItem]
