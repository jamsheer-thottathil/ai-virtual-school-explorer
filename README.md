# AI Virtual School Explorer

An exhibition-ready, mobile-first web app that lets visitors scan a QR code and **explore the school virtually**: walk between campus locations in 360° or zoomable photo views, open information hotspots, travel through the school's history, browse a media gallery, play offline discovery challenges, imagine the school in 2040, and chat with **"Ask Our School AI"**, a location-aware guide.

It is a **100% static site** (React + TypeScript + Vite) that deploys to **GitHub Pages**. There is no backend, database, CMS, login or admin panel. All content lives in JSON files and static assets, so school staff update the site by editing JSON, replacing images and committing to GitHub.

> **Sample content.** The school name ("Horizon Valley School"), descriptions, timeline, achievements, images, panoramas and video are **illustrative placeholders**. They are labelled as samples in the UI. Replace them with real, verified school information before the exhibition (see [How to update school content](#how-to-update-school-content)).

---

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Folder structure](#folder-structure)
4. [Local development](#local-development)
5. [Build](#build)
6. [Deployment to GitHub Pages](#deployment-to-github-pages)
7. [GitHub Pages configuration details](#github-pages-configuration-details)
8. [How to update school content](#how-to-update-school-content)
9. [How to add a new location](#how-to-add-a-new-location)
10. [How to add hotspots](#how-to-add-hotspots)
11. [How to replace images, panoramas and videos](#how-to-replace-images-panoramas-and-videos)
12. [How to configure AI](#how-to-configure-ai)
13. [Security notes](#security-notes)
14. [Troubleshooting](#troubleshooting)

---

## Features

| Area | What visitors get |
| --- | --- |
| **Landing page** | "EXPLORE OUR SCHOOL" hero, configurable logo/name, animated exploration indicator, feature highlights, quick-access cards, tour-stop preview, QR exhibition welcome section with share/copy link. |
| **Virtual campus** | 9 configurable locations. True 360° view (Pannellum) when a real equirectangular panorama exists; otherwise a fallback photo viewer with pinch/button/Ctrl+wheel zoom, drag-to-pan, double-tap zoom and swipe-to-next-stop. Navigation hotspots, "Walk to" links from JSON, previous/next stop, browser back/forward buttons, thumbnail filmstrip and an interactive campus map. |
| **Hotspots** | Slide-in panel with title, description, image, extra photos (lightbox), videos, historical notes, related links and an **Ask AI about this** button. Positions in % (photos) and yaw/pitch (360°). |
| **History** | Interactive timeline (horizontal on desktop, vertical on mobile), year selector, previous/next, keyboard arrows, milestone detail with gallery, and a historical-memories gallery. |
| **Gallery** | 10 categories, filter chips (shareable via `?category=`), masonry grid, lazy loading, fullscreen lightbox with swipe/keyboard, video playback. |
| **AI guide** | Chat with history, typing indicator, loading/cancel, error handling, suggested questions, location awareness (the current location's data is added to the AI context automatically), secure proxy mode, memory-only demo key mode, and an offline records-based fallback. |
| **Challenges** | School quiz, Guess the Location, True/False facts, Human vs AI and AI Story. Score tracking, progress bar, instant feedback, badges, completion screen. All questions come from JSON and work offline. |
| **Future School 2040** | Prompt input, suggestion chips, scenario explorer (tabs), concept cards and prepared concept visuals; optional AI text and image generation. |
| **Quality** | Code-split pages, lazily loaded Pannellum, lazy images, keyboard navigation, focus-trapped accessible dialogs, skip link, ARIA labels, reduced-motion support, responsive down to 320 px. |

---

## Architecture

```
            ┌─────────────── GitHub repository ────────────────┐
            │ src/data/*.json   public/assets/*   React source │
            └───────────────────────┬──────────────────────────┘
                                    │ push to main
                         GitHub Actions (deploy.yml)
                 validate content → build (Vite) → deploy
                                    │
                     GitHub Pages (static files only)
                                    │
 Visitor phone ──QR──► index.html + JS bundle (content bundled in)
                                    │
                  optional ──► AI proxy ──► AICredits (OpenAI-compatible)
```

**Configuration-driven.** `src/services/contentService.ts` loads every JSON file at build time using `import.meta.glob`. Adding a JSON file to `src/data/locations/`, `src/data/gallery/` or `src/data/challenges/` makes it appear automatically. No component changes are needed.

**Layers:**

- `src/types/`: TypeScript interfaces that mirror every JSON file.
- `src/services/contentService.ts`: loads and indexes content (locations, map connections, neighbours).
- `src/services/knowledgeService.ts`: builds the grounded AI context and the offline records search.
- `src/services/aiService.ts`: the OpenAI-compatible client (proxy/demo/offline modes, timeouts, fallback, Human vs AI picks, optional image generation).
- `src/hooks/AiGuideContext.tsx`: chat state, the memory-only demo key and the current location.
- `src/components/`: UI, grouped by feature (`campus`, `ai`, `gallery`, `timeline`, `challenges`, `common`, `layout`).
- `src/pages/` + `src/router/`: hash-routed, code-split pages.

**Routing.** A `HashRouter` is used (`/#/campus/library`) so deep links and refreshes never 404 on GitHub Pages. `public/404.html` also redirects mistyped "pretty" URLs (`/repo/campus/library`) to the hash route.

---

## Folder structure

```
ai-virtual-school-explorer/
├── .github/workflows/deploy.yml      # CI: validate → build → deploy to Pages
├── docs/schemas/location.schema.json # JSON Schema for location files
├── index.html
├── package.json
├── vite.config.ts                    # base './' → works under any repo path
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── scripts/
│   ├── validate-content.mjs          # npm run validate:content
│   └── generate-placeholder-assets.mjs
├── public/
│   ├── 404.html  .nojekyll
│   └── assets/
│       ├── hero/ map/ logos/
│       ├── locations/<location-id>/  # main.svg, thumbnail.svg, photo-1..3.svg
│       ├── panorama/                 # 360° equirectangular images (2:1)
│       ├── gallery/<category-id>/
│       ├── history/ videos/ future-school/
└── src/
    ├── main.tsx
    ├── router/index.tsx
    ├── layouts/RootLayout.tsx
    ├── pages/        Landing, Campus, Location, History, Gallery, Guide,
    │                 Challenges, ChallengePlay, Future, NotFound, RouteError
    ├── components/
    │   ├── ai/         ChatPanel, AiGuideDrawer, AiStatus (mode badge + demo key)
    │   ├── campus/     PanoramaViewer, ImageViewer, HotspotMarker, HotspotPanel,
    │   │               CampusMap, LocationThumbnails, LocationDetails
    │   ├── challenges/ QuestionChallenge, StoryChallengeView, ChallengeComplete, ProgressBar
    │   ├── gallery/    GalleryGrid, Lightbox
    │   ├── timeline/   Timeline, MilestoneDetail
    │   ├── common/     Modal, LazyImage, VideoPlayer, RichText, SampleBadge, …
    │   └── layout/     SiteHeader, SiteFooter
    ├── hooks/        AiGuideContext, useFocusTrap, useMediaQuery, …
    ├── services/     contentService, knowledgeService, aiService
    ├── styles/global.css
    ├── types/        content.ts, ai.ts
    ├── utils/        assets, text, score, icons, dom
    └── data/
        ├── school.json
        ├── locations/   entrance, main-building, classrooms, science-lab,
        │                computer-lab, library, playground, auditorium, garden
        ├── history/timeline.json
        ├── gallery/     campus, classrooms, teachers, students, sports,
        │                arts-culture, science-exhibitions, celebrations,
        │                achievements, history
        ├── challenges/  school-quiz, location-challenge, fact-challenge,
        │                human-vs-ai, ai-story
        ├── ai/          config.json, prompts.json
        └── future-school/scenarios.json
```

---

## Local development

Requirements: **Node.js 18.18+** (Node 20 LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). The dev server listens on your network too, so you can test on a phone on the same Wi-Fi with the "Network" URL.

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript type check |
| `npm run validate:content` | Check JSON, links between locations, challenge answers and that every referenced asset exists |
| `npm run assets:placeholders` | Re-create missing sample placeholder images (add `-- --force` to overwrite) |

---

## Build

```bash
npm run build
npm run preview   # check the production build at http://localhost:4173
```

The output in `dist/` is plain static files with relative paths. It can be hosted on GitHub Pages or any static host, or opened from a USB stick via a local static server.

---

## Deployment to GitHub Pages

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push to `main` (or run the workflow manually from **Actions → Deploy to GitHub Pages → Run workflow**).
4. The workflow installs dependencies, validates content, type-checks, builds and deploys. The site URL appears in the workflow summary, usually `https://<user>.github.io/<repo>/`.
5. Put that URL in `src/data/school.json → exhibition.publicUrl`, generate a QR code for it, save it as e.g. `public/assets/logos/qr-code.png`, and set `exhibition.qrImage` to `assets/logos/qr-code.png`. Use the same QR code on the exhibition banner.

> Tip: point the QR code directly at the first tour stop, e.g. `https://<user>.github.io/<repo>/#/campus/entrance`.

The workflow uses `npm ci` automatically once you commit a `package-lock.json` (recommended after your first `npm install`), and `npm install` otherwise.

---

## GitHub Pages configuration details

- **Vite base:** `base: './'` in `vite.config.ts` makes all asset URLs relative, so the same build works for `/<repo>/`, a user site, or a custom domain. You can force an absolute base with `VITE_BASE=/my-repo/ npm run build`.
- **Content asset paths** in JSON are written without a leading slash (`assets/...`) and resolved through `assetUrl()`, so they also work under any sub-path.
- **SPA routing:** hash routes (`#/history`) never need server rewrites. `public/404.html` turns `/<repo>/history` into `/<repo>/#/history`.
- **`.nojekyll`** stops GitHub Pages from running Jekyll on the build output.
- **Custom domain:** add a `public/CNAME` file containing your domain, then configure DNS as described in GitHub's documentation.

---

## How to update school content

All content lives in `src/data/`. Edit the JSON, run `npm run validate:content`, commit and push. GitHub Actions redeploys automatically.

| File | Controls |
| --- | --- |
| `school.json` | School name, short name, tagline, logo, hero texts and buttons, exhibition/QR section, about info (`established`, `founder`… use `null` if unknown), facilities, achievements, feature cards, quick-access cards, footer, start location, sample-data notice. |
| `locations/*.json` | One file per campus location (see below). |
| `history/timeline.json` | Timeline entries: `year`, `title`, `category`, `summary`, `details[]`, `image`, `gallery[]`. |
| `gallery/*.json` | One file per category: `id`, `title`, `description`, `order`, `items[]` (`type` `image` or `video`). |
| `challenges/*.json` | Quiz questions, location challenges, true/false facts, Human vs AI questions, story ingredients and badges. |
| `ai/config.json` | AI endpoint, model and behaviour. |
| `ai/prompts.json` | Assistant name, welcome message, system prompt, "not available" message, suggested questions and creative prompts. |
| `future-school/scenarios.json` | 2040 scenarios, prompt suggestions and notice. |

**When real data is in place**, set `"isSampleData": false` in `school.json`, each location, `timeline.json` (and its entries) and each gallery file. The "Sample" labels then disappear. Keep `about.founder`, `about.established` etc. as `null` if you don't have verified values: the AI guide will then say the information isn't available instead of guessing.

**Editing tips:** JSON needs double quotes, commas between items and no trailing commas. VS Code highlights mistakes. Location files can be checked against `docs/schemas/location.schema.json`.

---

## How to add a new location

1. **Create** `src/data/locations/sports-complex.json` (copy an existing file). The `id` must match the file name and use lowercase letters, numbers and hyphens.
2. **Add assets** in `public/assets/locations/sports-complex/` (`main.jpg`, `thumbnail.jpg`, extra photos) and update the paths in the JSON.
3. **Set** `order` (its position in the tour) and `mapPosition` (`x`/`y` in % of the campus map).
4. **Link it**: add `{ "to": "sports-complex", "label": "Go to the sports complex", "direction": "right" }` to the `navigation` array of one or more existing locations, and add navigation links back from the new file. Optionally add a navigation hotspot.
5. Run `npm run validate:content`, then commit.

Location fields: `id`, `name`, `order`, `category`, `shortDescription`, `detailedDescription`, `thumbnail`, `mainImage`, `panorama` (`null` or object), `historicalInformation[]`, `interestingFacts[]`, `facilities[]`, `achievements[]`, `relatedImages[]`, `videos[]`, `hotspots[]`, `navigation[]`, `aiContext`, `mapPosition`, `isSampleData`.

`direction` can be `forward`, `back`, `left`, `right`, `up` or `down` (it only changes the arrow icon).

---

## How to add hotspots

Add an object to the location's `hotspots` array:

```json
{
  "id": "trophy-wall",
  "type": "info",
  "title": "Trophy Wall",
  "description": "Awards won by our students.",
  "position": { "x": 62, "y": 40 },
  "panoramaPosition": { "yaw": 35, "pitch": -5 },
  "image": { "src": "assets/locations/main-building/trophy.jpg", "alt": "Trophy wall" },
  "photos": [{ "src": "assets/locations/main-building/trophy-2.jpg", "alt": "Close-up", "caption": "2024 trophies" }],
  "videos": [{ "src": "assets/videos/awards.mp4", "title": "Award ceremony", "poster": "assets/videos/awards.jpg" }],
  "historicalNotes": ["The first trophy was won in …"],
  "relatedContent": [{ "label": "Achievements gallery", "link": "/gallery?category=achievements" }],
  "aiQuestion": "What awards are shown on the trophy wall?"
}
```

- **`position`** (photo viewer): percentages of the image width (`x`) and height (`y`). `{ "x": 50, "y": 50 }` is the centre. A quick way to find it: open the image in any editor, read the pixel position and divide by the image width/height.
- **`panoramaPosition`** (360° viewer): `yaw` −180…180 (0 = initial view centre, positive = right) and `pitch` −90…90 (positive = up). Pannellum's [standalone viewer](https://pannellum.org/documentation/overview/) can show coordinates while you click around. Hotspots without `panoramaPosition` are hidden in 360° mode, but they remain in the "Points of interest" list.
- **Navigation hotspot:** `"type": "navigation"` with `"target": "<location-id>"`. Clicking it moves to that location.
- Only `id`, `type`, `title` and `position` are required. Everything else is optional.

---

## How to replace images, panoramas and videos

- **Simplest:** overwrite a file with a new one at the **same path** (e.g. replace `public/assets/locations/library/main.svg` with your photo saved as `main.svg`… or better, save `main.jpg` and change the path in `library.json`).
- **Recommended formats:** JPG/WebP photos, about 1600×1000 for main images, 480×300 for thumbnails, under ~300 KB each (use [Squoosh](https://squoosh.app) to compress). Always write a meaningful `alt` text.
- **Logo / hero / map:** `public/assets/logos/school-logo.svg`, `public/assets/hero/hero.svg`, `public/assets/map/campus-map.svg` (paths set in `school.json` → `logo`, `heroImage`, `campusMap`). After changing the map, adjust each location's `mapPosition`.
- **360° panoramas:** use only **real equirectangular** images (2:1 ratio, e.g. 4096×2048 or 6000×3000, from a 360° camera or a phone panorama app that exports equirectangular). Save them in `public/assets/panorama/` and set:
  ```json
  "panorama": { "src": "assets/panorama/library-360.jpg", "preview": "assets/panorama/library-360-preview.jpg", "initialYaw": 0, "initialPitch": 0 }
  ```
  Ordinary photos must **not** be used as panoramas: keep `"panorama": null` and the photo viewer is used instead. Keep panoramas ≤ 4096 px wide for older phones and tablets.
- **Videos:** MP4 (H.264/AAC), short and compressed (aim for < 10 MB), in `public/assets/videos/`, with a `poster` image. GitHub rejects files over 100 MB. For long videos use an external host and a full `https://` URL.
- **Placeholders:** the sample SVGs come from `scripts/generate-placeholder-assets.mjs`. They are only there so the app looks complete before real photos exist.

Run `npm run validate:content` afterwards: it reports any path that doesn't match a file.

---

## How to configure AI

Edit `src/data/ai/config.json`:

```json
{
  "enabled": true,
  "apiBaseUrl": "https://api.aicredits.in/v1",
  "model": "google/gemma-3-4b-it",
  "temperature": 0.3,
  "maxTokens": 600,
  "proxyUrl": "",
  "timeoutMs": 20000,
  "allowDemoKey": true,
  "maxHistoryMessages": 8,
  "imageGeneration": { "enabled": false, "endpoint": "", "model": "", "size": "1024x1024" }
}
```

| Field | Meaning |
| --- | --- |
| `enabled` | `false` = always use the offline records guide (no network calls). |
| `apiBaseUrl` | OpenAI-compatible base URL. Chat requests go to `<apiBaseUrl>/chat/completions` in demo mode. |
| `model` | Model ID (default `google/gemma-3-4b-it`). |
| `temperature`, `maxTokens` | Generation settings. Keep the temperature low for factual answers. |
| `proxyUrl` | **Secure proxy mode.** Full URL that accepts an OpenAI chat-completions body. When set, demo-key entry is hidden. |
| `timeoutMs` | Request timeout. On timeout the guide answers from the records. |
| `allowDemoKey` | Shows the memory-only key field when no proxy is configured. |
| `maxHistoryMessages` | How many previous messages are sent for context. |
| `imageGeneration` | Optional Future 2040 image generation via an OpenAI-compatible `/images/generations` endpoint (ideally through your proxy). If disabled or failing, prepared visuals are shown. |

**Modes (chosen automatically):**

1. **Proxy mode** (recommended for the exhibition): `proxyUrl` set. No key ever reaches the browser.
2. **Demo mode:** no proxy, and someone pastes a key into the chat panel. The key is held in memory only, is cleared on refresh, and is never stored or committed.
3. **Offline/records mode:** no proxy and no key, AI disabled, or any request failure. The guide searches the loaded JSON records and quotes them, or replies *"The requested information is not available in the school records currently loaded in the application."*

**Grounding.** Every request includes the school profile, the **current location in full** (description, history, facilities, achievements, facts, hotspot information, `aiContext`), summaries of other locations and the timeline. The system prompt in `prompts.json` forbids inventing facts, people, dates or awards, and requires the "not available" sentence when the records don't contain the answer. Change the wording there if needed, but keep the rules.

### Example secure proxy (Cloudflare Worker)

Deploy separately (free tier is fine) and store the key as a secret (`wrangler secret put AICREDITS_API_KEY`):

```js
// worker.js – minimal AICredits proxy for the AI Virtual School Explorer
const ALLOWED_ORIGIN = 'https://<user>.github.io';
const UPSTREAM = 'https://api.aicredits.in/v1/chat/completions';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (request.headers.get('Origin') !== ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403, headers: cors });

    const body = await request.json();
    // Enforce the model and limits server-side so the proxy can't be abused.
    const payload = {
      model: 'google/gemma-3-4b-it',
      messages: (body.messages || []).slice(-12),
      temperature: Math.min(Number(body.temperature) || 0.3, 1),
      max_tokens: Math.min(Number(body.max_tokens) || 600, 800)
    };
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AICREDITS_API_KEY}` },
      body: JSON.stringify(payload)
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
};
```

Then set `"proxyUrl": "https://<your-worker>.workers.dev"` in `config.json`. Consider adding rate limiting (Cloudflare rules) for a public exhibition.

---

## Security notes

- **Never put an API key in any file in this repository**, including `config.json`, `.env` or source code. Everything in a GitHub Pages site is public. `npm run validate:content` (also run in CI) fails if something that looks like a key appears in `ai/config.json`.
- **Demo mode** keys live only in React state: not in `localStorage`, cookies or URLs. They are lost on refresh. The UI shows the warning: *"Browser-based API keys are not secure and should only be used for demonstrations."* Use a low-limit key and revoke it after the demo.
- **Proxy mode** keeps the key server-side. Restrict the proxy to your Pages origin, fix the model and token limits, and add rate limiting.
- AI answers are rendered as text (a tiny safe Markdown subset). No HTML from the model is injected into the page.
- The app collects no personal data, has no analytics and stores nothing on the device.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Blank page after deploying | Check **Settings → Pages → Source = GitHub Actions**. Open the browser console: 404s on `.js` files usually mean a custom `VITE_BASE` that doesn't match the repo name. Remove it to use the default `./`. |
| Workflow fails at "Validate school content" | Read the ✖ lines in the log: a missing image path, a broken `navigation.to`, or invalid JSON (often a trailing comma). Run `npm run validate:content` locally. |
| Workflow shows a type-check warning | The type check is non-blocking. Run `npm run typecheck` locally to see the details. |
| Image not showing | Path must be relative to `public/` with no leading slash (`assets/…`). File names are **case-sensitive** on GitHub Pages (`Library.JPG` ≠ `library.jpg`). |
| 360° view shows the photo instead | The panorama failed to load (missing file, too large for the device's WebGL, or not 2:1). The app falls back automatically. Try a 4096×2048 JPG. |
| Hotspot in the wrong place | `position` uses % of the image, and `panoramaPosition` uses degrees. Check you edited the right one for the view you're testing. |
| AI says "Records mode (offline)" | No `proxyUrl` and no demo key, or `enabled` is `false`. |
| AI error "network or CORS error" | The browser can't call the API directly from your domain, or the proxy doesn't send `Access-Control-Allow-Origin` for your Pages URL. Use proxy mode with correct CORS headers. |
| AI error 401/403 | Invalid key, or the proxy rejected the origin. |
| "A newer version is available" | A cached page requested old code after a redeploy. Press **Reload**. |
| QR opens the wrong page | Regenerate the QR with the exact Pages URL (including `/<repo>/`). |
| Fonts look different offline | Google Fonts need internet. System fonts are used as a fallback automatically. |
