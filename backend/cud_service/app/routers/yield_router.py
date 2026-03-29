from fastapi import APIRouter, Request, HTTPException
import os, json

router = APIRouter()

YIELD_PATH = os.path.join(os.path.dirname(__file__), "../../../data/yield_data.json")

@router.get("/yield")
async def get_yield(crop: str, request: Request):
    if not crop:
        raise HTTPException(status_code=400, detail="crop parameter required")
    try:
        crop_key = crop.lower().strip()
        
        with open(YIELD_PATH) as f:
            data = json.load(f)
        
        if crop_key in data:
            result = data[crop_key]
        else:
            result = {"min": 5, "avg": 10, "max": 20, "unit": "quintals/acre"}
        
        return {"crop": crop_key, **result}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Yield data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid yield data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
