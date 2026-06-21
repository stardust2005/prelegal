import { NdaFormData, NDA_FIELDS } from "@/types/nda";
import { NDA_ATTRIBUTION, NDA_CLAUSES, getClauseSegments } from "@/lib/ndaTemplate";

const SUMMARY_FIELDS = NDA_FIELDS.filter((field) => field.group === "terms");

interface NdaPreviewProps {
  values: NdaFormData;
}

export default function NdaPreview({ values }: NdaPreviewProps) {
  return (
    <article className="flex flex-col gap-6 text-sm leading-6 text-zinc-800">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6">
        <h1 className="text-lg font-semibold text-zinc-900">
          Acuerdo de Confidencialidad Mutuo — Portada
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PartyBlock
            label="Parte A"
            name={values.partyAName}
            address={values.partyAAddress}
            signatory={values.partyASignatory}
          />
          <PartyBlock
            label="Parte B"
            name={values.partyBName}
            address={values.partyBAddress}
            signatory={values.partyBSignatory}
          />
        </div>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUMMARY_FIELDS.map((field) => (
            <SummaryItem key={field.key} label={field.label} value={values[field.key]} />
          ))}
        </dl>
      </header>

      <h2 className="text-base font-semibold text-zinc-900">Términos Estándar</h2>
      <ol className="flex flex-col gap-4">
        {NDA_CLAUSES.map((clause) => (
          <li key={clause.number}>
            <span className="font-semibold">
              {clause.number}. {clause.title}.
            </span>{" "}
            {getClauseSegments(clause.body, values).map((segment, i) => (
              <span
                key={i}
                className={[segment.bold ? "font-semibold" : "", segment.filled ? "underline" : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {segment.text}
              </span>
            ))}
          </li>
        ))}
      </ol>

      <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-500">
        {NDA_ATTRIBUTION}
      </footer>
    </article>
  );
}

function PartyBlock({
  label,
  name,
  address,
  signatory,
}: {
  label: string;
  name: string;
  address: string;
  signatory: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-zinc-200 p-3">
      <span className="text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <span className="font-medium">{name || "[Nombre]"}</span>
      <span className="text-zinc-600">{address || "[Dirección]"}</span>
      <span className="text-zinc-600">Firmante: {signatory || "[Firmante]"}</span>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd>{value || `[${label}]`}</dd>
    </div>
  );
}
