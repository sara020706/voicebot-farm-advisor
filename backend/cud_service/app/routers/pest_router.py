from fastapi import APIRouter, Request, HTTPException
import os, json

router = APIRouter()

PEST_PATH = os.path.join(os.path.dirname(__file__), "../../../data/pest_data.json")

@router.get("/pests")
async def get_pests(crop: str, request: Request):
    if not crop:
        raise HTTPException(status_code=400, detail="crop parameter required")
    try:
        crop_key = crop.lower().strip()
        
        with open(PEST_PATH) as f:
            data = json.load(f)
        
        if crop_key in data:
            pests = data[crop_key]
        else:
            pests = data.get("default", [])
        
        return {"crop": crop_key, "pests": pests}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Pest data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid pest data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
