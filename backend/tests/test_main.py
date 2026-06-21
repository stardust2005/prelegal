from fastapi.testclient import TestClient

from app.main import app


def test_health_check_returns_ok():
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_startup_initializes_database(tmp_path, monkeypatch):
    db_path = tmp_path / "app.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))

    with TestClient(app):
        pass

    assert db_path.exists()
