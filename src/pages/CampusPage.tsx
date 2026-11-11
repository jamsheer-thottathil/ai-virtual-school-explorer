import { Link } from 'react-router-dom';
import { ArrowRight, Play, Rotate3d } from 'lucide-react';
import { getStartLocation, locations } from '../services/contentService';
import { CampusMap } from '../components/campus/CampusMap';
import { LazyImage } from '../components/common/LazyImage';
import { SectionHeading } from '../components/common/SectionHeading';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CampusPage() {
  useDocumentTitle('Virtual Campus');
  const start = getStartLocation();

  return (
    <>
      <section className="section dark page-hero">
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="Virtual campus explorer"
            title="Choose where to begin"
            description="Tap a point on the map or pick a stop below. Every location has information points, photos, and an AI guide that knows where you are."
            actions={
              <Link to={`/campus/${start.id}`} className="btn btn-primary btn-lg">
                <Play size={18} aria-hidden="true" /> Start guided tour
              </Link>
            }
          />
          <CampusMap />
        </div>
      </section>

      <section className="section light">
        <div className="container">
          <SectionHeading eyebrow="All locations" title="Campus stops" />
          <ul className="location-grid">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Link to={`/campus/${loc.id}`} className="location-card">
                  <div className="location-card-media">
                    <LazyImage src={loc.thumbnail} alt="" />
                    {loc.panorama && (
                      <span className="pill-360">
                        <Rotate3d size={14} aria-hidden="true" /> 360°
                      </span>
                    )}
                  </div>
                  <div className="location-card-body">
                    <small>
                      Stop {loc.order} · {loc.category}
                    </small>
                    <h3>{loc.name}</h3>
                    <p>{loc.shortDescription}</p>
                    <span className="link-arrow">
                      Visit <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
