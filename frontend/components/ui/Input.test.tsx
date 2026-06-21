import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renders with the given id, type and placeholder", () => {
    render(<Input id="email" type="email" placeholder="tu@correo.com" />);

    const input = screen.getByPlaceholderText("tu@correo.com");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("type", "email");
  });
});
