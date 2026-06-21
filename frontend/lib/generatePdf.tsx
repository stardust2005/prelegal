"use client";

import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { NdaFormData } from "@/types/nda";
import { NDA_ATTRIBUTION, NDA_CLAUSES, getClauseSegments } from "@/lib/ndaTemplate";

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
        <Text style={styles.title}>Mutual Non-Disclosure Agreement — Cover Page</Text>

        <View style={styles.partyRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Party A</Text>
            <Text>{values.partyAName || "[Party A Name]"}</Text>
            <Text>{values.partyAAddress || "[Party A Address]"}</Text>
            <Text>Signatory: {values.partyASignatory || "[Party A Signatory]"}</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Party B</Text>
            <Text>{values.partyBName || "[Party B Name]"}</Text>
            <Text>{values.partyBAddress || "[Party B Address]"}</Text>
            <Text>Signatory: {values.partyBSignatory || "[Party B Signatory]"}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryItem label="Purpose" value={values.purpose} />
          <SummaryItem label="Effective Date" value={values.effectiveDate} />
          <SummaryItem label="MNDA Term" value={values.mndaTerm} />
          <SummaryItem label="Term of Confidentiality" value={values.termOfConfidentiality} />
          <SummaryItem label="Governing Law" value={values.governingLaw} />
          <SummaryItem label="Jurisdiction" value={values.jurisdiction} />
        </View>

        <Text style={styles.sectionTitle}>Standard Terms</Text>
        {NDA_CLAUSES.map((clause) => (
          <Text key={clause.number} style={styles.clause}>
            <Text style={styles.bold}>
              {clause.number}. {clause.title}.{" "}
            </Text>
            {getClauseSegments(clause.body, values).map((segment, i) => (
              <Text
                key={i}
                style={[
                  ...(segment.bold ? [styles.bold] : []),
                  ...(segment.filled ? [styles.filled] : []),
                ]}
              >
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
