"""
Crop prediction service - business logic for ML predictions
"""

from app.models.crop import SoilInput, CropResult
import sys, os
# Add the backend root to Python path to access shared modules
backend_root = os.path.join(os.path.dirname(__file__), '../../..')
sys.path.insert(0, backend_root)
from shared.database import supabase


def predict_crop(soil_data: SoilInput, user_id: str) -> dict:
    """
    Predict the best crop based on soil parameters and save to database
    """
    # For now, return a placeholder response
    # TODO: Implement actual ML prediction
    
    # Save scan to database
    scan_data = {
        "user_id": user_id,
        "n": soil_data.N,
        "p": soil_data.P,
        "k": soil_data.K,
        "ph": soil_data.pH,
        "temperature": soil_data.temperature,
        "humidity": soil_data.humidity,
        "rainfall": soil_data.rainfall,
        "recommended_crop": "rice",  # placeholder
        "confidence": 0.85  # placeholder
    }
    
    result = supabase.table("scans").insert(scan_data).execute()
    
    return {
        "scan_id": result.data[0]["id"] if result.data else None,
        "crop": "rice",
        "confidence": 0.85,
        "recommendations": ["Plant during monsoon season", "Ensure proper drainage"]
    }


def get_crop_recommendations(crop: str) -> list[str]:
    """
    Get recommendations for a specific crop
    """
    # Placeholder recommendations
    recommendations = {
        "rice": ["Plant during monsoon season", "Ensure proper drainage", "Use organic fertilizers"],
        "wheat": ["Plant in winter season", "Ensure good soil preparation", "Monitor for pests"],
        "cotton": ["Requires warm climate", "Deep plowing recommended", "Regular irrigation needed"]
    }
    
    return recommendations.get(crop.lower(), ["General farming practices recommended"])