import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getGalleryCategory, timeline } from '../services/contentService';
import { Timeline } from '../components/timeline/Timeline';
import { SectionHeading } from '../components/common/SectionHeading';
import { SampleNotice } from '../components/common/SampleBadge';
import { GalleryGrid, type GridItem } from '../components/gallery/GalleryGrid';
import { Lightbox } from '../components/gallery/Lightbox';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HistoryPage() {
  useDocumentTitle('Our History');
  const memories = getGalleryCategory('history');
  const items: GridItem[] = (memories?.items ?? []).map((i) => ({ ...i, categoryTitle: memories?.title ?? 'History' }));
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <section className="section dark page-hero history-hero">
        <div className="container">
          <SectionHeading as="h1" eyebrow="School history experience" title={timeline.title} description={timeline.subtitle} />
          {timeline.isSampleData && <SampleNotice>{timeline.notice}</SampleNotice>}
          <Timeline entries={timeline.entries} />
        </div>
      </section>

      {items.length > 0 && (
        <section className="section light">
          <div className="container">
            <SectionHeading
              eyebrow="Historical gallery"
              title={memories?.title ?? 'Historical memories'}
              description={memories?.description}
              actions={
                <Link to="/gallery?category=history" className="btn btn-dark">
                  Full gallery <ArrowRight size={16} aria-hidden="true" />
                </Link>
              }
            />
            <GalleryGrid items={items} onOpen={setIndex} />
            <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
          </div>
        </section>
      )}
    </>
  );
}
