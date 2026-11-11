import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Hotspot, MediaImage } from '../../types';
import { assetUrl } from '../../utils/assets';
import { HotspotMarker } from './HotspotMarker';

interface ImageViewerProps {
  image: MediaImage;
  hotspots: Hotspot[];
  onHotspot: (hotspot: Hotspot) => void;
  onNavigate: (target: string) => void;
  onSwipe?: (direction: 'left' | 'right') => void;
}

const MIN = 1;
const MAX = 4;

/**
 * Fallback viewer for ordinary (non-360°) photos.
 * Zoom: buttons, pinch, double-tap/double-click, Ctrl/⌘ + wheel, keyboard +/-.
 * Pan: drag when zoomed, arrow keys. Swipe left/right (unzoomed) = next/previous stop.
 * Hotspots are positioned in % of the image box, so they stay aligned at any zoom.
 */
export function ImageViewer({ image, hotspots, onHotspot, onNavigate, onSwipe }: ImageViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startDist: number; startScale: number; startX: number; startY: number; startOffset: { x: number; y: number }; moved: boolean; pinched: boolean } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setLoaded(false);
  }, [image.src]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const clampOffset = useCallback((x: number, y: number, s: number) => {
    const layer = layerRef.current;
    if (!layer) return { x, y };
    const maxX = ((s - 1) * layer.offsetWidth) / 2;
    const maxY = ((s - 1) * layer.offsetHeight) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  }, []);

  const zoomTo = useCallback(
    (next: number) => {
      const s = Math.max(MIN, Math.min(MAX, next));
      setScale(s);
      setOffset((o) => (s === 1 ? { x: 0, y: 0 } : clampOffset(o.x, o.y, s)));
    },
    [clampOffset]
  );

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el.requestFullscreen) await el.requestFullscreen();
    } catch {
      /* fullscreen not allowed (e.g. iOS Safari) – ignore */
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    const pts = [...pointers.current.values()];
    gesture.current = {
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startScale: scale,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: offset,
      moved: false,
      pinched: pts.length === 2
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.startDist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      zoomTo(g.startScale * (dist / g.startDist));
      g.moved = true;
      g.pinched = true;
      return;
    }
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
    if (scale > 1) setOffset(clampOffset(g.startOffset.x + dx, g.startOffset.y + dy, scale));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (!g || !wasSingle) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (!g.moved) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        zoomTo(scale > 1 ? 1 : 2);
        lastTap.current = 0;
      } else lastTap.current = now;
    } else if (!g.pinched && scale === 1 && onSwipe && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onSwipe(dx < 0 ? 'left' : 'right');
    }
    gesture.current = null;
  };

  // Native, non-passive wheel listener so Ctrl/⌘ + wheel can zoom without scrolling the page.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  useEffect(() => {
    const stage = stageRef.current?.querySelector<HTMLDivElement>('.image-stage');
    if (!stage) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && scaleRef.current === 1) return; // keep normal page scrolling
      e.preventDefault();
      zoomTo(scaleRef.current * (e.deltaY < 0 ? 1.15 : 0.87));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const step = 60;
    switch (e.key) {
      case '+':
      case '=':
        zoomTo(scale + 0.5);
        break;
      case '-':
        zoomTo(scale - 0.5);
        break;
      case '0':
        reset();
        break;
      case 'ArrowLeft':
        if (scale > 1) setOffset((o) => clampOffset(o.x + step, o.y, scale));
        else onSwipe?.('right');
        break;
      case 'ArrowRight':
        if (scale > 1) setOffset((o) => clampOffset(o.x - step, o.y, scale));
        else onSwipe?.('left');
        break;
      case 'ArrowUp':
        setOffset((o) => clampOffset(o.x, o.y + step, scale));
        break;
      case 'ArrowDown':
        setOffset((o) => clampOffset(o.x, o.y - step, scale));
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={stageRef}
      className={`image-viewer ${scale > 1 ? 'is-zoomed' : ''} ${isFullscreen ? 'is-fullscreen' : ''}`}
      style={{ ['--viewer-bg' as string]: `url("${assetUrl(image.src)}")` }}
    >
      <div
        className="image-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable image"
        aria-label={`${image.alt}. Use plus and minus to zoom, arrow keys to pan or change location.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div
          ref={layerRef}
          className="image-layer"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
        >
          <img
            src={assetUrl(image.src)}
            alt={image.alt}
            draggable={false}
            decoding="async"
            className={loaded ? 'is-loaded' : ''}
            onLoad={() => setLoaded(true)}
          />
          {loaded &&
            hotspots.map((h, i) => (
              <HotspotMarker
                key={h.id}
                hotspot={h}
                index={i}
                inverseScale={1 / scale}
                onActivate={() => (h.type === 'navigation' && h.target ? onNavigate(h.target) : onHotspot(h))}
              />
            ))}
        </div>
      </div>

      <div className="viewer-controls" role="toolbar" aria-label="Image controls">
        <button type="button" className="icon-btn" onClick={() => zoomTo(scale + 0.5)} aria-label="Zoom in" disabled={scale >= MAX}>
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={() => zoomTo(scale - 0.5)} aria-label="Zoom out" disabled={scale <= MIN}>
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={reset} aria-label="Reset view" disabled={scale === 1}>
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
        </button>
      </div>
      {image.caption && <p className="viewer-caption">{image.caption}</p>}
    </div>
  );
}
