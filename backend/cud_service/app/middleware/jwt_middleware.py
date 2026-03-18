from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import sys, os, logging
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.auth import decode_token

logger = logging.getLogger(__name__)

PUBLIC_ROUTES = [
    "/api/auth/login",
    "/api/auth/register",
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc"
]

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow OPTIONS requests for CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # Allow exact match for root route
        if request.url.path == "/":
            return await call_next(request)
        
        # Allow public routes
        for route in PUBLIC_ROUTES:
            if request.url.path.startswith(route):
                return await call_next(request)

        # Check authorization for protected routes
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header"}
            )

        token = auth_header.split(" ")[1]
        user_id = decode_token(token)

        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"}
            )

        request.state.user_id = user_id
        return await call_next(request)
