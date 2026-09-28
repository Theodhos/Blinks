import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type ScrollEventData = {
  scroll: number;
  limit: number;
  velocity: number;
  direction: number;
  progress: number;
};

type ScrollListener = (data: ScrollEventData) => void;

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
const scrollListeners = new Set<ScrollListener>();
let currentVelocity = 0;

export function initSmoothScroll(): Lenis {
  if (typeof window === 'undefined') {
    return {} as Lenis;
  }

  if (lenisInstance) {
    return lenisInstance;
  }

  // Create Lenis instance with silky smooth inertia (as on Trionn)
  lenisInstance = new Lenis({
    duration: 1.45,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.5,
  });

  // Synchronize Lenis scroll events with GSAP ScrollTrigger and custom subscribers
  lenisInstance.on('scroll', (e: any) => {
    ScrollTrigger.update();
    currentVelocity = e.velocity || 0;
    scrollListeners.forEach((cb) => {
      try {
        cb(e);
      } catch (err) {
        console.error('Scroll listener error:', err);
      }
    });
  });

  // GSAP ticker drives Lenis requestAnimationFrame
  tickerCallback = (time: number) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000);
    }
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function getScrollVelocity(): number {
  return currentVelocity;
}

export function addScrollListener(cb: ScrollListener): () => void {
  scrollListeners.add(cb);
  return () => {
    scrollListeners.delete(cb);
  };
}

export function scrollTo(
  target: string | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: options?.immediate ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: options?.immediate ? 'auto' : 'smooth' });
    }
  }
}

export function pauseScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
}

export function resumeScroll() {
  if (lenisInstance) {
    lenisInstance.start();
  }
}

export function destroySmoothScroll() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  scrollListeners.clear();
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
