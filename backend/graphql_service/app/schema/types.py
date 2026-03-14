import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class UserType:
    id: str
    name: str
    email: str
    state: Optional[str]
    acres: Optional[float]
    created_at: Optional[str]

@strawberry.type
class ScanType:
    id: str
    user_id: str
    recommended_crop: Optional[str]
    confidence: Optional[float]
    n: Optional[float]
    p: Optional[float]
    k: Optional[float]
    ph: Optional[float]
    temperature: Optional[float]
    humidity: Optional[float]
    rainfall: Optional[float]
    created_at: Optional[str]

@strawberry.type
class FertilizerLogType:
    id: str
    scan_id: str
    user_id: str
    nutrient: Optional[str]
    fertilizer_name: Optional[str]
    dosage: Optional[str]
    status: Optional[str]
    created_at: Optional[str]

@strawberry.type
class SchemeType:
    id: int
    name: str
    type: str
    description: str
    benefit: str
    link: Optional[str]