import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s"
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.middleware.jwt_middleware import JWTMiddleware
from app.routers.auth import router as auth_router
from app.routers.crop import router as crop_router
from app.routers.fertilizer import router as fertilizer_router
from app.routers.weather import router as weather_router
from app.routers.history import router as history_router

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        import sys, os
        sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
        from shared.database import supabase
        supabase.table("users").select("id").limit(1).execute()
        logger.info("✓ Supabase connection verified - Using REAL database")
    except Exception as e:
        logger.error(f"✗ Supabase connection FAILED: {e}")
    yield

app = FastAPI(
    title="VoiceBot CUD Service",
    version="1.0.0",
    lifespan=lifespan
)

# CRITICAL: CORS must be added FIRST, before JWT middleware
# This ensures OPTIONS preflight requests are handled before authentication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# JWT middleware comes AFTER CORS
app.add_middleware(JWTMiddleware)

app.include_router(auth_router,       prefix="/api/auth", tags=["Auth"])
app.include_router(crop_router,       prefix="/api",      tags=["Crop Prediction"])
app.include_router(fertilizer_router, prefix="/api",      tags=["Fertilizer"])
app.include_router(weather_router,    prefix="/api",      tags=["Weather"])
app.include_router(history_router,    prefix="/api",      tags=["History"])

@app.get("/health")
def health():
    return {"service": "cud", "status": "ok", "port": 5000}

@app.get("/")
def root():
    return {
        "service": "VoiceBot CUD Service",
        "version": "1.0.0",
        "docs": "/docs"
    }
