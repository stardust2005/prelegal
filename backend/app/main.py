import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app.chat import ChatRequest, ChatResponse, run_chat_turn
from app.db import init_db
from app.templates import ParsedDocument, get_document


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


@app.get("/api/documents/{document_id}")
def get_document_detail(document_id: str) -> ParsedDocument:
    document = get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


# Declare new API routes above this line — the catch-all mount below
# would otherwise shadow them.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
