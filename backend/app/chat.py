from typing import Literal

from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

NDA_FIELD_QUESTIONS = {
    "partyAName": "Parte A — Nombre de la empresa",
    "partyAAddress": "Parte A — Dirección",
    "partyASignatory": "Parte A — Firmante (nombre y cargo)",
    "partyBName": "Parte B — Nombre de la empresa",
    "partyBAddress": "Parte B — Dirección",
    "partyBSignatory": "Parte B — Firmante (nombre y cargo)",
    "purpose": "Propósito del acuerdo",
    "effectiveDate": "Fecha de vigencia",
    "mndaTerm": "Plazo del MNDA",
    "termOfConfidentiality": "Plazo de confidencialidad",
    "governingLaw": "Ley aplicable",
    "jurisdiction": "Jurisdicción",
}


class NdaFields(BaseModel):
    partyAName: str = ""
    partyAAddress: str = ""
    partyASignatory: str = ""
    partyBName: str = ""
    partyBAddress: str = ""
    partyBSignatory: str = ""
    purpose: str = ""
    effectiveDate: str = ""
    mndaTerm: str = ""
    termOfConfidentiality: str = ""
    governingLaw: str = ""
    jurisdiction: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    values: NdaFields


class ChatResponse(BaseModel):
    reply: str
    values: NdaFields


def _build_system_prompt(values: NdaFields) -> str:
    known = {k: v for k, v in values.model_dump().items() if v}
    pending = [label for key, label in NDA_FIELD_QUESTIONS.items() if not values.model_dump()[key]]

    return (
        "Eres un asistente legal que ayuda a un usuario a rellenar un Acuerdo de "
        "Confidencialidad Mutuo (Mutual NDA) mediante una conversación en español. "
        "Pregunta por los campos pendientes, uno o pocos a la vez, de forma natural. "
        "Nunca inventes un valor: solo registra lo que el usuario indique explícitamente. "
        f"Campos ya conocidos: {known}. "
        f"Campos pendientes: {pending}. "
        "Responde siempre con el JSON estructurado solicitado, incluyendo en 'values' "
        "únicamente los campos que el usuario haya proporcionado o confirmado en este turno "
        "(deja vacíos los que no se mencionen)."
    )


def run_chat_turn(request: ChatRequest) -> ChatResponse:
    messages = [{"role": "system", "content": _build_system_prompt(request.values)}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    parsed = ChatResponse.model_validate_json(response.choices[0].message.content)

    merged = request.values.model_copy(
        update={k: v for k, v in parsed.values.model_dump().items() if v}
    )
    return ChatResponse(reply=parsed.reply, values=merged)
