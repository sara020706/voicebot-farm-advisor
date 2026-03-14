from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from app.middleware.jwt_middleware import JWTMiddleware
from app.schema.schema import schema

app = FastAPI(title="VoiceBot GraphQL Service", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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