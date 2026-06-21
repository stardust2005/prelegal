import { AuthUser } from "@/types/auth";

async function postCredentials(path: string, email: string, password: string): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const response = await postCredentials("/api/auth/register", email, password);

  if (!response.ok) {
    if (response.status === 409) throw new Error("Ese correo ya está registrado.");
    throw new Error("No se pudo crear la cuenta.");
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await postCredentials("/api/auth/login", email, password);

  if (!response.ok) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");

  if (!response.ok) return null;

  return response.json();
}
