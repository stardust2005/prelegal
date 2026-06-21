import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppLayout from "@/app/app/layout";
import { fetchCurrentUser, logout } from "@/lib/authClient";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/authClient", () => ({
  fetchCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedLogout = vi.mocked(logout);

describe("AppLayout", () => {
  beforeEach(() => {
    replace.mockClear();
    mockedFetchCurrentUser.mockReset();
    mockedLogout.mockReset();
  });

  it("redirects to the login page when there is no logged-in user", async () => {
    mockedFetchCurrentUser.mockResolvedValue(null);

    render(
      <AppLayout>
        <p>Contenido protegido</p>
      </AppLayout>
    );

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("renders the navbar, the children and the footer when there is a logged-in user", async () => {
    mockedFetchCurrentUser.mockResolvedValue({ email: "a@example.com" });

    render(
      <AppLayout>
        <p>Contenido protegido</p>
      </AppLayout>
    );

    expect(await screen.findByText("Contenido protegido")).toBeInTheDocument();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(screen.getByText(/borradores/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("logs out and redirects to the login page when the logout button is clicked", async () => {
    mockedFetchCurrentUser.mockResolvedValue({ email: "a@example.com" });
    mockedLogout.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <AppLayout>
        <p>Contenido protegido</p>
      </AppLayout>
    );

    await screen.findByText("Contenido protegido");
    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(mockedLogout).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });
});
