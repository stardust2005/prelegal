import json

from app.db import get_connection


def save_generated_document(user_id: int, document_id: str, values: dict[str, str]) -> None:
    connection = get_connection()
    try:
        connection.execute(
            """
            INSERT INTO documents (user_id, document_id, values_json)
            VALUES (?, ?, ?)
            ON CONFLICT (user_id, document_id)
            DO UPDATE SET values_json = excluded.values_json, created_at = CURRENT_TIMESTAMP
            """,
            (user_id, document_id, json.dumps(values)),
        )
        connection.commit()
    finally:
        connection.close()


def list_generated_documents(user_id: int) -> list[dict]:
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT document_id, values_json, created_at
            FROM documents
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (user_id,),
        ).fetchall()
        return [
            {
                "document_id": row["document_id"],
                "values": json.loads(row["values_json"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    finally:
        connection.close()
