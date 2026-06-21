"use client";

import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { NdaFormData, NDA_FIELDS } from "@/types/nda";
import { NDA_ATTRIBUTION, NDA_CLAUSES, getClauseSegments } from "@/lib/ndaTemplate";

const SUMMARY_FIELDS = NDA_FIELDS.filter((field) => field.group === "terms");

function activeStyles(...styles: (Style | false | undefined)[]): Style[] {
  return styles.filter((style): style is Style => Boolean(style));
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, lineHeight: 1.5 },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 8 },
  partyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  partyBlock: { width: "48%" },
  partyLabel: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  summaryItem: { width: "50%", marginBottom: 6 },
  summaryLabel: { fontFamily: "Helvetica-Bold" },
  clause: { marginBottom: 10 },
  bold: { fontFamily: "Helvetica-Bold" },
  filled: { textDecoration: "underline" },
  footer: { marginTop: 16, fontSize: 8, color: "#71717a" },
});

function NdaPdfDocument({ values }: { values: NdaFormData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Acuerdo de Confidencialidad Mutuo — Portada</Text>

        <View style={styles.partyRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Parte A</Text>
            <Text>{values.partyAName || "[Nombre]"}</Text>
            <Text>{values.partyAAddress || "[Dirección]"}</Text>
            <Text>Firmante: {values.partyASignatory || "[Firmante]"}</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Parte B</Text>
            <Text>{values.partyBName || "[Nombre]"}</Text>
            <Text>{values.partyBAddress || "[Dirección]"}</Text>
            <Text>Firmante: {values.partyBSignatory || "[Firmante]"}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {SUMMARY_FIELDS.map((field) => (
            <SummaryItem key={field.key} label={field.label} value={values[field.key]} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Términos Estándar</Text>
        {NDA_CLAUSES.map((clause) => (
          <Text key={clause.number} style={styles.clause}>
            <Text style={styles.bold}>
              {clause.number}. {clause.title}.{" "}
            </Text>
            {getClauseSegments(clause.body, values).map((segment, i) => (
              <Text key={i} style={activeStyles(segment.bold && styles.bold, segment.filled && styles.filled)}>
                {segment.text}
              </Text>
            ))}
          </Text>
        ))}

        <Text style={styles.footer}>{NDA_ATTRIBUTION}</Text>
      </Page>
    </Document>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text>{value || `[${label}]`}</Text>
    </View>
  );
}

export async function downloadNdaPdf(values: NdaFormData) {
  const blob = await pdf(<NdaPdfDocument values={values} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mutual-nda.pdf";
  link.click();
  URL.revokeObjectURL(url);
}
