import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryList from "@/components/HistoryList";
import { fetchDocumentDetail } from "@/lib/documentClient";
import { downloadDocumentPdf } from "@/lib/generateDocumentPdf";
import { fetchHistory } from "@/lib/historyClient";

vi.mock("@/lib/historyClient", () => ({ fetchHistory: vi.fn() }));
vi.mock("@/lib/documentClient", () => ({ fetchDocumentDetail: vi.fn() }));
vi.mock("@/lib/generateDocumentPdf", () => ({ downloadDocumentPdf: vi.fn() }));

const mockedFetchHistory = vi.mocked(fetchHistory);
const mockedFetchDocumentDetail = vi.mocked(fetchDocumentDetail);
const mockedDownloadDocumentPdf = vi.mocked(downloadDocumentPdf);

const MUTUAL_NDA_DETAIL = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description: "...",
  fields: { proposito: "Propósito" },
  body: "...",
};

describe("HistoryList", () => {
  beforeEach(() => {
    mockedFetchHistory.mockReset();
    mockedFetchDocumentDetail.mockReset();
    mockedDownloadDocumentPdf.mockReset();
  });

  it("shows a message when there is no saved document yet", async () => {
    mockedFetchHistory.mockResolvedValue([]);

    render(<HistoryList />);

    expect(await screen.findByText(/todavía no has generado/i)).toBeInTheDocument();
  });

  it("lists each saved document by name and creation date without fetching the document detail", async () => {
    mockedFetchHistory.mockResolvedValue([
      {
        documentId: "mutual-nda",
        documentName: "Mutual Non-Disclosure Agreement",
        values: { proposito: "Evaluar una alianza" },
        createdAt: "2026-06-21T20:00:00",
      },
    ]);

    render(<HistoryList />);

    expect(await screen.findByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
    expect(screen.getByText("2026-06-21T20:00:00")).toBeInTheDocument();
    expect(mockedFetchDocumentDetail).not.toHaveBeenCalled();
  });

  it("downloads the PDF with the saved values when clicked", async () => {
    mockedFetchHistory.mockResolvedValue([
      {
        documentId: "mutual-nda",
        documentName: "Mutual Non-Disclosure Agreement",
        values: { proposito: "Evaluar una alianza" },
        createdAt: "2026-06-21T20:00:00",
      },
    ]);
    mockedFetchDocumentDetail.mockResolvedValue(MUTUAL_NDA_DETAIL);
    const user = userEvent.setup();

    render(<HistoryList />);

    const downloadButton = await screen.findByRole("button", { name: /descargar de nuevo/i });
    await user.click(downloadButton);

    await waitFor(() =>
      expect(mockedDownloadDocumentPdf).toHaveBeenCalledWith(MUTUAL_NDA_DETAIL, {
        proposito: "Evaluar una alianza",
      })
    );
  });
});
