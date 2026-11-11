import { FlaskConical } from 'lucide-react';

/** Visible label for illustrative content that is not a verified school record. */
export function SampleBadge({ text = 'Sample data', title }: { text?: string; title?: string }) {
  return (
    <span className="sample-badge" title={title ?? 'Illustrative sample content – not a verified school record'}>
      <FlaskConical size={13} aria-hidden="true" />
      {text}
    </span>
  );
}

export function SampleNotice({ children }: { children: string }) {
  return (
    <p className="sample-notice" role="note">
      <FlaskConical size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
