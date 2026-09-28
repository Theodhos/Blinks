export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalised position of `v` between `a` and `b`, clamped to 0..1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const smoothstep = (v: number, a: number, b: number) => {
  const t = range(v, a, b);
  return t * t * (3 - 2 * t);
};

/** 0 → 1 → 0 plateau: rises over [a, b], holds, falls over [c, d]. */
export const plateau = (v: number, a: number, b: number, c: number, d: number) =>
  smoothstep(v, a, b) * (1 - smoothstep(v, c, d));

/** Frame-rate independent exponential smoothing factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

/** Deterministic pseudo-random in 0..1 from an integer seed. */
export const seeded = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

export interface Track {
  sample: (u: number, out: number[]) => number[];
}

/**
 * Monotone cubic (PCHIP) interpolation through keyframes. Unlike Catmull-Rom it
 * never overshoots, so a slow push-in followed by a fast travel cannot make the
 * camera drift backwards.
 */
export function createTrack(us: number[], values: number[][]): Track {
  const n = us.length;
  const dim = values[0].length;
  const tangents: number[][] = values.map(() => new Array<number>(dim).fill(0));

  for (let d = 0; d < dim; d++) {
    const h: number[] = [];
    const delta: number[] = [];
    for (let k = 0; k < n - 1; k++) {
      h.push(us[k + 1] - us[k]);
      delta.push((values[k + 1][d] - values[k][d]) / h[k]);
    }
    tangents[0][d] = 0;
    tangents[n - 1][d] = 0;
    for (let k = 1; k < n - 1; k++) {
      if (delta[k - 1] * delta[k] <= 0) continue;
      const w1 = 2 * h[k] + h[k - 1];
      const w2 = h[k] + 2 * h[k - 1];
      tangents[k][d] = (w1 + w2) / (w1 / delta[k - 1] + w2 / delta[k]);
    }
  }

  return {
    sample(u, out) {
      if (u <= us[0]) {
        for (let d = 0; d < dim; d++) out[d] = values[0][d];
        return out;
      }
      if (u >= us[n - 1]) {
        for (let d = 0; d < dim; d++) out[d] = values[n - 1][d];
        return out;
      }
      let k = 0;
      while (k < n - 2 && u > us[k + 1]) k++;
      const h = us[k + 1] - us[k];
      const t = (u - us[k]) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      for (let d = 0; d < dim; d++) {
        out[d] =
          h00 * values[k][d] +
          h10 * h * tangents[k][d] +
          h01 * values[k + 1][d] +
          h11 * h * tangents[k + 1][d];
      }
      return out;
    },
  };
}
