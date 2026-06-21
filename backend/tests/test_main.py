from fastapi.testclient import TestClient

from app.chat import ChatResponse
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


def test_chat_endpoint_returns_run_chat_turn_result(monkeypatch):
    fake_response = ChatResponse(
        reply="¡Hola!", document_id="mutual-nda", values={"proposito": "Evaluar una alianza"}
    )
    monkeypatch.setattr("app.main.run_chat_turn", lambda request: fake_response)

    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hola"}], "values": {}},
        )

    assert response.status_code == 200
    assert response.json() == fake_response.model_dump()


def test_get_document_detail_returns_parsed_document():
    with TestClient(app) as client:
        response = client.get("/api/documents/mutual-nda")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "mutual-nda"
    assert body["fields"]["proposito"] == "Propósito"
    assert "{{proposito}}" in body["body"]


def test_get_document_detail_returns_404_for_unknown_document():
    with TestClient(app) as client:
        response = client.get("/api/documents/not-a-real-document")

    assert response.status_code == 404
