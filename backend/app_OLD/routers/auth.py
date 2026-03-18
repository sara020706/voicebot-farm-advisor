"""
Authentication routes
"""

from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, UserLogin
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """
    Register a new user
    """
    try:
        result = auth_service.register_user(user)
        return result
    except ValueError as e:
        # Client error (e.g., email already exists)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the actual error for debugging
        print(f"Registration error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    """
    Login user and return JWT token
    """
    try:
        result = auth_service.authenticate_user(credentials)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )
