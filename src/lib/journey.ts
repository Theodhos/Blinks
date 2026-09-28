/**
 * The journey is measured in `u`: the integer part is the scene index, the
 * fraction is progress through that scene. While a scene is pinned the fraction
 * runs 0 → PIN; the final stretch PIN → 1 is pure camera travel to the next
 * scene, during which no overlay copy is on screen.
 */
export const PIN = 0.85;

export interface SceneDef {
  id: string;
  label: string;
  /** Scroll length in viewport heights. Omitted for natural-height scenes. */
  length?: number;
  /** Shown in navigation. */
  nav: boolean;
}

export const SCENES: SceneDef[] = [
  { id: 'origin', label: 'Origin', length: 2.2, nav: true },
  { id: 'story', label: 'Story', length: 2.8, nav: true },
  { id: 'services', label: 'Services', length: 4.8, nav: true },
  { id: 'work', label: 'Work', length: 5.6, nav: true },
  { id: 'lab', label: 'Lab', length: 3.4, nav: true },
  { id: 'process', label: 'Process', length: 4, nav: true },
  { id: 'results', label: 'Results', length: 4.2, nav: true },
  { id: 'voices', label: 'Voices', length: 2.8, nav: true },
  { id: 'contact', label: 'Contact', length: 2.4, nav: true },
  { id: 'footer', label: 'Studio', nav: false },
];

export const SCENE = {
  origin: 0,
  story: 1,
  services: 2,
  work: 3,
  lab: 4,
  process: 5,
  results: 6,
  voices: 7,
  contact: 8,
  footer: 9,
} as const;

/** Pinned progress (0..1) of a scene for a given journey position. */
export const pinProgress = (u: number, scene: number) =>
  Math.min(1, Math.max(0, (u - scene) / PIN));

/** True while a scene's overlay copy should be on screen. */
export const isPinned = (u: number, scene: number, lead = 0.015, tail = 0.01) =>
  u >= scene - lead && u <= scene + PIN + tail;

/**
 * Index of the active step inside a pinned scene, or -1 when the scene is not
 * pinned. Steps share the pinned range equally.
 */
export const activeStep = (u: number, scene: number, count: number) => {
  if (!isPinned(u, scene)) return -1;
  return Math.min(count - 1, Math.floor(pinProgress(u, scene) * count));
};

/** Journey position at fraction `t` of step `i` in a scene of `count` steps. */
export const stepAt = (scene: number, i: number, count: number, t: number) =>
  scene + (PIN * (i + t)) / count;
