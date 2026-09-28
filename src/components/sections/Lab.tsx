'use client';

import { EXPERIMENTS } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { scrollToScene } from '@/lib/scroll';
import { Fade, Label, Line } from '@/components/ui/Type';
import { SceneSection } from './Stage';

/** The lab index. The carousel turns to whichever experiment is current. */
export function Lab() {
  const step = useActiveStep(SCENE.lab, EXPERIMENTS.length);
  const current = EXPERIMENTS[Math.max(step, 0)];

  return (
    <SceneSection index={SCENE.lab} title="Design in motion — lab experiments" active={step >= 0}>
      <div className="absolute left-5 top-24 sm:left-10 sm:top-28">
        <Fade>
          <Label className="text-ash">Creative Labs R&amp;D</Label>
        </Fade>
        <h2 className="display mt-3 text-[clamp(1.6rem,3.4vw,3.25rem)]">
          <Line index={1}>Design</Line>
          <Line index={2}>
            <span className="accent text-signal">in</span> Motion
          </Line>
        </h2>
      </div>

      <ol className="absolute left-10 top-1/2 hidden -translate-y-[35%] wide:block">
        {EXPERIMENTS.map((experiment, i) => (
          <Fade key={experiment.id} as="li" index={3 + i}>
            <button
              type="button"
              onClick={() => scrollToScene(SCENE.lab, (i + 0.4) / EXPERIMENTS.length)}
              aria-current={i === step ? 'true' : undefined}
              className={`group flex items-baseline gap-4 py-1.5 text-left transition-all duration-700 ${
                i === step ? 'translate-x-3 text-bone' : 'text-smoke hover:text-ash'
              }`}
            >
              <span className={`label tabular-nums ${i === step ? 'text-signal' : ''}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-base font-medium tracking-tight">{experiment.title}</span>
            </button>
          </Fade>
        ))}
      </ol>

      <div
        key={current.id}
        className="swap absolute inset-x-5 bottom-[5vh] sm:inset-x-10 wide:bottom-10 wide:left-10 wide:right-auto wide:w-[min(34vw,30rem)]"
      >
        <Label className="text-signal wide:hidden">
          Exp {String(Math.max(step, 0) + 1).padStart(2, '0')} / {String(EXPERIMENTS.length).padStart(2, '0')}
        </Label>
        <p className="display mt-2 text-2xl wide:hidden">{current.title}</p>
        <p className="accent mt-2 text-xl text-bone sm:text-2xl">{current.subtitle}</p>
        <div className="label relative mt-4 flex flex-wrap gap-x-5 gap-y-1 pt-3 text-ash">
          <span className="absolute inset-x-0 top-0 block h-px bg-line" />
          <span>{current.category}</span>
          <span>{current.tech}</span>
          <span>{current.year}</span>
        </div>
      </div>
    </SceneSection>
  );
}
