import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHistory } from "@/lib/historyClient";

describe("fetchHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the saved documents from /api/history and maps them to camelCase", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          document_id: "mutual-nda",
          document_name: "Mutual Non-Disclosure Agreement",
          values: { proposito: "Evaluar una alianza" },
          created_at: "2026-06-21T20:00:00",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchHistory();

    expect(fetchMock).toHaveBeenCalledWith("/api/history");
    expect(result).toEqual([
      {
        documentId: "mutual-nda",
        documentName: "Mutual Non-Disclosure Agreement",
        values: { proposito: "Evaluar una alianza" },
        createdAt: "2026-06-21T20:00:00",
      },
    ]);
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(fetchHistory()).rejects.toThrow();
  });
});
