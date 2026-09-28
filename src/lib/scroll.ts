import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PIN } from './journey';
import { clamp } from './math';
import { runtime } from './runtime';

gsap.registerPlugin(ScrollTrigger);

/** Live scroll state. `u` is the journey position described in journey.ts. */
export const scroll = {
  y: 0,
  u: 0,
  velocity: 0,
  /** 0..1 across the whole document. */
  progress: 0,
};

interface Box {
  top: number;
  height: number;
}

type Listener = () => void;

let lenis: Lenis | null = null;
let boxes: Box[] = [];
let viewport = 1;
let limit = 1;
let locked = false;
const listeners = new Set<Listener>();

function toJourney(y: number) {
  const last = boxes.length - 1;
  for (let i = 0; i <= last; i++) {
    const box = boxes[i];
    if (y >= box.top + box.height && i < last) continue;
    const pinned = Math.max(box.height - viewport, 0);
    const travel = Math.max(box.height - pinned, 1);
    const local = y - box.top;
    const fraction =
      local <= pinned
        ? pinned > 0
          ? (local / pinned) * PIN
          : 0
        : PIN + ((local - pinned) / travel) * (1 - PIN);
    return i + clamp(fraction, 0, 1);
  }
  return 0;
}

function measure() {
  viewport = window.innerHeight;
  limit = Math.max(document.documentElement.scrollHeight - viewport, 1);
  boxes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    height: el.offsetHeight,
  }));
}

function tick(time: number) {
  lenis?.raf(time * 1000);
  const y = lenis ? lenis.scroll : window.scrollY;
  scroll.velocity = lenis ? lenis.velocity : y - scroll.y;
  scroll.y = y;
  scroll.progress = clamp(y / limit);
  scroll.u = boxes.length ? toJourney(y) : 0;
  listeners.forEach((cb) => cb());
}

export function startScroll() {
  if (!runtime.reducedMotion) {
    lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenis.on('scroll', ScrollTrigger.update);
    if (locked) lenis.stop();
  }

  measure();
  const observer = new ResizeObserver(() => {
    measure();
    ScrollTrigger.refresh();
  });
  observer.observe(document.body);
  window.addEventListener('resize', measure);

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    observer.disconnect();
    window.removeEventListener('resize', measure);
    lenis?.destroy();
    lenis = null;
  };
}

/** Subscribe to per-frame scroll updates. */
export function onFrame(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function lockScroll(state: boolean) {
  locked = state;
  if (state) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle('is-locked', state);
}

/** Scroll to a scene, optionally part-way through its pinned range. */
export function scrollToScene(index: number, pinned = 0, immediate = false) {
  const box = boxes[index];
  if (!box) return;
  const target = box.top + Math.max(box.height - viewport, 0) * clamp(pinned);
  if (lenis) {
    lenis.scrollTo(target, { immediate, duration: 2.2, force: true });
  } else {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
  }
}
