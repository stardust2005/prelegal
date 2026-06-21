import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NdaPreview from "@/components/NdaPreview";
import { EMPTY_NDA_FORM_DATA } from "@/types/nda";
import { NDA_ATTRIBUTION, NDA_CLAUSES } from "@/lib/ndaTemplate";

describe("NdaPreview", () => {
  it("shows bracketed fallback placeholders for every field when the form is empty", () => {
    render(<NdaPreview values={EMPTY_NDA_FORM_DATA} />);

    expect(screen.getAllByText("[Name]")).toHaveLength(2);
    expect(screen.getAllByText("[Address]")).toHaveLength(2);
    expect(screen.getAllByText("Signatory: [Signatory]")).toHaveLength(2);

    // Each placeholder appears once in the cover-page summary plus once per
    // occurrence in the Standard Terms clause text (see lib/ndaTemplate.test.ts
    // for the exact per-clause counts).
    expect(screen.getAllByText("[Purpose]")).toHaveLength(4);
    expect(screen.getAllByText("[Effective Date]")).toHaveLength(2);
    expect(screen.getAllByText("[MNDA Term]")).toHaveLength(2);
    expect(screen.getAllByText("[Term of Confidentiality]")).toHaveLength(2);
    expect(screen.getAllByText("[Governing Law]")).toHaveLength(3);
    expect(screen.getAllByText("[Jurisdiction]")).toHaveLength(3);
  });

  it("renders the provided party and term values instead of fallbacks", () => {
    render(
      <NdaPreview
        values={{
          ...EMPTY_NDA_FORM_DATA,
          partyAName: "Acme, Inc.",
          partyAAddress: "123 Main St",
          partyASignatory: "Jane Smith",
          purpose: "Evaluating a partnership",
          governingLaw: "Delaware",
        }}
      />
    );

    expect(screen.getByText("Acme, Inc.")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Signatory: Jane Smith")).toBeInTheDocument();
    // "Delaware" appears in the cover-page summary and twice more in clause 9.
    expect(screen.getAllByText("Delaware").length).toBeGreaterThan(0);
    expect(screen.queryByText("[Governing Law]")).not.toBeInTheDocument();
  });

  it("renders all 11 standard-terms clauses with their numbers and titles", () => {
    render(<NdaPreview values={EMPTY_NDA_FORM_DATA} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(11);
    NDA_CLAUSES.forEach((clause) => {
      expect(screen.getByText(`${clause.number}. ${clause.title}.`)).toBeInTheDocument();
    });
  });

  it("includes the Common Paper CC BY 4.0 attribution", () => {
    render(<NdaPreview values={EMPTY_NDA_FORM_DATA} />);
    expect(screen.getByText(NDA_ATTRIBUTION)).toBeInTheDocument();
  });

  it("underlines the inline clause substitutions but not the cover-page summary or static text", () => {
    render(<NdaPreview values={{ ...EMPTY_NDA_FORM_DATA, governingLaw: "Delaware" }} />);

    // "Delaware" appears once in the cover-page <dd> summary and twice inline in clause 9.
    const occurrences = screen.getAllByText("Delaware");
    expect(occurrences).toHaveLength(3);

    const underlined = occurrences.filter((el) => el.classList.contains("underline"));
    const plain = occurrences.filter((el) => !el.classList.contains("underline"));
    expect(underlined).toHaveLength(2);
    expect(plain).toHaveLength(1);
    expect(plain[0].tagName).toBe("DD");

    expect(screen.getByText("Standard Terms")).not.toHaveClass("underline");
  });
});
