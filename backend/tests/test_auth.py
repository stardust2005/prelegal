import pytest

from app.auth import (
    EmailAlreadyRegisteredError,
    create_session,
    create_user,
    delete_session,
    get_user_by_email,
    get_user_by_session_token,
    hash_password,
    verify_password,
)
from app.db import init_db


def test_hash_password_returns_a_different_string_than_the_input():
    hashed = hash_password("correct-horse")

    assert hashed != "correct-horse"


def test_verify_password_accepts_the_correct_password():
    hashed = hash_password("correct-horse")

    assert verify_password("correct-horse", hashed) is True


def test_verify_password_rejects_the_wrong_password():
    hashed = hash_password("correct-horse")

    assert verify_password("wrong-password", hashed) is False


@pytest.fixture
def db(tmp_path, monkeypatch):
    db_path = tmp_path / "app.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    init_db(str(db_path))
    return db_path


def test_create_user_returns_a_new_user_id(db):
    user_id = create_user("a@example.com", "correct-horse")

    assert isinstance(user_id, int)


def test_create_user_rejects_a_duplicate_email(db):
    create_user("a@example.com", "correct-horse")

    with pytest.raises(EmailAlreadyRegisteredError):
        create_user("a@example.com", "another-password")


def test_get_user_by_email_returns_the_stored_user(db):
    user_id = create_user("a@example.com", "correct-horse")

    user = get_user_by_email("a@example.com")

    assert user["id"] == user_id
    assert user["email"] == "a@example.com"
    assert verify_password("correct-horse", user["password_hash"])


def test_get_user_by_email_returns_none_when_not_found(db):
    assert get_user_by_email("missing@example.com") is None


def test_create_session_returns_a_token_resolvable_to_the_user(db):
    user_id = create_user("a@example.com", "correct-horse")

    token = create_session(user_id)
    user = get_user_by_session_token(token)

    assert user["id"] == user_id
    assert user["email"] == "a@example.com"


def test_get_user_by_session_token_returns_none_for_an_unknown_token(db):
    assert get_user_by_session_token("not-a-real-token") is None


def test_delete_session_invalidates_the_token(db):
    user_id = create_user("a@example.com", "correct-horse")
    token = create_session(user_id)

    delete_session(token)

    assert get_user_by_session_token(token) is None
