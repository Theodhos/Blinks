'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MANIFESTO } from '@/data/agency';
import { usePinned } from '@/hooks/useJourney';
import { SCENE, SCENES } from '@/lib/journey';
import { pinnedTimeline } from '@/components/animations/ScrollAnimations';
import { Label } from '@/components/ui/Type';

const EMPHASIS = new Set(['strategy,', 'design,', 'technology.']);
const words = MANIFESTO.statement.split(' ');

/**
 * The manifesto is read at the pace of the scroll: each word lights as the
 * monolith comes apart behind it. Then the statement yields to the creed.
 */
export function Story() {
  const section = useRef<HTMLElement>(null);
  const active = usePinned(SCENE.story);

  useEffect(() => {
    if (!section.current) return;
    return pinnedTimeline(section.current, (timeline) => {
      // Staggered tweens only take their start values when they begin, so the
      // resting state is set up front.
      gsap.set('[data-eyebrow]', { opacity: 0 });
      gsap.set('[data-word]', { opacity: 0.12, yPercent: 18 });
      gsap.set('[data-creed-line], [data-mission]', { opacity: 0, y: 40 });
      gsap.set('[data-rule]', { scaleX: 0 });

      timeline
        .to('[data-eyebrow]', { opacity: 1, duration: 0.05 }, 0.01)
        .to(
          '[data-word]',
          { opacity: 1, yPercent: 0, duration: 0.1, stagger: { amount: 0.36 }, ease: 'power2.out' },
          0.03,
        )
        .to('[data-statement]', { yPercent: -14, opacity: 0, duration: 0.1, ease: 'power2.in' }, 0.54)
        .to('[data-rule]', { scaleX: 1, duration: 0.14, ease: 'power2.out' }, 0.62)
        .to(
          '[data-creed-line], [data-mission]',
          { opacity: 1, y: 0, duration: 0.1, stagger: 0.03, ease: 'power2.out' },
          0.63,
        )
        .to('[data-creed-block], [data-eyebrow]', { opacity: 0, duration: 0.06 }, 0.93);
    });
  }, []);

  return (
    <section
      ref={section}
      id={SCENES[SCENE.story].id}
      data-scene
      aria-label="About the studio"
      style={{ height: `${(SCENES[SCENE.story].length ?? 1) * 100}vh` }}
    >
      <div className="stage" data-active={active}>
        <div data-eyebrow className="absolute left-5 top-24 sm:left-10 sm:top-28">
          <Label className="text-ash">About</Label>
        </div>

        <div data-statement className="absolute inset-x-5 top-1/2 -translate-y-1/2 sm:inset-x-10 wide:right-[14vw]">
          <h2 className="font-sans text-[clamp(1.75rem,5.4vw,5.5rem)] font-medium leading-[1.06] tracking-[-0.035em]">
            {words.map((word, i) => (
              <span key={i} data-word className="inline-block will-change-[opacity,transform]">
                {EMPHASIS.has(word) ? <em className="accent text-signal">{word}</em> : word}
                {i < words.length - 1 && ' '}
              </span>
            ))}
          </h2>
        </div>

        <div
          data-creed-block
          className="absolute inset-x-5 top-1/2 -translate-y-1/2 sm:inset-x-10 wide:right-[14vw]"
        >
          <span data-rule className="mb-10 block h-px origin-left bg-line" />
          <div className="grid gap-10 wide:grid-cols-12 wide:items-end">
            <p className="display text-[clamp(1.5rem,3.9vw,4.25rem)] wide:col-span-8">
              {MANIFESTO.credo.map((line, i) => (
                <span key={line} data-creed-line className={`block ${i === 1 ? 'text-signal' : ''}`}>
                  {line}
                </span>
              ))}
            </p>
            <p
              data-mission
              className="max-w-md text-base leading-relaxed text-bone/80 sm:text-lg wide:col-span-4"
            >
              {MANIFESTO.mission}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
