import fs from "fs";
import { expect, test, type Page } from "@playwright/test";
import { PDFParse } from "pdf-parse";

const HAPPY_PATH_VALUES = {
  "Party A — Name": "Acme, Inc.",
  "Party A — Address": "123 Main St, Wilmington, DE",
  "Party A — Signatory": "Jane Smith, CEO",
  "Party B — Name": "Beta LLC",
  "Party B — Address": "456 Market St, Austin, TX",
  "Party B — Signatory": "John Doe, Founder",
  Purpose: "Evaluating a potential business relationship",
  "Effective Date": "June 21, 2026",
  "MNDA Term": "2 years from the Effective Date",
  "Term of Confidentiality": "3 years from disclosure",
  "Governing Law": "Delaware",
  Jurisdiction: "Wilmington, Delaware",
};

async function fillForm(page: Page, values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    await page.getByLabel(label).fill(value);
  }
}

async function downloadAndParsePdf(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download as PDF/i }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error("Download did not produce a local file path");

  const parser = new PDFParse({ data: fs.readFileSync(path) });
  const result = await parser.getText();
  return { text: result.text, pageCount: result.total, suggestedFilename: download.suggestedFilename() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mutual NDA Generator" })).toBeVisible();
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
  await expect(preview).toContainText("Evaluating a potential business relationship");
  await expect(preview).toContainText("Delaware");
  await expect(preview).not.toContainText("[Purpose]");

  const { text, pageCount, suggestedFilename } = await downloadAndParsePdf(page);

  expect(suggestedFilename).toBe("mutual-nda.pdf");
  // The full cover page + all 11 Standard Terms clauses don't fit on one A4
  // page even with normal-length values; react-pdf paginates automatically.
  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("Acme, Inc.");
  expect(text).toContain("Jane Smith, CEO");
  expect(text).toContain("Beta LLC");
  expect(text).toContain("Evaluating a potential business relationship");
  expect(text).toContain("Wilmington, Delaware");
  // The attribution footer should appear exactly once, not once per page.
  expect(text.match(/Common Paper Mutual Non-Disclosure Agreement/g)).toHaveLength(1);

  expect(consoleErrors).toEqual([]);
});

test("empty form: shows bracketed fallbacks in the preview and still downloads a valid PDF", async ({
  page,
}) => {
  const preview = page.locator("article");
  await expect(preview).toContainText("[Purpose]");
  await expect(preview).toContainText("[Governing Law]");

  const { text, pageCount } = await downloadAndParsePdf(page);

  expect(pageCount).toBeGreaterThanOrEqual(1);
  expect(text).toContain("[Purpose]");
  expect(text).toContain("[Name]");
});

test("preserves special characters (quotes, ampersand, accented letters) end to end", async ({
  page,
}) => {
  const tricky = {
    "Party A — Name": `O'Brien & Associates, S.A.`,
    Purpose: `Evaluación de una posible colaboración (& "joint venture")`,
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
  await fillForm(page, { Purpose: longPurpose.trim() });

  const { pageCount, text } = await downloadAndParsePdf(page);

  expect(pageCount).toBeGreaterThan(1);
  expect(text).toContain("strategic partnership");
  expect(consoleErrors).toEqual([]);
});
