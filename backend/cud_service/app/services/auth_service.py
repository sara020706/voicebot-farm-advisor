"""
Authentication service - business logic for user auth
"""

import sys, os
# Add the backend root to Python path to access shared modules
backend_root = os.path.join(os.path.dirname(__file__), '../../..')
sys.path.insert(0, backend_root)
from shared.auth import hash_password, verify_password, create_token
from shared.database import supabase


def register_user(data) -> dict:
    """
    Register a new user
    """
    # Check if email already exists
    existing = supabase.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise ValueError("Email already registered")
    
    # Hash password and insert
    hashed = hash_password(data.password)
    result = supabase.table("users").insert({
        "name": data.name,
        "email": data.email,
        "hashed_password": hashed,
        "state": getattr(data, 'state', None),
        "acres": getattr(data, 'acres', None)
    }).execute()
    
    if not result.data:
        raise Exception("Failed to create user")
    
    user = result.data[0]
    token = create_token(user["id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "state": user.get("state")
        }
    }


def authenticate_user(data) -> dict:
    """
    Authenticate user and return token
    """
    # Find user by email
    result = supabase.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise ValueError("Invalid email or password")
    
    user = result.data[0]
    
    # Verify password
    if not verify_password(data.password, user["hashed_password"]):
        raise ValueError("Invalid email or password")
    
    token = create_token(user["id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "state": user.get("state")
        }
    }