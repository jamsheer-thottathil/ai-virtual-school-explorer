import type { Badge } from '../types';

export function scorePercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

/** Highest badge whose threshold is met, or null. */
export function awardBadge(badges: Badge[], percent: number): Badge | null {
  const earned = badges
    .filter((b) => percent >= b.minScorePercent)
    .sort((a, b) => b.minScorePercent - a.minScorePercent);
  return earned[0] ?? null;
}
