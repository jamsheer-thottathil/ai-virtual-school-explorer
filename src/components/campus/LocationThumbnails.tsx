import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { locations } from '../../services/contentService';
import { LazyImage } from '../common/LazyImage';
import { centerHorizontally } from '../../utils/dom';

/** Horizontal filmstrip of every location, current one highlighted and scrolled into view. */
export function LocationThumbnails({ currentId }: { currentId?: string }) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    centerHorizontally(activeRef.current);
  }, [currentId]);

  return (
    <nav className="thumb-strip" aria-label="All campus locations">
      <ol>
        {locations.map((loc) => {
          const active = loc.id === currentId;
          return (
            <li key={loc.id}>
              <Link
                ref={active ? activeRef : undefined}
                to={`/campus/${loc.id}`}
                className={`thumb-card ${active ? 'active' : ''}`}
                aria-current={active ? 'location' : undefined}
              >
                <LazyImage src={loc.thumbnail} alt="" />
                <span className="thumb-order">{String(loc.order).padStart(2, '0')}</span>
                <span className="thumb-name">{loc.name}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
