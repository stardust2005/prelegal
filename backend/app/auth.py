import secrets
import sqlite3

import bcrypt
from fastapi import Cookie, HTTPException

from app.db import get_connection

SESSION_COOKIE_NAME = "session_token"


class EmailAlreadyRegisteredError(Exception):
    pass


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_user(email: str, password: str) -> int:
    connection = get_connection()
    try:
        cursor = connection.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, hash_password(password)),
        )
        connection.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError as error:
        raise EmailAlreadyRegisteredError(email) from error
    finally:
        connection.close()


def get_user_by_email(email: str) -> dict | None:
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        connection.close()


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    connection = get_connection()
    try:
        connection.execute(
            "INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id)
        )
        connection.commit()
        return token
    finally:
        connection.close()


def get_user_by_session_token(token: str) -> dict | None:
    connection = get_connection()
    try:
        row = connection.execute(
            """
            SELECT users.id, users.email
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        connection.close()


def delete_session(token: str) -> None:
    connection = get_connection()
    try:
        connection.execute("DELETE FROM sessions WHERE token = ?", (token,))
        connection.commit()
    finally:
        connection.close()


def get_current_user(session_token: str | None = Cookie(default=None)) -> dict:
    user = get_user_by_session_token(session_token) if session_token else None
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
