import { expect, test, type Page } from "@playwright/test";

async function mockLoggedInUser(page: Page, email: string) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { email } });
  });
}

test("logs in with valid credentials and reaches the platform", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({ json: { email: "a@example.com" } });
  });
  await mockLoggedInUser(page, "a@example.com");

  await page.goto("/");
  await page.getByLabel("Correo electrónico").fill("a@example.com");
  await page.getByLabel("Contraseña").fill("correct-horse");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL("/app/");
  await expect(page.getByRole("heading", { name: "Generador de Documentos Legales" })).toBeVisible();
  await expect(page.getByText("a@example.com")).toBeVisible();
});

test("shows an error and stays on the login page when credentials are rejected", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({ status: 401, json: { detail: "Invalid email or password" } });
  });

  await page.goto("/");
  await page.getByLabel("Correo electrónico").fill("a@example.com");
  await page.getByLabel("Contraseña").fill("wrong-password");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText(/incorrectos/i)).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("registers a new account and reaches the platform", async ({ page }) => {
  await page.route("**/api/auth/register", async (route) => {
    await route.fulfill({ status: 201, json: { email: "b@example.com" } });
  });
  await mockLoggedInUser(page, "b@example.com");

  await page.goto("/register/");
  await page.getByLabel("Correo electrónico").fill("b@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("correct-horse");
  await page.getByLabel("Confirmar contraseña").fill("correct-horse");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL("/app/");
  await expect(page.getByText("b@example.com")).toBeVisible();
});

test("logs out and returns to the login page", async ({ page }) => {
  await mockLoggedInUser(page, "a@example.com");
  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/app/");
  await expect(page.getByText("a@example.com")).toBeVisible();

  await page.getByRole("button", { name: /cerrar sesión/i }).click();

  await expect(page).toHaveURL("/");
});
