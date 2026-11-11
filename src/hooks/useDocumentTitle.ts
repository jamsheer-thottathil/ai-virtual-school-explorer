import { useEffect } from 'react';
import { school } from '../services/contentService';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${school.name}` : `${school.name} · AI Virtual School Explorer`;
  }, [title]);
}
