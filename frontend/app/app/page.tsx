import type { Metadata } from "next";
import DocumentWorkspace from "@/components/DocumentWorkspace";

export const metadata: Metadata = {
  title: "Generador de Documentos Legales | PreLegal",
  description:
    "Describe en un chat con IA el documento legal que necesitas y descárgalo como PDF.",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">Generador de Documentos Legales</h1>
        <p className="text-sm text-zinc-600">
          Cuéntale al asistente qué documento necesitas, responde a sus preguntas y
          descárgalo como PDF.
        </p>
      </header>

      <DocumentWorkspace />
    </div>
  );
}
