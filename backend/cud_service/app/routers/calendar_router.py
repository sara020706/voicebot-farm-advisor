from fastapi import APIRouter, Request, HTTPException
import os, json
from datetime import datetime

router = APIRouter()

CALENDAR_PATH = os.path.join(os.path.dirname(__file__), "../../../data/calendar_data.json")

@router.get("/calendar")
async def get_calendar(crop: str, request: Request):
    if not crop:
        raise HTTPException(status_code=400, detail="crop parameter required")
    try:
        crop_key = crop.lower().strip()
        
        with open(CALENDAR_PATH) as f:
            data = json.load(f)
        
        current_month = datetime.now().month
        
        if crop_key in data:
            calendar = data[crop_key]
        else:
            calendar = data.get("default", {"season": "Varies", "duration_days": 120, "tasks": []})
        
        for task in calendar.get("tasks", []):
            task["is_current"] = task["month"] == current_month
        
        return {"crop": crop_key, "current_month": current_month, **calendar}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Calendar data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid calendar data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
