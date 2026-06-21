import functools
import json
import os
import re
import unicodedata
from pathlib import Path

from pydantic import BaseModel

_DEFAULT_REPO_ROOT = Path(__file__).resolve().parents[2]
TEMPLATES_DIR = Path(os.environ.get("TEMPLATES_DIR", str(_DEFAULT_REPO_ROOT / "Templates")))
CATALOG_PATH = Path(os.environ.get("CATALOG_PATH", str(_DEFAULT_REPO_ROOT / "catalog.json")))

_PLACEHOLDER_CLASSES = (
    "coverpage_link",
    "keyterms_link",
    "orderform_link",
    "sow_link",
    "businessterms_link",
)
_PLACEHOLDER_RE = re.compile(
    r'<span class="(?:' + "|".join(_PLACEHOLDER_CLASSES) + r')"[^>]*>(.*?)</span>',
    re.DOTALL,
)
_HEADER_RE = re.compile(r'<span class="header_[23]"[^>]*>(.*?)</span>', re.DOTALL)
_EMPTY_ANCHOR_RE = re.compile(r'<span id="[^"]*"></span>')
_WRAPPING_ANCHOR_RE = re.compile(r'<span id="[^"]*">(.*?)</span>', re.DOTALL)


class ParsedDocument(BaseModel):
    id: str
    name: str
    description: str
    fields: dict[str, str]
    body: str


def slugify_field_key(label: str) -> str:
    normalized = unicodedata.normalize("NFKD", label)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_only.lower()).strip("_")


def parse_template(markdown_text: str) -> tuple[dict[str, str], str]:
    """Convierte una plantilla markdown de Common Paper en (fields, body).

    fields: dict ordenado key -> label, una entrada por etiqueta distinta.
    body: el markdown con cada placeholder de campo sustituido por
    `{{key}}`, y los spans de ancla/encabezado colapsados a su texto interior.
    """
    fields: dict[str, str] = {}
    label_to_key: dict[str, str] = {}

    def replace_placeholder(match: re.Match[str]) -> str:
        label = match.group(1).strip()
        key = label_to_key.get(label)
        if key is None:
            key = slugify_field_key(label)
            label_to_key[label] = key
            fields[key] = label
        return "{{" + key + "}}"

    body = _PLACEHOLDER_RE.sub(replace_placeholder, markdown_text)
    body = _HEADER_RE.sub(r"\1", body)
    body = _EMPTY_ANCHOR_RE.sub("", body)
    body = _WRAPPING_ANCHOR_RE.sub(r"\1", body)
    return fields, body


def load_catalog_entries() -> list[dict]:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def _document_id_from_filename(filename: str) -> str:
    return Path(filename).stem


@functools.lru_cache(maxsize=1)
def get_all_documents() -> dict[str, ParsedDocument]:
    documents: dict[str, ParsedDocument] = {}
    for entry in load_catalog_entries():
        document_id = _document_id_from_filename(entry["filename"])
        markdown_text = (TEMPLATES_DIR / entry["filename"]).read_text(encoding="utf-8")
        fields, body = parse_template(markdown_text)
        documents[document_id] = ParsedDocument(
            id=document_id,
            name=entry["name"],
            description=entry["description"],
            fields=fields,
            body=body,
        )
    return documents


def get_document(document_id: str) -> ParsedDocument | None:
    return get_all_documents().get(document_id)


def valid_document_ids() -> list[str]:
    return list(get_all_documents().keys())
