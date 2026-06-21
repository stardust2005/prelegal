import pytest

from app.auth import create_user
from app.db import init_db
from app.document_history import list_generated_documents, save_generated_document


@pytest.fixture
def user_id(tmp_path, monkeypatch):
    db_path = tmp_path / "app.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    init_db(str(db_path))
    return create_user("a@example.com", "correct-horse")


def test_save_generated_document_appears_in_the_users_history(user_id):
    save_generated_document(user_id, "mutual-nda", {"proposito": "Evaluar una alianza"})

    history = list_generated_documents(user_id)

    assert len(history) == 1
    assert history[0]["document_id"] == "mutual-nda"
    assert history[0]["values"] == {"proposito": "Evaluar una alianza"}


def test_save_generated_document_overwrites_the_same_document_for_the_same_user(user_id):
    save_generated_document(user_id, "mutual-nda", {"proposito": "Primera version"})
    save_generated_document(user_id, "mutual-nda", {"proposito": "Version final"})

    history = list_generated_documents(user_id)

    assert len(history) == 1
    assert history[0]["values"] == {"proposito": "Version final"}


def test_list_generated_documents_only_returns_the_given_users_documents(user_id):
    other_user_id = create_user("b@example.com", "correct-horse")
    save_generated_document(other_user_id, "mutual-nda", {"proposito": "De otro usuario"})

    assert list_generated_documents(user_id) == []
