from fastapi import Request, HTTPException
import sys, os
# Add the backend root to Python path to access shared modules
backend_root = os.path.join(os.path.dirname(__file__), '../..')
sys.path.insert(0, backend_root)
from shared.database import supabase

def get_current_user(request: Request):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    result = supabase.table("users").select(
        "id, name, email, state, acres"
    ).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]