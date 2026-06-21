import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDocumentDetail } from "@/lib/documentClient";

describe("fetchDocumentDetail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the document detail from /api/documents/{id}", async () => {
    const detail = {
      id: "mutual-nda",
      name: "Mutual Non-Disclosure Agreement",
      description: "...",
      fields: { proposito: "Propósito" },
      body: "# Términos Estándar\n\n1. {{proposito}}",
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => detail });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDocumentDetail("mutual-nda");

    expect(fetchMock).toHaveBeenCalledWith("/api/documents/mutual-nda");
    expect(result).toEqual(detail);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(fetchDocumentDetail("unknown")).rejects.toThrow();
  });
});
