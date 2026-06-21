import { DocumentDetail } from "@/types/document";

export async function fetchDocumentDetail(documentId: string): Promise<DocumentDetail> {
  const response = await fetch(`/api/documents/${documentId}`);

  if (!response.ok) {
    throw new Error("Document detail request failed");
  }

  return response.json();
}
