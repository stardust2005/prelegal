import { parseInlineSegments, parseMarkdownBlocks } from "@/lib/markdown";
import { DocumentDetail, DocumentValues } from "@/types/document";

interface DocumentPreviewProps {
  document: DocumentDetail;
  values: DocumentValues;
}

export default function DocumentPreview({ document, values }: DocumentPreviewProps) {
  const blocks = parseMarkdownBlocks(document.body);

  return (
    <article className="flex flex-col gap-3 text-sm leading-6 text-zinc-800">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Heading = block.level === 1 ? "h2" : "h3";
          return (
            <Heading key={i} className="text-base font-semibold text-zinc-900">
              {block.text}
            </Heading>
          );
        }

        const segments = parseInlineSegments(block.text, values, document.fields);
        const content = segments.map((segment, j) =>
          segment.href ? (
            <a
              key={j}
              href={segment.href}
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              {segment.text}
            </a>
          ) : (
            <span
              key={j}
              className={[segment.bold ? "font-semibold" : "", segment.filled ? "underline" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {segment.text}
            </span>
          )
        );

        if (block.type === "list-item") {
          return (
            <p key={i} style={{ marginLeft: `${block.depth * 1.5}rem` }}>
              <span className="font-medium">{block.marker}.</span> {content}
            </p>
          );
        }

        return <p key={i}>{content}</p>;
      })}
    </article>
  );
}
