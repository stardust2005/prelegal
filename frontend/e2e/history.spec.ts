import fs from "fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";

const MUTUAL_NDA_DETAIL = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description: "Acuerdo de confidencialidad mutuo.",
  fields: { proposito: "Propósito" },
  body: "# Términos Estándar\n\n1. Esto cubre el {{proposito}}.",
};

async function mockBackend(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { email: "a@example.com" } });
  });
  await page.route("**/api/history", async (route) => {
    await route.fulfill({
      json: [
        {
          document_id: "mutual-nda",
          document_name: "Mutual Non-Disclosure Agreement",
          values: { proposito: "Evaluar una alianza" },
          created_at: "2026-06-21T20:00:00",
        },
      ],
    });
  });
  await page.route("**/api/documents/mutual-nda", async (route) => {
    await route.fulfill({ json: MUTUAL_NDA_DETAIL });
  });
}

test("lists a previously generated document and downloads it again", async ({ page }) => {
  await mockBackend(page);

  await page.goto("/app/");
  await page.getByRole("link", { name: /mis documentos/i }).click();

  await expect(page).toHaveURL("/app/documents/");
  await expect(page.getByText("Mutual Non-Disclosure Agreement")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /descargar de nuevo/i }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error("Download did not produce a local file path");

  const parser = new PDFParse({ data: fs.readFileSync(path) });
  const result = await parser.getText();
  expect(result.text).toContain("Evaluar una alianza");
});

test("shows an empty state when there is no saved document yet", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ json: { email: "a@example.com" } });
  });
  await page.route("**/api/history", async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.goto("/app/documents/");

  await expect(page.getByText(/todavía no has generado/i)).toBeVisible();
});
