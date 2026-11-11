import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { assetUrl } from '../../utils/assets';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  /** Load eagerly (for above-the-fold hero images). */
  priority?: boolean;
  wrapperClassName?: string;
}

/** Image with native lazy loading, fade-in, and a graceful broken-image state. */
export function LazyImage({ src, alt, priority, className, wrapperClassName, ...rest }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`img-fallback ${wrapperClassName ?? ''}`} role="img" aria-label={alt}>
        <ImageOff size={28} aria-hidden="true" />
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={assetUrl(src)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`lazy-img ${loaded ? 'is-loaded' : ''} ${className ?? ''}`}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
