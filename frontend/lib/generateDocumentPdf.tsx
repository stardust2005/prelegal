"use client";

import { Document, Link, Page, StyleSheet, Text, pdf } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { parseInlineSegments, parseMarkdownBlocks } from "@/lib/markdown";
import { DocumentDetail, DocumentValues } from "@/types/document";

function activeStyles(...styles: (Style | false | undefined)[]): Style[] {
  return styles.filter((style): style is Style => Boolean(style));
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, lineHeight: 1.5 },
  heading1: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 12 },
  heading2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 8 },
  paragraph: { marginBottom: 8 },
  bold: { fontFamily: "Helvetica-Bold" },
  filled: { textDecoration: "underline" },
  link: { color: "#209dd7", textDecoration: "underline" },
});

function DocumentPdfBody({ document, values }: { document: DocumentDetail; values: DocumentValues }) {
  const blocks = parseMarkdownBlocks(document.body);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <Text key={i} style={block.level === 1 ? styles.heading1 : styles.heading2}>
              {block.text}
            </Text>
          );
        }

        const segments = parseInlineSegments(block.text, values, document.fields);
        const marginLeft = block.type === "list-item" ? block.depth * 24 : 0;

        return (
          <Text key={i} style={[styles.paragraph, { marginLeft }]}>
            {block.type === "list-item" && <Text style={styles.bold}>{block.marker}. </Text>}
            {segments.map((segment, j) =>
              segment.href ? (
                <Link key={j} src={segment.href} style={styles.link}>
                  {segment.text}
                </Link>
              ) : (
                <Text key={j} style={activeStyles(segment.bold && styles.bold, segment.filled && styles.filled)}>
                  {segment.text}
                </Text>
              )
            )}
          </Text>
        );
      })}
    </>
  );
}

function DocumentPdfDocument({ document, values }: { document: DocumentDetail; values: DocumentValues }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentPdfBody document={document} values={values} />
      </Page>
    </Document>
  );
}

export async function downloadDocumentPdf(document: DocumentDetail, values: DocumentValues) {
  const blob = await pdf(<DocumentPdfDocument document={document} values={values} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `${document.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
