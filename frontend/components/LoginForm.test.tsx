import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/LoginForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("navigates to the platform on submit, even with empty fields", async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(push).toHaveBeenCalledWith("/app/");
  });
});
