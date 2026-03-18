"""
Authentication service - business logic for user auth
"""

import sys, os, logging
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.auth import hash_password, verify_password, create_token
from shared.database import supabase

logger = logging.getLogger(__name__)


def register_user(data) -> dict:
    """
    Register a new user
    """
    try:
        # Check if email already exists
        logger.info(f"Checking if email exists: {data.email}")
        existing = supabase.table("users").select("id").eq("email", data.email).execute()
        if existing.data:
            raise ValueError("Email already registered")
        
        # Hash password and insert
        logger.info(f"Hashing password for: {data.email}")
        hashed = hash_password(data.password)
        
        logger.info(f"Inserting user to Supabase: {data.email}")
        result = supabase.table("users").insert({
            "name": data.name,
            "email": data.email,
            "hashed_password": hashed,
            "state": getattr(data, 'state', None),
            "acres": getattr(data, 'acres', None)
        }).execute()
        
        if not result.data:
            logger.error("Supabase insert returned empty data")
            raise Exception("Failed to create user - database returned no data")
        
        user = result.data[0]
        logger.info(f"User created with ID: {user['id']}")
        
        token = create_token(user["id"])
        logger.info(f"JWT token created for user: {user['id']}")
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "state": user.get("state")
            }
        }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {type(e).__name__}: {str(e)}")
        raise


def authenticate_user(data) -> dict:
    """
    Authenticate user and return token
    """
    try:
        # Find user by email
        logger.info(f"Looking up user: {data.email}")
        result = supabase.table("users").select("*").eq("email", data.email).execute()
        if not result.data:
            logger.warning(f"User not found: {data.email}")
            raise ValueError("Invalid email or password")
        
        user = result.data[0]
        logger.info(f"User found: {user['id']}")
        
        # Verify password
        logger.info(f"Verifying password for: {data.email}")
        if not verify_password(data.password, user["hashed_password"]):
            logger.warning(f"Invalid password for: {data.email}")
            raise ValueError("Invalid email or password")
        
        token = create_token(user["id"])
        logger.info(f"Login successful for: {data.email}")
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "state": user.get("state")
            }
        }
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Login failed: {type(e).__name__}: {str(e)}")
        raise