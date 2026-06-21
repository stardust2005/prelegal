import { ChatMessage } from "@/types/chat";
import { DocumentValues } from "@/types/document";

interface ChatTurnResult {
  reply: string;
  documentId: string | null;
  values: DocumentValues;
}

export async function sendChatTurn(
  messages: ChatMessage[],
  documentId: string | null,
  values: DocumentValues
): Promise<ChatTurnResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, document_id: documentId, values }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  const body = await response.json();
  return { reply: body.reply, documentId: body.document_id, values: body.values };
}
