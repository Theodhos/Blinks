/**
 * Mutable runtime state shared between the DOM layer and the WebGL layer.
 * Read inside animation frames; never triggers React renders by itself.
 */
export const runtime = {
  /** Pointer in normalised device coordinates, -1..1. */
  pointer: { x: 0, y: 0 },
  /** True when the viewport is landscape enough for side-by-side framing. */
  wide: true,
  /** 0 while the preloader covers the world, tweened to 1 on reveal. */
  intro: 0,
  /** 0..1 energy fed to the monolith while the final call to action is hovered. */
  pulse: 0,
  reducedMotion: false,
  /** Lower geometry / particle budgets on small or coarse-pointer devices. */
  lowPower: false,
};

export const WIDE_QUERY = '(min-aspect-ratio: 11/10) and (min-width: 900px)';

type LoadListener = (state: LoadState) => void;

export interface LoadState {
  progress: number;
  ready: boolean;
  failed: boolean;
}

const loadState: LoadState = { progress: 0, ready: false, failed: false };
const loadListeners = new Set<LoadListener>();

export const loader = {
  get: () => loadState,
  set(patch: Partial<LoadState>) {
    Object.assign(loadState, patch);
    loadListeners.forEach((cb) => cb(loadState));
  },
  subscribe(cb: LoadListener) {
    loadListeners.add(cb);
    return () => {
      loadListeners.delete(cb);
    };
  },
};
