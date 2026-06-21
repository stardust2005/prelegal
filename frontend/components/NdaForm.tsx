"use client";

import { NdaField, NdaFieldGroup, NdaFormData, NDA_FIELDS } from "@/types/nda";

interface NdaFormProps {
  values: NdaFormData;
  onChange: (key: keyof NdaFormData, value: string) => void;
}

const GROUPS: { group: NdaFieldGroup; title: string }[] = [
  { group: "partyA", title: "Party A" },
  { group: "partyB", title: "Party B" },
  { group: "terms", title: "Agreement Terms" },
];

export default function NdaForm({ values, onChange }: NdaFormProps) {
  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      {GROUPS.map(({ group, title }) => (
        <fieldset key={group} className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-zinc-900">{title}</legend>
          {NDA_FIELDS.filter((field) => field.group === group).map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={onChange}
            />
          ))}
        </fieldset>
      ))}
    </form>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: NdaField;
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
