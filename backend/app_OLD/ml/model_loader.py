"""
ML model loader - loads crop_model.pkl and exposes predict function
"""

import pickle
import os
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "crop_model.pkl"
_model = None


def load_model():
    """
    Load the crop prediction model from disk
    """
    global _model
    if _model is None and MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model


def predict(features: list) -> str:
    """
    Make a prediction using the loaded model
    
    Args:
        features: List of feature values [N, P, K, temperature, humidity, pH, rainfall]
    
    Returns:
        Predicted crop name
    """
    model = load_model()
    if model is None:
        raise FileNotFoundError("Model file not found. Train and save model first.")
    
    prediction = model.predict([features])
    return prediction[0]


def is_model_available() -> bool:
    """
    Check if model file exists
    """
    return MODEL_PATH.exists()
