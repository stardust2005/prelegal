import json
from types import SimpleNamespace

from app.chat import ChatMessage, ChatRequest, run_chat_turn


def _fake_completion_returning(payload: dict):
    message = SimpleNamespace(content=json.dumps(payload))
    choice = SimpleNamespace(message=message)
    return SimpleNamespace(choices=[choice])


def test_run_chat_turn_selection_mode_returns_resolved_document_id(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {"reply": "Perfecto, un NDA mutuo.", "document_id": "mutual-nda"}
        ),
    )

    request = ChatRequest(messages=[ChatMessage(role="user", content="Necesito un NDA mutuo")])
    response = run_chat_turn(request)

    assert response.document_id == "mutual-nda"
    assert response.values == {}
    assert response.reply == "Perfecto, un NDA mutuo."


def test_run_chat_turn_selection_mode_rejects_invalid_document_id(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {"reply": "No tenemos eso, ¿quizás un Mutual NDA?", "document_id": "documento-inexistente"}
        ),
    )

    request = ChatRequest(messages=[ChatMessage(role="user", content="Quiero un contrato de alquiler")])
    response = run_chat_turn(request)

    assert response.document_id is None
    assert response.values == {}


def test_run_chat_turn_fields_mode_merges_new_values_over_existing(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {
                "reply": "¿Cuál es la ley aplicable?",
                "document_id": None,
                "values": {"fecha_de_vigencia": "1 de julio de 2026"},
            }
        ),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="La fecha es el 1 de julio de 2026")],
        document_id="mutual-nda",
        values={"proposito": "Evaluar una alianza"},
    )
    response = run_chat_turn(request)

    assert response.document_id == "mutual-nda"
    assert response.values["fecha_de_vigencia"] == "1 de julio de 2026"
    assert response.values["proposito"] == "Evaluar una alianza"


def test_run_chat_turn_fields_mode_does_not_overwrite_existing_value_with_blank(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {"reply": "Ok", "document_id": None, "values": {"proposito": ""}}
        ),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="hola")],
        document_id="mutual-nda",
        values={"proposito": "Evaluar una alianza"},
    )
    response = run_chat_turn(request)

    assert response.values["proposito"] == "Evaluar una alianza"


def test_run_chat_turn_fields_mode_document_id_change_resets_values(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {
                "reply": "Ah, entonces necesitas un Anexo de IA, no un NDA.",
                "document_id": "ai-addendum",
                "values": {"proposito": "esto se descarta"},
            }
        ),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="En realidad necesito un anexo de IA")],
        document_id="mutual-nda",
        values={"proposito": "Evaluar una alianza"},
    )
    response = run_chat_turn(request)

    assert response.document_id == "ai-addendum"
    assert response.values == {}


def test_run_chat_turn_fields_mode_falls_back_to_selection_when_document_id_invalid(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            {"reply": "¿Qué documento necesitas?", "document_id": None}
        ),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="hola")],
        document_id="documento-borrado",
        values={"x": "y"},
    )
    response = run_chat_turn(request)

    assert response.document_id is None
    assert response.values == {}


def test_run_chat_turn_calls_completion_with_cerebras_provider(monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured.update(kwargs)
        return _fake_completion_returning({"reply": "hola", "document_id": None})

    monkeypatch.setattr("app.chat.completion", fake_completion)

    request = ChatRequest(messages=[ChatMessage(role="user", content="hola")])
    run_chat_turn(request)

    assert captured["model"] == "openrouter/openai/gpt-oss-120b"
    assert captured["extra_body"] == {"provider": {"order": ["cerebras"]}}
    assert captured["reasoning_effort"] == "low"
