/**
 * Centre `el` inside its nearest horizontally scrollable ancestor WITHOUT
 * scrolling the page vertically (unlike element.scrollIntoView).
 */
export function centerHorizontally(el: HTMLElement | null, smooth = true) {
  if (!el) return;
  let parent = el.parentElement;
  while (parent && parent.scrollWidth <= parent.clientWidth) parent = parent.parentElement;
  if (!parent || parent === document.body || parent === document.documentElement) return;
  const elRect = el.getBoundingClientRect();
  const pRect = parent.getBoundingClientRect();
  const left = parent.scrollLeft + (elRect.left - pRect.left) - (pRect.width - elRect.width) / 2;
  parent.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
}
