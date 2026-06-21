import fs from "fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";

const MUTUAL_NDA_DETAIL = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description: "Acuerdo de confidencialidad mutuo.",
  fields: { proposito: "Propósito", ley_aplicable: "Ley Aplicable" },
  body: "# Términos Estándar\n\n1. Esto cubre el {{proposito}} bajo la ley de {{ley_aplicable}}.",
};

const AI_ADDENDUM_DETAIL = {
  id: "ai-addendum",
  name: "AI Addendum",
  description: "Anexo de IA.",
  fields: { cliente: "Cliente" },
  body: "# Anexo de IA\n\n1. El {{cliente}} podrá utilizar los Servicios de IA.",
};

const DOCUMENT_DETAILS: Record<string, typeof MUTUAL_NDA_DETAIL> = {
  "mutual-nda": MUTUAL_NDA_DETAIL,
  "ai-addendum": AI_ADDENDUM_DETAIL,
};

async function mockBackend(
  page: Page,
  chatResponses: { reply: string; document_id: string | null; values: Record<string, string> }[]
) {
  let call = 0;
  await page.route("**/api/chat", async (route) => {
    const response = chatResponses[Math.min(call, chatResponses.length - 1)];
    call += 1;
    await route.fulfill({ json: response });
  });
  await page.route("**/api/documents/*", async (route) => {
    const documentId = route.request().url().split("/").pop()!;
    const detail = DOCUMENT_DETAILS[documentId];
    if (!detail) {
      await route.fulfill({ status: 404, json: { detail: "Document not found" } });
      return;
    }
    await route.fulfill({ json: detail });
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
  return { text: result.text, suggestedFilename: download.suggestedFilename() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: "Generador de Documentos Legales" })).toBeVisible();
});

test("shows an initial greeting and a disabled download button before a document is resolved", async ({
  page,
}) => {
  await expect(page.getByRole("log")).toContainText(/documento/i);
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeDisabled();
  await expect(page.getByText(/cuéntame en el chat/i)).toBeVisible();
});

test("happy path: resolves a document, fills its fields across turns, and downloads a matching PDF", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await mockBackend(page, [
    { reply: "Entendido, un Mutual NDA.", document_id: "mutual-nda", values: {} },
    {
      reply: "Perfecto, registrado.",
      document_id: "mutual-nda",
      values: { proposito: "Evaluar una alianza", ley_aplicable: "España" },
    },
  ]);

  await sendChatMessage(page, "Necesito un acuerdo de confidencialidad mutuo");
  await expect(page.getByRole("heading", { name: "Términos Estándar" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeDisabled();

  await sendChatMessage(page, "El propósito es evaluar una alianza, bajo ley de España");

  const preview = page.locator("article");
  await expect(preview).toContainText("Evaluar una alianza");
  await expect(preview).toContainText("España");

  const downloadButton = page.getByRole("button", { name: /Descargar como PDF/i });
  await expect(downloadButton).toBeEnabled();

  const { text, suggestedFilename } = await downloadAndParsePdf(page);
  expect(suggestedFilename).toBe("mutual-nda.pdf");
  expect(text).toContain("Evaluar una alianza");
  expect(text).toContain("España");

  expect(consoleErrors).toEqual([]);
});

test("switching to a different document resets values and downloads under the new document's name", async ({
  page,
}) => {
  await mockBackend(page, [
    {
      reply: "Un NDA, registrado el propósito.",
      document_id: "mutual-nda",
      values: { proposito: "Evaluar una alianza" },
    },
    {
      reply: "Ah, en realidad necesitas un Anexo de IA.",
      document_id: "ai-addendum",
      values: {},
    },
    { reply: "Perfecto.", document_id: "ai-addendum", values: { cliente: "Acme Inc." } },
  ]);

  await sendChatMessage(page, "Necesito un NDA para evaluar una alianza");
  await expect(page.getByRole("heading", { name: "Términos Estándar" })).toBeVisible();

  await sendChatMessage(page, "En realidad necesito un anexo de IA");
  await expect(page.getByRole("heading", { name: "Anexo de IA" })).toBeVisible();
  await expect(page.locator("article")).not.toContainText("Evaluar una alianza");

  await sendChatMessage(page, "El cliente es Acme Inc.");
  await expect(page.locator("article")).toContainText("Acme Inc.");

  const { suggestedFilename } = await downloadAndParsePdf(page);
  expect(suggestedFilename).toBe("ai-addendum.pdf");
});

test("offers the closest supported document when the user asks for something unsupported", async ({
  page,
}) => {
  await mockBackend(page, [
    {
      reply:
        "No generamos contratos de arrendamiento, pero el Pilot Agreement podría ajustarse a tu caso. ¿Qué necesitas regular exactamente?",
      document_id: null,
      values: {},
    },
  ]);

  await sendChatMessage(page, "Necesito un contrato de alquiler de vivienda");

  await expect(page.getByText(/pilot agreement/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Descargar como PDF/i })).toBeDisabled();
});
