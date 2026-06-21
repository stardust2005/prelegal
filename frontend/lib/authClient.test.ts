import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCurrentUser, login, logout, register } from "@/lib/authClient";

describe("register", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the email and password to /api/auth/register and returns the user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "a@example.com" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await register("a@example.com", "correct-horse");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@example.com", password: "correct-horse" }),
      })
    );
    expect(result).toEqual({ email: "a@example.com" });
  });

  it("throws a specific message when the email is already registered", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));

    await expect(register("a@example.com", "x")).rejects.toThrow(/ya está registrado/i);
  });
});

describe("login", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the email and password to /api/auth/login and returns the user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "a@example.com" }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await login("a@example.com", "correct-horse");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@example.com", password: "correct-horse" }),
      })
    );
    expect(result).toEqual({ email: "a@example.com" });
  });

  it("throws when the credentials are rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    await expect(login("a@example.com", "wrong")).rejects.toThrow();
  });
});

describe("logout", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to /api/auth/logout", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await logout();

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });
});

describe("fetchCurrentUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the user when authenticated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "a@example.com" }) }));

    const result = await fetchCurrentUser();

    expect(result).toEqual({ email: "a@example.com" });
  });

  it("returns null when not authenticated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    const result = await fetchCurrentUser();

    expect(result).toBeNull();
  });
});
