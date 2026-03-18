from fastapi import Request, HTTPException
import sys, os, logging

sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.database import supabase

logger = logging.getLogger(__name__)

def get_current_user(request: Request):
    user_id = getattr(request.state, "user_id", None)
    logger.info(f"get_current_user — user_id={user_id}")
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated — user_id missing from request state"
        )
    
    try:
        result = supabase.table("users")\
            .select("id, name, email, state, acres")\
            .eq("id", str(user_id))\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_current_user failed: {e}")
        raise HTTPException(status_code=500, detail=f"Could not fetch user: {str(e)}")
