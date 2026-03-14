"""
Authentication service - business logic for user auth
"""

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.database import supabase
from app.config import get_settings

# Configure passlib to truncate passwords automatically
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__ident="2b",  # Use 2b variant which is more standard
    bcrypt__truncate_error=False  # Don't raise error on long passwords
)


def hash_password(password: str) -> str:
    """
    Hash a plain text password
    Bcrypt has a 72-byte limit, passlib handles truncation automatically
    """
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a password against its hash
    Passlib handles bcrypt truncation automatically
    """
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    """
    Create JWT access token
    """
    settings = get_settings()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def verify_token(token: str) -> str | None:
    """
    Verify JWT token and return user_id
    """
    try:
        settings = get_settings()
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


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
    token = create_access_token(user["id"])
    
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
    
    token = create_access_token(user["id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "state": user.get("state")
        }
    }
