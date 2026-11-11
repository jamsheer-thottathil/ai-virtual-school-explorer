import { Play } from 'lucide-react';
import type { GalleryItem } from '../../types';
import { LazyImage } from '../common/LazyImage';

export interface GridItem extends GalleryItem {
  categoryTitle: string;
}

/** Responsive masonry-style grid. Clicking an item opens the lightbox. */
export function GalleryGrid({ items, onOpen }: { items: GridItem[]; onOpen: (index: number) => void }) {
  if (!items.length) return <p className="muted center">No media in this category yet.</p>;

  return (
    <ul className="gallery-grid">
      {items.map((item, i) => (
        <li key={item.id} className="gallery-cell" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
          <button type="button" className="gallery-item" onClick={() => onOpen(i)} aria-label={`Open ${item.type}: ${item.caption}`}>
            <LazyImage src={item.thumbnail ?? (item.type === 'video' ? item.poster ?? '' : item.src)} alt={item.alt} />
            {item.type === 'video' && (
              <span className="play-badge" aria-hidden="true">
                <Play size={20} />
              </span>
            )}
            <span className="gallery-caption">
              <small>{item.categoryTitle}</small>
              {item.caption}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
