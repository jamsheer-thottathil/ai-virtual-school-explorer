/**
 * Content service
 * ---------------
 * Loads every JSON file in src/data at build time (Vite import.meta.glob).
 * Because content is bundled, the tour, gallery, history and challenges work
 * offline once the page has loaded, and no runtime fetches can 404 on
 * GitHub Pages.
 *
 * To add content, just add a JSON file to the right folder – it is picked
 * up automatically. No component needs to change.
 */
import type {
  AiConfig,
  AiPrompts,
  Challenge,
  FutureSchoolData,
  GalleryCategory,
  LocationData,
  SchoolData,
  TimelineData
} from '../types';

import schoolJson from '../data/school.json';
import timelineJson from '../data/history/timeline.json';
import futureJson from '../data/future-school/scenarios.json';
import aiConfigJson from '../data/ai/config.json';
import aiPromptsJson from '../data/ai/prompts.json';

const locationModules = import.meta.glob('../data/locations/*.json', { eager: true, import: 'default' });
const galleryModules = import.meta.glob('../data/gallery/*.json', { eager: true, import: 'default' });
const challengeModules = import.meta.glob('../data/challenges/*.json', { eager: true, import: 'default' });

function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

export const school = schoolJson as SchoolData;
export const timeline = timelineJson as TimelineData;
export const futureSchool = futureJson as FutureSchoolData;
export const aiConfig = aiConfigJson as AiConfig;
export const aiPrompts = aiPromptsJson as AiPrompts;

export const locations: LocationData[] = (Object.values(locationModules) as LocationData[]).sort(byOrder);
export const galleryCategories: GalleryCategory[] = (Object.values(galleryModules) as GalleryCategory[]).sort(byOrder);
export const challenges: Challenge[] = (Object.values(challengeModules) as Challenge[]).sort(byOrder);

const locationMap = new Map(locations.map((l) => [l.id, l]));

export function getLocation(id: string | undefined): LocationData | undefined {
  return id ? locationMap.get(id) : undefined;
}

export function getLocationName(id: string): string {
  return locationMap.get(id)?.name ?? id;
}

export function getStartLocation(): LocationData {
  return getLocation(school.startLocation) ?? locations[0];
}

/** Previous / next stop in tour order (wraps around). */
export function getTourNeighbours(id: string): { prev: LocationData; next: LocationData } | null {
  const index = locations.findIndex((l) => l.id === id);
  if (index < 0 || locations.length < 2) return null;
  return {
    prev: locations[(index - 1 + locations.length) % locations.length],
    next: locations[(index + 1) % locations.length]
  };
}

/** Navigation links whose target exists (broken links are skipped with a dev warning). */
export function getValidNavigation(location: LocationData) {
  return location.navigation.filter((link) => {
    const ok = locationMap.has(link.to);
    if (!ok && import.meta.env.DEV) {
      console.warn(`[content] ${location.id}.json links to unknown location "${link.to}"`);
    }
    return ok;
  });
}

export function getChallenge(id: string | undefined): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}

export function getGalleryCategory(id: string | undefined): GalleryCategory | undefined {
  return galleryCategories.find((c) => c.id === id);
}

/** Unique, undirected connections for drawing the campus map. */
export function getMapConnections(): [LocationData, LocationData][] {
  const seen = new Set<string>();
  const result: [LocationData, LocationData][] = [];
  for (const loc of locations) {
    for (const link of loc.navigation) {
      const target = locationMap.get(link.to);
      if (!target) continue;
      const key = [loc.id, target.id].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      result.push([loc, target]);
    }
  }
  return result;
}
