import { expect, test } from "@playwright/test";

test("fake login navigates straight to the platform", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL("/app/");
  await expect(page.getByRole("heading", { name: "Generador de Documentos Legales" })).toBeVisible();
});
