"use client";

import { useRef, useState } from "react";
import DocumentChat from "@/components/DocumentChat";
import DocumentPreview from "@/components/DocumentPreview";
import Button from "@/components/ui/Button";
import { fetchDocumentDetail } from "@/lib/documentClient";
import { downloadDocumentPdf } from "@/lib/generateDocumentPdf";
import { DocumentDetail, DocumentValues } from "@/types/document";

export default function DocumentWorkspace() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [values, setValues] = useState<DocumentValues>({});
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const latestDocumentIdRef = useRef<string | null>(null);

  const isComplete =
    documentDetail !== null &&
    Object.keys(documentDetail.fields).every((key) => values[key]?.trim());

  function handleTurn({
    documentId: nextId,
    values: nextValues,
  }: {
    documentId: string | null;
    values: DocumentValues;
  }) {
    if (nextId === documentId) {
      setValues(nextValues);
      return;
    }

    setDocumentId(nextId);
    setValues({});
    setDocumentDetail(null);
    latestDocumentIdRef.current = nextId;

    if (nextId) {
      fetchDocumentDetail(nextId).then((detail) => {
        if (latestDocumentIdRef.current === nextId) setDocumentDetail(detail);
      });
    }
  }

  async function handleDownload() {
    if (!documentDetail) return;
    setIsDownloading(true);
    try {
      await downloadDocumentPdf(documentDetail, values);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      <section className="flex rounded-lg border border-zinc-200 bg-white p-6">
        <DocumentChat documentId={documentId} values={values} onTurn={handleTurn} />
      </section>

      <section className="flex flex-col gap-4">
        <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-navy">
          Este documento es un borrador generado automáticamente y debe ser revisado por un
          profesional legal antes de su uso.
        </p>

        <Button
          type="button"
          variant="primary"
          onClick={handleDownload}
          disabled={isDownloading || !isComplete}
          className="self-start"
        >
          {isDownloading ? "Generando PDF…" : "Descargar como PDF"}
        </Button>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          {documentDetail ? (
            <DocumentPreview document={documentDetail} values={values} />
          ) : (
            <p className="text-sm text-zinc-500">
              Cuéntame en el chat qué documento necesitas para empezar.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
