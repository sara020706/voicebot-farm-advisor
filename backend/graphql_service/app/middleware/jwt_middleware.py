from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.auth import decode_token

PUBLIC_ROUTES = [
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc"
]

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow public routes
        if any(request.url.path.startswith(route) for route in PUBLIC_ROUTES):
            return await call_next(request)
        
        # For GraphQL, check if it's an introspection query (allow for GraphQL IDE)
        if request.url.path.startswith("/graphql"):
            # Allow OPTIONS requests for CORS
            if request.method == "OPTIONS":
                return await call_next(request)
            
            # For GraphQL queries, check authorization
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

        # For other routes, require authentication
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