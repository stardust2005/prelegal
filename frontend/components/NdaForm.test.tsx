import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaForm from "@/components/NdaForm";
import { EMPTY_NDA_FORM_DATA, NDA_FIELDS, NdaFormData } from "@/types/nda";

/** Mirrors the controlled-input wiring app/page.tsx uses, so typing behaves like in production. */
function StatefulNdaForm({ onChange }: { onChange: (key: keyof NdaFormData, value: string) => void }) {
  const [values, setValues] = useState(EMPTY_NDA_FORM_DATA);
  return (
    <NdaForm
      values={values}
      onChange={(key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        onChange(key, value);
      }}
    />
  );
}

describe("NdaForm", () => {
  it("renders one labeled input per field, grouped into three fieldsets", () => {
    render(<NdaForm values={EMPTY_NDA_FORM_DATA} onChange={vi.fn()} />);

    NDA_FIELDS.forEach((field) => {
      expect(screen.getByLabelText(field.label)).toBeInTheDocument();
    });

    expect(screen.getByRole("group", { name: "Party A" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Party B" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Agreement Terms" })).toBeInTheDocument();
  });

  it("groups fields under the correct fieldset", () => {
    render(<NdaForm values={EMPTY_NDA_FORM_DATA} onChange={vi.fn()} />);

    const partyAGroup = screen.getByRole("group", { name: "Party A" });
    expect(partyAGroup).toContainElement(screen.getByLabelText("Party A — Name"));
    expect(partyAGroup).toContainElement(screen.getByLabelText("Party A — Signatory"));

    const partyBGroup = screen.getByRole("group", { name: "Party B" });
    expect(partyBGroup).toContainElement(screen.getByLabelText("Party B — Name"));

    const termsGroup = screen.getByRole("group", { name: "Agreement Terms" });
    expect(termsGroup).toContainElement(screen.getByLabelText("Purpose"));
    expect(termsGroup).toContainElement(screen.getByLabelText("Jurisdiction"));
  });

  it("renders each field's current value from props", () => {
    render(
      <NdaForm
        values={{ ...EMPTY_NDA_FORM_DATA, purpose: "Existing purpose" }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Purpose")).toHaveValue("Existing purpose");
  });

  it("shows the configured placeholder text on each input", () => {
    render(<NdaForm values={EMPTY_NDA_FORM_DATA} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Purpose")).toHaveAttribute(
      "placeholder",
      "Evaluating a potential business relationship"
    );
  });

  it("calls onChange with the field key and accumulated value as the user types", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StatefulNdaForm onChange={onChange} />);

    await user.type(screen.getByLabelText("Party A — Name"), "Acme");

    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange.mock.calls.map((call) => call[1])).toEqual(["A", "Ac", "Acm", "Acme"]);
    onChange.mock.calls.forEach((call) => expect(call[0]).toBe("partyAName"));
    expect(screen.getByLabelText("Party A — Name")).toHaveValue("Acme");
  });

  it("does not call onChange for fields the user did not touch", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NdaForm values={EMPTY_NDA_FORM_DATA} onChange={onChange} />);

    await user.type(screen.getByLabelText("Jurisdiction"), "X");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("jurisdiction", "X");
  });
});
