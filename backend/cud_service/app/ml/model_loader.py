import os
import pickle
import logging
import numpy as np
import requests

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../../../models/crop_model.pkl")

MODEL_URLS = [
    "https://github.com/Gladiator07/Crop-Recommendation-System/raw/main/models/RF_model.pkl",
    "https://github.com/akshat-jn/crop-recommendation/raw/main/model/crop_recommendation_model.pkl",
    "https://github.com/dheerajdlalwani/crop-recommendation/raw/main/model/crop_model.pkl",
]

CROP_LABELS = [
    'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee',
    'cotton', 'grapes', 'jute', 'kidneybeans', 'lentil', 'maize',
    'mango', 'mothbeans', 'mungbean', 'muskmelon', 'orange', 'papaya',
    'pigeonpeas', 'pomegranate', 'rice', 'watermelon'
]

model = None
model_source = "none"

def download_model():
    global model, model_source
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    for url in MODEL_URLS:
        try:
            logger.info(f"Attempting model download from: {url}")
            response = requests.get(url, timeout=15)
            if response.status_code == 200 and len(response.content) > 10000:
                with open(MODEL_PATH, "wb") as f:
                    f.write(response.content)
                with open(MODEL_PATH, "rb") as f:
                    test_model = pickle.load(f)
                test_input = np.array([[90, 42, 43, 28, 82, 6.5, 202]])
                test_model.predict(test_input)
                model = test_model
                model_source = f"downloaded: {url}"
                logger.info(f"Model downloaded and verified successfully")
                return True
        except Exception as e:
            logger.warning(f"Download failed from {url}: {e}")
            if os.path.exists(MODEL_PATH):
                os.remove(MODEL_PATH)

    return False

def load_model():
    global model, model_source

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                loaded = pickle.load(f)
            test_input = np.array([[90, 42, 43, 28, 82, 6.5, 202]])
            loaded.predict(test_input)
            model = loaded
            model_source = "local cache"
            logger.info("Loaded crop model from local cache")
            return
        except Exception as e:
            logger.warning(f"Local model invalid: {e} — will try download")
            os.remove(MODEL_PATH)

    if download_model():
        return

    logger.info("All model downloads failed — using rule-based fallback")
    model = None
    model_source = "rule-based fallback"

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

def rule_based_predict(N, P, K, ph, temperature, humidity, rainfall):
    scores = []
    for rule in CROP_RULES:
        score = 0
        if rule["N"][0]        <= N           <= rule["N"][1]:        score += 1
        if rule["P"][0]        <= P           <= rule["P"][1]:        score += 1
        if rule["K"][0]        <= K           <= rule["K"][1]:        score += 1
        if rule["ph"][0]       <= ph          <= rule["ph"][1]:       score += 1
        if rule["temp"][0]     <= temperature <= rule["temp"][1]:     score += 1
        if rule["humidity"][0] <= humidity    <= rule["humidity"][1]: score += 1
        if rule["rainfall"][0] <= rainfall    <= rule["rainfall"][1]: score += 1
        scores.append((rule["crop"], round(score / 7, 4)))

    if not scores:
        return "rice", 0.5, "rule-based"

    scores.sort(key=lambda x: x[1], reverse=True)
    best_crop, best_score = scores[0]

    if not best_crop or str(best_crop) == "nan":
        return "rice", 0.5, "rule-based"

    return best_crop, best_score, "rule-based"

def predict(N: float, P: float, K: float, ph: float,
            temperature: float, humidity: float, rainfall: float):
    global model, model_source

    if model is not None:
        try:
            features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
            crop = str(model.predict(features)[0])
            proba = model.predict_proba(features)[0]
            confidence = round(float(max(proba)), 4)

            if crop == "nan" or confidence != confidence:
                raise ValueError(f"Model returned invalid values: crop={crop}")

            logger.info(f"ML model predicted: {crop} confidence={confidence} source={model_source}")
            return crop, confidence, "ml-model"

        except Exception as e:
            logger.warning(f"ML prediction failed: {e} — falling back to rules")

    crop, score, source = rule_based_predict(N, P, K, ph, temperature, humidity, rainfall)
    logger.info(f"Rule-based predicted: {crop} score={score}")
    return crop, score, source

load_model()
logger.info(f"Model loader ready — source: {model_source}")
