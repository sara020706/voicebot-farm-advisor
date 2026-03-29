import os
import requests
from typing import Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

AGRICULTURE_SYSTEM_PROMPT = """You are an agricultural expert assistant helping farmers.

CRITICAL FORMATTING RULES - follow exactly:
- Never use markdown formatting: no **, no *, no #, no bullet points, no numbered lists
- Never use special characters: no →, no •, no ◆, no ►
- Never use emoji
- Write in plain conversational sentences only
- When listing things use "first... second... third..." not bullet points
- Respond in the same language the farmer is using
- Use simple vocabulary a farmer would understand

Provide detailed, practical farming advice on: crop selection, pest control, fertilizer usage, 
irrigation advice, seasonal recommendations, and soil health."""

def ask_gemini(question: str, max_tokens: int = 5000) -> str:
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key not configured. Please set GEMINI_API_KEY in .env file")
    
    try:
        full_prompt = f"{AGRICULTURE_SYSTEM_PROMPT}\n\nQuestion: {question}\n\nAnswer:"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": full_prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": max_tokens,
                "topP": 0.8,
                "topK": 40
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"Gemini API returned status {response.status_code}")
        
        data = response.json()
        
        if "candidates" not in data or len(data["candidates"]) == 0:
            raise Exception("Gemini returned no response")
        
        answer = data["candidates"][0]["content"]["parts"][0]["text"]
        
        return answer.strip()
        
    except requests.exceptions.Timeout:
        raise Exception("Gemini API is taking too long. Please try again.")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to connect to Gemini API: {str(e)}")
    except Exception as e:
        raise
