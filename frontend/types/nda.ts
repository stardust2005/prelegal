export interface NdaFormData {
  partyAName: string;
  partyAAddress: string;
  partyASignatory: string;
  partyBName: string;
  partyBAddress: string;
  partyBSignatory: string;
  purpose: string;
  effectiveDate: string;
  mndaTerm: string;
  termOfConfidentiality: string;
  governingLaw: string;
  jurisdiction: string;
}

export const EMPTY_NDA_FORM_DATA: NdaFormData = {
  partyAName: "",
  partyAAddress: "",
  partyASignatory: "",
  partyBName: "",
  partyBAddress: "",
  partyBSignatory: "",
  purpose: "",
  effectiveDate: "",
  mndaTerm: "",
  termOfConfidentiality: "",
  governingLaw: "",
  jurisdiction: "",
};

export type NdaFieldGroup = "partyA" | "partyB" | "terms";

export interface NdaField {
  key: keyof NdaFormData;
  label: string;
  placeholder: string;
  group: NdaFieldGroup;
}

export const NDA_FIELDS: NdaField[] = [
  { key: "partyAName", label: "Party A — Name", placeholder: "Acme, Inc.", group: "partyA" },
  {
    key: "partyAAddress",
    label: "Party A — Address",
    placeholder: "123 Main St, Wilmington, DE",
    group: "partyA",
  },
  {
    key: "partyASignatory",
    label: "Party A — Signatory",
    placeholder: "Jane Smith, CEO",
    group: "partyA",
  },
  { key: "partyBName", label: "Party B — Name", placeholder: "Beta LLC", group: "partyB" },
  {
    key: "partyBAddress",
    label: "Party B — Address",
    placeholder: "456 Market St, Austin, TX",
    group: "partyB",
  },
  {
    key: "partyBSignatory",
    label: "Party B — Signatory",
    placeholder: "John Doe, Founder",
    group: "partyB",
  },
  {
    key: "purpose",
    label: "Purpose",
    placeholder: "Evaluating a potential business relationship",
    group: "terms",
  },
  { key: "effectiveDate", label: "Effective Date", placeholder: "June 21, 2026", group: "terms" },
  {
    key: "mndaTerm",
    label: "MNDA Term",
    placeholder: "2 years from the Effective Date",
    group: "terms",
  },
  {
    key: "termOfConfidentiality",
    label: "Term of Confidentiality",
    placeholder: "3 years from disclosure",
    group: "terms",
  },
  { key: "governingLaw", label: "Governing Law", placeholder: "Delaware", group: "terms" },
  {
    key: "jurisdiction",
    label: "Jurisdiction",
    placeholder: "Wilmington, Delaware",
    group: "terms",
  },
];
