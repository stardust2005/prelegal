import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.chat import ChatRequest, ChatResponse, run_chat_turn
from app.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(os.environ.get("DATABASE_PATH", "data/app.db"))
    yield


app = FastAPI(title="PreLegal API", lifespan=lifespan)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest) -> ChatResponse:
    return run_chat_turn(request)


# Declare new API routes above this line — the catch-all mount below
# would otherwise shadow them.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
