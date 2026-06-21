import { NdaFormData } from "@/types/nda";

/**
 * Clause text is transcribed (in Spanish) from ../../Templates/mutual-nda.md
 * (Common Paper Mutual NDA Standard Terms v1.0, CC BY 4.0), with the cover-page
 * placeholders rewritten as {{fieldKey}} tokens so they can be filled in from NdaFormData.
 */
export interface NdaClause {
  number: number;
  title: string;
  body: string;
}

export const NDA_CLAUSES: NdaClause[] = [
  {
    number: 1,
    title: "Introducción",
    body: "Este Acuerdo de Confidencialidad Mutuo (que incorpora estos Términos Estándar y la Portada (definida más adelante)) (“**MNDA**”) permite a cada parte (“**Parte Divulgadora**”) divulgar o poner a disposición información en relación con el {{purpose}} que (1) la Parte Divulgadora identifique ante la parte receptora (“**Parte Receptora**”) como “confidencial”, “propietaria” o similar, o (2) deba razonablemente entenderse como confidencial o propietaria debido a su naturaleza y a las circunstancias de su divulgación (“**Información Confidencial**”). La Información Confidencial de cada parte también incluye la existencia y el estado de las conversaciones entre las partes y la información contenida en la Portada. La Información Confidencial incluye información técnica o comercial, diseños o hojas de ruta de productos, requisitos, precios, documentación de seguridad y cumplimiento, tecnología, invenciones y know-how. Para utilizar este MNDA, las partes deben completar y firmar una portada que incorpore estos Términos Estándar (“**Portada**”). Cada parte se identifica en la Portada y los términos en mayúscula tienen el significado que se les atribuye en este documento o en la Portada.",
  },
  {
    number: 2,
    title: "Uso y Protección de la Información Confidencial",
    body: "La Parte Receptora deberá: (a) utilizar la Información Confidencial únicamente para el {{purpose}}; (b) no divulgar la Información Confidencial a terceros sin la aprobación previa por escrito de la Parte Divulgadora, salvo que la Parte Receptora podrá divulgarla a sus empleados, agentes, asesores, contratistas y otros representantes que tengan una necesidad razonable de conocerla para el {{purpose}}, siempre que dichos representantes estén sujetos a obligaciones de confidencialidad no menos protectoras para la Parte Divulgadora que los términos aplicables de este MNDA, y que la Parte Receptora siga siendo responsable de su cumplimiento; y (c) proteger la Información Confidencial utilizando, como mínimo, las mismas protecciones que la Parte Receptora utiliza para su propia información similar, y nunca por debajo de un estándar de cuidado razonable.",
  },
  {
    number: 3,
    title: "Excepciones",
    body: "Las obligaciones de la Parte Receptora en este MNDA no se aplican a la información que pueda demostrar que: (a) es o se hace pública sin culpa de la Parte Receptora; (b) la conocía o poseía legítimamente antes de recibirla de la Parte Divulgadora, sin restricciones de confidencialidad; (c) la obtuvo legítimamente de un tercero sin restricciones de confidencialidad; o (d) la desarrolló de forma independiente sin utilizar ni hacer referencia a la Información Confidencial.",
  },
  {
    number: 4,
    title: "Divulgaciones Exigidas por Ley",
    body: "La Parte Receptora podrá divulgar la Información Confidencial en la medida exigida por ley, normativa o autoridad regulatoria, citación u orden judicial, siempre que (en la medida legalmente permitida) proporcione a la Parte Divulgadora un aviso razonable y previo de la divulgación requerida, y colabore razonablemente, a costa de la Parte Divulgadora, en los esfuerzos de esta para obtener un tratamiento confidencial de la Información Confidencial.",
  },
  {
    number: 5,
    title: "Vigencia y Terminación",
    body: "Este MNDA entra en vigor en la {{effectiveDate}} y vence al finalizar el {{mndaTerm}}. Cualquiera de las partes podrá terminar este MNDA, con o sin motivo, mediante notificación escrita a la otra parte. Las obligaciones de la Parte Receptora relativas a la Información Confidencial sobrevivirán durante el {{termOfConfidentiality}}, a pesar de cualquier vencimiento o terminación de este MNDA.",
  },
  {
    number: 6,
    title: "Devolución o Destrucción de la Información Confidencial",
    body: "Al vencimiento o terminación de este MNDA, o ante la solicitud previa de la Parte Divulgadora, la Parte Receptora deberá: (a) cesar el uso de la Información Confidencial; (b) inmediatamente después de la solicitud por escrito de la Parte Divulgadora, destruir toda la Información Confidencial en su posesión o control, o devolverla a la Parte Divulgadora; y (c) si la Parte Divulgadora lo solicita, confirmar por escrito el cumplimiento de estas obligaciones. Como excepción al apartado (b), la Parte Receptora podrá conservar la Información Confidencial de acuerdo con sus políticas estándar de copias de seguridad o retención de registros, o según lo exija la ley, pero los términos de este MNDA seguirán aplicándose a la Información Confidencial conservada.",
  },
  {
    number: 7,
    title: "Derechos de Propiedad",
    body: "La Parte Divulgadora conserva todos sus derechos de propiedad intelectual y demás derechos sobre su Información Confidencial, y su divulgación a la Parte Receptora no concede ninguna licencia sobre dichos derechos.",
  },
  {
    number: 8,
    title: "Exención de Responsabilidad",
    body: "TODA LA INFORMACIÓN CONFIDENCIAL SE PROPORCIONA “TAL CUAL”, CON TODOS SUS DEFECTOS Y SIN GARANTÍAS, INCLUIDAS LAS GARANTÍAS IMPLÍCITAS DE TITULARIDAD, COMERCIABILIDAD E IDONEIDAD PARA UN PROPÓSITO PARTICULAR.",
  },
  {
    number: 9,
    title: "Ley Aplicable y Jurisdicción",
    body: "Este MNDA y todos los asuntos relacionados con él se rigen e interpretan de conformidad con las leyes del Estado de {{governingLaw}}, sin tener en cuenta las disposiciones sobre conflicto de leyes de dicha {{governingLaw}}. Cualquier demanda, acción o procedimiento legal relacionado con este MNDA deberá iniciarse en los tribunales federales o estatales ubicados en {{jurisdiction}}. Cada parte se somete irrevocablemente a la jurisdicción exclusiva de dicha {{jurisdiction}} en cualquier demanda, acción o procedimiento de ese tipo.",
  },
  {
    number: 10,
    title: "Medidas Cautelares",
    body: "El incumplimiento de este MNDA puede causar un daño irreparable para el cual los daños monetarios serían un remedio insuficiente. Ante un incumplimiento de este MNDA, la Parte Divulgadora tiene derecho a solicitar las medidas cautelares apropiadas, incluida una orden judicial de cesación, además de sus demás recursos.",
  },
  {
    number: 11,
    title: "Disposiciones Generales",
    body: "Ninguna de las partes tiene la obligación, en virtud de este MNDA, de divulgar Información Confidencial a la otra ni de proseguir con ninguna transacción propuesta. Ninguna de las partes podrá cesionar este MNDA sin el consentimiento previo por escrito de la otra parte, salvo que cualquiera de las partes podrá cederlo en relación con una fusión, reorganización, adquisición u otra transferencia de la totalidad o sustancialmente la totalidad de sus activos o valores con derecho a voto. Cualquier cesión que infrinja esta Sección será nula y sin efecto. Este MNDA vinculará y beneficiará a los sucesores y cesionarios permitidos de cada parte. Las renuncias deberán ser firmadas por el representante autorizado de la parte que renuncia y no podrán inferirse de la conducta. Si alguna disposición de este MNDA se considera inaplicable, se limitará en la medida mínima necesaria para que el resto del MNDA siga vigente. Este MNDA (incluida la Portada) constituye el acuerdo íntegro entre las partes respecto de su objeto, y sustituye todo entendimiento, acuerdo, declaración y garantía previos y contemporáneos, ya sea escrito u oral, relativo a dicho objeto. Este MNDA solo podrá modificarse, enmendarse, renunciarse o complementarse mediante un acuerdo por escrito firmado por ambas partes. Las notificaciones, solicitudes y aprobaciones bajo este MNDA deberán enviarse por escrito a las direcciones de correo electrónico o postales indicadas en la Portada, y se considerarán entregadas en el momento de su recepción. Este MNDA podrá firmarse en varios ejemplares, incluidas copias electrónicas, cada uno de los cuales se considerará un original y que en conjunto constituirán un mismo acuerdo.",
  },
];

export const NDA_ATTRIBUTION =
  "Acuerdo de Confidencialidad Mutuo de Common Paper, Versión 1.0 (commonpaper.com/standards/mutual-nda/1.0), de uso libre bajo licencia CC BY 4.0 (creativecommons.org/licenses/by/4.0).";

export interface ClauseSegment {
  text: string;
  bold?: boolean;
  filled?: boolean;
}

const PLACEHOLDER_FALLBACK: Record<keyof NdaFormData, string> = {
  partyAName: "[Nombre de la Parte A]",
  partyAAddress: "[Dirección de la Parte A]",
  partyASignatory: "[Firmante de la Parte A]",
  partyBName: "[Nombre de la Parte B]",
  partyBAddress: "[Dirección de la Parte B]",
  partyBSignatory: "[Firmante de la Parte B]",
  purpose: "[Propósito]",
  effectiveDate: "[Fecha de Vigencia]",
  mndaTerm: "[Plazo del MNDA]",
  termOfConfidentiality: "[Plazo de Confidencialidad]",
  governingLaw: "[Ley Aplicable]",
  jurisdiction: "[Jurisdicción]",
};

/** Splits clause body text into plain/bold/filled-placeholder segments for rendering. */
export function getClauseSegments(body: string, values: NdaFormData): ClauseSegment[] {
  const segments: ClauseSegment[] = [];
  const boldParts = body.split(/\*\*(.*?)\*\*/g);

  boldParts.forEach((part, i) => {
    const bold = i % 2 === 1;
    const placeholderParts = part.split(/\{\{(\w+)\}\}/g);

    placeholderParts.forEach((piece, j) => {
      if (j % 2 === 1) {
        const key = piece as keyof NdaFormData;
        const value = values[key]?.trim() || PLACEHOLDER_FALLBACK[key];
        segments.push({ text: value, bold, filled: true });
      } else if (piece) {
        segments.push({ text: piece, bold });
      }
    });
  });

  return segments;
}
