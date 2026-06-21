# PreLegal — Mutual NDA Generator

Next.js prototype for [PL-3](https://frogames.atlassian.net/browse/PL-3): fill in a form
with the parties and key terms, preview the generated Mutual NDA, and download it as a PDF.
Fully client-side — no backend required.

The clause text in `lib/ndaTemplate.ts` is transcribed from `../Templates/mutual-nda.md`
(Common Paper Mutual NDA v1.0, CC BY 4.0).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/page.tsx` — form + live preview layout
- `components/NdaForm.tsx` — form fields for both parties and agreement terms
- `components/NdaPreview.tsx` — renders the filled-in NDA on screen
- `lib/ndaTemplate.ts` — clause data and placeholder substitution
- `lib/generatePdf.tsx` — builds and downloads the PDF via `@react-pdf/renderer`
