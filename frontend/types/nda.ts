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

export const NDA_FIELDS: { key: keyof NdaFormData; label: string; placeholder: string }[] = [
  { key: "partyAName", label: "Party A — Name", placeholder: "Acme, Inc." },
  { key: "partyAAddress", label: "Party A — Address", placeholder: "123 Main St, Wilmington, DE" },
  { key: "partyASignatory", label: "Party A — Signatory", placeholder: "Jane Smith, CEO" },
  { key: "partyBName", label: "Party B — Name", placeholder: "Beta LLC" },
  { key: "partyBAddress", label: "Party B — Address", placeholder: "456 Market St, Austin, TX" },
  { key: "partyBSignatory", label: "Party B — Signatory", placeholder: "John Doe, Founder" },
  { key: "purpose", label: "Purpose", placeholder: "Evaluating a potential business relationship" },
  { key: "effectiveDate", label: "Effective Date", placeholder: "June 21, 2026" },
  { key: "mndaTerm", label: "MNDA Term", placeholder: "2 years from the Effective Date" },
  { key: "termOfConfidentiality", label: "Term of Confidentiality", placeholder: "3 years from disclosure" },
  { key: "governingLaw", label: "Governing Law", placeholder: "Delaware" },
  { key: "jurisdiction", label: "Jurisdiction", placeholder: "Wilmington, Delaware" },
];
