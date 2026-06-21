from fastapi.testclient import TestClient

from app.main import app


def test_register_creates_a_user_and_sets_a_session_cookie(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "correct-horse"}
        )

        assert response.status_code == 201
        assert response.json() == {"email": "a@example.com"}
        assert "session_token" in response.cookies


def test_register_rejects_a_duplicate_email(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "a@example.com", "password": "x"})
        response = client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "y"}
        )

        assert response.status_code == 409


def test_login_with_correct_credentials_sets_a_session_cookie(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "correct-horse"}
        )
        client.cookies.clear()

        response = client.post(
            "/api/auth/login", json={"email": "a@example.com", "password": "correct-horse"}
        )

        assert response.status_code == 200
        assert response.json() == {"email": "a@example.com"}
        assert "session_token" in response.cookies


def test_login_with_wrong_password_is_rejected(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "correct-horse"}
        )

        response = client.post(
            "/api/auth/login", json={"email": "a@example.com", "password": "wrong"}
        )

        assert response.status_code == 401


def test_login_with_unknown_email_is_rejected(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login", json={"email": "missing@example.com", "password": "x"}
        )

        assert response.status_code == 401


def test_me_returns_the_logged_in_user(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "correct-horse"}
        )

        response = client.get("/api/auth/me")

        assert response.status_code == 200
        assert response.json() == {"email": "a@example.com"}


def test_me_returns_401_when_not_logged_in(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        response = client.get("/api/auth/me")

        assert response.status_code == 401


def test_logout_clears_the_session(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "app.db"))

    with TestClient(app) as client:
        client.post(
            "/api/auth/register", json={"email": "a@example.com", "password": "correct-horse"}
        )

        logout_response = client.post("/api/auth/logout")
        me_response = client.get("/api/auth/me")

        assert logout_response.status_code == 200
        assert me_response.status_code == 401
