import os
import sqlite3

DEFAULT_DB_PATH = os.environ.get("DATABASE_PATH", "data/app.db")


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    if os.path.exists(db_path):
        os.remove(db_path)

    connection = sqlite3.connect(db_path)
    connection.execute(
        """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    connection.commit()
    connection.close()
