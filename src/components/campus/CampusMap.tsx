import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getMapConnections, locations, school } from '../../services/contentService';
import { assetUrl } from '../../utils/assets';

/**
 * Interactive campus map. Marker positions come from each location's
 * `mapPosition`; paths are drawn from the `navigation` links.
 * The map artwork path is `campusMap` in src/data/school.json.
 */
export function CampusMap({ currentId, onSelect }: { currentId?: string; onSelect?: () => void }) {
  const connections = getMapConnections();

  return (
    <div className="campus-map" style={{ backgroundImage: `url("${assetUrl(school.campusMap)}")` }}>
      <svg className="campus-map-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {connections.map(([a, b]) => (
          <line
            key={`${a.id}-${b.id}`}
            x1={a.mapPosition.x}
            y1={a.mapPosition.y}
            x2={b.mapPosition.x}
            y2={b.mapPosition.y}
            className={a.id === currentId || b.id === currentId ? 'active' : ''}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <ol className="campus-map-markers" aria-label="Campus map locations">
        {locations.map((loc) => {
          const active = loc.id === currentId;
          return (
            <li key={loc.id} style={{ left: `${loc.mapPosition.x}%`, top: `${loc.mapPosition.y}%` }}>
              <Link
                to={`/campus/${loc.id}`}
                className={`map-marker ${active ? 'active' : ''}`}
                aria-current={active ? 'location' : undefined}
                onClick={onSelect}
              >
                <span className="map-marker-dot" aria-hidden="true">
                  {active ? <MapPin size={16} /> : loc.order}
                </span>
                <span className="map-marker-label">{loc.name}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
