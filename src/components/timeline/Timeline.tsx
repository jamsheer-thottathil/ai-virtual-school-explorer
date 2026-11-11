import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimelineEntry } from '../../types';
import { MilestoneDetail } from './MilestoneDetail';
import { centerHorizontally } from '../../utils/dom';

/**
 * Interactive timeline: horizontal track on desktop, vertical on mobile (CSS).
 * Includes a year selector, previous/next controls and arrow-key navigation.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectId = useId();
  const active = entries[activeIndex];

  useEffect(() => {
    centerHorizontally(itemRefs.current[activeIndex]);
  }, [activeIndex]);

  if (!entries.length) return <p className="muted">No timeline entries have been added yet.</p>;

  const go = (i: number) => setActiveIndex(Math.max(0, Math.min(entries.length - 1, i)));

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      go(activeIndex + 1);
      itemRefs.current[Math.min(entries.length - 1, activeIndex + 1)]?.focus();
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      go(activeIndex - 1);
      itemRefs.current[Math.max(0, activeIndex - 1)]?.focus();
    }
  };

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <label htmlFor={selectId} className="timeline-select-label">
          Jump to year
        </label>
        <select id={selectId} value={activeIndex} onChange={(e) => go(Number(e.target.value))} className="select">
          {entries.map((en, i) => (
            <option key={en.id} value={i}>
              {en.year} – {en.title}
            </option>
          ))}
        </select>
        <div className="timeline-steppers">
          <button type="button" className="icon-btn" onClick={() => go(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous milestone">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span className="muted small" aria-live="polite">
            {activeIndex + 1} / {entries.length}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => go(activeIndex + 1)}
            disabled={activeIndex === entries.length - 1}
            aria-label="Next milestone"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="timeline-track-wrap">
        <ol className="timeline-track" onKeyDown={onKey} aria-label="Milestones">
          {entries.map((en, i) => (
            <li key={en.id} className={i === activeIndex ? 'active' : i < activeIndex ? 'past' : ''}>
              <button
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                onClick={() => go(i)}
                aria-pressed={i === activeIndex}
                tabIndex={i === activeIndex ? 0 : -1}
              >
                <span className="tl-year">{en.year}</span>
                <span className="tl-dot" aria-hidden="true" />
                <span className="tl-title">{en.title}</span>
                <span className="tl-cat">{en.category}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <MilestoneDetail key={active.id} entry={active} />
    </div>
  );
}
