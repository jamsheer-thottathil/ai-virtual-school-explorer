import { ArrowUpRight, Info } from 'lucide-react';
import type { Hotspot } from '../../types';
import { getLocationName } from '../../services/contentService';

export function HotspotMarker({
  hotspot,
  index,
  inverseScale,
  onActivate
}: {
  hotspot: Hotspot;
  index: number;
  inverseScale: number;
  onActivate: () => void;
}) {
  const isNav = hotspot.type === 'navigation';
  const label = hotspot.label ?? hotspot.title;
  const aria = isNav && hotspot.target ? `Go to ${getLocationName(hotspot.target)}` : `Information: ${hotspot.title}`;

  return (
    <button
      type="button"
      className={`hotspot hotspot-${hotspot.type}`}
      style={{
        left: `${hotspot.position.x}%`,
        top: `${hotspot.position.y}%`,
        transform: `translate(-50%, -50%) scale(${inverseScale})`,
        animationDelay: `${index * 120}ms`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      aria-label={aria}
    >
      <span className="hotspot-dot" aria-hidden="true">
        {isNav ? <ArrowUpRight size={16} /> : <Info size={16} />}
      </span>
      <span className="hotspot-label" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}
