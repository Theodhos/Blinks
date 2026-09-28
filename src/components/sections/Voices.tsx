'use client';

import type { CSSProperties } from 'react';
import { TESTIMONIALS } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { Fade, Label } from '@/components/ui/Type';
import { SceneSection } from './Stage';

/** Client words, set large in open space. One voice at a time. */
export function Voices() {
  const step = useActiveStep(SCENE.voices, TESTIMONIALS.length);

  return (
    <SceneSection index={SCENE.voices} title="Client testimonials" active={step >= 0}>
      <Fade className="absolute left-5 top-24 flex items-center gap-4 sm:left-10 sm:top-28">
        <Label className="text-ash">Client reputation</Label>
        <Label className="tabular-nums text-signal">
          {String(Math.max(step, 0) + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
        </Label>
      </Fade>

      {TESTIMONIALS.map((testimonial, i) => (
        <figure
          key={testimonial.id}
          data-active={step === i}
          className="panel absolute inset-x-5 top-1/2 mx-auto max-w-6xl -translate-y-1/2 sm:inset-x-10 wide:inset-x-[12vw]"
        >
          <blockquote className="text-[clamp(1.45rem,3.6vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.03em]">
            <span className="accent mr-2 text-signal" aria-hidden>
              “
            </span>
            {testimonial.quote.split(' ').map((word, j) => (
              <span key={j} className="mask mask--inline" style={{ '--i': j * 0.3 } as CSSProperties}>
                <span>{word}&nbsp;</span>
              </span>
            ))}
          </blockquote>
          <Fade index={9} as="div" className="relative mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-1 pt-5">
            <span className="rule absolute left-0 top-0 block h-px w-16 bg-signal" />
            <figcaption className="contents">
              <span className="font-display text-lg font-bold uppercase tracking-tight">{testimonial.author}</span>
              <Label className="text-ash">
                {testimonial.role} — {testimonial.company}
              </Label>
            </figcaption>
          </Fade>
        </figure>
      ))}
    </SceneSection>
  );
}
