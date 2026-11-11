import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** center = dialog, panel = slide-in from the right (bottom sheet on mobile), full = fullscreen viewer */
  variant?: 'center' | 'panel' | 'full';
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, variant = 'center', hideTitle, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(ref, open, onClose);
  useBodyScrollLock(open);

  if (!open) return null;

  return createPortal(
    <div className={`modal-root modal-${variant}`} role="presentation">
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={`modal-surface ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={`modal-header ${hideTitle ? 'visually-hidden-title' : ''}`}>
          <h2 id={titleId} className={hideTitle ? 'sr-only' : 'modal-title'}>
            {title}
          </h2>
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
