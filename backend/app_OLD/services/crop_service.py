"""
Crop prediction service - business logic for ML predictions
"""

from app.models.crop import SoilInput, CropResult
from app.ml.model_loader import load_model, predict


def predict_crop(soil_data: SoilInput) -> CropResult:
    """
    Predict the best crop based on soil parameters
    """
    raise NotImplementedError("coming soon")


def get_crop_recommendations(crop: str) -> list[str]:
    """
    Get recommendations for a specific crop
    """
    raise NotImplementedError("coming soon")
