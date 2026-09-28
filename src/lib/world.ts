import { Color } from 'three';
import { SCENE, stepAt } from './journey';
import { createTrack } from './math';

export type V3 = [number, number, number];

/* -------------------------------------------------------------------------- */
/* Layout — where everything lives along the journey                          */
/* -------------------------------------------------------------------------- */

export const COUNTS = { services: 4, projects: 5, lab: 7, process: 4, results: 4 };

const alternate = (i: number, first: 1 | -1 = 1) => (i % 2 === 0 ? first : -first);

export const servicePosition = (i: number): V3 => [alternate(i) * 2, 0, -30 - 18 * i];
export const projectPosition = (i: number): V3 => [alternate(i) * 2.5, 0, -118 - 16 * i];
export const resultPosition = (i: number): V3 => [alternate(i) * 2.1, 0, -338 - 14 * i];

export const PROCESS_NODES: V3[] = [
  [-1.8, -0.2, -258],
  [1.8, 0.3, -272],
  [-1.8, 0, -286],
];
export const OUTCOME_WORDS: V3[] = [
  [-0.9, 1.15, -304],
  [0.9, 0, -310],
  [-0.5, -2.3, -317],
];

export const LAB_CENTER: V3 = [2.6, 0, -224];
export const LAB_RADIUS = 4.2;
/** Resting angle of the active panel; also keeps the fly-through gaps clear. */
export const LAB_FRONT_ANGLE = -0.218;

export const HALO: V3 = [2.4, 0, -382];
export const VOICES_CENTER: V3 = [0, 0, -414];
export const FINALE: V3 = [0, 0, -452];
export const WORDMARK_Z = -461;

export const FOV = { wide: 40, stacked: 55 };

/* -------------------------------------------------------------------------- */
/* Camera                                                                     */
/* -------------------------------------------------------------------------- */

interface CameraKey {
  u: number;
  pos: V3;
  look: V3;
  mpos: V3;
  mlook: V3;
}

const cameraKeys: CameraKey[] = [];
const focusKeys: { u: number; at: V3 }[] = [];

const shot = (u: number, pos: V3, look: V3, mpos: V3 = pos, mlook: V3 = look) =>
  cameraKeys.push({ u, pos, look, mpos, mlook });

/**
 * Frame a subject: on wide viewports it sits to one side with copy opposite,
 * on stacked viewports it is centred in the upper half with copy below.
 */
const frame = (u: number, subject: V3, distance: number, side: number, offset = 2.8) => {
  const [x, y, z] = subject;
  const camX = x - side * offset;
  const far = distance * 1.3;
  shot(
    u,
    [camX, y + 0.15, z + distance],
    [camX + side * 0.1 * distance, y, z],
    [x, y + 0.2, z + far],
    [x, y - 0.19 * far, z],
  );
  focusKeys.push({ u, at: [x - side * 1.6, y + 1.3, z + 2.6] });
};

// Origin — the monolith, whole.
shot(0, [0, 0.1, 9.5], [0, 0, 0], [0, 0.2, 12.5], [0, -0.6, 0]);
shot(0.85, [1.8, 0.5, 6.4], [0, 0, 0], [1.2, 0.4, 9.5], [0, -0.4, 0]);
// Story — orbit the shattering form, then dive through its core.
// The core is framed low and to the right, clear of the manifesto.
shot(1.3, [-2, 0.3, 5.4], [-2.2, 1.5, 0], [-1.2, 0.3, 8], [0, 3.1, 0]);
shot(1.7, [-0.6, 0, 4.2], [-1.4, 1, -2], [-0.4, 0, 6], [0, 2.2, -2]);
shot(1.86, [0, 0, 2.6], [0, 0, -6]);
shot(1.93, [0, 0, -0.6], [0, 0, -12]);
focusKeys.push({ u: 0, at: [0, 0, 0] }, { u: 1.93, at: [0, 0, 0] });

for (let i = 0; i < COUNTS.services; i++) {
  const side = alternate(i);
  frame(stepAt(SCENE.services, i, COUNTS.services, 0.1), servicePosition(i), 9, side);
  frame(stepAt(SCENE.services, i, COUNTS.services, 0.9), servicePosition(i), 6.6, side);
}

for (let i = 0; i < COUNTS.projects; i++) {
  const side = alternate(i);
  frame(stepAt(SCENE.work, i, COUNTS.projects, 0.1), projectPosition(i), 8.4, side, 3.1);
  frame(stepAt(SCENE.work, i, COUNTS.projects, 0.9), projectPosition(i), 6.6, side, 3.1);
}

// Lab — hold outside the carousel, then fly through it.
shot(4.02, [0, 0.8, -211.5], [1.4, 0, -224], [2.6, 1.2, -207], [2.6, -2.6, -224]);
shot(4.85, [0, 0.4, -213.5], [1.4, 0, -224], [2.6, 0.9, -209], [2.6, -2.6, -224]);
focusKeys.push({ u: 4.02, at: [1, 1.5, -216] }, { u: 4.85, at: [1, 1.5, -216] });

PROCESS_NODES.forEach((node, i) => {
  const side = Math.sign(node[0]);
  frame(stepAt(SCENE.process, i, COUNTS.process, 0.1), node, 7.5, side, 2.6);
  frame(stepAt(SCENE.process, i, COUNTS.process, 0.9), node, 5.6, side, 2.6);
});
shot(stepAt(SCENE.process, 3, COUNTS.process, 0.15), [0, 0, -292], [0, 0, -310], [0, 0, -286], [0, 0, -310]);
shot(5.85, [0, 0, -297.5], [0, 0, -310], [0, 0, -292], [0, 0, -310]);
focusKeys.push({ u: 5.7, at: [0, 1, -302] });

for (let i = 0; i < 3; i++) {
  const side = alternate(i);
  frame(stepAt(SCENE.results, i, COUNTS.results, 0.1), resultPosition(i), 9, side);
  frame(stepAt(SCENE.results, i, COUNTS.results, 0.9), resultPosition(i), 7, side);
}
frame(stepAt(SCENE.results, 3, COUNTS.results, 0.1), HALO, 9.5, 1);
frame(stepAt(SCENE.results, 3, COUNTS.results, 0.95), HALO, 8, 1);

// Voices — a slow drift through suspended fragments.
shot(7.02, [0, 0, -396], [0, 0, -420]);
shot(7.85, [0.4, 0.2, -407], [0, 0, -424]);
focusKeys.push({ u: 7.4, at: [0, 2, -410] });

// Contact — the approach, and the final reveal of the wordmark.
shot(8.03, [0, 0.4, -428], FINALE, [0, 0.4, -424], [0, -0.5, -452]);
shot(8.85, [0, 0, -444], FINALE, [0, 0, -440], [0, -0.4, -452]);
shot(9, [0, -0.2, -439.5], [0, -2.3, -452], [0, 0.2, -436], [0, -1.2, -452]);
shot(9.85, [0, -0.2, -438.5], [0, -2.3, -452], [0, 0.2, -435], [0, -1.2, -452]);
focusKeys.push({ u: 8.03, at: FINALE }, { u: 9.85, at: FINALE });

cameraKeys.sort((a, b) => a.u - b.u);
focusKeys.sort((a, b) => a.u - b.u);

const us = cameraKeys.map((k) => k.u);

export const cameraTrack = {
  wide: {
    pos: createTrack(us, cameraKeys.map((k) => k.pos)),
    look: createTrack(us, cameraKeys.map((k) => k.look)),
  },
  stacked: {
    pos: createTrack(us, cameraKeys.map((k) => k.mpos)),
    look: createTrack(us, cameraKeys.map((k) => k.mlook)),
  },
};

/** Where the travelling accent light sits. */
export const focusTrack = createTrack(
  focusKeys.map((k) => k.u),
  focusKeys.map((k) => k.at),
);

/* -------------------------------------------------------------------------- */
/* Mood — background, accent light and environment across the journey         */
/* -------------------------------------------------------------------------- */

export const PALETTE = {
  void: '#070708',
  bone: '#f2efe9',
  signal: '#ff4d00',
  steel: '#9db8ff',
};

interface Mood {
  u: number;
  bg: string;
  accent: string;
  /** Accent light intensity. */
  power: number;
  /** Environment reflection intensity. */
  env: number;
}

const soften = (hex: string, amount = 0.45) => `#${new Color(hex).lerp(new Color('#ffffff'), amount).getHexString()}`;

const moods: Mood[] = [
  { u: 0, bg: '#08080a', accent: PALETTE.signal, power: 1, env: 1 },
  { u: 1.4, bg: '#0d0907', accent: PALETTE.signal, power: 1.5, env: 0.9 },
  { u: 1.93, bg: '#1a0b04', accent: PALETTE.signal, power: 2.4, env: 0.8 },
  { u: 2.05, bg: '#07080b', accent: '#e2e8f0', power: 1, env: 1.1 },
  { u: stepAt(2, 1, 4, 0.5), bg: '#0b0706', accent: '#ff5533', power: 1.2, env: 1.2 },
  { u: stepAt(2, 2, 4, 0.5), bg: '#06080d', accent: '#60a5fa', power: 1.1, env: 1 },
  { u: stepAt(2, 3, 4, 0.5), bg: '#0b0905', accent: '#f59e0b', power: 1.1, env: 1.1 },
  { u: stepAt(3, 0, 5, 0.5), bg: '#08080a', accent: soften('#d4af37'), power: 0.9, env: 0.8 },
  { u: stepAt(3, 1, 5, 0.5), bg: '#0a0607', accent: soften('#ff3e3e'), power: 0.9, env: 0.8 },
  { u: stepAt(3, 2, 5, 0.5), bg: '#06080b', accent: soften('#93c5fd'), power: 0.9, env: 0.8 },
  { u: stepAt(3, 3, 5, 0.5), bg: '#08070c', accent: soften('#a78bfa'), power: 0.9, env: 0.8 },
  { u: stepAt(3, 4, 5, 0.5), bg: '#0a0906', accent: soften('#fbbf24'), power: 0.9, env: 0.8 },
  { u: 4.4, bg: '#08070b', accent: PALETTE.bone, power: 0.8, env: 0.9 },
  { u: 5.3, bg: '#0a0806', accent: PALETTE.signal, power: 1.2, env: 1 },
  { u: 6.3, bg: '#0e0906', accent: '#ffb27a', power: 1, env: 1.1 },
  { u: 7.4, bg: '#05070c', accent: PALETTE.steel, power: 0.9, env: 0.9 },
  { u: 8.2, bg: '#0a0605', accent: PALETTE.signal, power: 1.4, env: 1 },
  { u: 8.85, bg: '#1c0a03', accent: PALETTE.signal, power: 3, env: 1.3 },
  { u: 9.2, bg: '#0c0705', accent: PALETTE.signal, power: 2, env: 1.1 },
];

const linear = (hex: string) => {
  const c = new Color(hex);
  return [c.r, c.g, c.b];
};

/** Samples to [bgR, bgG, bgB, accentR, accentG, accentB, power, env] in linear colour. */
export const moodTrack = createTrack(
  moods.map((m) => m.u),
  moods.map((m) => [...linear(m.bg), ...linear(m.accent), m.power, m.env]),
);
