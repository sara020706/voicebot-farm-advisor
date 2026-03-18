import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s"
)

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from strawberry.fastapi import GraphQLRouter
from app.middleware.jwt_middleware import JWTMiddleware
from app.schema.schema import schema

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from shared.database import supabase
        supabase.table("users").select("id").limit(1).execute()
        logger.info("✓ Supabase connection verified")
    except Exception as e:
        logger.error(f"✗ Supabase connection FAILED: {e}")
    yield

app = FastAPI(
    title="VoiceBot GraphQL Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(JWTMiddleware)

async def get_context(request: Request):
    return {"request": request}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/health")
def health():
    return {"service": "graphql", "status": "ok", "port": 5001}

@app.get("/")
def root():
    return {
        "service": "VoiceBot GraphQL Service",
        "version": "1.0.0",
        "graphql": "/graphql"
    }
