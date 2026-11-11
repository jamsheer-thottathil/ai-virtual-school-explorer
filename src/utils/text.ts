const STOP_WORDS = new Set(
  (
    'a an the and or but if then of to in on at for with about from by is are was were be been being ' +
    'this that these those it its as into over under what which who whom whose when where why how ' +
    'do does did can could should would will shall may might must i me my we our ours you your yours ' +
    'he she they them their there here tell please show give know any some all more most very much ' +
    'school location place'
  ).split(' ')
);

/** Lower-case word tokens without stop words. Very light stemming. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .map(stem);
}

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && /(ss|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  if (word.length > 6 && word.endsWith('ing')) return word.slice(0, -3);
  return word;
}

/** Overlap score between query tokens and a document's tokens. */
export function overlapScore(queryTokens: string[], docTokens: string[]): number {
  if (!queryTokens.length || !docTokens.length) return 0;
  const doc = new Set(docTokens);
  let score = 0;
  for (const t of new Set(queryTokens)) {
    if (doc.has(t)) score += 1;
    else if (t.length > 4 && docTokens.some((d) => d.startsWith(t.slice(0, 5)))) score += 0.5;
  }
  return score / Math.sqrt(new Set(queryTokens).size);
}

/** Number of distinct query tokens found exactly in the document. */
export function exactMatches(queryTokens: string[], docTokens: string[]): number {
  const doc = new Set(docTokens);
  return [...new Set(queryTokens)].filter((t) => doc.has(t)).length;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function createId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Fill {placeholders} in a template string. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
