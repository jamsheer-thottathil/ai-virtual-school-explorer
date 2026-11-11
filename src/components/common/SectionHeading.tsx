import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
  as: Tag = 'h2'
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  actions?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={`section-heading align-${align}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag className="section-title">{title}</Tag>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
