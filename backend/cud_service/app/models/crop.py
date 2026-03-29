from pydantic import BaseModel


class SoilInput(BaseModel):
    N:           float
    P:           float
    K:           float
    pH:          float
    temperature: float
    humidity:    float
    rainfall:    float


class CropResult(BaseModel):
    crop:       str
    confidence: float
    source:     str
