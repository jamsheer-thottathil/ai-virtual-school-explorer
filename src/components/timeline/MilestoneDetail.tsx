import { useState } from 'react';
import type { TimelineEntry } from '../../types';
import { LazyImage } from '../common/LazyImage';
import { SampleBadge } from '../common/SampleBadge';
import { Lightbox, type LightboxItem } from '../gallery/Lightbox';

export function MilestoneDetail({ entry }: { entry: TimelineEntry }) {
  const [index, setIndex] = useState<number | null>(null);
  const media: LightboxItem[] = [entry.image, ...entry.gallery].map((img, i) => ({
    id: `${entry.id}-${i}`,
    type: 'image',
    src: img.src,
    alt: img.alt,
    caption: img.caption
  }));

  return (
    <article className="milestone glass fade-in" aria-live="polite">
      <button type="button" className="milestone-image" onClick={() => setIndex(0)} aria-label={`Enlarge image: ${entry.image.alt}`}>
        <LazyImage src={entry.image.src} alt={entry.image.alt} />
      </button>
      <div className="milestone-body">
        <p className="eyebrow">
          {entry.year} · {entry.category} {entry.isSampleData && <SampleBadge />}
        </p>
        <h3>{entry.title}</h3>
        <p className="lead">{entry.summary}</p>
        <ul className="bullet-list">
          {entry.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {entry.gallery.length > 0 && (
          <div className="thumb-grid">
            {entry.gallery.map((g, i) => (
              <button key={g.src + i} type="button" className="thumb-btn" onClick={() => setIndex(i + 1)} aria-label={`View photo: ${g.alt}`}>
                <LazyImage src={g.src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <Lightbox items={media} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </article>
  );
}
