'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CONTACT } from '@/data/agency';
import { usePinned } from '@/hooks/useJourney';
import { SCENE, SCENES } from '@/lib/journey';
import { runtime } from '@/lib/runtime';
import { pinnedTimeline } from '@/components/animations/ScrollAnimations';
import { Magnetic } from '@/components/ui/Magnetic';
import { Arrow, Label } from '@/components/ui/Type';
import { useUI } from '@/components/ui/UIProvider';

/**
 * The climax. The headline grows with the approach until it fills the frame,
 * and the button feeds energy back into the monolith behind it.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const active = usePinned(SCENE.contact);
  const { setBriefOpen } = useUI();

  useEffect(() => {
    if (!section.current) return;
    return pinnedTimeline(section.current, (timeline) => {
      gsap.set('[data-eyebrow]', { opacity: 0 });
      gsap.set('[data-headline] > span', { opacity: 0, scale: 0.55, yPercent: 40 });
      gsap.set('[data-action]', { opacity: 0, scale: 0.6 });
      gsap.set('[data-detail]', { opacity: 0, y: 20 });

      timeline
        .to('[data-eyebrow]', { opacity: 1, duration: 0.08 }, 0.04)
        .to(
          '[data-headline] > span',
          { opacity: 1, scale: 1, yPercent: 0, duration: 0.42, stagger: 0.08, ease: 'power3.out' },
          0.06,
        )
        .to('[data-action]', { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.6)' }, 0.46)
        .to('[data-detail]', { opacity: 1, y: 0, duration: 0.14, stagger: 0.04 }, 0.56)
        .to('[data-frame]', { opacity: 0, yPercent: -8, duration: 0.08, ease: 'power2.in' }, 0.92);
    });
  }, []);

  const energise = (value: number) =>
    gsap.to(runtime, { pulse: value, duration: value ? 0.6 : 1.2, ease: 'power2.out', overwrite: true });

  useEffect(() => () => void energise(0), []);

  return (
    <section
      ref={section}
      id={SCENES[SCENE.contact].id}
      data-scene
      aria-label="Contact"
      style={{ height: `${(SCENES[SCENE.contact].length ?? 1) * 100}vh` }}
    >
      <div className="stage" data-active={active} inert={!active}>
        <div
          data-frame
          className="scrim absolute inset-0 flex flex-col items-center justify-center px-5 text-center sm:px-10"
        >
          <div data-eyebrow>
            <Label className="text-signal">{CONTACT.eyebrow}</Label>
          </div>

          <h2 data-headline className="mt-5 will-change-transform">
            <span className="display block text-[10.5vw] leading-[0.9] wide:whitespace-nowrap wide:text-[min(5.5vw,11vh)]">
              {CONTACT.headlineOne}
            </span>
            <span className="accent mt-[0.12em] block text-[14vw] leading-[0.95] text-signal wide:mt-0 wide:whitespace-nowrap wide:text-[min(9.5vw,19vh)]">
              {CONTACT.headlineTwo}
            </span>
          </h2>

          <div data-action className="mt-8 sm:mt-10">
            <Magnetic strength={0.45} onEnter={() => energise(1)} onLeave={() => energise(0)}>
              <button
                type="button"
                onClick={() => setBriefOpen(true)}
                data-cursor="Open"
                className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-bone text-void shadow-[0_0_80px_rgb(255_77_0/0.35)] transition-[background-color,box-shadow] duration-700 hover:bg-signal hover:shadow-[0_0_140px_rgb(255_77_0/0.7)] sm:h-40 sm:w-40"
              >
                <span
                  className="absolute inset-0 rounded-full border border-bone/40 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:opacity-0"
                  aria-hidden
                />
                <span data-magnetic-inner className="label flex flex-col items-center gap-2 font-bold">
                  <Arrow diagonal className="text-2xl transition-transform duration-700 group-hover:rotate-45" />
                  {CONTACT.cta}
                </span>
              </button>
            </Magnetic>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
            <a data-detail href={`mailto:${CONTACT.email}`} className="link font-mono text-sm sm:text-lg">
              {CONTACT.email}
            </a>
            <span data-detail>
              <Label className="text-ash">{CONTACT.responseTime}</Label>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
