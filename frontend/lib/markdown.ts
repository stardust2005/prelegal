export interface InlineSegment {
  text: string;
  bold?: boolean;
  filled?: boolean;
  href?: string;
}

export type MdBlock =
  | { type: "heading"; level: 1 | 2; text: string }
  | { type: "list-item"; depth: number; marker: string; text: string }
  | { type: "paragraph"; text: string };

const LINK_RE = /\[([^\]]*)\]\(([^)]*)\)/g;
const HEADING_RE = /^(#{1,2})\s+(.*)$/;
const LIST_ITEM_RE = /^(\s*)([0-9]+|[a-zA-Z]+)\.\s+(.*)$/;

function parseLinks(text: string, bold: boolean): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index), bold: bold || undefined });
    }
    segments.push({ text: match[1], bold: bold || undefined, href: match[2] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: bold || undefined });
  }
  return segments;
}

export function parseInlineSegments(
  text: string,
  values: Record<string, string>,
  fieldLabels: Record<string, string>
): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const boldParts = text.split(/\*\*(.*?)\*\*/g);

  boldParts.forEach((part, i) => {
    const bold = i % 2 === 1;
    const placeholderParts = part.split(/\{\{(\w+)\}\}/g);

    placeholderParts.forEach((piece, j) => {
      if (j % 2 === 1) {
        const value = values[piece]?.trim();
        const label = fieldLabels[piece] ?? piece;
        segments.push({ text: value || `[${label}]`, bold: bold || undefined, filled: true });
        return;
      }
      if (!piece) return;
      segments.push(...parseLinks(piece, bold));
    });
  });

  return segments;
}

export function parseMarkdownBlocks(body: string): MdBlock[] {
  const blocks: MdBlock[] = [];

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length as 1 | 2, text: headingMatch[2] });
      continue;
    }

    const listMatch = LIST_ITEM_RE.exec(line);
    if (listMatch) {
      const depth = Math.round(listMatch[1].length / 4);
      blocks.push({ type: "list-item", depth, marker: listMatch[2], text: listMatch[3] });
      continue;
    }

    blocks.push({ type: "paragraph", text: line.trim() });
  }

  return blocks;
}
