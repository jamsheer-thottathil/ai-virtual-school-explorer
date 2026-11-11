const ABSOLUTE = /^(https?:)?\/\/|^data:|^blob:/i;

/**
 * Resolve a content path (relative to /public) to a URL that works on
 * GitHub Pages regardless of the repository sub-path.
 *   "assets/hero/hero.svg"  ->  "./assets/hero/hero.svg"  (with base "./")
 */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (ABSOLUTE.test(path)) return path;
  const clean = path.replace(/^\.?\//, '');
  const base = import.meta.env.BASE_URL || './';
  return `${base.endsWith('/') ? base : `${base}/`}${clean}`;
}

/** True for in-app routes like "/gallery" (as opposed to external links). */
export function isInternalLink(link: string): boolean {
  return link.startsWith('/') && !link.startsWith('//');
}
