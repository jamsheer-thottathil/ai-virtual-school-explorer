/**
 * Content model for AI Virtual School Explorer.
 * Every interface here mirrors a JSON file under src/data/.
 * Paths to images/videos are written relative to the /public folder,
 * e.g. "assets/locations/library/main.svg" (no leading slash).
 */

export interface MediaImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface MediaVideo {
  src: string;
  title: string;
  poster?: string;
  caption?: string;
  /** MIME type, defaults to video/mp4 */
  mimeType?: string;
}

export interface RelatedLink {
  label: string;
  /** In-app route ("/gallery?category=sports") or a full https:// URL */
  link: string;
}

/* ------------------------------------------------------------------ */
/* School                                                              */
/* ------------------------------------------------------------------ */

export interface FeatureHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface QuickAccessCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  image?: string;
}

export interface SchoolData {
  name: string;
  shortName: string;
  tagline: string;
  logo: string;
  heroImage: string;
  /** Background artwork for the interactive campus map. */
  campusMap: string;
  startLocation: string;
  isSampleData: boolean;
  sampleDataNotice: string;
  hero: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    description: string;
    instruction: string;
    primaryButtons: { label: string; route: string; icon: string }[];
  };
  exhibition: {
    title: string;
    message: string;
    /** Optional QR image (e.g. assets/logos/qr-code.png). Empty = hide image. */
    qrImage: string;
    /** Public URL of the deployed site, shown under the QR / used for sharing. */
    publicUrl: string;
    steps: string[];
  };
  about: {
    summary: string;
    established: string | null;
    founder: string | null;
    affiliation: string | null;
    address: string | null;
    website: string | null;
  };
  facilities: string[];
  achievements: string[];
  features: FeatureHighlight[];
  quickAccess: QuickAccessCard[];
  footer: {
    text: string;
    credits: string;
  };
}

/* ------------------------------------------------------------------ */
/* Locations                                                           */
/* ------------------------------------------------------------------ */

/** Position on a normal (flat) image, in percent of width/height (0–100). */
export interface ImagePosition {
  x: number;
  y: number;
}

/** Position inside a 360° equirectangular panorama, in degrees. */
export interface PanoramaPosition {
  yaw: number;
  pitch: number;
}

export type HotspotType = 'info' | 'navigation';

export interface Hotspot {
  id: string;
  type: HotspotType;
  title: string;
  /** Short label shown on hover / screen readers. Defaults to title. */
  label?: string;
  description?: string;
  /** Used by the flat image viewer. */
  position: ImagePosition;
  /** Used when the location has a 360° panorama. */
  panoramaPosition?: PanoramaPosition;
  /** For navigation hotspots: id of the target location. */
  target?: string;
  image?: MediaImage;
  photos?: MediaImage[];
  videos?: MediaVideo[];
  historicalNotes?: string[];
  relatedContent?: RelatedLink[];
  /** Question sent to the AI guide when "Ask AI about this" is pressed. */
  aiQuestion?: string;
}

export type NavigationDirection = 'forward' | 'back' | 'left' | 'right' | 'up' | 'down';

export interface NavigationLink {
  to: string;
  label: string;
  direction?: NavigationDirection;
}

export interface PanoramaConfig {
  /** Equirectangular 2:1 image. Only set this for REAL 360° images. */
  src: string;
  /** Optional low-res preview shown while loading. */
  preview?: string;
  initialYaw?: number;
  initialPitch?: number;
  initialHfov?: number;
  autoRotate?: number;
  /** Partial panoramas: horizontal / vertical angle of view in degrees. */
  haov?: number;
  vaov?: number;
}

export interface LocationData {
  id: string;
  name: string;
  order: number;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  thumbnail: string;
  mainImage: MediaImage;
  panorama: PanoramaConfig | null;
  historicalInformation: string[];
  interestingFacts: string[];
  facilities: string[];
  achievements: string[];
  relatedImages: MediaImage[];
  videos: MediaVideo[];
  hotspots: Hotspot[];
  navigation: NavigationLink[];
  aiContext: string;
  /** Marker position on the campus map, percent of map width/height. */
  mapPosition: ImagePosition;
  isSampleData: boolean;
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  image: MediaImage;
  gallery: MediaImage[];
  isSampleData: boolean;
}

export interface TimelineData {
  title: string;
  subtitle: string;
  isSampleData: boolean;
  notice: string;
  entries: TimelineEntry[];
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  /** Optional smaller image used in the grid. */
  thumbnail?: string;
  poster?: string;
  alt: string;
  caption: string;
  year?: string;
  mimeType?: string;
}

export interface GalleryCategory {
  id: string;
  title: string;
  description: string;
  order: number;
  isSampleData: boolean;
  items: GalleryItem[];
}

/* ------------------------------------------------------------------ */
/* Challenges                                                          */
/* ------------------------------------------------------------------ */

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Badge is awarded when score percentage >= this value. */
  minScorePercent: number;
}

interface ChallengeBase {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  accent: string;
  badges: Badge[];
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  image?: MediaImage;
}

export interface QuizChallenge extends ChallengeBase {
  type: 'quiz';
  questions: MultipleChoiceQuestion[];
}

export interface GuessLocationQuestion {
  id: string;
  prompt: string;
  image: MediaImage;
  /** Location ids – names are read from the location JSON files. */
  options: string[];
  answer: string;
  hint: string;
}

export interface LocationChallenge extends ChallengeBase {
  type: 'guess-location';
  questions: GuessLocationQuestion[];
}

export interface FactStatement {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface FactChallenge extends ChallengeBase {
  type: 'true-false';
  questions: FactStatement[];
}

export interface HumanVsAiChallenge extends ChallengeBase {
  type: 'human-vs-ai';
  questions: MultipleChoiceQuestion[];
}

export interface StoryChallenge extends ChallengeBase {
  type: 'story';
  characters: string[];
  places: string[];
  themes: string[];
  templates: string[];
  minimumChoices: number;
}

export type Challenge =
  | QuizChallenge
  | LocationChallenge
  | FactChallenge
  | HumanVsAiChallenge
  | StoryChallenge;

/* ------------------------------------------------------------------ */
/* Future school                                                       */
/* ------------------------------------------------------------------ */

export interface FutureScenario {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  image: MediaImage;
  features: string[];
  keywords: string[];
}

export interface FutureSchoolData {
  title: string;
  subtitle: string;
  notice: string;
  promptSuggestions: string[];
  scenarios: FutureScenario[];
}
