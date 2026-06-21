import json
from types import SimpleNamespace

from app.chat import ChatMessage, ChatRequest, NdaFields, run_chat_turn


def _fake_completion_returning(reply: str, values: dict):
    payload = json.dumps({"reply": reply, "values": values})
    message = SimpleNamespace(content=payload)
    choice = SimpleNamespace(message=message)
    return SimpleNamespace(choices=[choice])


def test_run_chat_turn_merges_new_field_values_over_existing(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning(
            "¿Quién firma por Acme?",
            {"partyAName": "Acme Inc."},
        ),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="La parte A es Acme Inc.")],
        values=NdaFields(purpose="Evaluar una alianza"),
    )

    response = run_chat_turn(request)

    assert response.reply == "¿Quién firma por Acme?"
    assert response.values.partyAName == "Acme Inc."
    assert response.values.purpose == "Evaluar una alianza"


def test_run_chat_turn_does_not_overwrite_existing_value_with_blank(monkeypatch):
    monkeypatch.setattr(
        "app.chat.completion",
        lambda **kwargs: _fake_completion_returning("ok", {"partyAName": ""}),
    )

    request = ChatRequest(
        messages=[ChatMessage(role="user", content="hola")],
        values=NdaFields(partyAName="Acme Inc."),
    )

    response = run_chat_turn(request)

    assert response.values.partyAName == "Acme Inc."


def test_run_chat_turn_calls_completion_with_cerebras_provider(monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured.update(kwargs)
        return _fake_completion_returning("hola", {})

    monkeypatch.setattr("app.chat.completion", fake_completion)

    request = ChatRequest(messages=[ChatMessage(role="user", content="hola")], values=NdaFields())
    run_chat_turn(request)

    assert captured["model"] == "openrouter/openai/gpt-oss-120b"
    assert captured["extra_body"] == {"provider": {"order": ["cerebras"]}}
    assert captured["reasoning_effort"] == "low"
