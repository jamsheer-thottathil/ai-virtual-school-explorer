import { useState } from 'react';
import { Award, Building, Lightbulb, ScrollText } from 'lucide-react';
import type { LocationData } from '../../types';
import { LazyImage } from '../common/LazyImage';
import { VideoPlayer } from '../common/VideoPlayer';
import { Lightbox, type LightboxItem } from '../gallery/Lightbox';

function ListCard({ icon: Icon, title, items }: { icon: typeof Award; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="detail-card glass">
      <h3>
        <Icon size={18} aria-hidden="true" /> {title}
      </h3>
      <ul className="bullet-list">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

export function LocationDetails({ location }: { location: LocationData }) {
  const [index, setIndex] = useState<number | null>(null);
  const media: LightboxItem[] = location.relatedImages.map((img, i) => ({
    id: `${location.id}-r${i}`,
    type: 'image',
    src: img.src,
    alt: img.alt,
    caption: img.caption
  }));

  return (
    <div className="location-details">
      <div className="detail-grid">
        <ListCard icon={ScrollText} title="History" items={location.historicalInformation} />
        <ListCard icon={Lightbulb} title="Interesting facts" items={location.interestingFacts} />
        <ListCard icon={Building} title="Facilities" items={location.facilities} />
        <ListCard icon={Award} title="Achievements" items={location.achievements} />
      </div>

      {!!media.length && (
        <section className="detail-media">
          <h3>Photos from the {location.name}</h3>
          <div className="media-row">
            {media.map((m, i) => (
              <button key={m.id} type="button" className="media-tile" onClick={() => setIndex(i)} aria-label={`Open photo: ${m.alt}`}>
                <LazyImage src={m.src} alt="" />
                {m.caption && <span>{m.caption}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {!!location.videos.length && (
        <section className="detail-media">
          <h3>Videos</h3>
          <div className="video-grid">
            {location.videos.map((v) => (
              <VideoPlayer key={v.src} video={v} />
            ))}
          </div>
        </section>
      )}

      <Lightbox items={media} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </div>
  );
}
