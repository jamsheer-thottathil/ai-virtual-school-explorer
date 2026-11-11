import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Hotspot, PanoramaConfig } from '../../types';
import { assetUrl } from '../../utils/assets';

let pannellumPromise: Promise<PannellumStatic> | null = null;

/** Load Pannellum (JS + CSS) on demand, so visitors without panoramas never download it. */
function loadPannellum(): Promise<PannellumStatic> {
  if (!pannellumPromise) {
    pannellumPromise = Promise.all([
      import('pannellum/build/pannellum.js'),
      import('pannellum/build/pannellum.css')
    ]).then(() => {
      if (!window.pannellum) throw new Error('Pannellum failed to initialise');
      return window.pannellum;
    });
    pannellumPromise.catch(() => {
      pannellumPromise = null;
    });
  }
  return pannellumPromise;
}

interface PanoramaViewerProps {
  panorama: PanoramaConfig;
  title: string;
  hotspots: Hotspot[];
  onHotspot: (hotspot: Hotspot) => void;
  onNavigate: (target: string) => void;
  onError: (reason: string) => void;
}

/**
 * True 360° viewer (Pannellum). Drag/swipe to look around, pinch or scroll to zoom.
 * Only used when the location JSON has a `panorama` object.
 */
export function PanoramaViewer({ panorama, title, hotspots, onHotspot, onNavigate, onError }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const [loading, setLoading] = useState(true);
  const handlers = useRef({ onHotspot, onNavigate, onError });
  handlers.current = { onHotspot, onNavigate, onError };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadPannellum()
      .then((pannellum) => {
        if (cancelled || !containerRef.current) return;
        const hotSpots = hotspots
          .filter((h) => h.panoramaPosition)
          .map((h) => ({
            pitch: h.panoramaPosition!.pitch,
            yaw: h.panoramaPosition!.yaw,
            type: 'info',
            cssClass: `pano-hotspot pano-hotspot-${h.type}`,
            createTooltipFunc: (div: HTMLElement) => {
              div.setAttribute('role', 'button');
              div.setAttribute('aria-label', h.type === 'navigation' ? `Go to ${h.title}` : `Information: ${h.title}`);
              div.setAttribute('title', h.label ?? h.title);
              const label = document.createElement('span');
              label.className = 'pano-hotspot-label';
              label.textContent = h.label ?? h.title;
              div.appendChild(label);
            },
            clickHandlerFunc: () => {
              if (h.type === 'navigation' && h.target) handlers.current.onNavigate(h.target);
              else handlers.current.onHotspot(h);
            }
          }));

        const viewer = pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: assetUrl(panorama.src),
          preview: panorama.preview ? assetUrl(panorama.preview) : undefined,
          autoLoad: true,
          showControls: true,
          showFullscreenCtrl: true,
          showZoomCtrl: true,
          compass: false,
          mouseZoom: 'fullscreenonly',
          keyboardZoom: true,
          draggable: true,
          friction: 0.15,
          yaw: panorama.initialYaw ?? 0,
          pitch: panorama.initialPitch ?? 0,
          hfov: panorama.initialHfov ?? 100,
          minHfov: 40,
          maxHfov: 120,
          autoRotate: panorama.autoRotate ?? -2,
          autoRotateInactivityDelay: 4000,
          haov: panorama.haov,
          vaov: panorama.vaov,
          strings: { loadingLabel: 'Loading 360° view…' },
          hotSpots
        });
        viewer.on('load', () => !cancelled && setLoading(false));
        viewer.on('error', (msg) => !cancelled && handlers.current.onError(String(msg ?? 'Panorama failed to load')));
        viewerRef.current = viewer;
      })
      .catch((err: unknown) => {
        if (!cancelled) handlers.current.onError(err instanceof Error ? err.message : 'Panorama viewer unavailable');
      });

    return () => {
      cancelled = true;
      try {
        viewerRef.current?.destroy();
      } catch {
        /* viewer already gone */
      }
      viewerRef.current = null;
    };
    // Rebuild when the panorama or hotspot set changes (i.e. a new location).
  }, [panorama, hotspots]);

  return (
    <div className="panorama-wrap">
      <div ref={containerRef} className="panorama-canvas" role="application" aria-label={`360 degree view of ${title}. Drag to look around.`} />
      {loading && (
        <div className="viewer-loading" aria-live="polite">
          <Loader2 className="spin" size={28} aria-hidden="true" /> Loading 360° view…
        </div>
      )}
    </div>
  );
}
