import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { galleryCategories } from '../services/contentService';
import { GalleryGrid, type GridItem } from '../components/gallery/GalleryGrid';
import { Lightbox } from '../components/gallery/Lightbox';
import { SectionHeading } from '../components/common/SectionHeading';
import { SampleNotice } from '../components/common/SampleBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function GalleryPage() {
  useDocumentTitle('Gallery');
  const [params, setParams] = useSearchParams();
  const active = params.get('category') ?? 'all';
  const [index, setIndex] = useState<number | null>(null);

  const items: GridItem[] = useMemo(() => {
    const cats = active === 'all' ? galleryCategories : galleryCategories.filter((c) => c.id === active);
    return cats.flatMap((c) => c.items.map((i) => ({ ...i, categoryTitle: c.title })));
  }, [active]);

  const activeCategory = galleryCategories.find((c) => c.id === active);
  const anySample = galleryCategories.some((c) => c.isSampleData);

  const select = (id: string) => {
    setIndex(null);
    if (id === 'all') setParams({}, { replace: true });
    else setParams({ category: id }, { replace: true });
  };

  return (
    <section className="section dark page-hero gallery-page">
      <div className="container">
        <SectionHeading
          as="h1"
          eyebrow="School gallery"
          title={activeCategory ? activeCategory.title : 'Moments from our campus'}
          description={activeCategory ? activeCategory.description : 'Browse photographs and videos by category. Tap any item to view it fullscreen.'}
        />
        {anySample && <SampleNotice>Images shown are sample placeholders. Replace them in public/assets/gallery and update src/data/gallery/*.json.</SampleNotice>}

        <div className="filter-bar" role="toolbar" aria-label="Filter gallery by category">
          <button type="button" className={`chip ${active === 'all' ? 'active' : ''}`} aria-pressed={active === 'all'} onClick={() => select('all')}>
            All
          </button>
          {galleryCategories.map((c) => (
            <button key={c.id} type="button" className={`chip ${active === c.id ? 'active' : ''}`} aria-pressed={active === c.id} onClick={() => select(c.id)}>
              {c.title} <span className="chip-count">{c.items.length}</span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {items.length} items
        </p>
        <GalleryGrid key={active} items={items} onOpen={setIndex} />
        <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
      </div>
    </section>
  );
}
