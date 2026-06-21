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


def test_chat_endpoint_requires_authentication():
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hola"}], "values": {}},
        )

    assert response.status_code == 401


def test_chat_endpoint_returns_run_chat_turn_result(monkeypatch):
    fake_response = ChatResponse(
        reply="¡Hola!", document_id="mutual-nda", values={"proposito": "Evaluar una alianza"}
    )
    monkeypatch.setattr("app.main.run_chat_turn", lambda request: fake_response)

    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "a@example.com", "password": "x"})
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hola"}], "values": {}},
        )

    assert response.status_code == 200
    assert response.json() == fake_response.model_dump()


def test_chat_endpoint_saves_a_fully_completed_document_to_the_users_history(monkeypatch):
    completed_values = {
        "proposito": "Evaluar una alianza",
        "fecha_de_vigencia": "1 de julio de 2026",
        "plazo_del_mnda": "2 años",
        "plazo_de_confidencialidad": "5 años",
        "ley_aplicable": "España",
        "jurisdiccion": "Madrid",
    }
    fake_response = ChatResponse(
        reply="Documento completo.", document_id="mutual-nda", values=completed_values
    )
    monkeypatch.setattr("app.main.run_chat_turn", lambda request: fake_response)

    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "a@example.com", "password": "x"})
        client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hola"}], "values": {}},
        )

        history_response = client.get("/api/history")

    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["document_id"] == "mutual-nda"
    assert history[0]["document_name"] == "Mutual Non-Disclosure Agreement"
    assert history[0]["values"] == completed_values


def test_chat_endpoint_does_not_save_an_incomplete_document(monkeypatch):
    fake_response = ChatResponse(
        reply="¿Cuál es la ley aplicable?",
        document_id="mutual-nda",
        values={"proposito": "Evaluar una alianza"},
    )
    monkeypatch.setattr("app.main.run_chat_turn", lambda request: fake_response)

    with TestClient(app) as client:
        client.post("/api/auth/register", json={"email": "a@example.com", "password": "x"})
        client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hola"}], "values": {}},
        )

        history_response = client.get("/api/history")

    assert history_response.json() == []


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
