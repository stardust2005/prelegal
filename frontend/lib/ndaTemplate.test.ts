import { describe, expect, it } from "vitest";
import { EMPTY_NDA_FORM_DATA, NdaFormData } from "@/types/nda";
import { NDA_CLAUSES, getClauseSegments } from "@/lib/ndaTemplate";

function values(overrides: Partial<NdaFormData> = {}): NdaFormData {
  return { ...EMPTY_NDA_FORM_DATA, ...overrides };
}

describe("getClauseSegments", () => {
  it("returns a single plain segment for text with no bold or placeholders", () => {
    expect(getClauseSegments("Plain text only.", values())).toEqual([
      { text: "Plain text only.", bold: false },
    ]);
  });

  it("marks bold-delimited text as bold and strips the ** markers", () => {
    expect(getClauseSegments("before **BOLD** after", values())).toEqual([
      { text: "before ", bold: false },
      { text: "BOLD", bold: true },
      { text: " after", bold: false },
    ]);
  });

  it("substitutes a placeholder with the provided value and marks it filled", () => {
    expect(getClauseSegments("Use for the {{purpose}}.", values({ purpose: "Testing" }))).toEqual(
      [
        { text: "Use for the ", bold: false },
        { text: "Testing", bold: false, filled: true },
        { text: ".", bold: false },
      ]
    );
  });

  it("falls back to a bracketed placeholder label when the value is empty", () => {
    expect(getClauseSegments("{{purpose}}", values())).toEqual([
      { text: "[Purpose]", bold: false, filled: true },
    ]);
  });

  it("falls back to the bracketed label when the value is whitespace-only", () => {
    expect(getClauseSegments("{{governingLaw}}", values({ governingLaw: "   " }))).toEqual([
      { text: "[Governing Law]", bold: false, filled: true },
    ]);
  });

  it("trims surrounding whitespace from a provided value", () => {
    expect(getClauseSegments("{{jurisdiction}}", values({ jurisdiction: "  Delaware  " }))).toEqual([
      { text: "Delaware", bold: false, filled: true },
    ]);
  });

  it("handles bold and placeholder tokens combined in the same clause", () => {
    expect(
      getClauseSegments("Hello **World** {{purpose}} end", values({ purpose: "Testing" }))
    ).toEqual([
      { text: "Hello ", bold: false },
      { text: "World", bold: true },
      { text: " ", bold: false },
      { text: "Testing", bold: false, filled: true },
      { text: " end", bold: false },
    ]);
  });

  it("substitutes every occurrence of a placeholder repeated multiple times", () => {
    const segments = getClauseSegments(
      "{{jurisdiction}} and {{jurisdiction}} and {{jurisdiction}}",
      values({ jurisdiction: "Wilmington, Delaware" })
    );
    const filled = segments.filter((s) => s.filled);
    expect(filled).toHaveLength(3);
    expect(filled.every((s) => s.text === "Wilmington, Delaware")).toBe(true);
  });

  it("returns an empty array for an empty clause body", () => {
    expect(getClauseSegments("", values())).toEqual([]);
  });
});

describe("NDA_CLAUSES", () => {
  it("contains exactly 11 clauses numbered sequentially from 1", () => {
    expect(NDA_CLAUSES).toHaveLength(11);
    NDA_CLAUSES.forEach((clause, i) => {
      expect(clause.number).toBe(i + 1);
      expect(clause.title.length).toBeGreaterThan(0);
      expect(clause.body.length).toBeGreaterThan(0);
    });
  });

  it("substitutes Purpose into clause 1 (Introduction)", () => {
    const intro = NDA_CLAUSES[0];
    const text = getClauseSegments(intro.body, values({ purpose: "a pilot evaluation" }))
      .map((s) => s.text)
      .join("");
    expect(text).toContain("in connection with the a pilot evaluation which");
  });

  it("substitutes Effective Date, MNDA Term and Term of Confidentiality into clause 5", () => {
    const termClause = NDA_CLAUSES.find((c) => c.title === "Term and Termination")!;
    const text = getClauseSegments(
      termClause.body,
      values({
        effectiveDate: "June 21, 2026",
        mndaTerm: "2 years",
        termOfConfidentiality: "3 years",
      })
    )
      .map((s) => s.text)
      .join("");
    expect(text).toContain("commences on the June 21, 2026 and expires at the end of the 2 years");
    expect(text).toContain("survive for the 3 years");
  });

  it("substitutes Governing Law (x2) and Jurisdiction (x2) into clause 9", () => {
    const govClause = NDA_CLAUSES.find((c) => c.title === "Governing Law and Jurisdiction")!;
    const segments = getClauseSegments(
      govClause.body,
      values({ governingLaw: "Delaware", jurisdiction: "Wilmington, Delaware" })
    );
    const filled = segments.filter((s) => s.filled);
    expect(filled.filter((s) => s.text === "Delaware")).toHaveLength(2);
    expect(filled.filter((s) => s.text === "Wilmington, Delaware")).toHaveLength(2);
  });

  it("falls back to bracketed placeholders across every clause when the form is empty", () => {
    NDA_CLAUSES.forEach((clause) => {
      const segments = getClauseSegments(clause.body, values());
      segments
        .filter((s) => s.filled)
        .forEach((s) => {
          expect(s.text).toMatch(/^\[.+\]$/);
        });
    });
  });

  it("preserves clause content exactly aside from markdown/placeholder tokens", () => {
    const filled = values({
      purpose: "Purpose",
      effectiveDate: "Date",
      mndaTerm: "Term",
      termOfConfidentiality: "Confidentiality",
      governingLaw: "Law",
      jurisdiction: "Court",
    });
    NDA_CLAUSES.forEach((clause) => {
      const reconstructed = getClauseSegments(clause.body, filled)
        .map((s) => s.text)
        .join("");
      const expected = clause.body
        .replace(/\*\*/g, "")
        .replace(/\{\{purpose\}\}/g, "Purpose")
        .replace(/\{\{effectiveDate\}\}/g, "Date")
        .replace(/\{\{mndaTerm\}\}/g, "Term")
        .replace(/\{\{termOfConfidentiality\}\}/g, "Confidentiality")
        .replace(/\{\{governingLaw\}\}/g, "Law")
        .replace(/\{\{jurisdiction\}\}/g, "Court");
      expect(reconstructed).toBe(expected);
    });
  });
});
