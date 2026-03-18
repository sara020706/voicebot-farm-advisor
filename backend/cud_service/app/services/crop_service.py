"""
Crop prediction service - business logic for ML predictions
"""

import sys, os, logging
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.database import supabase
from app.ml.model_loader import predict

logger = logging.getLogger(__name__)

def predict_crop(soil_data, user_id: str) -> dict:
    logger.info(f"predict_crop called — user_id={user_id}")

    if not user_id:
        raise ValueError("user_id is missing — JWT middleware may not be setting request.state.user_id")

    crop, confidence = predict(
        N=soil_data.N,
        P=soil_data.P,
        K=soil_data.K,
        ph=soil_data.pH,
        temperature=soil_data.temperature,
        humidity=soil_data.humidity,
        rainfall=soil_data.rainfall
    )

    logger.info(f"Prediction result — crop={crop} confidence={confidence}")

    if not crop or str(crop) == "nan":
        raise ValueError(f"Invalid prediction result: crop={crop}")

    insert_data = {
        "user_id": str(user_id),
        "n": float(soil_data.N),
        "p": float(soil_data.P),
        "k": float(soil_data.K),
        "ph": float(soil_data.pH),
        "temperature": float(soil_data.temperature),
        "humidity": float(soil_data.humidity),
        "rainfall": float(soil_data.rainfall),
        "recommended_crop": str(crop),
        "confidence": float(confidence)
    }

    logger.info(f"Inserting to Supabase: {insert_data}")

    try:
        result = supabase.table("scans").insert(insert_data).execute()
        logger.info(f"Supabase insert result: {result.data}")
        if not result.data:
            logger.error("Supabase insert returned empty data — check RLS policies")
    except Exception as e:
        logger.error(f"Supabase insert FAILED: {e}")
        raise Exception(f"Failed to save scan to database: {str(e)}")

    return {
        "crop": str(crop),
        "confidence": round(float(confidence) * 100, 1)
    }