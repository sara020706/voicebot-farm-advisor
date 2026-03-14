from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import sys, os
# Add the backend root to Python path to access shared modules
backend_root = os.path.join(os.path.dirname(__file__), '../../..')
sys.path.insert(0, backend_root)
from shared.auth import decode_token

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
        if any(request.url.path.startswith(route) for route in PUBLIC_ROUTES):
            return await call_next(request)

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