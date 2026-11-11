import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ExternalLink, ScrollText } from 'lucide-react';
import type { Hotspot } from '../../types';
import { Modal } from '../common/Modal';
import { LazyImage } from '../common/LazyImage';
import { VideoPlayer } from '../common/VideoPlayer';
import { SampleBadge } from '../common/SampleBadge';
import { Lightbox, type LightboxItem } from '../gallery/Lightbox';
import { isInternalLink } from '../../utils/assets';
import { useAiGuide } from '../../hooks/AiGuideContext';

/** Slide-in information panel for an info hotspot. */
export function HotspotPanel({
  hotspot,
  locationName,
  isSample,
  onClose
}: {
  hotspot: Hotspot | null;
  locationName: string;
  isSample: boolean;
  onClose: () => void;
}) {
  const { openDrawer } = useAiGuide();
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  if (!hotspot) return null;
  const photos: LightboxItem[] = (hotspot.photos ?? []).map((p, i) => ({
    id: `${hotspot.id}-p${i}`,
    type: 'image',
    src: p.src,
    alt: p.alt,
    caption: p.caption
  }));

  const askAi = () => {
    const question = hotspot.aiQuestion ?? `Tell me about "${hotspot.title}" at the ${locationName}.`;
    onClose();
    // Wait for the panel to unmount so focus returns correctly before the drawer opens.
    window.setTimeout(() => openDrawer(question), 60);
  };

  return (
    <>
      <Modal
        open={Boolean(hotspot)}
        onClose={onClose}
        title={hotspot.title}
        variant="panel"
        className="hotspot-panel"
        footer={
          <button type="button" className="btn btn-glow btn-block" onClick={askAi}>
            <Bot size={18} aria-hidden="true" /> Ask AI about this
          </button>
        }
      >
        <p className="eyebrow">
          {locationName} {isSample && <SampleBadge />}
        </p>
        {hotspot.image && (
          <figure className="panel-hero">
            <LazyImage src={hotspot.image.src} alt={hotspot.image.alt} />
            {hotspot.image.caption && <figcaption>{hotspot.image.caption}</figcaption>}
          </figure>
        )}
        {hotspot.description && <p className="lead">{hotspot.description}</p>}

        {!!hotspot.historicalNotes?.length && (
          <section className="panel-section">
            <h3>
              <ScrollText size={16} aria-hidden="true" /> Historical notes
            </h3>
            <ul className="bullet-list">
              {hotspot.historicalNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
        )}

        {!!photos.length && (
          <section className="panel-section">
            <h3>Photos</h3>
            <div className="thumb-grid">
              {photos.map((p, i) => (
                <button key={p.id} type="button" className="thumb-btn" onClick={() => setPhotoIndex(i)} aria-label={`View photo: ${p.alt}`}>
                  <LazyImage src={p.src} alt="" />
                </button>
              ))}
            </div>
          </section>
        )}

        {!!hotspot.videos?.length && (
          <section className="panel-section">
            <h3>Videos</h3>
            {hotspot.videos.map((v) => (
              <VideoPlayer key={v.src} video={v} />
            ))}
          </section>
        )}

        {!!hotspot.relatedContent?.length && (
          <section className="panel-section">
            <h3>Related</h3>
            <ul className="related-links">
              {hotspot.relatedContent.map((r) => (
                <li key={r.link + r.label}>
                  {isInternalLink(r.link) ? (
                    <Link to={r.link} onClick={onClose}>
                      {r.label}
                    </Link>
                  ) : (
                    <a href={r.link} target="_blank" rel="noopener noreferrer">
                      {r.label} <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </Modal>
      <Lightbox items={photos} index={photoIndex} onClose={() => setPhotoIndex(null)} onIndexChange={setPhotoIndex} />
    </>
  );
}
