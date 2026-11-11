import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  CornerUpRight,
  Image as ImageIcon,
  Info,
  Map as MapIcon,
  Rotate3d,
  Undo2,
  Redo2
} from 'lucide-react';
import type { Hotspot, NavigationDirection } from '../types';
import { getLocation, getLocationName, getTourNeighbours, getValidNavigation } from '../services/contentService';
import { useAiGuide } from '../hooks/AiGuideContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PanoramaViewer } from '../components/campus/PanoramaViewer';
import { ImageViewer } from '../components/campus/ImageViewer';
import { HotspotPanel } from '../components/campus/HotspotPanel';
import { LocationThumbnails } from '../components/campus/LocationThumbnails';
import { LocationDetails } from '../components/campus/LocationDetails';
import { CampusMap } from '../components/campus/CampusMap';
import { Modal } from '../components/common/Modal';
import { SampleBadge } from '../components/common/SampleBadge';
import NotFoundPage from './NotFoundPage';

const DIRECTION_ICON: Record<NavigationDirection, typeof ArrowUp> = {
  forward: ArrowUp,
  back: ArrowDown,
  left: CornerUpLeft,
  right: CornerUpRight,
  up: ArrowUp,
  down: ArrowDown
};

export default function LocationPage() {
  const { locationId } = useParams();
  const location = getLocation(locationId);
  const navigate = useNavigate();
  const { setCurrentLocationId, openDrawer } = useAiGuide();
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [panoramaFailed, setPanoramaFailed] = useState<string | null>(null);
  const [preferPhoto, setPreferPhoto] = useState(false);

  useDocumentTitle(location?.name);

  // Tell the AI guide where the visitor is.
  useEffect(() => {
    setCurrentLocationId(location?.id ?? null);
    return () => setCurrentLocationId(null);
  }, [location?.id, setCurrentLocationId]);

  useEffect(() => {
    setActiveHotspot(null);
    setPanoramaFailed(null);
    setPreferPhoto(false);
  }, [location?.id]);

  const goTo = useCallback((id: string) => navigate(`/campus/${id}`), [navigate]);
  const neighbours = location ? getTourNeighbours(location.id) : null;
  const links = useMemo(() => (location ? getValidNavigation(location) : []), [location]);

  const onSwipe = useCallback(
    (dir: 'left' | 'right') => {
      if (!neighbours) return;
      goTo(dir === 'left' ? neighbours.next.id : neighbours.prev.id);
    },
    [neighbours, goTo]
  );

  if (!location) return <NotFoundPage />;

  const usePanorama = Boolean(location.panorama) && !panoramaFailed && !preferPhoto;
  const infoHotspots = location.hotspots.filter((h) => h.type === 'info');

  return (
    <div className="location-page">
      <section className="viewer-section" aria-label={`${location.name} viewer`}>
        <div className="viewer-frame">
          {usePanorama && location.panorama ? (
            <PanoramaViewer
              key={location.id}
              panorama={location.panorama}
              title={location.name}
              hotspots={location.hotspots}
              onHotspot={setActiveHotspot}
              onNavigate={goTo}
              onError={setPanoramaFailed}
            />
          ) : (
            <ImageViewer
              key={location.id}
              image={location.mainImage}
              hotspots={location.hotspots}
              onHotspot={setActiveHotspot}
              onNavigate={goTo}
              onSwipe={onSwipe}
            />
          )}

          <div className="viewer-overlay-top">
            <div className="location-title glass">
              <span className="loc-order">{String(location.order).padStart(2, '0')}</span>
              <div>
                <p className="eyebrow">
                  {location.category} {location.isSampleData && <SampleBadge text="Sample" />}
                </p>
                <h1>{location.name}</h1>
              </div>
            </div>
            <div className="viewer-top-actions">
              <button type="button" className="icon-btn glass" onClick={() => navigate(-1)} aria-label="Go back">
                <Undo2 size={18} aria-hidden="true" />
              </button>
              <button type="button" className="icon-btn glass" onClick={() => navigate(1)} aria-label="Go forward">
                <Redo2 size={18} aria-hidden="true" />
              </button>
              <button type="button" className="icon-btn glass" onClick={() => setMapOpen(true)} aria-label="Open campus map">
                <MapIcon size={18} aria-hidden="true" />
              </button>
              {location.panorama && !panoramaFailed && (
                <button
                  type="button"
                  className="icon-btn glass"
                  onClick={() => setPreferPhoto((p) => !p)}
                  aria-label={preferPhoto ? 'Switch to 360° view' : 'Switch to photo view'}
                  title={preferPhoto ? '360° view' : 'Photo view'}
                >
                  {preferPhoto ? <Rotate3d size={18} aria-hidden="true" /> : <ImageIcon size={18} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>

          {neighbours && (
            <>
              <button type="button" className="tour-arrow prev glass" onClick={() => goTo(neighbours.prev.id)} aria-label={`Previous stop: ${neighbours.prev.name}`}>
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button type="button" className="tour-arrow next glass" onClick={() => goTo(neighbours.next.id)} aria-label={`Next stop: ${neighbours.next.name}`}>
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <p className="viewer-hint">
          {usePanorama
            ? 'Drag or swipe to look around 360°. Tap the glowing markers to learn more.'
            : 'Pinch or use the zoom buttons. Tap the glowing markers to learn more. Swipe to move to the next stop.'}
          {panoramaFailed && ' (360° view unavailable on this device – showing the photo instead.)'}
        </p>

        {links.length > 0 && (
          <nav className="nav-links" aria-label="Connected locations">
            <span className="nav-links-label">Walk to</span>
            {links.map((link) => {
              const Icon = DIRECTION_ICON[link.direction ?? 'forward'];
              return (
                <Link key={link.to} to={`/campus/${link.to}`} className="nav-link-btn">
                  <Icon size={16} aria-hidden="true" />
                  <span>
                    {link.label}
                    <small>{getLocationName(link.to)}</small>
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </section>

      <LocationThumbnails currentId={location.id} />

      <section className="section light location-info">
        <div className="container location-info-grid">
          <div className="location-intro">
            <p className="eyebrow">About this location</p>
            <h2 className="section-title">{location.name}</h2>
            <p className="lead">{location.shortDescription}</p>
            <p>{location.detailedDescription}</p>
            <div className="btn-row">
              <button type="button" className="btn btn-glow" onClick={() => openDrawer(`Tell me about this location – the ${location.name}.`)}>
                <Bot size={18} aria-hidden="true" /> Ask AI about the {location.name}
              </button>
              {neighbours && (
                <Link to={`/campus/${neighbours.next.id}`} className="btn btn-dark">
                  Next: {neighbours.next.name} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {infoHotspots.length > 0 && (
            <aside className="poi-list glass-light" aria-labelledby="poi-title">
              <h3 id="poi-title">
                <Info size={18} aria-hidden="true" /> Points of interest
              </h3>
              <ul>
                {infoHotspots.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => setActiveHotspot(h)}>
                      <span>{h.title}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
        <div className="container">
          <LocationDetails location={location} />
          {neighbours && (
            <div className="prev-next">
              <Link to={`/campus/${neighbours.prev.id}`} className="prev-next-card">
                <ArrowLeft size={18} aria-hidden="true" />
                <span>
                  <small>Previous stop</small>
                  {neighbours.prev.name}
                </span>
              </Link>
              <Link to={`/campus/${neighbours.next.id}`} className="prev-next-card next">
                <span>
                  <small>Next stop</small>
                  {neighbours.next.name}
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <HotspotPanel
        hotspot={activeHotspot}
        locationName={location.name}
        isSample={location.isSampleData}
        onClose={() => setActiveHotspot(null)}
      />

      <Modal open={mapOpen} onClose={() => setMapOpen(false)} title="Campus map" variant="center" className="map-modal">
        <CampusMap currentId={location.id} onSelect={() => setMapOpen(false)} />
      </Modal>
    </div>
  );
}
