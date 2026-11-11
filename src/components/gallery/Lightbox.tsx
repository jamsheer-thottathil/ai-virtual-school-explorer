import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LazyImage } from '../common/LazyImage';
import { VideoPlayer } from '../common/VideoPlayer';

export interface LightboxItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  caption?: string;
  poster?: string;
  mimeType?: string;
}

/** Fullscreen media viewer with keyboard (←/→/Esc) and swipe navigation. */
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null && index >= 0 && index < items.length;
  const item = open ? items[index] : null;

  const go = (delta: number) => {
    if (index === null || items.length < 2) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'VIDEO') return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose} title={item.caption || item.alt} variant="full" hideTitle className="lightbox">
      <div
        className="lightbox-stage"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {items.length > 1 && (
          <button type="button" className="icon-btn lightbox-nav prev" onClick={() => go(-1)} aria-label="Previous item">
            <ChevronLeft size={28} aria-hidden="true" />
          </button>
        )}
        <div className="lightbox-media" key={item.id}>
          {item.type === 'video' ? (
            <VideoPlayer video={{ src: item.src, title: item.alt, poster: item.poster, caption: item.caption, mimeType: item.mimeType }} autoPlay />
          ) : (
            <LazyImage src={item.src} alt={item.alt} priority />
          )}
        </div>
        {items.length > 1 && (
          <button type="button" className="icon-btn lightbox-nav next" onClick={() => go(1)} aria-label="Next item">
            <ChevronRight size={28} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="lightbox-caption" aria-live="polite">
        {item.caption && <p>{item.caption}</p>}
        <span className="muted small">
          {index! + 1} / {items.length}
        </span>
      </div>
    </Modal>
  );
}
