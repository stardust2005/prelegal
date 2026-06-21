import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("shows the legal disclaimer about draft documents", () => {
    render(<Footer />);

    expect(
      screen.getByText(/borradores.*revisad.*legal/i)
    ).toBeInTheDocument();
  });
});
