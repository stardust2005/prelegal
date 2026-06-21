"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatTurn } from "@/lib/chatClient";
import { ChatMessage } from "@/types/chat";
import { DocumentValues } from "@/types/document";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hola, cuéntame qué documento legal necesitas (por ejemplo, un acuerdo de confidencialidad, un contrato de servicios, una licencia de software…) y te iré guiando para completarlo.",
};

const ERROR_FALLBACK_MESSAGE = "Hubo un problema al contactar con el asistente. Inténtalo de nuevo.";

interface DocumentChatProps {
  documentId: string | null;
  values: DocumentValues;
  onTurn: (result: { documentId: string | null; values: DocumentValues }) => void;
}

export default function DocumentChat({ documentId, values, onTurn }: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isSending) inputRef.current?.focus();
  }, [isSending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendChatTurn(nextMessages, documentId, values);
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      onTurn({ documentId: result.documentId, values: result.values });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: ERROR_FALLBACK_MESSAGE }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex max-h-[28rem] flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4"
      >
        {messages.map((message, i) => (
          <p
            key={i}
            className={[
              "max-w-[85%] rounded-md px-3 py-2 text-sm",
              message.role === "assistant"
                ? "self-start bg-zinc-100 text-zinc-900"
                : "self-end bg-[#209dd7] text-white",
            ].join(" ")}
          >
            {message.content}
          </p>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          placeholder="Escribe tu respuesta…"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#209dd7] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white hover:bg-[#5f2d75] disabled:opacity-50"
        >
          {isSending ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
