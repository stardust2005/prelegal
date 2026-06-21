import type { Metadata } from "next";
import NdaWorkspace from "@/components/NdaWorkspace";

export const metadata: Metadata = {
  title: "Generador de NDA Mutuo | PreLegal",
  description:
    "Genera un Acuerdo de Confidencialidad Mutuo de Common Paper a partir de un formulario sencillo y descárgalo como PDF.",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">Generador de NDA Mutuo</h1>
        <p className="text-sm text-zinc-600">
          Completa los datos a continuación para generar un Acuerdo de Confidencialidad Mutuo de
          Common Paper, y descárgalo como PDF.
        </p>
      </header>

      <NdaWorkspace />
    </div>
  );
}
