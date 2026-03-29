"""
Government schemes routes
"""

from fastapi import APIRouter, Request, HTTPException, Query
import json
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/schemes")
async def schemes_endpoint(
    request: Request,
    crop: Optional[str] = Query(None, description="Filter by crop"),
    state: Optional[str] = Query(None, description="Filter by state")
):
    user_id = getattr(request.state, "user_id", None)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    logger.info(f"GET /api/schemes — user_id={user_id} crop={crop} state={state}")
    
    try:
        schemes_path = os.path.join(os.path.dirname(__file__), '../../../data/schemes.json')
        
        if not os.path.exists(schemes_path):
            logger.error(f"Schemes file not found at {schemes_path}")
            return {"schemes": []}
        
        with open(schemes_path, 'r') as f:
            all_schemes = json.load(f)
        
        filtered = []
        for scheme in all_schemes:
            # Check crop filter
            crop_match = (not crop) or \
                        ("all" in scheme.get("applies_to", [])) or \
                        (crop.lower() in [c.lower() for c in scheme.get("applies_to", [])])
            
            # Check state filter
            state_match = (not state) or \
                         ("all" in scheme.get("states", [])) or \
                         (state.lower() in [s.lower() for s in scheme.get("states", [])])
            
            if crop_match and state_match:
                filtered.append(scheme)
        
        logger.info(f"Returning {len(filtered)} schemes")
        return {"schemes": filtered}
        
    except Exception as e:
        logger.error(f"Schemes endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
