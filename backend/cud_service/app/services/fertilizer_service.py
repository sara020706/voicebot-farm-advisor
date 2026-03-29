import sys, os, json, logging
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.database import supabase

logger = logging.getLogger(__name__)

NUTRIENTS_PATH = os.path.join(
    os.path.dirname(__file__), "../../../../data/crop_nutrients.json"
)

def load_crop_nutrients():
    try:
        with open(NUTRIENTS_PATH) as f:
            data = json.load(f)
        logger.info(f"Loaded crop nutrients for {len(data)} crops from {NUTRIENTS_PATH}")
        return data
    except Exception as e:
        logger.error(f"Failed to load crop_nutrients.json: {e}")
        return {"default": {"N": 80, "P": 40, "K": 40}}

CROP_NUTRIENTS = load_crop_nutrients()

FERTILIZER_MAP = {
    "N": {
        "name": "Urea",
        "very_deficient_dose": "80 kg/acre",
        "deficient_dose":      "50 kg/acre",
        "sufficient_dose":     "none needed",
    },
    "P": {
        "name": "DAP (Di-Ammonium Phosphate)",
        "very_deficient_dose": "50 kg/acre",
        "deficient_dose":      "25 kg/acre",
        "sufficient_dose":     "none needed",
    },
    "K": {
        "name": "MOP (Muriate of Potash)",
        "very_deficient_dose": "40 kg/acre",
        "deficient_dose":      "20 kg/acre",
        "sufficient_dose":     "none needed",
    },
}

def recommend_fertilizer(data, user_id: str, scan_id: str = None) -> dict:
    logger.info(f"recommend_fertilizer — crop={data.crop} N={data.N} P={data.P} K={data.K}")

    crop_key = data.crop.lower().strip()
    ideal = CROP_NUTRIENTS.get(crop_key, CROP_NUTRIENTS.get("default", {"N": 80, "P": 40, "K": 40}))

    logger.info(f"Using ICAR ideals for '{crop_key}': N={ideal['N']} P={ideal['P']} K={ideal['K']}")

    deficiencies = []

    for nutrient in ["N", "P", "K"]:
        actual = float(getattr(data, nutrient))
        target = float(ideal[nutrient])
        fert   = FERTILIZER_MAP[nutrient]

        if actual < target * 0.5:
            status = "very deficient"
            dosage = fert["very_deficient_dose"]
        elif actual < target:
            status = "deficient"
            dosage = fert["deficient_dose"]
        else:
            status = "sufficient"
            dosage = fert["sufficient_dose"]

        deficiencies.append({
            "nutrient":     nutrient,
            "fertilizer":   fert["name"],
            "dosage":       dosage,
            "status":       status,
            "actual_value": actual,
            "ideal_value":  target,
            "source":       ideal.get("source", "ICAR"),
        })

        logger.info(f"  {nutrient}: actual={actual} ideal={target} status={status}")

    try:
        for d in deficiencies:
            supabase.table("fertilizer_logs").insert({
                "user_id":         str(user_id),
                "scan_id":         str(scan_id) if scan_id else None,
                "nutrient":        d["nutrient"],
                "fertilizer_name": d["fertilizer"],
                "dosage":          d["dosage"],
                "status":          d["status"],
            }).execute()
        logger.info(f"Saved {len(deficiencies)} fertilizer logs to Supabase")
    except Exception as e:
        logger.error(f"Failed to save fertilizer logs: {e}")

    return {"deficiencies": deficiencies}
