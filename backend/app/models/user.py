"""
User-related Pydantic models
"""

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """Model for user registration"""
    name: str
    email: EmailStr
    password: str
    state: str | None = None
    acres: float | None = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long (max 128 characters)')
        return v
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Model for user response (without password)"""
    id: str
    name: str
    email: EmailStr
    state: str | None = None
    
    class Config:
        from_attributes = True
