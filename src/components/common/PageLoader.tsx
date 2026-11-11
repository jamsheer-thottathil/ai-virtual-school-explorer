import { Compass } from 'lucide-react';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Compass size={36} className="spin-slow" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
