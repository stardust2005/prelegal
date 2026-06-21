import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentPreview from "@/components/DocumentPreview";
import { DocumentDetail } from "@/types/document";

const DOCUMENT: DocumentDetail = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description: "...",
  fields: { proposito: "Propósito", ley_aplicable: "Ley Aplicable" },
  body: [
    "# Términos Estándar",
    "",
    '1. **Introducción**. Esto es para el {{proposito}} de las partes.',
    "    1. Sub-cláusula con {{ley_aplicable}}.",
  ].join("\n"),
};

describe("DocumentPreview", () => {
  it("renders the document heading", () => {
    render(<DocumentPreview document={DOCUMENT} values={{}} />);
    expect(screen.getByRole("heading", { name: "Términos Estándar" })).toBeInTheDocument();
  });

  it("renders filled placeholder values inline", () => {
    render(<DocumentPreview document={DOCUMENT} values={{ proposito: "Evaluar una alianza" }} />);
    expect(screen.getByText(/Evaluar una alianza/)).toBeInTheDocument();
  });

  it("falls back to a bracketed field label when a value is missing", () => {
    render(<DocumentPreview document={DOCUMENT} values={{}} />);
    expect(screen.getByText(/\[Ley Aplicable\]/)).toBeInTheDocument();
  });

  it("renders nested list items with visible markers", () => {
    render(<DocumentPreview document={DOCUMENT} values={{}} />);
    expect(screen.getByText(/Sub-cláusula con/)).toBeInTheDocument();
  });
});
