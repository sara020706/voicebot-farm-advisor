"""
FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, crop, fertilizer, weather

settings = get_settings()

app = FastAPI(
    title="VoiceBot API",
    description="Backend API for VoiceBot agricultural assistant",
    version="0.1.0",
    debug=settings.debug
)

# CORS configuration to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with /api prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(crop.router, prefix="/api", tags=["Crop Prediction"])
app.include_router(fertilizer.router, prefix="/api", tags=["Fertilizer"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VoiceBot API",
        "version": "0.1.0",
        "docs": "/docs"
    }
