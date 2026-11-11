#!/usr/bin/env node
/**
 * Content validator – run before committing content changes:
 *   npm run validate:content
 * Checks JSON syntax, required fields, links between locations, hotspot
 * targets, challenge answers and that every referenced asset file exists.
 * Exits with code 1 if any error is found (also runs in GitHub Actions).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');
const PUBLIC = join(ROOT, 'public');
const errors = [];
const warnings = [];

function load(rel) {
  try {
    return JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
  } catch (e) {
    errors.push(`${rel}: invalid JSON – ${e.message}`);
    return null;
  }
}
const list = (dir) => readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json')).map((f) => `${dir}/${f}`);

function asset(file, path, where) {
  if (!path) return;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return;
  if (path.startsWith('/')) warnings.push(`${file}: "${path}" (${where}) starts with "/" – use a relative path like "assets/..." for GitHub Pages.`);
  if (!existsSync(join(PUBLIC, path.replace(/^\.?\//, '')))) errors.push(`${file}: missing asset "${path}" (${where})`);
}
function require(file, obj, keys) {
  for (const k of keys) if (obj[k] === undefined) errors.push(`${file}: missing field "${k}"`);
}

/* school */
const school = load('school.json');
if (school) {
  require('school.json', school, ['name', 'logo', 'heroImage', 'startLocation', 'hero', 'exhibition', 'about']);
  asset('school.json', school.logo, 'logo');
  asset('school.json', school.heroImage, 'heroImage');
  asset('school.json', school.campusMap, 'campusMap');
  asset('school.json', school.exhibition?.qrImage, 'exhibition.qrImage');
  school.quickAccess?.forEach((q, i) => asset('school.json', q.image, `quickAccess[${i}].image`));
}

/* locations */
const locFiles = list('locations');
const locations = locFiles.map((f) => [f, load(f)]).filter(([, l]) => l);
const ids = new Set(locations.map(([, l]) => l.id));
const orders = new Set();
for (const [file, loc] of locations) {
  require(file, loc, ['id', 'name', 'order', 'shortDescription', 'detailedDescription', 'thumbnail', 'mainImage', 'panorama', 'hotspots', 'navigation', 'mapPosition', 'aiContext']);
  if (`locations/${loc.id}.json` !== file) warnings.push(`${file}: id "${loc.id}" does not match the file name.`);
  if (orders.has(loc.order)) warnings.push(`${file}: duplicate order ${loc.order}.`);
  orders.add(loc.order);
  asset(file, loc.thumbnail, 'thumbnail');
  asset(file, loc.mainImage?.src, 'mainImage');
  if (loc.panorama) {
    asset(file, loc.panorama.src, 'panorama.src');
    asset(file, loc.panorama.preview, 'panorama.preview');
  }
  loc.relatedImages?.forEach((m, i) => asset(file, m.src, `relatedImages[${i}]`));
  loc.videos?.forEach((v, i) => {
    asset(file, v.src, `videos[${i}]`);
    asset(file, v.poster, `videos[${i}].poster`);
  });
  for (const link of loc.navigation ?? []) if (!ids.has(link.to)) errors.push(`${file}: navigation to unknown location "${link.to}"`);
  const hsIds = new Set();
  for (const h of loc.hotspots ?? []) {
    if (hsIds.has(h.id)) errors.push(`${file}: duplicate hotspot id "${h.id}"`);
    hsIds.add(h.id);
    const p = h.position;
    if (!p || p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) errors.push(`${file}: hotspot "${h.id}" position must be x/y between 0 and 100`);
    if (h.type === 'navigation' && !ids.has(h.target)) errors.push(`${file}: hotspot "${h.id}" targets unknown location "${h.target}"`);
    if (loc.panorama && !h.panoramaPosition) warnings.push(`${file}: hotspot "${h.id}" has no panoramaPosition – it will not appear in the 360° view.`);
    asset(file, h.image?.src, `hotspot ${h.id}.image`);
    h.photos?.forEach((m, i) => asset(file, m.src, `hotspot ${h.id}.photos[${i}]`));
    h.videos?.forEach((v, i) => asset(file, v.src, `hotspot ${h.id}.videos[${i}]`));
  }
}
if (school && !ids.has(school.startLocation)) errors.push(`school.json: startLocation "${school.startLocation}" is not a location id`);

/* timeline */
const timeline = load('history/timeline.json');
timeline?.entries?.forEach((e) => {
  asset('history/timeline.json', e.image?.src, `${e.id}.image`);
  e.gallery?.forEach((g, i) => asset('history/timeline.json', g.src, `${e.id}.gallery[${i}]`));
});

/* gallery */
for (const f of list('gallery')) {
  const cat = load(f);
  if (!cat) continue;
  require(f, cat, ['id', 'title', 'order', 'items']);
  cat.items?.forEach((it) => {
    asset(f, it.src, it.id);
    asset(f, it.thumbnail, `${it.id}.thumbnail`);
    asset(f, it.poster, `${it.id}.poster`);
    if (it.type === 'video' && !it.poster && !it.thumbnail) warnings.push(`${f}: video "${it.id}" has no poster image.`);
  });
}

/* challenges */
for (const f of list('challenges')) {
  const c = load(f);
  if (!c) continue;
  require(f, c, ['id', 'type', 'title', 'badges']);
  if (c.type === 'quiz' || c.type === 'human-vs-ai') {
    c.questions.forEach((q) => {
      if (q.answerIndex < 0 || q.answerIndex >= q.options.length) errors.push(`${f}: question "${q.id}" answerIndex out of range`);
      asset(f, q.image?.src, q.id);
    });
  } else if (c.type === 'guess-location') {
    c.questions.forEach((q) => {
      q.options.forEach((o) => !ids.has(o) && errors.push(`${f}: question "${q.id}" option "${o}" is not a location id`));
      if (!q.options.includes(q.answer)) errors.push(`${f}: question "${q.id}" answer is not one of the options`);
      asset(f, q.image?.src, q.id);
    });
  } else if (c.type === 'story') {
    c.places.forEach((p) => !ids.has(p) && errors.push(`${f}: story place "${p}" is not a location id`));
  } else if (c.type !== 'true-false') {
    errors.push(`${f}: unknown challenge type "${c.type}"`);
  }
}

/* future + ai */
load('future-school/scenarios.json')?.scenarios?.forEach((s) => asset('future-school/scenarios.json', s.image?.src, s.id));
const ai = load('ai/config.json');
if (ai) {
  for (const k of ['apiBaseUrl', 'model', 'temperature', 'maxTokens', 'enabled', 'proxyUrl', 'timeoutMs']) if (ai[k] === undefined) errors.push(`ai/config.json: missing "${k}"`);
  const raw = readFileSync(join(DATA, 'ai/config.json'), 'utf8');
  if (/sk-[A-Za-z0-9]{16,}|"apiKey"\s*:/i.test(raw)) errors.push('ai/config.json: looks like an API key was added – NEVER commit keys. Use proxyUrl instead.');
}
load('ai/prompts.json');

for (const w of warnings) console.warn(`⚠  ${w}`);
for (const e of errors) console.error(`✖  ${e}`);
console.log(`\n${locations.length} locations checked · ${errors.length} error(s) · ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
