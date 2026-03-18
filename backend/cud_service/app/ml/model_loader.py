import os
import pickle
import logging
import numpy as np

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "../../../../models/crop_model.pkl"
)

model = None

CROP_RULES = [
    {"crop": "rice",        "N": (60,140), "P": (30,60),  "K": (30,60),  "ph": (5.0,7.0), "temp": (20,38), "humidity": (60,95), "rainfall": (150,300)},
    {"crop": "wheat",       "N": (60,120), "P": (40,80),  "K": (30,60),  "ph": (6.0,7.5), "temp": (10,25), "humidity": (40,75), "rainfall": (50,150)},
    {"crop": "maize",       "N": (60,120), "P": (30,60),  "K": (15,40),  "ph": (5.5,7.5), "temp": (18,35), "humidity": (50,80), "rainfall": (50,150)},
    {"crop": "cotton",      "N": (60,120), "P": (30,70),  "K": (15,40),  "ph": (6.0,8.0), "temp": (21,35), "humidity": (50,85), "rainfall": (60,200)},
    {"crop": "sugarcane",   "N": (60,120), "P": (20,60),  "K": (15,40),  "ph": (6.0,7.5), "temp": (20,38), "humidity": (50,85), "rainfall": (100,250)},
    {"crop": "mungbean",    "N": (15,40),  "P": (30,70),  "K": (15,40),  "ph": (6.0,7.5), "temp": (25,35), "humidity": (60,90), "rainfall": (60,150)},
    {"crop": "blackgram",   "N": (15,40),  "P": (30,70),  "K": (15,40),  "ph": (6.0,7.5), "temp": (25,35), "humidity": (60,90), "rainfall": (60,150)},
    {"crop": "lentil",      "N": (15,40),  "P": (30,70),  "K": (15,40),  "ph": (6.0,7.5), "temp": (15,28), "humidity": (50,80), "rainfall": (40,120)},
    {"crop": "pomegranate", "N": (15,45),  "P": (10,40),  "K": (10,40),  "ph": (5.5,7.5), "temp": (18,38), "humidity": (40,75), "rainfall": (50,150)},
    {"crop": "banana",      "N": (80,140), "P": (50,100), "K": (40,100), "ph": (5.5,7.0), "temp": (20,35), "humidity": (60,90), "rainfall": (100,300)},
    {"crop": "mango",       "N": (15,45),  "P": (10,40),  "K": (10,40),  "ph": (5.5,7.5), "temp": (24,38), "humidity": (40,75), "rainfall": (50,150)},
    {"crop": "grapes",      "N": (15,45),  "P": (10,40),  "K": (10,40),  "ph": (5.5,7.0), "temp": (18,35), "humidity": (50,80), "rainfall": (50,150)},
    {"crop": "watermelon",  "N": (60,120), "P": (30,70),  "K": (40,80),  "ph": (6.0,7.5), "temp": (22,38), "humidity": (50,80), "rainfall": (40,100)},
    {"crop": "muskmelon",   "N": (60,120), "P": (30,70),  "K": (40,80),  "ph": (6.0,7.5), "temp": (25,38), "humidity": (50,80), "rainfall": (30,80)},
    {"crop": "apple",       "N": (15,45),  "P": (10,40),  "K": (10,40),  "ph": (5.5,6.5), "temp": (8,25),  "humidity": (50,80), "rainfall": (100,200)},
    {"crop": "orange",      "N": (15,45),  "P": (10,40),  "K": (10,40),  "ph": (6.0,7.5), "temp": (15,35), "humidity": (50,80), "rainfall": (75,200)},
    {"crop": "papaya",      "N": (40,80),  "P": (10,40),  "K": (40,80),  "ph": (6.0,7.5), "temp": (22,35), "humidity": (60,90), "rainfall": (100,200)},
    {"crop": "coconut",     "N": (15,45),  "P": (10,40),  "K": (40,80),  "ph": (5.0,8.0), "temp": (22,38), "humidity": (60,95), "rainfall": (100,300)},
    {"crop": "jute",        "N": (60,120), "P": (30,60),  "K": (30,60),  "ph": (6.0,7.5), "temp": (22,38), "humidity": (60,90), "rainfall": (150,250)},
    {"crop": "coffee",      "N": (60,120), "P": (30,60),  "K": (15,40),  "ph": (6.0,6.5), "temp": (15,28), "humidity": (60,90), "rainfall": (100,250)},
    {"crop": "chickpea",    "N": (15,40),  "P": (30,70),  "K": (15,40),  "ph": (6.0,7.5), "temp": (15,30), "humidity": (40,75), "rainfall": (60,150)},
    {"crop": "kidneybeans", "N": (15,40),  "P": (30,70),  "K": (15,40),  "ph": (6.0,7.5), "temp": (15,30), "humidity": (50,80), "rainfall": (80,150)},
]

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            logger.info("Loaded crop model from local pkl")
            return
        except Exception as e:
            logger.warning(f"Failed to load local model: {e}")
    logger.info("Using rule-based crop prediction fallback")
    model = None

def rule_based_predict(N, P, K, ph, temperature, humidity, rainfall):
    scores = []
    for rule in CROP_RULES:
        score = 0
        if rule["N"][0] <= N <= rule["N"][1]: score += 1
        if rule["P"][0] <= P <= rule["P"][1]: score += 1
        if rule["K"][0] <= K <= rule["K"][1]: score += 1
        if rule["ph"][0] <= ph <= rule["ph"][1]: score += 1
        if rule["temp"][0] <= temperature <= rule["temp"][1]: score += 1
        if rule["humidity"][0] <= humidity <= rule["humidity"][1]: score += 1
        if rule["rainfall"][0] <= rainfall <= rule["rainfall"][1]: score += 1
        scores.append((rule["crop"], round(score / 7, 2)))

    if not scores:
        return "rice", 0.5

    scores.sort(key=lambda x: x[1], reverse=True)
    best_crop, best_score = scores[0]

    # Never return nan — hard guard
    if not best_crop or best_crop != best_crop:
        return "rice", 0.5

    return best_crop, best_score

def predict(N: float, P: float, K: float, ph: float,
            temperature: float, humidity: float, rainfall: float):
    if model is not None:
        try:
            features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
            crop = model.predict(features)[0]
            proba = model.predict_proba(features)[0]
            confidence = round(float(max(proba)), 2)
            if str(crop) == "nan" or confidence != confidence:
                raise ValueError("Model returned nan")
            return str(crop), confidence
        except Exception as e:
            logger.warning(f"Model prediction failed: {e}, using fallback")

    return rule_based_predict(N, P, K, ph, temperature, humidity, rainfall)

load_model()