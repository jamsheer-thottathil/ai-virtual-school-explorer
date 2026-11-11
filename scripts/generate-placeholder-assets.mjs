#!/usr/bin/env node
/**
 * Generates the illustrated SAMPLE placeholder images in public/assets.
 * No dependencies. Run:  npm run assets:placeholders
 *
 * These are stand-ins so the exhibition app looks complete before real
 * photographs are available. Replace any file with a real photo (keep the
 * same path, or update the path in the JSON file) – see README.
 * Existing files are NOT overwritten unless you pass --force.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
const FORCE = process.argv.includes('--force');
let written = 0;

function save(rel, svg) {
  const file = join(ROOT, rel);
  if (existsSync(file) && !FORCE) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + '\n');
  written += 1;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------- drawing helpers (1600 x 1000 canvas) ---------------- */

function sky(id, top, bottom) {
  return `<defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <linearGradient id="gnd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7d4e"/><stop offset="1" stop-color="#244a31"/></linearGradient>
  <radialGradient id="glow${id}" cx="0.8" cy="0.15" r="0.5"><stop offset="0" stop-color="#fff7d6" stop-opacity="0.9"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient></defs>
  <rect width="1600" height="1000" fill="url(#sky${id})"/><rect width="1600" height="1000" fill="url(#glow${id})"/>`;
}

function clouds(seed) {
  let s = '';
  for (let i = 0; i < 4; i++) {
    const x = (seed * 211 + i * 397) % 1500;
    const y = 80 + ((seed * 53 + i * 61) % 160);
    s += `<g fill="#fff" opacity="0.55"><ellipse cx="${x}" cy="${y}" rx="90" ry="26"/><ellipse cx="${x + 50}" cy="${y - 16}" rx="60" ry="24"/></g>`;
  }
  return s;
}

function ground(id, y = 760) {
  return `<rect y="${y}" width="1600" height="${1000 - y}" fill="url(#gnd${id})"/>`;
}

function building(x, y, w, h, color, cols = 6, rows = 3, roof = '#7c2d12') {
  let win = '';
  const gw = w / cols;
  const gh = (h - 40) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      win += `<rect x="${x + c * gw + gw * 0.22}" y="${y + 30 + r * gh + gh * 0.2}" width="${gw * 0.56}" height="${gh * 0.55}" rx="4" fill="#cfe8ff" opacity="0.9"/>`;
    }
  }
  return `<g><polygon points="${x - 20},${y} ${x + w / 2},${y - 70} ${x + w + 20},${y}" fill="${roof}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>${win}</g>`;
}

function tree(x, y, s = 1, c = '#2f855a') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="0" width="20" height="90" fill="#6b4423"/><circle cx="0" cy="-20" r="70" fill="${c}"/><circle cx="-45" cy="10" r="45" fill="${c}"/><circle cx="45" cy="10" r="45" fill="${c}"/></g>`;
}

function person(x, y, color, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-118" r="22" fill="#f1c27d"/><rect x="-26" y="-94" width="52" height="70" rx="18" fill="${color}"/><rect x="-22" y="-28" width="16" height="50" rx="6" fill="#334155"/><rect x="6" y="-28" width="16" height="50" rx="6" fill="#334155"/></g>`;
}

const MOTIFS = {
  entrance: (id) =>
    `${sky(id, '#7dd3fc', '#e0f2fe')}${clouds(1)}${ground(id)}
    ${building(520, 420, 560, 340, '#e7d7c1', 7, 3)}
    <polygon points="700,1000 900,1000 840,760 760,760" fill="#d6c7a8"/>
    <rect x="330" y="430" width="70" height="340" fill="#94a3b8"/><rect x="1200" y="430" width="70" height="340" fill="#94a3b8"/>
    <path d="M330 450 Q800 230 1270 450" stroke="#334155" stroke-width="26" fill="none"/>
    <rect x="610" y="300" width="380" height="70" rx="12" fill="#1e3a8a"/><text x="800" y="347" fill="#fff" font-family="Arial" font-size="34" font-weight="700" text-anchor="middle">WELCOME</text>
    ${tree(180, 700, 1.2)}${tree(1420, 700, 1.1)}`,
  'main-building': (id) =>
    `${sky(id, '#93c5fd', '#eff6ff')}${clouds(2)}${ground(id)}
    ${building(240, 400, 1120, 360, '#f2e4cf', 12, 3)}
    <rect x="720" y="210" width="160" height="200" fill="#e7d3b6"/><circle cx="800" cy="285" r="52" fill="#fff" stroke="#334155" stroke-width="8"/>
    <line x1="800" y1="285" x2="800" y2="250" stroke="#334155" stroke-width="7"/><line x1="800" y1="285" x2="828" y2="296" stroke="#334155" stroke-width="7"/>
    <polygon points="700,210 800,130 900,210" fill="#7c2d12"/><rect x="740" y="640" width="120" height="120" fill="#7c4a1e"/>
    ${tree(120, 720, 1.1)}${tree(1490, 720, 1.2)}`,
  classrooms: () =>
    `<rect width="1600" height="1000" fill="#fef3c7"/><rect y="700" width="1600" height="300" fill="#d6a76c"/>
    <rect x="300" y="140" width="1000" height="420" rx="14" fill="#14532d" stroke="#7c4a1e" stroke-width="22"/>
    <text x="360" y="250" fill="#ecfdf5" font-family="Comic Sans MS, Arial" font-size="58">E = mc²   ∑ learning</text>
    <text x="360" y="340" fill="#ecfdf5" font-family="Comic Sans MS, Arial" font-size="46">Today: Curiosity + Teamwork</text>
    <rect x="1340" y="160" width="160" height="120" rx="10" fill="#38bdf8"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${170 + i * 330}" y="760" width="250" height="40" rx="8" fill="#92400e"/><rect x="${190 + i * 330}" y="800" width="20" height="120" fill="#78350f"/><rect x="${380 + i * 330}" y="800" width="20" height="120" fill="#78350f"/>`).join('')}
    <rect x="80" y="160" width="120" height="420" fill="#bae6fd" stroke="#fff" stroke-width="10"/>`,
  'science-lab': () =>
    `<rect width="1600" height="1000" fill="#e0f2fe"/><rect y="640" width="1600" height="360" fill="#cbd5e1"/>
    <rect x="120" y="600" width="1360" height="60" rx="10" fill="#334155"/>
    <path d="M420 330 h80 v120 l90 150 h-260 l90 -150z" fill="#a7f3d0" stroke="#0f172a" stroke-width="10"/>
    <rect x="760" y="360" width="70" height="240" rx="30" fill="#fbcfe8" stroke="#0f172a" stroke-width="10"/>
    <circle cx="1080" cy="500" r="100" fill="#c4b5fd" stroke="#0f172a" stroke-width="10"/><rect x="1050" y="300" width="60" height="110" fill="#c4b5fd" stroke="#0f172a" stroke-width="10"/>
    <circle cx="460" cy="260" r="18" fill="#a7f3d0" opacity="0.8"/><circle cx="1080" cy="240" r="22" fill="#c4b5fd" opacity="0.8"/>
    <g stroke="#0ea5e9" stroke-width="8" fill="none" opacity="0.7"><ellipse cx="1350" cy="250" rx="110" ry="40"/><ellipse cx="1350" cy="250" rx="110" ry="40" transform="rotate(60 1350 250)"/><ellipse cx="1350" cy="250" rx="110" ry="40" transform="rotate(120 1350 250)"/></g><circle cx="1350" cy="250" r="16" fill="#0ea5e9"/>`,
  'computer-lab': () =>
    `<rect width="1600" height="1000" fill="#0f172a"/><rect y="680" width="1600" height="320" fill="#1e293b"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${140 + i * 350}" y="380" width="280" height="190" rx="14" fill="#38bdf8" stroke="#94a3b8" stroke-width="12"/><rect x="${160 + i * 350}" y="400" width="240" height="20" fill="#0ea5e9"/><rect x="${160 + i * 350}" y="440" width="${120 + i * 20}" height="14" fill="#e0f2fe"/><rect x="${160 + i * 350}" y="470" width="180" height="14" fill="#e0f2fe" opacity="0.7"/><rect x="${260 + i * 350}" y="570" width="40" height="60" fill="#94a3b8"/><rect x="${200 + i * 350}" y="630" width="160" height="16" rx="6" fill="#94a3b8"/>`).join('')}
    <rect x="100" y="660" width="1400" height="30" fill="#475569"/>
    <g fill="#22d3ee" opacity="0.4" font-family="Courier New" font-size="34"><text x="160" y="200">&lt;code/&gt; 01001 AI</text><text x="900" y="260">print("Hello")</text></g>`,
  library: () =>
    `<rect width="1600" height="1000" fill="#fdf4e3"/><rect y="820" width="1600" height="180" fill="#b45309"/>
    ${[0, 1, 2].map((s) => `<rect x="${110 + s * 480}" y="140" width="420" height="680" fill="#7c4a1e"/>${[0, 1, 2, 3].map((r) => `<rect x="${130 + s * 480}" y="${170 + r * 160}" width="380" height="10" fill="#5b3413"/>${Array.from({ length: 12 }, (_, b) => `<rect x="${138 + s * 480 + b * 31}" y="${190 + r * 160 - ((b * 7 + r * 3 + s) % 4) * 6}" width="26" height="${130 + ((b * 7 + r * 3 + s) % 4) * 6}" fill="${['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2'][(b + r + s) % 6]}"/>`).join('')}`).join('')}`).join('')}`,
  playground: (id) =>
    `${sky(id, '#38bdf8', '#e0f2fe')}${clouds(3)}<rect y="520" width="1600" height="480" fill="#4d9a5b"/>
    <ellipse cx="800" cy="760" rx="700" ry="190" fill="none" stroke="#c2410c" stroke-width="60"/><ellipse cx="800" cy="760" rx="700" ry="190" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="20 14"/>
    <rect x="160" y="600" width="12" height="140" fill="#fff"/><rect x="160" y="600" width="140" height="12" fill="#fff"/><rect x="1428" y="600" width="12" height="140" fill="#fff"/><rect x="1300" y="600" width="140" height="12" fill="#fff"/>
    <circle cx="800" cy="760" r="70" fill="none" stroke="#fff" stroke-width="6"/><line x1="800" y1="580" x2="800" y2="950" stroke="#fff" stroke-width="6"/>
    ${person(640, 780, '#ef4444', 0.9)}${person(960, 800, '#3b82f6', 0.9)}<circle cx="800" cy="840" r="22" fill="#fff" stroke="#111" stroke-width="4"/>
    ${tree(120, 470, 0.9)}${tree(1480, 470, 0.9)}`,
  auditorium: () =>
    `<rect width="1600" height="1000" fill="#1f1235"/>
    <rect x="200" y="160" width="1200" height="480" fill="#3b1d5c"/><path d="M200 160 h300 q-60 240 0 480 h-300z" fill="#b91c1c"/><path d="M1400 160 h-300 q60 240 0 480 h300z" fill="#b91c1c"/>
    <rect x="160" y="120" width="1280" height="60" fill="#7f1d1d"/><rect x="200" y="620" width="1200" height="60" fill="#78350f"/>
    <polygon points="650,0 950,0 1100,620 500,620" fill="#fde68a" opacity="0.18"/>
    ${person(800, 610, '#f59e0b', 1.1)}
    ${[0, 1, 2].map((r) => Array.from({ length: 14 }, (_, c) => `<rect x="${130 + c * 100 + (r % 2) * 50}" y="${740 + r * 80}" width="80" height="60" rx="16" fill="#7c2d12" opacity="${1 - r * 0.15}"/>`).join('')).join('')}`,
  garden: (id) =>
    `${sky(id, '#a5f3fc', '#f0fdf4')}${clouds(4)}<rect y="600" width="1600" height="400" fill="#65a30d"/>
    <ellipse cx="1100" cy="800" rx="260" ry="80" fill="#38bdf8" stroke="#0e7490" stroke-width="8"/>
    ${tree(200, 560, 1.4, '#15803d')}${tree(520, 600, 1, '#16a34a')}${tree(1450, 560, 1.3, '#15803d')}
    ${Array.from({ length: 22 }, (_, i) => `<g transform="translate(${80 + i * 70} ${900 - (i % 3) * 30})"><rect x="-3" y="0" width="6" height="40" fill="#166534"/><circle r="16" fill="${['#f43f5e', '#facc15', '#a855f7', '#fb923c'][i % 4]}"/><circle r="6" fill="#fef08a"/></g>`).join('')}
    <path d="M760 1000 Q820 800 700 640" stroke="#d6c7a8" stroke-width="70" fill="none"/>`,
  trophy: () =>
    `<rect width="1600" height="1000" fill="#1e1b4b"/><circle cx="800" cy="480" r="420" fill="#fbbf24" opacity="0.12"/>
    <path d="M620 220 h360 v120 q0 220 -180 260 q-180 -40 -180 -260z" fill="#fbbf24"/><path d="M620 260 q-140 0 -120 120 q20 110 150 120" stroke="#fbbf24" stroke-width="30" fill="none"/><path d="M980 260 q140 0 120 120 q-20 110 -150 120" stroke="#fbbf24" stroke-width="30" fill="none"/>
    <rect x="760" y="600" width="80" height="130" fill="#f59e0b"/><rect x="640" y="730" width="320" height="80" rx="10" fill="#92400e"/>
    <polygon points="800,300 822,360 886,360 834,398 854,460 800,422 746,460 766,398 714,360 778,360" fill="#fff7d6"/>`,
  people: () =>
    `<rect width="1600" height="1000" fill="#ecfeff"/><circle cx="1300" cy="200" r="180" fill="#a5f3fc"/><rect y="760" width="1600" height="240" fill="#bae6fd"/>
    ${['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#0ea5e9'].map((c, i) => person(260 + i * 216, 800 - (i % 2) * 20, c, 2)).join('')}`,
  future: () =>
    `<defs><linearGradient id="fut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#fut)"/>
    ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 397) % 1600}" cy="${(i * 211) % 420}" r="${1 + (i % 3)}" fill="#fff" opacity="0.7"/>`).join('')}
    <g stroke="#22d3ee" stroke-width="2" opacity="0.35">${Array.from({ length: 14 }, (_, i) => `<line x1="${800}" y1="620" x2="${i * 123}" y2="1000"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${640 + i * 60}" x2="1600" y2="${640 + i * 60}"/>`).join('')}</g>
    ${[[200, 300, 160, 320], [420, 220, 140, 400], [620, 160, 360, 460], [1020, 240, 150, 380], [1220, 320, 200, 300]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#1e1b4b" stroke="#818cf8" stroke-width="4"/>${Array.from({ length: Math.floor(h / 50) }, (_, r) => `<rect x="${x + 16}" y="${y + 24 + r * 50}" width="${w - 32}" height="12" rx="6" fill="#22d3ee" opacity="${0.35 + (r % 3) * 0.2}"/>`).join('')}`).join('')}
    <ellipse cx="800" cy="150" rx="230" ry="40" fill="none" stroke="#a78bfa" stroke-width="6"/>`
};

function overlay(kind, i) {
  switch (kind) {
    case 'robot':
      return `<g transform="translate(1150 520)"><rect x="-90" y="-120" width="180" height="150" rx="40" fill="#e2e8f0" stroke="#22d3ee" stroke-width="8"/><circle cx="-35" cy="-50" r="18" fill="#22d3ee"/><circle cx="35" cy="-50" r="18" fill="#22d3ee"/><rect x="-70" y="40" width="140" height="180" rx="30" fill="#cbd5e1"/><line x1="0" y1="-120" x2="0" y2="-170" stroke="#e2e8f0" stroke-width="8"/><circle cx="0" cy="-178" r="14" fill="#f472b6"/></g>`;
    case 'vr':
      return `<g transform="translate(800 520)"><rect x="-220" y="-80" width="440" height="170" rx="70" fill="#111827" stroke="#a78bfa" stroke-width="10"/><rect x="-180" y="-50" width="160" height="110" rx="40" fill="#6366f1" opacity="0.8"/><rect x="20" y="-50" width="160" height="110" rx="40" fill="#22d3ee" opacity="0.8"/></g>`;
    case 'leaf':
      return `<g transform="translate(800 540)"><path d="M0 -220 C 200 -160 220 120 0 220 C -220 120 -200 -160 0 -220z" fill="#22c55e" opacity="0.9"/><path d="M0 -200 V 220" stroke="#14532d" stroke-width="10"/><circle cx="380" cy="-60" r="80" fill="#facc15" opacity="0.8"/></g>`;
    case 'brain':
      return `<g transform="translate(800 520)" fill="none" stroke="#f472b6" stroke-width="12"><circle r="170" stroke="#22d3ee"/><path d="M-90 -60 q90 -90 180 0 M-110 30 q110 80 220 0 M0 -170 V170"/></g>`;
    case 'confetti':
      return Array.from({ length: 60 }, (_, k) => `<rect x="${(k * 137 + i * 50) % 1600}" y="${(k * 89) % 700}" width="14" height="24" transform="rotate(${k * 33} ${(k * 137 + i * 50) % 1600} ${(k * 89) % 700})" fill="${['#f43f5e', '#facc15', '#22d3ee', '#a855f7'][k % 4]}"/>`).join('');
    default:
      return '';
  }
}

function frame({ motif, title, subtitle = 'SAMPLE IMAGE · replace with a real photo', tint = '', sepia = false, extra = '', w = 1600, h = 1000, id = 'a' }) {
  const body = MOTIFS[motif](id);
  const filter = sepia
    ? `<filter id="sep${id}"><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0 0.35 0.69 0.17 0 0 0.27 0.53 0.13 0 0 0 0 0 1 0"/></filter>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1600 1000" role="img" aria-label="${esc(title)} (sample illustration)">
  <defs>${filter}<linearGradient id="shade${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></linearGradient></defs>
  <g${sepia ? ` filter="url(#sep${id})"` : ''}>${body}${extra}</g>
  ${tint ? `<rect width="1600" height="1000" fill="${tint}" opacity="0.18"/>` : ''}
  <rect width="1600" height="1000" fill="url(#shade${id})"/>
  <text x="60" y="900" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700">${esc(title)}</text>
  <text x="62" y="950" fill="#fff" opacity="0.8" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="3">${esc(subtitle)}</text>
</svg>`;
}

/* ---------------- what to generate ---------------- */

const LOCATIONS = {
  entrance: 'Main Entrance',
  'main-building': 'Main Building',
  classrooms: 'Classrooms',
  'science-lab': 'Science Laboratory',
  'computer-lab': 'Computer Laboratory',
  library: 'Library',
  playground: 'Playground',
  auditorium: 'Auditorium',
  garden: 'School Garden'
};
const TINTS = ['', '#6366f1', '#f59e0b', '#14b8a6'];

for (const [id, name] of Object.entries(LOCATIONS)) {
  save(`locations/${id}/main.svg`, frame({ motif: id, title: name, id: 'm' }));
  save(`locations/${id}/thumbnail.svg`, frame({ motif: id, title: name, subtitle: 'SAMPLE', w: 480, h: 300, id: 't' }));
  [1, 2, 3].forEach((n) =>
    save(`locations/${id}/photo-${n}.svg`, frame({ motif: id, title: `${name} · view ${n}`, tint: TINTS[n], id: `p${n}` }))
  );
}

const GALLERY = {
  campus: ['main-building', 'Campus', ['Campus at sunrise', 'Front courtyard', 'Walkway between blocks']],
  classrooms: ['classrooms', 'Classrooms', ['Smart classroom session', 'Group project time', 'Learning corner']],
  teachers: ['people', 'Teachers', ['Teachers planning together', 'Mentoring session', 'Staff workshop']],
  students: ['people', 'Students', ['Student council', 'Reading buddies', 'Lunch-break friends']],
  sports: ['playground', 'Sports', ['Annual sports day', 'Football practice', 'Relay race finish']],
  'arts-culture': ['auditorium', 'Arts & Culture', ['Music performance', 'Drama rehearsal', 'Art exhibition']],
  'science-exhibitions': ['science-lab', 'Science Exhibitions', ['Science fair stalls', 'Robotics demo', 'Young inventors']],
  celebrations: ['auditorium', 'Celebrations', ['Annual day', 'Festival celebration', 'Graduation day']],
  achievements: ['trophy', 'Achievements', ['Trophy cabinet', 'Award ceremony', 'Certificates of merit']],
  history: ['main-building', 'Historical Memories', ['The early campus', 'First batch of students', 'Old school bell']]
};

for (const [cat, [motif, , captions]] of Object.entries(GALLERY)) {
  captions.forEach((cap, i) =>
    save(
      `gallery/${cat}/${i + 1}.svg`,
      frame({
        motif,
        title: cap,
        tint: TINTS[(i + 1) % 4],
        sepia: cat === 'history',
        extra: cat === 'celebrations' ? overlay('confetti', i) : '',
        id: `g${i}`
      })
    )
  );
}

const HISTORY = {
  establishment: ['main-building', 'School Establishment'],
  'first-principal': ['people', 'First Principal'],
  'first-building': ['main-building', 'First Campus Building'],
  infrastructure: ['library', 'Infrastructure Growth'],
  academics: ['classrooms', 'Academic Achievements'],
  sports: ['playground', 'Sports Achievements'],
  'modern-expansion': ['computer-lab', 'Modern Expansion']
};
Object.entries(HISTORY).forEach(([file, [motif, title]], i) =>
  save(`history/${file}.svg`, frame({ motif, title, sepia: i < 3, id: `h${i}` }))
);

const FUTURE = {
  'ai-classroom': ['brain', 'AI-Powered Classroom'],
  'robot-assistants': ['robot', 'Robot Teaching Assistants'],
  'smart-labs': ['brain', 'Smart Laboratories'],
  'vr-education': ['vr', 'Virtual Reality Education'],
  'smart-campus': ['', 'Smart Campus'],
  'eco-school': ['leaf', 'Eco-Friendly School'],
  'personalized-learning': ['brain', 'Personalized Learning']
};
Object.entries(FUTURE).forEach(([file, [ov, title]], i) =>
  save(
    `future-school/${file}.svg`,
    frame({ motif: 'future', title, subtitle: 'CONCEPT VISUAL · 2040 imagination', extra: overlay(ov, i), id: `f${i}` })
  )
);

// Hero, map, logo, favicon
save(
  'hero/hero.svg',
  frame({ motif: 'main-building', title: ' ', subtitle: ' ', id: 'hero' }).replace('<rect width="1600" height="1000" fill="url(#shadehero)"/>', '')
);

const markerless = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <rect width="1600" height="1000" fill="#14532d"/>
  <g opacity="0.25" stroke="#bbf7d0">${Array.from({ length: 40 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="1000"/>`).join('')}${Array.from({ length: 25 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="1600" y2="${i * 40}"/>`).join('')}</g>
  <path d="M800 1000 V820 H360 V560 M800 820 H1250 V300 M800 820 V420 H520 V250" stroke="#d6c7a8" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="640" y="300" width="330" height="200" rx="16" fill="#e7d7c1" opacity="0.9"/>
  <rect x="380" y="150" width="260" height="150" rx="16" fill="#e7d7c1" opacity="0.85"/>
  <ellipse cx="1260" cy="230" rx="230" ry="130" fill="#4d9a5b" stroke="#c2410c" stroke-width="18"/>
  <rect x="1060" y="520" width="300" height="180" rx="16" fill="#7c3aed" opacity="0.6"/>
  <circle cx="230" cy="620" r="120" fill="#15803d"/><circle cx="330" cy="700" r="80" fill="#16a34a"/>
  <rect x="160" y="300" width="230" height="160" rx="16" fill="#e7d7c1" opacity="0.85"/>
  <text x="40" y="960" fill="#bbf7d0" font-family="Arial" font-size="26" letter-spacing="3">SAMPLE CAMPUS MAP · replace public/assets/map/campus-map.svg</text>
</svg>`;
save('map/campus-map.svg', markerless);

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="School logo (sample)">
  <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="0.6" stop-color="#22d3ee"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs>
  <path d="M64 6 L116 26 V62 C116 92 94 114 64 122 C34 114 12 92 12 62 V26 Z" fill="url(#lg)"/>
  <path d="M64 30 L98 46 L64 62 L30 46 Z" fill="#0b1020"/><path d="M42 54 V72 C42 80 86 80 86 72 V54 L64 64 Z" fill="#0b1020" opacity="0.85"/>
  <path d="M98 46 V70" stroke="#0b1020" stroke-width="5"/><circle cx="98" cy="74" r="5" fill="#0b1020"/>
  <path d="M40 92 Q64 104 88 92" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
save('logos/school-logo.svg', logo);
save('logos/favicon.svg', logo);

console.log(`Placeholder assets: ${written} file(s) written to public/assets${FORCE ? ' (forced)' : ''}.`);
