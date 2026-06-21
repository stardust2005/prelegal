import functools

from pydantic import BaseModel, create_model

from app.templates import get_document


@functools.lru_cache(maxsize=None)
def get_fields_model(document_id: str) -> type[BaseModel]:
    """Construye (y cachea) el modelo Pydantic de `values` para un documento."""
    document = get_document(document_id)
    if document is None:
        raise KeyError(document_id)

    field_definitions = {key: (str, "") for key in document.fields}
    model_name = "".join(part.capitalize() for part in document_id.split("-")) + "Fields"
    return create_model(model_name, **field_definitions)


@functools.lru_cache(maxsize=None)
def get_turn_output_model(document_id: str) -> type[BaseModel]:
    """Construye (y cachea) el modelo Pydantic de salida del chat para un documento."""
    fields_model = get_fields_model(document_id)
    return create_model(
        "ChatTurnOutput",
        reply=(str, ...),
        document_id=(str | None, None),
        values=(fields_model, fields_model()),
    )
