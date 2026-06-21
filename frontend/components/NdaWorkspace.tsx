"use client";

import { useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaPreview from "@/components/NdaPreview";
import { downloadNdaPdf } from "@/lib/generatePdf";
import { EMPTY_NDA_FORM_DATA, NdaFormData } from "@/types/nda";

export default function NdaWorkspace() {
  const [values, setValues] = useState<NdaFormData>(EMPTY_NDA_FORM_DATA);
  const [isDownloading, setIsDownloading] = useState(false);

  function handleChange(key: keyof NdaFormData, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadNdaPdf(values);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <NdaForm values={values} onChange={handleChange} />
      </section>

      <section className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {isDownloading ? "Generando PDF…" : "Descargar como PDF"}
        </button>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <NdaPreview values={values} />
        </div>
      </section>
    </main>
  );
}
