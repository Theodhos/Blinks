'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PROCESS, STUDIO } from '@/data/agency';
import { loader, runtime } from '@/lib/runtime';
import { useUI } from './UIProvider';

/** Never hold the visitor longer than this, whatever the network is doing. */
const TIMEOUT = 12000;
const MINIMUM = 1400;

/** Covers the world while it compiles, then lifts to begin the film. */
export function Preloader() {
  const { enter } = useUI();
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const shown = { value: 0 };
    const started = performance.now();
    let finished = false;

    const paint = () => {
      const value = Math.round(shown.value);
      if (counter.current) counter.current.textContent = String(value).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${shown.value / 100})`;
    };

    const leave = () => {
      if (finished) return;
      finished = true;
      const skipIntro = runtime.reducedMotion || new URLSearchParams(window.location.search).has('at');

      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(shown, { value: 100, duration: 0.5, ease: 'power2.out', onUpdate: paint })
        .to('[data-preloader-item]', { yPercent: -120, duration: 0.7, stagger: 0.05, ease: 'power3.in' }, '+=0.15')
        .add(() => {
          enter();
          gsap.to(runtime, { intro: 1, duration: skipIntro ? 0.01 : 2.8, ease: 'power3.out' });
        })
        .to(root.current, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=0.1');
    };

    const advance = (progress: number, ready: boolean) => {
      const waited = performance.now() - started;
      if (ready && waited >= MINIMUM) {
        leave();
        return;
      }
      // Hold just short of complete until the world has actually rendered.
      const target = Math.min(ready ? 99 : 92, Math.max(progress * 92, (waited / MINIMUM) * 60));
      gsap.to(shown, { value: target, duration: 0.8, ease: 'power2.out', onUpdate: paint, overwrite: true });
    };

    const unsubscribe = loader.subscribe((state) => advance(state.progress, state.ready));
    const poll = window.setInterval(() => advance(loader.get().progress, loader.get().ready), 200);
    const timeout = window.setTimeout(leave, TIMEOUT);
    advance(loader.get().progress, loader.get().ready);

    return () => {
      unsubscribe();
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      gsap.killTweensOf(shown);
    };
  }, [enter]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-void px-5 py-6 text-bone sm:px-10 sm:py-8"
      role="status"
      aria-label="Loading"
    >
      <div className="flex justify-between overflow-hidden">
        <span data-preloader-item className="label block text-ash">
          {STUDIO.name} — {STUDIO.descriptor}
        </span>
        <span data-preloader-item className="label hidden text-ash sm:block">
          Berlin / NYC / Tokyo
        </span>
      </div>

      <div className="overflow-hidden">
        <span data-preloader-item className="display block text-[22vw] leading-[0.8] wide:text-[15vw]">
          <span ref={counter} className="tabular-nums">
            000
          </span>
        </span>
      </div>

      <div>
        <div className="flex justify-between overflow-hidden pb-3">
          <span data-preloader-item className="label block text-ash">
            {[...PROCESS.outcome].reverse().join(' • ')}
          </span>
          <span data-preloader-item className="label block text-ash">
            Est. {STUDIO.established}
          </span>
        </div>
        <span className="block h-px w-full bg-line">
          <span ref={bar} className="block h-px origin-left scale-x-0 bg-signal" />
        </span>
      </div>
    </div>
  );
}
