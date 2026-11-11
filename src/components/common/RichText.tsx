import { Fragment, type ReactNode } from 'react';

/**
 * Tiny, safe Markdown subset renderer for AI answers:
 * paragraphs, "-"/"•"/"*" bullet lists, numbered lists, **bold**, _italic_ / *italic*.
 * Builds React elements only – never injects HTML.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|_[^_]+_|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) parts.push(<strong key={`${keyPrefix}-${i}`}>{token.slice(2, -2)}</strong>);
    else parts.push(<em key={`${keyPrefix}-${i}`}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
    i += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim().length);
        if (!lines.length) return null;
        const isBullets = lines.every((l) => /^\s*([-•*])\s+/.test(l));
        const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isBullets || isNumbered) {
          const Tag = isNumbered ? 'ol' : 'ul';
          return (
            <Tag key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*([-•*]|\d+[.)])\s+/, ''), `${bi}-${li}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l.replace(/^#{1,6}\s+/, ''), `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
