from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.jwt_middleware import JWTMiddleware
from app.routers import auth, crop, fertilizer, weather

app = FastAPI(title="VoiceBot CUD Service", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(JWTMiddleware)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(crop.router, prefix="/api", tags=["Crop"])
app.include_router(fertilizer.router, prefix="/api", tags=["Fertilizer"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])

@app.get("/health")
def health():
    return {"service": "cud", "status": "ok", "port": 5000}