import fs from "fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";

const COMPLETE_VALUES = {
  partyAName: "Acme, Inc.",
  partyAAddress: "123 Main St, Wilmington, DE",
  partyASignatory: "Jane Smith, CEO",
  partyBName: "Beta LLC",
  partyBAddress: "456 Market St, Austin, TX",
  partyBSignatory: "John Doe, Founder",
  purpose: "Evaluar una posible relación comercial",
  effectiveDate: "21 de junio de 2026",
  mndaTerm: "2 años desde la Fecha de Vigencia",
  termOfConfidentiality: "3 años desde la divulgación",
  governingLaw: "Delaware",
  jurisdiction: "Wilmington, Delaware",
};

const EMPTY_VALUES = Object.fromEntries(Object.keys(COMPLETE_VALUES).map((key) => [key, ""]));

/** Intercepts POST /api/chat so e2e tests don't depend on a real LLM call. */
async function mockChatResponses(page: Page, responses: { reply: string; values: Record<string, string> }[]) {
  let call = 0;
  await page.route("**/api/chat", async (route) => {
    const response = responses[Math.min(call, responses.length - 1)];
    call += 1;
    await route.fulfill({ json: response });
  });
}

async function sendChatMessage(page: Page, text: string) {
  await page.getByPlaceholder("Escribe tu respuesta…").fill(text);
  await page.getByRole("button", { name: /enviar/i }).click();
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

test("shows an initial greeting and disables download until the chat completes every field", async ({ page }) => {
  await expect(page.getByRole("log")).toContainText(/acuerdo de confidencialidad mutuo/i);
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeDisabled();

  const preview = page.locator("article");
  await expect(preview).toContainText("[Propósito]");
});

test("happy path: chat conversation fills the fields, updates the live preview, and downloads a matching PDF", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await mockChatResponses(page, [
    { reply: "Perfecto, he registrado todos los datos del acuerdo.", values: COMPLETE_VALUES },
  ]);

  await sendChatMessage(page, "Aquí tienes todos los datos del NDA entre Acme y Beta.");

  await expect(page.getByText("Perfecto, he registrado todos los datos del acuerdo.")).toBeVisible();

  const preview = page.locator("article");
  await expect(preview).toContainText("Acme, Inc.");
  await expect(preview).toContainText("Beta LLC");
  await expect(preview).toContainText("Evaluar una posible relación comercial");
  await expect(preview).toContainText("Delaware");
  await expect(preview).not.toContainText("[Propósito]");

  const downloadButton = page.getByRole("button", { name: /Descargar como PDF/i });
  await expect(downloadButton).toBeEnabled();

  const { text, pageCount, suggestedFilename } = await downloadAndParsePdf(page);

  expect(suggestedFilename).toBe("mutual-nda.pdf");
  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("Acme, Inc.");
  expect(text).toContain("Jane Smith, CEO");
  expect(text).toContain("Beta LLC");
  expect(text).toContain("Wilmington, Delaware");
  expect(text.match(/Acuerdo de Confidencialidad Mutuo de Common Paper/g)).toHaveLength(1);

  expect(consoleErrors).toEqual([]);
});

test("keeps the download button disabled until every field has been filled across multiple turns", async ({
  page,
}) => {
  const partialValues = { ...EMPTY_VALUES, partyAName: "Acme, Inc.", purpose: "Evaluar una alianza" };

  await mockChatResponses(page, [
    { reply: "¿Quién es la Parte B?", values: partialValues },
    { reply: "Perfecto, ya tengo todos los datos.", values: COMPLETE_VALUES },
  ]);

  await sendChatMessage(page, "Somos Acme, Inc. y queremos evaluar una alianza.");
  await expect(page.getByText("¿Quién es la Parte B?")).toBeVisible();
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeDisabled();

  await sendChatMessage(page, "La Parte B es Beta LLC, en Delaware.");
  await expect(page.getByText("Perfecto, ya tengo todos los datos.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeEnabled();
});

test("preserves special characters (quotes, ampersand, accented letters) end to end", async ({ page }) => {
  const trickyValues = {
    ...COMPLETE_VALUES,
    partyAName: `O'Brien & Associates, S.A.`,
    purpose: `Evaluación de una posible colaboración (& "joint venture")`,
  };
  await mockChatResponses(page, [{ reply: "Entendido.", values: trickyValues }]);

  await sendChatMessage(page, "La parte A es O'Brien & Associates.");

  const preview = page.locator("article");
  await expect(preview).toContainText("O'Brien & Associates, S.A.");
  await expect(preview).toContainText('Evaluación de una posible colaboración (& "joint venture")');

  const { text } = await downloadAndParsePdf(page);
  expect(text).toContain("O'Brien & Associates, S.A.");
  expect(text).toContain("Evaluaci");
  expect(text).toContain("joint venture");
});

test("very long field values wrap across multiple PDF pages without errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const longPurpose = "evaluating a very long-running multi-phase strategic partnership ".repeat(80).trim();
  await mockChatResponses(page, [
    { reply: "Entendido.", values: { ...COMPLETE_VALUES, purpose: longPurpose } },
  ]);

  await sendChatMessage(page, "El propósito es muy largo, te lo explico con detalle.");
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeEnabled();

  const { pageCount, text } = await downloadAndParsePdf(page);

  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("strategic partnership");
  expect(consoleErrors).toEqual([]);
});
