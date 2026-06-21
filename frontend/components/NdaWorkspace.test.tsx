import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaWorkspace from "@/components/NdaWorkspace";
import { NdaFormData } from "@/types/nda";

vi.mock("@/lib/generatePdf", () => ({ downloadNdaPdf: vi.fn() }));

const COMPLETE_VALUES: NdaFormData = {
  partyAName: "Acme",
  partyAAddress: "Addr A",
  partyASignatory: "Jane",
  partyBName: "Beta",
  partyBAddress: "Addr B",
  partyBSignatory: "John",
  purpose: "Purpose",
  effectiveDate: "Today",
  mndaTerm: "2 years",
  termOfConfidentiality: "3 years",
  governingLaw: "Delaware",
  jurisdiction: "Wilmington",
};

vi.mock("@/components/NdaChat", () => ({
  default: ({ onValuesChange }: { onValuesChange: (values: NdaFormData) => void }) => (
    <button onClick={() => onValuesChange(COMPLETE_VALUES)}>complete chat</button>
  ),
}));

describe("NdaWorkspace", () => {
  it("disables the download button until the chat reports all fields filled", async () => {
    render(<NdaWorkspace />);
    expect(screen.getByRole("button", { name: /descargar como pdf/i })).toBeDisabled();

    const user = userEvent.setup();
    await user.click(screen.getByText("complete chat"));

    expect(screen.getByRole("button", { name: /descargar como pdf/i })).toBeEnabled();
  });
});
