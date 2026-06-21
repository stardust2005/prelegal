import os
from contextlib import asynccontextmanager

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.auth import (
    SESSION_COOKIE_NAME,
    EmailAlreadyRegisteredError,
    create_session,
    create_user,
    delete_session,
    get_current_user,
    get_user_by_email,
    verify_password,
)
from app.chat import ChatRequest, ChatResponse, run_chat_turn
from app.db import init_db
from app.document_history import list_generated_documents, save_generated_document
from app.templates import ParsedDocument, get_document


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(os.environ.get("DATABASE_PATH", "data/app.db"))
    yield


app = FastAPI(title="PreLegal API", lifespan=lifespan)


class Credentials(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    email: str


class GeneratedDocumentResponse(BaseModel):
    document_id: str
    document_name: str
    values: dict[str, str]
    created_at: str


def _set_session_cookie(response: Response, user_id: int) -> None:
    token = create_session(user_id)
    response.set_cookie(
        SESSION_COOKIE_NAME, token, httponly=True, samesite="lax", max_age=60 * 60 * 24 * 30
    )


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", status_code=201)
def register(credentials: Credentials, response: Response) -> UserResponse:
    try:
        user_id = create_user(credentials.email, credentials.password)
    except EmailAlreadyRegisteredError as error:
        raise HTTPException(status_code=409, detail="Email already registered") from error

    _set_session_cookie(response, user_id)
    return UserResponse(email=credentials.email)


@app.post("/api/auth/login")
def login(credentials: Credentials, response: Response) -> UserResponse:
    user = get_user_by_email(credentials.email)
    if user is None or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _set_session_cookie(response, user["id"])
    return UserResponse(email=user["email"])


@app.post("/api/auth/logout")
def logout(response: Response, session_token: str | None = Cookie(default=None)) -> dict[str, str]:
    if session_token:
        delete_session(session_token)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {}


@app.get("/api/auth/me")
def me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    return UserResponse(email=current_user["email"])


@app.get("/api/history")
def history(current_user: dict = Depends(get_current_user)) -> list[GeneratedDocumentResponse]:
    return [
        GeneratedDocumentResponse(
            document_id=saved["document_id"],
            document_name=get_document(saved["document_id"]).name,
            values=saved["values"],
            created_at=saved["created_at"],
        )
        for saved in list_generated_documents(current_user["id"])
    ]


@app.post("/api/chat")
def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)) -> ChatResponse:
    response = run_chat_turn(request)

    if response.document_id is not None:
        document = get_document(response.document_id)
        if document is not None and all(
            response.values.get(field, "").strip() for field in document.fields
        ):
            save_generated_document(current_user["id"], response.document_id, response.values)

    return response


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
