from pathlib import Path

from app.templates import (
    TEMPLATES_DIR,
    get_all_documents,
    get_document,
    parse_template,
    slugify_field_key,
    valid_document_ids,
)


def test_parse_template_dedups_repeated_placeholder_by_label():
    markdown = (
        "1. **Intro**. El <span class=\"coverpage_link\">Propósito</span> es X. "
        "Usa el <span class=\"coverpage_link\">Propósito</span> de nuevo. "
        "2. **Otra**. <span class=\"coverpage_link\">Ley Aplicable</span>."
    )

    fields, body = parse_template(markdown)

    assert len(fields) == 2
    assert body.count("{{") == 3
    purpose_key = next(k for k, v in fields.items() if v == "Propósito")
    assert body.count("{{" + purpose_key + "}}") == 2


def test_parse_template_collapses_header_spans_without_id():
    markdown = '1. <span class="header_2" id="1">Servicios</span>\n    1. <span class="header_3">Acceso.</span> Cuerpo.'

    _, body = parse_template(markdown)

    assert "<span" not in body
    assert "Servicios" in body
    assert "Acceso." in body


def test_parse_template_collapses_empty_definition_anchor_before_bold():
    markdown = '<span id="4.1"></span>**"Término"** significa algo.'

    _, body = parse_template(markdown)

    assert "<span" not in body
    assert body.startswith('**"Término"** significa algo.')


def test_parse_template_collapses_wrapping_anchor_around_bold():
    markdown = '<span id="11.20">**"Términos Clave"**</span> significa una Portada.'

    _, body = parse_template(markdown)

    assert "<span" not in body
    assert body.startswith('**"Términos Clave"** significa una Portada.')


def test_parse_template_collapses_wrapping_anchor_around_plain_text():
    markdown = 'a. <span id="5.3.a">si</span> la otra parte no subsana.'

    _, body = parse_template(markdown)

    assert "<span" not in body
    assert "si la otra parte no subsana." in body


def test_parse_template_placeholder_with_extra_id_attribute_is_still_a_field():
    markdown = '<span class="coverpage_link" id="4.5.a">Cliente</span> dejará de tener derecho.'

    fields, body = parse_template(markdown)

    assert len(fields) == 1
    assert list(fields.values()) == ["Cliente"]
    assert "<span" not in body


def test_parse_template_real_mutual_nda_has_six_unique_fields():
    markdown = (TEMPLATES_DIR / "mutual-nda.md").read_text(encoding="utf-8")

    fields, body = parse_template(markdown)

    assert len(fields) == 6
    assert set(fields.values()) == {
        "Propósito",
        "Fecha de Vigencia",
        "Plazo del MNDA",
        "Plazo de Confidencialidad",
        "Ley Aplicable",
        "Jurisdicción",
    }
    assert "<span" not in body
    assert "coverpage_link" not in body


def test_parse_template_real_ai_addendum_has_no_residual_spans():
    markdown = (TEMPLATES_DIR / "ai-addendum.md").read_text(encoding="utf-8")

    fields, body = parse_template(markdown)

    assert len(fields) > 0
    assert "<span" not in body


def test_slugify_field_key_is_stable_ascii_and_dedups_case():
    assert slugify_field_key("Fecha de Vigencia") == slugify_field_key("FECHA DE VIGENCIA")
    key = slugify_field_key("Plazo de Confidencialidad")
    assert key.isascii()
    assert " " not in key


def test_get_all_documents_returns_eleven_entries_keyed_by_filename_stem():
    documents = get_all_documents()

    assert len(documents) == 11
    assert "mutual-nda" in documents
    assert "ai-addendum" in documents
    assert documents["mutual-nda"].name == "Mutual Non-Disclosure Agreement"


def test_get_document_returns_none_for_unknown_id():
    assert get_document("not-a-real-document") is None


def test_valid_document_ids_matches_catalog_filenames():
    ids = valid_document_ids()

    assert len(ids) == 11
    assert "mutual-nda" in ids
