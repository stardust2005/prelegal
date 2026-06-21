import sqlite3

from app.db import init_db


def test_init_db_creates_users_table(tmp_path):
    db_path = tmp_path / "app.db"

    init_db(str(db_path))

    connection = sqlite3.connect(db_path)
    columns = {row[1] for row in connection.execute("PRAGMA table_info(users)")}
    connection.close()

    assert columns == {"id", "email", "password_hash", "created_at"}


def test_init_db_wipes_existing_data_on_each_call(tmp_path):
    db_path = tmp_path / "app.db"

    init_db(str(db_path))
    connection = sqlite3.connect(db_path)
    connection.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        ("a@example.com", "hash"),
    )
    connection.commit()
    connection.close()

    init_db(str(db_path))

    connection = sqlite3.connect(db_path)
    count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    connection.close()

    assert count == 0


def test_init_db_creates_sessions_table(tmp_path):
    db_path = tmp_path / "app.db"

    init_db(str(db_path))

    connection = sqlite3.connect(db_path)
    columns = {row[1] for row in connection.execute("PRAGMA table_info(sessions)")}
    connection.close()

    assert columns == {"token", "user_id", "created_at"}


def test_init_db_creates_documents_table(tmp_path):
    db_path = tmp_path / "app.db"

    init_db(str(db_path))

    connection = sqlite3.connect(db_path)
    columns = {row[1] for row in connection.execute("PRAGMA table_info(documents)")}
    connection.close()

    assert columns == {"id", "user_id", "document_id", "values_json", "created_at"}
