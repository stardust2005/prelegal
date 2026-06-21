"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { fetchDocumentDetail } from "@/lib/documentClient";
import { downloadDocumentPdf } from "@/lib/generateDocumentPdf";
import { fetchHistory } from "@/lib/historyClient";
import { SavedDocument } from "@/types/document";

export default function HistoryList() {
  const [documents, setDocuments] = useState<SavedDocument[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory().then(setDocuments);
  }, []);

  async function handleDownload(saved: SavedDocument) {
    setDownloadingId(saved.documentId);
    try {
      const detail = await fetchDocumentDetail(saved.documentId);
      await downloadDocumentPdf(detail, saved.values);
    } finally {
      setDownloadingId(null);
    }
  }

  if (documents === null) {
    return <p className="text-sm text-muted">Cargando…</p>;
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted">Todavía no has generado ningún documento.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((saved) => (
        <li
          key={saved.documentId}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
        >
          <div>
            <p className="font-medium text-navy">{saved.documentName}</p>
            <p className="text-xs text-muted">{saved.createdAt}</p>
          </div>
          <Button
            type="button"
            onClick={() => handleDownload(saved)}
            disabled={downloadingId === saved.documentId}
          >
            {downloadingId === saved.documentId ? "Generando…" : "Descargar de nuevo"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
