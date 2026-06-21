from app.document_models import get_fields_model, get_turn_output_model


def test_get_fields_model_has_one_str_field_per_document_field():
    model = get_fields_model("mutual-nda")

    instance = model()
    dumped = instance.model_dump()

    assert set(dumped.keys()) == {
        "proposito",
        "fecha_de_vigencia",
        "plazo_del_mnda",
        "plazo_de_confidencialidad",
        "ley_aplicable",
        "jurisdiccion",
    }
    assert all(value == "" for value in dumped.values())


def test_get_fields_model_is_cached_across_calls():
    assert get_fields_model("mutual-nda") is get_fields_model("mutual-nda")


def test_get_fields_model_raises_for_unknown_document():
    try:
        get_fields_model("not-a-real-document")
    except KeyError:
        pass
    else:
        raise AssertionError("expected KeyError for unknown document id")


def test_get_turn_output_model_wraps_reply_document_id_and_values():
    model = get_turn_output_model("mutual-nda")

    instance = model(reply="hola", values={"proposito": "Test"})

    assert instance.reply == "hola"
    assert instance.document_id is None
    assert instance.values.proposito == "Test"


def test_get_turn_output_model_is_cached_across_calls():
    assert get_turn_output_model("mutual-nda") is get_turn_output_model("mutual-nda")
