export type DocumentValues = Record<string, string>;

export interface DocumentDetail {
  id: string;
  name: string;
  description: string;
  fields: Record<string, string>;
  body: string;
}
