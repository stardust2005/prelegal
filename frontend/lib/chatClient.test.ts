import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatTurn } from "@/lib/chatClient";
import { EMPTY_NDA_FORM_DATA } from "@/types/nda";

describe("sendChatTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the message history and current values to /api/chat", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Hola", values: EMPTY_NDA_FORM_DATA }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Hola" }];
    await sendChatTurn(messages, EMPTY_NDA_FORM_DATA);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, values: EMPTY_NDA_FORM_DATA }),
      })
    );
  });

  it("returns the parsed reply and values from a successful response", async () => {
    const updatedValues = { ...EMPTY_NDA_FORM_DATA, purpose: "Evaluar una alianza" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reply: "¿Cuál es el propósito?", values: updatedValues }),
      })
    );

    const result = await sendChatTurn([], EMPTY_NDA_FORM_DATA);

    expect(result).toEqual({ reply: "¿Cuál es el propósito?", values: updatedValues });
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(sendChatTurn([], EMPTY_NDA_FORM_DATA)).rejects.toThrow();
  });
});
