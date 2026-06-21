import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/components/RegisterForm";
import { register } from "@/lib/authClient";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/authClient", () => ({
  register: vi.fn(),
}));

const mockedRegister = vi.mocked(register);

describe("RegisterForm", () => {
  beforeEach(() => {
    push.mockClear();
    mockedRegister.mockReset();
  });

  it("renders email, password and confirm-password fields and a submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("registers with the typed credentials and navigates to the platform on success", async () => {
    mockedRegister.mockResolvedValue({ email: "a@example.com" });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "correct-horse");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(mockedRegister).toHaveBeenCalledWith("a@example.com", "correct-horse");
    expect(push).toHaveBeenCalledWith("/app/");
  });

  it("shows an error and does not call register when the passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "correct-horse");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "something-else");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no coinciden/i);
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("shows the backend error message and does not navigate when registration fails", async () => {
    mockedRegister.mockRejectedValue(new Error("Ese correo ya está registrado."));
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "correct-horse");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ese correo ya está registrado.");
    expect(push).not.toHaveBeenCalled();
  });
});
