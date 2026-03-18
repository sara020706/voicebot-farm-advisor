"""
Authentication routes
"""

from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, UserLogin
from app.services import auth_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    try:
        result = auth_service.register_user(user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    try:
        result = auth_service.authenticate_user(credentials)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
