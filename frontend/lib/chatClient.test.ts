import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatTurn } from "@/lib/chatClient";

describe("sendChatTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the message history, document id and current values to /api/chat", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Hola", document_id: null, values: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Hola" }];
    await sendChatTurn(messages, null, {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, document_id: null, values: {} }),
      })
    );
  });

  it("returns the parsed reply, documentId and values from a successful response", async () => {
    const updatedValues = { proposito: "Evaluar una alianza" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: "¿Cuál es la ley aplicable?",
          document_id: "mutual-nda",
          values: updatedValues,
        }),
      })
    );

    const result = await sendChatTurn([], "mutual-nda", {});

    expect(result).toEqual({
      reply: "¿Cuál es la ley aplicable?",
      documentId: "mutual-nda",
      values: updatedValues,
    });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(sendChatTurn([], null, {})).rejects.toThrow();
  });
});
