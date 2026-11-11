/**
 * Knowledge service
 * -----------------
 * Turns the JSON records into (1) a grounded context block for the LLM and
 * (2) a small offline "records search" used whenever the AI is disabled,
 * unreachable, or no key/proxy is configured.
 *
 * The offline guide only ever quotes the loaded records. It never invents.
 */
import type { LocationData } from '../types';
import { exactMatches, overlapScore, tokenize, truncate } from '../utils/text';
import { aiPrompts, locations, school, timeline } from './contentService';

interface KnowledgeChunk {
  id: string;
  source: string;
  locationId?: string;
  title: string;
  text: string;
  tokens: string[];
}

function chunk(id: string, source: string, title: string, text: string, locationId?: string): KnowledgeChunk {
  return { id, source, title, text, locationId, tokens: tokenize(`${title} ${title} ${text}`) };
}

function buildChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const a = school.about;
  chunks.push(
    chunk('school-about', 'School profile', school.name, [
      a.summary,
      a.established ? `Established: ${a.established}.` : '',
      a.founder ? `Founder: ${a.founder}.` : '',
      a.affiliation ? `Affiliation: ${a.affiliation}.` : ''
    ].join(' '))
  );
  if (school.facilities.length) {
    chunks.push(chunk('school-facilities', 'School profile', 'Facilities available', school.facilities.join('; ')));
  }
  if (school.achievements.length) {
    chunks.push(chunk('school-achievements', 'School profile', 'School achievements', school.achievements.join('; ')));
  }

  for (const loc of locations) {
    chunks.push(
      chunk(`${loc.id}-about`, loc.name, loc.name, `${loc.shortDescription} ${loc.detailedDescription}`, loc.id)
    );
    if (loc.historicalInformation.length)
      chunks.push(chunk(`${loc.id}-history`, loc.name, `${loc.name} history`, loc.historicalInformation.join(' '), loc.id));
    if (loc.interestingFacts.length)
      chunks.push(chunk(`${loc.id}-facts`, loc.name, `${loc.name} interesting facts`, loc.interestingFacts.join(' '), loc.id));
    if (loc.facilities.length)
      chunks.push(chunk(`${loc.id}-facilities`, loc.name, `${loc.name} facilities`, loc.facilities.join('; '), loc.id));
    if (loc.achievements.length)
      chunks.push(chunk(`${loc.id}-achievements`, loc.name, `${loc.name} achievements`, loc.achievements.join('; '), loc.id));
    for (const h of loc.hotspots) {
      if (h.type !== 'info') continue;
      const text = [h.description ?? '', ...(h.historicalNotes ?? [])].join(' ');
      chunks.push(chunk(`${loc.id}-${h.id}`, `${loc.name} › ${h.title}`, h.title, text, loc.id));
    }
  }

  for (const entry of timeline.entries) {
    chunks.push(
      chunk(`timeline-${entry.id}`, `History timeline (${entry.year})`, `${entry.year} ${entry.title}`,
        `${entry.summary} ${entry.details.join(' ')}`)
    );
  }
  return chunks;
}

let cache: KnowledgeChunk[] | null = null;
function getChunks(): KnowledgeChunk[] {
  if (!cache) cache = buildChunks();
  return cache;
}

function list(label: string, items: string[]): string {
  return items.length ? `${label}:\n${items.map((i) => `- ${i}`).join('\n')}` : `${label}: (none recorded)`;
}

function describeLocation(loc: LocationData, detailed: boolean): string {
  const parts = [
    `Name: ${loc.name}`,
    `Description: ${loc.detailedDescription}`,
    list('Historical information', loc.historicalInformation),
    list('Facilities', loc.facilities),
    list('Achievements', loc.achievements),
    list('Interesting facts', loc.interestingFacts)
  ];
  if (detailed) {
    const hotspots = loc.hotspots
      .filter((h) => h.type === 'info')
      .map((h) => `${h.title}: ${h.description ?? ''} ${(h.historicalNotes ?? []).join(' ')}`.trim());
    parts.push(list('Information points (hotspots)', hotspots));
    if (loc.aiContext) parts.push(`Additional guide notes: ${loc.aiContext}`);
  }
  return parts.join('\n');
}

/**
 * Grounded context for the LLM. The current location is described in detail;
 * other locations are summarised so the guide can answer campus-wide questions.
 */
export function buildAiContext(currentLocation?: LocationData): string {
  const a = school.about;
  const sections: string[] = [];
  sections.push(
    [
      '### SCHOOL PROFILE',
      `School name: ${school.name}`,
      `Summary: ${a.summary}`,
      `Established: ${a.established ?? 'not recorded'}`,
      `Founder: ${a.founder ?? 'not recorded'}`,
      `Affiliation: ${a.affiliation ?? 'not recorded'}`,
      list('Facilities', school.facilities),
      list('Achievements', school.achievements),
      school.isSampleData ? `NOTE: ${school.sampleDataNotice}` : ''
    ].join('\n')
  );

  if (currentLocation) {
    sections.push(`### CURRENT LOCATION (the visitor is here now)\n${describeLocation(currentLocation, true)}`);
  } else {
    sections.push('### CURRENT LOCATION\nThe visitor is not inside a specific campus location right now.');
  }

  sections.push(
    `### OTHER CAMPUS LOCATIONS\n${locations
      .filter((l) => l.id !== currentLocation?.id)
      .map((l) => `- ${l.name}: ${l.shortDescription} Facilities: ${l.facilities.join(', ') || 'none recorded'}.`)
      .join('\n')}`
  );

  sections.push(
    `### HISTORY TIMELINE${timeline.isSampleData ? ' (SAMPLE DATA – not verified records)' : ''}\n${timeline.entries
      .map((e) => `- ${e.year}: ${e.title} – ${e.summary}`)
      .join('\n')}`
  );

  return sections.join('\n\n');
}

export function buildSystemPrompt(currentLocation?: LocationData): string {
  return `${aiPrompts.systemPrompt
    .replace(/\{schoolName\}/g, school.name)
    .replace(/\{unavailableMessage\}/g, aiPrompts.unavailableMessage)}\n\n=== SCHOOL RECORDS ===\n${buildAiContext(currentLocation)}\n=== END OF RECORDS ===`;
}

const THIS_LOCATION = /\b(this|here|current)\b.*\b(location|place|room|area|spot)\b|\bwhere am i\b|\bthis (location|place)\b/i;

/** Answer from the loaded records only (no network). */
export function answerFromRecords(question: string, currentLocation?: LocationData): string {
  const q = question.trim();
  if (!q) return aiPrompts.unavailableMessage;

  if (currentLocation && THIS_LOCATION.test(q)) {
    const loc = currentLocation;
    const facts = loc.interestingFacts.slice(0, 2).map((f) => `• ${f}`).join('\n');
    return `You are at the **${loc.name}**. ${loc.detailedDescription}${
      loc.facilities.length ? `\n\nFacilities here: ${loc.facilities.join(', ')}.` : ''
    }${facts ? `\n\nInteresting facts:\n${facts}` : ''}`;
  }

  const qTokens = tokenize(q);
  if (!qTokens.length) return aiPrompts.unavailableMessage;

  // Explicitly named location wins.
  const named = locations.find((l) =>
    tokenize(l.name).every((t) => qTokens.includes(t)) || q.toLowerCase().includes(l.id.replace(/-/g, ' '))
  );

  // Longer questions need at least two matching keywords, so one stray word
  // (e.g. "car" in an off-topic question) cannot pull in an unrelated record.
  const requiredHits = qTokens.length >= 3 ? 2 : 1;

  const scored = getChunks()
    .map((c) => {
      const isNamed = Boolean(named && c.locationId === named.id);
      let s = overlapScore(qTokens, c.tokens);
      if (isNamed) s += 0.8;
      if (!named && currentLocation && c.locationId === currentLocation.id) s += 0.25;
      const relevant = isNamed || exactMatches(qTokens, c.tokens) >= requiredHits;
      return { c, s: relevant ? s : 0 };
    })
    .filter((x) => x.s >= 0.55)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);

  if (!scored.length) return aiPrompts.unavailableMessage;

  const body = scored
    .map(({ c }) => `**${c.title}** _(source: ${c.source})_\n${truncate(c.text, 420)}`)
    .join('\n\n');
  return body;
}

/** Records-based pick for multiple-choice questions (offline "AI" player). */
export function chooseOptionFromRecords(question: string, options: string[]): number {
  const chunks = getChunks();
  const qTokens = tokenize(question);
  const relevant = chunks
    .map((c) => ({ c, s: overlapScore(qTokens, c.tokens) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => x.c);
  const haystack = relevant.map((c) => c.tokens).flat();
  let best = 0;
  let bestScore = -1;
  options.forEach((opt, i) => {
    const s = overlapScore(tokenize(opt), haystack);
    if (s > bestScore) {
      best = i;
      bestScore = s;
    }
  });
  return best;
}
