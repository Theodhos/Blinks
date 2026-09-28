'use client';

import { AWARDS, CLIENTS, STATS } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { COUNTS } from '@/lib/world';
import { Fade, Label, Line } from '@/components/ui/Type';
import { SceneSection, fit, panelPosition } from './Stage';

/** Captions for the figures standing in the scene, then the record of recognition. */
export function Results() {
  const step = useActiveStep(SCENE.results, COUNTS.results);
  const recognition = STATS.length;

  return (
    <SceneSection index={SCENE.results} title="Results and recognition" active={step >= 0}>
      <Fade className="absolute left-5 top-24 flex items-center gap-4 sm:left-10 sm:top-28">
        <Label className="text-ash">{step === recognition ? 'Industry recognition' : 'Proven scale'}</Label>
      </Fade>

      {STATS.map((stat, i) => (
        <article
          key={stat.label}
          data-active={step === i}
          className={`panel ${panelPosition(i % 2 === 0 ? 1 : -1)}`}
        >
          <Fade index={0}>
            <Label className="tabular-nums text-signal">
              {String(i + 1).padStart(2, '0')} / {String(STATS.length).padStart(2, '0')}
            </Label>
          </Fade>
          <h2 className="display fit mt-3" style={fit(stat.label, 4.5)}>
            <span className="sr-only">{stat.number} </span>
            {stat.label.split(' & ').map((part, j, parts) => (
              <Line key={part} index={1 + j}>
                {part}
                {j < parts.length - 1 && ' &'}
              </Line>
            ))}
          </h2>
          <Fade index={4} className="relative mt-5 max-w-sm pt-5">
            <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
            <p className="text-sm leading-relaxed text-bone/80 sm:text-lg">{stat.sublabel}</p>
          </Fade>
        </article>
      ))}

      <article
        data-active={step === recognition}
        className="panel absolute inset-x-5 bottom-[5vh] sm:inset-x-10 wide:inset-x-auto wide:bottom-auto wide:left-[7vw] wide:top-1/2 wide:w-[min(46vw,44rem)] wide:-translate-y-1/2"
      >
        <h2 className="display text-[clamp(1.6rem,3.4vw,3.25rem)]">
          <Line index={0}>
            Awards <span className="accent text-signal">&amp;</span> Honors
          </Line>
        </h2>

        <ul className="mt-5">
          {AWARDS.map((award, i) => (
            <Fade key={award.title} as="li" index={2 + i} className="relative">
              <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
              <div className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 py-2.5 sm:py-3">
                <span className="label tabular-nums text-smoke">{award.year}</span>
                <span>
                  <span className="block text-sm font-medium tracking-tight text-bone sm:text-base">
                    {award.title}
                  </span>
                  <span className="label hidden text-ash sm:block">{award.category}</span>
                </span>
                <span className="label text-right text-bone/80">{award.organization}</span>
              </div>
            </Fade>
          ))}
        </ul>

        <Fade index={8} className="relative mt-1 pt-4">
          <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
          <Label className="text-smoke">Trusted by</Label>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {CLIENTS.map((client) => (
              <li key={client.name} className="font-display text-sm font-bold uppercase tracking-tight text-bone/85">
                {client.name}
              </li>
            ))}
          </ul>
        </Fade>
      </article>
    </SceneSection>
  );
}
