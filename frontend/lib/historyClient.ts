import { SavedDocument } from "@/types/document";

export async function fetchHistory(): Promise<SavedDocument[]> {
  const response = await fetch("/api/history");

  if (!response.ok) {
    throw new Error("History request failed");
  }

  const body = await response.json();
  return body.map(
    (item: {
      document_id: string;
      document_name: string;
      values: Record<string, string>;
      created_at: string;
    }) => ({
      documentId: item.document_id,
      documentName: item.document_name,
      values: item.values,
      createdAt: item.created_at,
    })
  );
}
