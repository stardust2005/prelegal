from typing import Literal

from litellm import completion
from pydantic import BaseModel

from app.document_models import get_fields_model, get_turn_output_model
from app.templates import get_all_documents, get_document, valid_document_ids

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    document_id: str | None = None
    values: dict[str, str] = {}


class ChatResponse(BaseModel):
    reply: str
    document_id: str | None = None
    values: dict[str, str] = {}


class _DocumentSelectionOutput(BaseModel):
    reply: str
    document_id: str | None = None


def _catalog_summary() -> str:
    return "\n".join(
        f"- {doc_id}: {doc.name} — {doc.description}"
        for doc_id, doc in get_all_documents().items()
    )


def _selection_system_prompt() -> str:
    return (
        "Eres un asistente legal que ayuda a un usuario a identificar qué tipo de "
        "documento legal necesita, de entre este catálogo:\n"
        f"{_catalog_summary()}\n\n"
        "Pregunta lo necesario para identificar el documento correcto. Si el usuario "
        "describe algo que no está en el catálogo, explícaselo y sugiere en tu respuesta "
        "(en lenguaje natural) el documento del catálogo más parecido a lo que pide. "
        "Solo rellena 'document_id' con el id exacto del catálogo cuando estés seguro de "
        "qué documento quiere el usuario; si no, déjalo en null. "
        "Termina siempre tu respuesta con una pregunta concreta mientras no sepas qué "
        "documento necesita el usuario."
    )


def _fields_system_prompt(
    document_name: str, known: dict[str, str], pending_labels: list[str]
) -> str:
    return (
        f'Eres un asistente legal ayudando a un usuario a rellenar un documento de tipo '
        f'"{document_name}" mediante una conversación en español. '
        "Pregunta por los campos pendientes, uno o pocos a la vez, de forma natural. "
        "Nunca inventes un valor: solo registra lo que el usuario indique explícitamente. "
        f"Campos ya conocidos: {known}. "
        f"Campos pendientes: {pending_labels}. "
        "Si el usuario pide explícitamente cambiar a otro tipo de documento, indica el "
        "nuevo document_id; en caso contrario, deja document_id en null. "
        "Si quedan campos pendientes, termina SIEMPRE tu respuesta con una pregunta "
        "concreta sobre el siguiente campo que falta. Nunca dejes la respuesta sin una "
        "pregunta de seguimiento mientras haya información pendiente."
    )


def _call_llm(messages: list[dict[str, str]], response_format: type[BaseModel]) -> BaseModel:
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=response_format,
        reasoning_effort="low",
        allowed_openai_params=["reasoning_effort"],
        extra_body=EXTRA_BODY,
    )
    return response_format.model_validate_json(response.choices[0].message.content)


def run_chat_turn(request: ChatRequest) -> ChatResponse:
    if request.document_id is None:
        return _run_selection_turn(request)
    return _run_fields_turn(request, request.document_id)


def _run_selection_turn(request: ChatRequest) -> ChatResponse:
    messages = [{"role": "system", "content": _selection_system_prompt()}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    parsed = _call_llm(messages, _DocumentSelectionOutput)

    document_id = parsed.document_id
    if document_id is not None and document_id not in valid_document_ids():
        document_id = None

    return ChatResponse(reply=parsed.reply, document_id=document_id, values={})


def _run_fields_turn(request: ChatRequest, document_id: str) -> ChatResponse:
    if document_id not in valid_document_ids():
        return _run_selection_turn(ChatRequest(messages=request.messages))

    document = get_document(document_id)
    fields_model = get_fields_model(document_id)
    output_model = get_turn_output_model(document_id)

    known_values = fields_model(**request.values)
    dumped = known_values.model_dump()
    known = {k: v for k, v in dumped.items() if v}
    pending = [document.fields[k] for k in document.fields if not dumped[k]]

    messages = [{"role": "system", "content": _fields_system_prompt(document.name, known, pending)}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    parsed = _call_llm(messages, output_model)

    new_document_id = parsed.document_id
    if new_document_id is not None and new_document_id not in valid_document_ids():
        new_document_id = document_id

    if new_document_id is not None and new_document_id != document_id:
        return ChatResponse(reply=parsed.reply, document_id=new_document_id, values={})

    merged = known_values.model_copy(
        update={k: v for k, v in parsed.values.model_dump().items() if v}
    )
    return ChatResponse(reply=parsed.reply, document_id=document_id, values=merged.model_dump())
