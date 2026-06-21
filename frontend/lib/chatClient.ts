import { ChatMessage } from "@/types/chat";
import { NdaFormData } from "@/types/nda";

interface ChatTurnResult {
  reply: string;
  values: NdaFormData;
}

export async function sendChatTurn(
  messages: ChatMessage[],
  values: NdaFormData
): Promise<ChatTurnResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, values }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  return response.json();
}
