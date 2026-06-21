"use client";

import { NdaFormData, NDA_FIELDS } from "@/types/nda";

interface NdaFormProps {
  values: NdaFormData;
  onChange: (key: keyof NdaFormData, value: string) => void;
}

const PARTY_A_KEYS = new Set(["partyAName", "partyAAddress", "partyASignatory"]);
const PARTY_B_KEYS = new Set(["partyBName", "partyBAddress", "partyBSignatory"]);

export default function NdaForm({ values, onChange }: NdaFormProps) {
  const partyAFields = NDA_FIELDS.filter((f) => PARTY_A_KEYS.has(f.key));
  const partyBFields = NDA_FIELDS.filter((f) => PARTY_B_KEYS.has(f.key));
  const termFields = NDA_FIELDS.filter(
    (f) => !PARTY_A_KEYS.has(f.key) && !PARTY_B_KEYS.has(f.key)
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-zinc-900">Party A</legend>
        {partyAFields.map((field) => (
          <FormField key={field.key} field={field} value={values[field.key]} onChange={onChange} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-zinc-900">Party B</legend>
        {partyBFields.map((field) => (
          <FormField key={field.key} field={field} value={values[field.key]} onChange={onChange} />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-zinc-900">Agreement Terms</legend>
        {termFields.map((field) => (
          <FormField key={field.key} field={field} value={values[field.key]} onChange={onChange} />
        ))}
      </fieldset>
    </form>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: { key: keyof NdaFormData; label: string; placeholder: string };
  value: string;
  onChange: (key: keyof NdaFormData, value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700">{field.label}</span>
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none"
      />
    </label>
  );
}
