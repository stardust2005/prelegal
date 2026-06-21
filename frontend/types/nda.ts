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
  { key: "partyAName", label: "Parte A — Nombre", placeholder: "Acme, Inc.", group: "partyA" },
  {
    key: "partyAAddress",
    label: "Parte A — Dirección",
    placeholder: "123 Main St, Wilmington, DE",
    group: "partyA",
  },
  {
    key: "partyASignatory",
    label: "Parte A — Firmante",
    placeholder: "Jane Smith, CEO",
    group: "partyA",
  },
  { key: "partyBName", label: "Parte B — Nombre", placeholder: "Beta LLC", group: "partyB" },
  {
    key: "partyBAddress",
    label: "Parte B — Dirección",
    placeholder: "456 Market St, Austin, TX",
    group: "partyB",
  },
  {
    key: "partyBSignatory",
    label: "Parte B — Firmante",
    placeholder: "John Doe, Founder",
    group: "partyB",
  },
  {
    key: "purpose",
    label: "Propósito",
    placeholder: "Evaluar una posible relación comercial",
    group: "terms",
  },
  { key: "effectiveDate", label: "Fecha de Vigencia", placeholder: "21 de junio de 2026", group: "terms" },
  {
    key: "mndaTerm",
    label: "Plazo del MNDA",
    placeholder: "2 años desde la Fecha de Vigencia",
    group: "terms",
  },
  {
    key: "termOfConfidentiality",
    label: "Plazo de Confidencialidad",
    placeholder: "3 años desde la divulgación",
    group: "terms",
  },
  { key: "governingLaw", label: "Ley Aplicable", placeholder: "Delaware", group: "terms" },
  {
    key: "jurisdiction",
    label: "Jurisdicción",
    placeholder: "Wilmington, Delaware",
    group: "terms",
  },
];
