'use client';

import { CONTACT, HERO, STUDIO } from '@/data/agency';
import { useJourneyValue } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { scrollToScene } from '@/lib/scroll';
import { Magnetic } from '@/components/ui/Magnetic';
import { Arrow, Fade, Label } from '@/components/ui/Type';
import { useUI } from '@/components/ui/UIProvider';
import { SceneSection } from './Stage';

/**
 * The headline itself is set in the 3D scene, cut by the monolith. This
 * overlay carries only the quiet supporting details around the frame.
 */
export function Origin() {
  const { entered, setBriefOpen } = useUI();
  const near = useJourneyValue((u) => u < 0.5);

  return (
    <SceneSection index={SCENE.origin} title="Introduction" active={entered && near}>
      <h1 className="sr-only">
        {STUDIO.name} — {HERO.lineOne} {HERO.lineTwo} {STUDIO.descriptor}.
      </h1>

      <Fade index={2} className="absolute left-5 top-24 sm:left-10 sm:top-28">
        <Label className="text-ash">{STUDIO.descriptor}</Label>
      </Fade>

      <Fade index={3} className="absolute left-10 top-1/2 hidden origin-left -rotate-90 wide:block">
        <Label className="whitespace-nowrap text-smoke">{STUDIO.coordinates}</Label>
      </Fade>

      <div className="absolute inset-x-5 bottom-8 grid gap-8 sm:inset-x-10 sm:bottom-10 wide:grid-cols-3 wide:items-end">
        <div className="max-w-sm">
          <Fade index={5} as="p" className="text-sm leading-relaxed text-bone/80 sm:text-base">
            {STUDIO.summary}
          </Fade>
          <Fade index={7} className="label mt-6 flex flex-wrap gap-x-8 gap-y-4">
            <Magnetic strength={0.25}>
              <button type="button" onClick={() => setBriefOpen(true)} className="link link--solid font-bold">
                {HERO.primaryCta} <Arrow />
              </button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(CONTACT.callTitle)}`}
                className="link text-bone/80"
              >
                {HERO.secondaryCta} <Arrow />
              </a>
            </Magnetic>
          </Fade>
        </div>

        <Fade index={9} className="hidden justify-self-center wide:block">
          <button
            type="button"
            onClick={() => scrollToScene(SCENE.story, 0.05)}
            className="group flex flex-col items-center gap-3"
            aria-label="Begin the journey"
          >
            <Label className="text-ash transition-colors duration-500 group-hover:text-bone">Scroll to begin</Label>
            <span className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="cue absolute inset-0 block bg-signal" />
            </span>
          </button>
        </Fade>

        <Fade index={8} className="hidden wide:block wide:justify-self-end wide:text-right">
          <Label className="block text-signal">Est. {STUDIO.established}</Label>
          <Label className="mt-1 block text-ash">{STUDIO.tenure}</Label>
        </Fade>
      </div>
    </SceneSection>
  );
}
