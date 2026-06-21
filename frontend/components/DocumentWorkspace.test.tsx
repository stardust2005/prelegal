import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentWorkspace from "@/components/DocumentWorkspace";
import { fetchDocumentDetail } from "@/lib/documentClient";
import { downloadDocumentPdf } from "@/lib/generateDocumentPdf";
import { DocumentDetail, DocumentValues } from "@/types/document";

vi.mock("@/lib/documentClient", () => ({ fetchDocumentDetail: vi.fn() }));
vi.mock("@/lib/generateDocumentPdf", () => ({ downloadDocumentPdf: vi.fn() }));

const mockedFetchDocumentDetail = vi.mocked(fetchDocumentDetail);
const mockedDownloadDocumentPdf = vi.mocked(downloadDocumentPdf);

let latestOnTurn: (result: { documentId: string | null; values: DocumentValues }) => void;

vi.mock("@/components/DocumentChat", () => ({
  default: ({ onTurn }: { onTurn: typeof latestOnTurn }) => {
    latestOnTurn = onTurn;
    return <div data-testid="document-chat" />;
  },
}));

const MUTUAL_NDA: DocumentDetail = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description: "...",
  fields: { proposito: "Propósito", ley_aplicable: "Ley Aplicable" },
  body: "# Términos Estándar\n\n1. {{proposito}} y {{ley_aplicable}}.",
};

const AI_ADDENDUM: DocumentDetail = {
  id: "ai-addendum",
  name: "AI Addendum",
  description: "...",
  fields: { cliente: "Cliente" },
  body: "# Anexo de IA\n\n1. {{cliente}}.",
};

describe("DocumentWorkspace", () => {
  beforeEach(() => {
    mockedFetchDocumentDetail.mockReset();
    mockedDownloadDocumentPdf.mockReset();
  });

  it("shows an empty-state placeholder and a disabled download button before any document is resolved", () => {
    render(<DocumentWorkspace />);

    expect(screen.getByRole("button", { name: /descargar como pdf/i })).toBeDisabled();
    expect(screen.queryByText(/términos estándar/i)).not.toBeInTheDocument();
  });

  it("fetches and renders the document detail once the chat resolves a documentId", async () => {
    mockedFetchDocumentDetail.mockResolvedValue(MUTUAL_NDA);
    render(<DocumentWorkspace />);

    latestOnTurn({ documentId: "mutual-nda", values: {} });

    await waitFor(() => expect(mockedFetchDocumentDetail).toHaveBeenCalledWith("mutual-nda"));
    expect(await screen.findByRole("heading", { name: "Términos Estándar" })).toBeInTheDocument();
  });

  it("updates the preview values on a same-document turn without refetching the document", async () => {
    mockedFetchDocumentDetail.mockResolvedValue(MUTUAL_NDA);
    render(<DocumentWorkspace />);

    latestOnTurn({ documentId: "mutual-nda", values: {} });
    await screen.findByRole("heading", { name: "Términos Estándar" });

    latestOnTurn({ documentId: "mutual-nda", values: { proposito: "Evaluar una alianza" } });

    expect(await screen.findByText(/Evaluar una alianza/)).toBeInTheDocument();
    expect(mockedFetchDocumentDetail).toHaveBeenCalledTimes(1);
  });

  it("resets values and refetches when the chat switches to a different document", async () => {
    mockedFetchDocumentDetail.mockResolvedValueOnce(MUTUAL_NDA).mockResolvedValueOnce(AI_ADDENDUM);
    render(<DocumentWorkspace />);

    latestOnTurn({ documentId: "mutual-nda", values: { proposito: "Evaluar una alianza" } });
    await screen.findByRole("heading", { name: "Términos Estándar" });

    latestOnTurn({ documentId: "ai-addendum", values: {} });

    expect(await screen.findByRole("heading", { name: "Anexo de IA" })).toBeInTheDocument();
    expect(screen.queryByText(/Evaluar una alianza/)).not.toBeInTheDocument();
    expect(mockedFetchDocumentDetail).toHaveBeenCalledTimes(2);
  });

  it("enables the download button only when every field of the resolved document is filled", async () => {
    mockedFetchDocumentDetail.mockResolvedValue(MUTUAL_NDA);
    render(<DocumentWorkspace />);

    latestOnTurn({ documentId: "mutual-nda", values: { proposito: "Evaluar una alianza" } });
    await screen.findByRole("heading", { name: "Términos Estándar" });
    expect(screen.getByRole("button", { name: /descargar como pdf/i })).toBeDisabled();

    latestOnTurn({
      documentId: "mutual-nda",
      values: { proposito: "Evaluar una alianza", ley_aplicable: "España" },
    });

    expect(await screen.findByRole("button", { name: /descargar como pdf/i })).toBeEnabled();
  });

  it("downloads the PDF with the current document and values when clicked", async () => {
    mockedFetchDocumentDetail.mockResolvedValue(MUTUAL_NDA);
    const user = userEvent.setup();
    render(<DocumentWorkspace />);

    latestOnTurn({ documentId: "mutual-nda", values: {} });
    await screen.findByRole("heading", { name: "Términos Estándar" });

    const completeValues = { proposito: "Evaluar una alianza", ley_aplicable: "España" };
    latestOnTurn({ documentId: "mutual-nda", values: completeValues });
    const downloadButton = await screen.findByRole("button", { name: /descargar como pdf/i });
    await waitFor(() => expect(downloadButton).toBeEnabled());

    await user.click(downloadButton);

    expect(mockedDownloadDocumentPdf).toHaveBeenCalledWith(MUTUAL_NDA, completeValues);
  });
});
