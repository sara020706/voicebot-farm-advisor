"""
History routes - Get user's scan history
"""

from fastapi import APIRouter, Request, HTTPException
import sys, os, logging
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.database import supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/history")
async def get_history(request: Request):
    user_id = getattr(request.state, "user_id", None)

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        result = supabase.table("scans")\
            .select("id, created_at, recommended_crop, confidence, n, p, k, ph, temperature, humidity, rainfall")\
            .eq("user_id", str(user_id))\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()

        return {"scans": result.data or []}

    except Exception as e:
        logger.error(f"History query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
