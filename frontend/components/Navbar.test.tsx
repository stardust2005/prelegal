import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("shows the brand, the logged-in user's email and a link to the document history", () => {
    render(<Navbar email="a@example.com" onLogout={vi.fn()} />);

    expect(screen.getByText("PreLegal")).toBeInTheDocument();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mis documentos/i })).toHaveAttribute(
      "href",
      "/app/documents"
    );
  });

  it("calls onLogout when the logout button is clicked", async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(<Navbar email="a@example.com" onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(onLogout).toHaveBeenCalled();
  });
});
