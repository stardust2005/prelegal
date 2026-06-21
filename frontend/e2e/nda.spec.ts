import fs from "fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";

const HAPPY_PATH_VALUES = {
  "Parte A — Nombre": "Acme, Inc.",
  "Parte A — Dirección": "123 Main St, Wilmington, DE",
  "Parte A — Firmante": "Jane Smith, CEO",
  "Parte B — Nombre": "Beta LLC",
  "Parte B — Dirección": "456 Market St, Austin, TX",
  "Parte B — Firmante": "John Doe, Founder",
  Propósito: "Evaluar una posible relación comercial",
  "Fecha de Vigencia": "21 de junio de 2026",
  "Plazo del MNDA": "2 años desde la Fecha de Vigencia",
  "Plazo de Confidencialidad": "3 años desde la divulgación",
  "Ley Aplicable": "Delaware",
  Jurisdicción: "Wilmington, Delaware",
};

async function fillForm(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    await page.getByLabel(label).fill(value);
  }
}

async function downloadAndParsePdf(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Descargar como PDF/i }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error("Download did not produce a local file path");

  const parser = new PDFParse({ data: fs.readFileSync(path) });
  const result = await parser.getText();
  return { text: result.text, pageCount: result.total, suggestedFilename: download.suggestedFilename() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: "Generador de NDA Mutuo" })).toBeVisible();
});

test("happy path: fills the form, updates the live preview, and downloads a matching PDF", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await fillForm(page, HAPPY_PATH_VALUES);

  const preview = page.locator("article");
  await expect(preview).toContainText("Acme, Inc.");
  await expect(preview).toContainText("Beta LLC");
  await expect(preview).toContainText("Evaluar una posible relación comercial");
  await expect(preview).toContainText("Delaware");
  await expect(preview).not.toContainText("[Propósito]");

  const { text, pageCount, suggestedFilename } = await downloadAndParsePdf(page);

  expect(suggestedFilename).toBe("mutual-nda.pdf");
  // The full cover page + all 11 Standard Terms clauses don't fit on one A4
  // page even with normal-length values; react-pdf paginates automatically.
  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("Acme, Inc.");
  expect(text).toContain("Jane Smith, CEO");
  expect(text).toContain("Beta LLC");
  expect(text).toContain("Evaluar una posible relación comercial");
  expect(text).toContain("Wilmington, Delaware");
  // The attribution footer should appear exactly once, not once per page.
  expect(text.match(/Acuerdo de Confidencialidad Mutuo de Common Paper/g)).toHaveLength(1);

  expect(consoleErrors).toEqual([]);
});

test("empty form: shows bracketed fallbacks in the preview and still downloads a valid PDF", async ({
  page,
}) => {
  const preview = page.locator("article");
  await expect(preview).toContainText("[Propósito]");
  await expect(preview).toContainText("[Ley Aplicable]");

  const { text, pageCount } = await downloadAndParsePdf(page);

  expect(pageCount).toBeGreaterThanOrEqual(1);
  expect(text).toContain("[Propósito]");
  expect(text).toContain("[Nombre]");
});

test("preserves special characters (quotes, ampersand, accented letters) end to end", async ({
  page,
}) => {
  const tricky = {
    "Parte A — Nombre": `O'Brien & Associates, S.A.`,
    Propósito: `Evaluación de una posible colaboración (& "joint venture")`,
  };
  await fillForm(page, tricky);

  const preview = page.locator("article");
  await expect(preview).toContainText("O'Brien & Associates, S.A.");
  await expect(preview).toContainText('Evaluación de una posible colaboración (& "joint venture")');

  const { text } = await downloadAndParsePdf(page);
  expect(text).toContain("O'Brien & Associates, S.A.");
  expect(text).toContain("Evaluaci");
  expect(text).toContain("joint venture");
});

test("very long input wraps across multiple PDF pages without errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const longPurpose = "evaluating a very long-running multi-phase strategic partnership ".repeat(80);
  await fillForm(page, { Propósito: longPurpose.trim() });

  const { pageCount, text } = await downloadAndParsePdf(page);

  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("strategic partnership");
  expect(consoleErrors).toEqual([]);
});
