import type { Metadata } from "next";
import HistoryList from "@/components/HistoryList";

export const metadata: Metadata = {
  title: "Mis Documentos | PreLegal",
  description: "Consulta y vuelve a descargar los documentos legales que has generado.",
};

export default function MyDocuments() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-navy">Mis Documentos</h1>
        <p className="text-sm text-muted">
          Aquí encontrarás los documentos que has generado anteriormente.
        </p>
      </header>

      <main className="p-6">
        <HistoryList />
      </main>
    </div>
  );
}
