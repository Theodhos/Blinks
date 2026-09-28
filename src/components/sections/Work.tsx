'use client';

import { PROJECTS } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { Fade, Label, Line } from '@/components/ui/Type';
import { SceneSection, fit, panelPosition } from './Stage';

/** Each project's case notes, shown while the camera stands before its panel. */
export function Work() {
  const step = useActiveStep(SCENE.work, PROJECTS.length);

  return (
    <SceneSection index={SCENE.work} title="Selected work" active={step >= 0}>
      <Fade className="absolute left-5 top-24 flex items-center gap-4 sm:left-10 sm:top-28">
        <Label className="text-ash">Selected work</Label>
        <Label className="tabular-nums text-signal">
          {String(Math.max(step, 0) + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
        </Label>
      </Fade>

      {PROJECTS.map((project, i) => (
        <article
          key={project.id}
          data-active={step === i}
          className={`panel ${panelPosition(i % 2 === 0 ? 1 : -1)}`}
        >
          <Fade index={0} className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Label className="text-signal">{project.category}</Label>
            <Label className="text-ash">{project.year}</Label>
          </Fade>

          <h2 className="display fit mt-3" style={fit(project.title, 6.5)}>
            {project.title.split(' ').map((word, j) => (
              <Line key={word} index={1 + j}>
                {word}
              </Line>
            ))}
          </h2>

          <Fade index={4} as="p" className="mt-5 max-w-md text-sm leading-relaxed text-bone/75 sm:text-base">
            {project.description}
          </Fade>

          <Fade index={6} className="relative mt-6 pt-4">
            <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="label text-smoke">Client</dt>
                <dd className="mt-1 text-sm text-bone">{project.client}</dd>
              </div>
              <div>
                <dt className="label text-smoke">Outcome</dt>
                <dd className="accent mt-0.5 text-xl leading-tight text-bone sm:text-2xl">{project.metrics}</dd>
              </div>
            </dl>
          </Fade>

          <Fade index={8} as="ul" className="label mt-5 hidden flex-wrap gap-x-4 gap-y-1 text-ash sm:flex">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </Fade>
        </article>
      ))}
    </SceneSection>
  );
}
