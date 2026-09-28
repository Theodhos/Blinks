'use client';

import { SERVICES, SERVICES_INTRO } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { Fade, Label, Line } from '@/components/ui/Type';
import { SceneSection, fit, panelPosition } from './Stage';

/** One discipline at a time, each beside the form that embodies it. */
export function Services() {
  const step = useActiveStep(SCENE.services, SERVICES.length);

  return (
    <SceneSection index={SCENE.services} title="Services" active={step >= 0}>
      <Fade className="absolute left-5 top-24 flex items-center gap-4 sm:left-10 sm:top-28">
        <Label className="text-ash">Core disciplines</Label>
        <Label className="tabular-nums text-signal">
          {String(Math.max(step, 0) + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}
        </Label>
      </Fade>

      <p className="sr-only">{SERVICES_INTRO}</p>

      {SERVICES.map((service, i) => (
        <article
          key={service.id}
          data-active={step === i}
          className={`panel ${panelPosition(i % 2 === 0 ? 1 : -1)}`}
        >
          <Line index={0}>
            <span className="accent block text-lg text-signal sm:text-2xl">{service.tagline}</span>
          </Line>
          <h2 className="display fit mt-3" style={fit(service.title, 3.4)}>
            {service.title.split(' & ').map((part, j, parts) => (
              <Line key={part} index={1 + j}>
                {part}
                {j < parts.length - 1 && ' &'}
              </Line>
            ))}
          </h2>
          <Fade index={4} as="p" className="mt-5 max-w-md text-sm leading-relaxed text-bone/75 sm:text-base">
            {service.description}
          </Fade>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 wide:grid-cols-1">
            {service.deliverables.map((item, j) => (
              <Fade key={item} as="li" index={6 + j} className="relative py-2 wide:py-2.5">
                <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
                <span className="label flex items-baseline gap-3 text-bone/90">
                  <span className="hidden text-smoke wide:inline">{String(j + 1).padStart(2, '0')}</span>
                  {item}
                </span>
              </Fade>
            ))}
          </ul>
        </article>
      ))}
    </SceneSection>
  );
}
