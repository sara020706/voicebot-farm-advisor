"""
Fertilizer recommendation service - business logic for fertilizer rules
"""

from app.models.fertilizer import FertilizerInput, FertilizerResult
import sys, os
# Add the backend root to Python path to access shared modules
backend_root = os.path.join(os.path.dirname(__file__), '../../..')
sys.path.insert(0, backend_root)
from shared.database import supabase


def recommend_fertilizer(fertilizer_data: FertilizerInput, user_id: str) -> dict:
    """
    Recommend fertilizer based on soil and crop data and save to database
    """
    # Simple rule-based fertilizer recommendation
    n_deficit = max(0, 40 - fertilizer_data.N)
    p_deficit = max(0, 30 - fertilizer_data.P)
    k_deficit = max(0, 35 - fertilizer_data.K)
    
    # Determine primary nutrient needed
    if n_deficit > p_deficit and n_deficit > k_deficit:
        fertilizer = "Urea"
        nutrient = "Nitrogen"
        amount = f"{n_deficit * 2.5:.1f} kg/acre"
    elif p_deficit > k_deficit:
        fertilizer = "DAP (Diammonium Phosphate)"
        nutrient = "Phosphorus"
        amount = f"{p_deficit * 3:.1f} kg/acre"
    else:
        fertilizer = "Muriate of Potash"
        nutrient = "Potassium"
        amount = f"{k_deficit * 2:.1f} kg/acre"
    
    # Save fertilizer log to database
    log_data = {
        "user_id": user_id,
        "nutrient": nutrient,
        "fertilizer_name": fertilizer,
        "dosage": amount,
        "status": "recommended"
    }
    
    result = supabase.table("fertilizer_logs").insert(log_data).execute()
    
    return {
        "log_id": result.data[0]["id"] if result.data else None,
        "fertilizer": fertilizer,
        "amount": amount,
        "application_method": "Broadcast and incorporate into soil",
        "recommendations": [
            f"Apply {amount} of {fertilizer}",
            "Apply during soil preparation",
            "Water immediately after application"
        ]
    }


def calculate_fertilizer_amount(soil_type: str, crop_type: str, npk_values: dict) -> str:
    """
    Calculate recommended fertilizer amount
    """
    # Placeholder calculation
    base_amount = 50  # kg/acre
    
    # Adjust based on soil type
    soil_multiplier = {"clay": 1.2, "loam": 1.0, "sandy": 0.8}.get(soil_type.lower(), 1.0)
    
    # Adjust based on crop
    crop_multiplier = {"rice": 1.1, "wheat": 1.0, "cotton": 1.3}.get(crop_type.lower(), 1.0)
    
    final_amount = base_amount * soil_multiplier * crop_multiplier
    
    return f"{final_amount:.1f} kg/acre"


def get_application_method(fertilizer_type: str) -> str:
    """
    Get recommended application method for fertilizer
    """
    methods = {
        "urea": "Broadcast and incorporate into soil before planting",
        "dap": "Apply during soil preparation and mix well",
        "muriate of potash": "Broadcast evenly and water immediately",
        "compost": "Mix with soil during land preparation"
    }
    
    return methods.get(fertilizer_type.lower(), "Follow manufacturer's instructions")