import { describe, expect, it } from "vitest";
import { parseInlineSegments, parseMarkdownBlocks } from "@/lib/markdown";

const LABELS = {
  proposito: "Propósito",
  ley_aplicable: "Ley Aplicable",
  jurisdiccion: "Jurisdicción",
  importe_maximo: "Importe Máximo General",
};

describe("parseInlineSegments", () => {
  it("returns a single plain segment for text with no markup", () => {
    expect(parseInlineSegments("Plain text only.", {}, LABELS)).toEqual([
      { text: "Plain text only." },
    ]);
  });

  it("marks bold-delimited text as bold and strips the ** markers", () => {
    expect(parseInlineSegments("before **BOLD** after", {}, LABELS)).toEqual([
      { text: "before " },
      { text: "BOLD", bold: true },
      { text: " after" },
    ]);
  });

  it("substitutes a placeholder with the provided value and marks it filled", () => {
    expect(
      parseInlineSegments("Use for the {{proposito}}.", { proposito: "Testing" }, LABELS)
    ).toEqual([{ text: "Use for the " }, { text: "Testing", filled: true }, { text: "." }]);
  });

  it("falls back to a bracketed field label when the value is missing", () => {
    expect(parseInlineSegments("{{proposito}}", {}, LABELS)).toEqual([
      { text: "[Propósito]", filled: true },
    ]);
  });

  it("falls back to the bracketed label when the value is whitespace-only", () => {
    expect(parseInlineSegments("{{ley_aplicable}}", { ley_aplicable: "   " }, LABELS)).toEqual([
      { text: "[Ley Aplicable]", filled: true },
    ]);
  });

  it("trims surrounding whitespace from a provided value", () => {
    expect(
      parseInlineSegments("{{jurisdiccion}}", { jurisdiccion: "  Delaware  " }, LABELS)
    ).toEqual([{ text: "Delaware", filled: true }]);
  });

  it("handles a placeholder nested inside bold markup", () => {
    expect(
      parseInlineSegments(
        "**no excederá el {{importe_maximo}}.**",
        { importe_maximo: "10.000 USD" },
        LABELS
      )
    ).toEqual([
      { text: "no excederá el ", bold: true },
      { text: "10.000 USD", bold: true, filled: true },
      { text: ".", bold: true },
    ]);
  });

  it("parses a markdown link into a segment with href", () => {
    expect(
      parseInlineSegments("Ver [Versión 1.0](https://example.com/v1) para más detalles.", {}, LABELS)
    ).toEqual([
      { text: "Ver " },
      { text: "Versión 1.0", href: "https://example.com/v1" },
      { text: " para más detalles." },
    ]);
  });

  it("substitutes every occurrence of a repeated placeholder", () => {
    const segments = parseInlineSegments(
      "{{jurisdiccion}} and {{jurisdiccion}}",
      { jurisdiccion: "Madrid" },
      LABELS
    );
    const filled = segments.filter((s) => s.filled);
    expect(filled).toHaveLength(2);
    expect(filled.every((s) => s.text === "Madrid")).toBe(true);
  });

  it("returns an empty array for empty input", () => {
    expect(parseInlineSegments("", {}, LABELS)).toEqual([]);
  });
});

describe("parseMarkdownBlocks", () => {
  it("parses a top-level # heading", () => {
    expect(parseMarkdownBlocks("# Términos Estándar")).toEqual([
      { type: "heading", level: 1, text: "Términos Estándar" },
    ]);
  });

  it("parses a depth-0 numbered list item", () => {
    expect(parseMarkdownBlocks("1. Introducción al acuerdo.")).toEqual([
      { type: "list-item", depth: 0, marker: "1", text: "Introducción al acuerdo." },
    ]);
  });

  it("parses a depth-1 nested numbered list item (4-space indent)", () => {
    expect(parseMarkdownBlocks("    1. Uso de los Servicios de IA.")).toEqual([
      { type: "list-item", depth: 1, marker: "1", text: "Uso de los Servicios de IA." },
    ]);
  });

  it("parses a depth-2 lettered list item (8-space indent)", () => {
    expect(parseMarkdownBlocks("        a. Honorarios y Facturación.")).toEqual([
      { type: "list-item", depth: 2, marker: "a", text: "Honorarios y Facturación." },
    ]);
  });

  it("parses a multi-letter roman numeral list marker (e.g. ii., iii.)", () => {
    expect(parseMarkdownBlocks("            ii. En la Cláusula 9, se aplica la Opción 2.")).toEqual([
      { type: "list-item", depth: 3, marker: "ii", text: "En la Cláusula 9, se aplica la Opción 2." },
    ]);
  });

  it("parses a plain line as a paragraph", () => {
    expect(parseMarkdownBlocks("Acuerdo de Common Paper, de uso libre.")).toEqual([
      { type: "paragraph", text: "Acuerdo de Common Paper, de uso libre." },
    ]);
  });

  it("ignores blank lines between blocks", () => {
    const blocks = parseMarkdownBlocks("# Título\n\n1. Primero\n\n2. Segundo");
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Título" },
      { type: "list-item", depth: 0, marker: "1", text: "Primero" },
      { type: "list-item", depth: 0, marker: "2", text: "Segundo" },
    ]);
  });

  it("returns an empty array for an empty body", () => {
    expect(parseMarkdownBlocks("")).toEqual([]);
  });

  it("parses real-world nested structure (heading, depth-0, depth-1, depth-2)", () => {
    const body = [
      "# Acuerdo de Colaboración Comercial",
      "",
      "1. Cooperación",
      "    1. Obligaciones. Cada parte cumplirá.",
      "2. Pago e Impuestos",
      "    1. Si las obligaciones incluyen pago:",
      "        a. Honorarios y Facturación.",
      "        b. Pago.",
    ].join("\n");

    const blocks = parseMarkdownBlocks(body);

    expect(blocks[0]).toEqual({ type: "heading", level: 1, text: "Acuerdo de Colaboración Comercial" });
    expect(blocks.filter((b) => b.type === "list-item" && b.depth === 0)).toHaveLength(2);
    expect(blocks.filter((b) => b.type === "list-item" && b.depth === 1)).toHaveLength(2);
    expect(blocks.filter((b) => b.type === "list-item" && b.depth === 2)).toHaveLength(2);
  });
});
