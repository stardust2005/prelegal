import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/LoginForm";
import { login } from "@/lib/authClient";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/authClient", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
    mockedLogin.mockReset();
  });

  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("logs in with the typed credentials and navigates to the platform on success", async () => {
    mockedLogin.mockResolvedValue({ email: "a@example.com" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(mockedLogin).toHaveBeenCalledWith("a@example.com", "correct-horse");
    expect(push).toHaveBeenCalledWith("/app/");
  });

  it("shows an error message and does not navigate when login fails", async () => {
    mockedLogin.mockRejectedValue(new Error("Correo o contraseña incorrectos."));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "wrong");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
    expect(push).not.toHaveBeenCalled();
  });

  it("links to the registration page", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: /regístrate/i })).toHaveAttribute("href", "/register");
  });
});
