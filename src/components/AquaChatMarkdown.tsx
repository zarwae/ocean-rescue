import React from 'react';

interface AquaChatMarkdownProps {
  text: string;
}

function renderInlineFormatting(line: string): React.ReactNode[] {
  // Parse **bold**, *italic*, `code`, and [label](https://...)
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${keyCounter++}`} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${keyCounter++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${keyCounter++}`}
          className="px-1.5 py-0.5 rounded bg-[var(--bg-canvas)]/70 border border-[var(--border-hairline)] text-[11px] font-medium text-[var(--accent-teal)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token);
      if (linkMatch) {
        parts.push(
          <a
            key={`a-${keyCounter++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-teal)] underline underline-offset-2 hover:opacity-80"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export const AquaChatMarkdown: React.FC<AquaChatMarkdownProps> = ({ text }) => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${i}`} className="border-t border-[var(--border-hairline)] my-2" />);
      i++;
      continue;
    }

    // Headings (#, ##, ###)
    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(
        <h4
          key={`h-${i}`}
          className={`font-display font-medium text-[var(--text-primary)] leading-snug ${
            level <= 2 ? 'text-sm sm:text-base mt-1.5' : 'text-[13px] sm:text-sm mt-1'
          }`}
        >
          {renderInlineFormatting(headingMatch[2])}
        </h4>
      );
      i++;
      continue;
    }

    // Unordered list (- or *)
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="space-y-1.5 pl-4 list-disc marker:text-[var(--accent-teal)]">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. 2. ...)
    if (/^\d+\.\s+/.test(trimmed)) {
      const orderedItems: Array<{ num: string; content: string }> = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const match = /^(\d+)\.\s+(.+)$/.exec(lines[i].trim());
        if (match) {
          orderedItems.push({ num: match[1], content: match[2] });
        }
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="space-y-1.5">
          {orderedItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-teal)] pt-0.5 shrink-0">
                {item.num}.
              </span>
              <span>{renderInlineFormatting(item.content)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph
    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^(#{1,4})\s+/.test(lines[i].trim()) &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInlineFormatting(paraLines.join(' '))}
      </p>
    );
  }

  return <div className="space-y-2">{blocks}</div>;
};
