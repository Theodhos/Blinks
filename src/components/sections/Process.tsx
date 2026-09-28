'use client';

import { PROCESS } from '@/data/agency';
import { useActiveStep } from '@/hooks/useJourney';
import { SCENE } from '@/lib/journey';
import { COUNTS, PROCESS_NODES } from '@/lib/world';
import { Fade, Label, Line } from '@/components/ui/Type';
import { SceneSection, fit, panelPosition } from './Stage';

/** Three stages along one line of light, then the outcome. */
export function Process() {
  const step = useActiveStep(SCENE.process, COUNTS.process);
  const finale = PROCESS.steps.length;

  return (
    <SceneSection index={SCENE.process} title="Process" active={step >= 0}>
      <Fade className="absolute left-5 top-24 flex items-center gap-4 sm:left-10 sm:top-28">
        <Label className="text-ash">How we work</Label>
        <Label className="text-signal">{PROCESS.heading}</Label>
      </Fade>

      {PROCESS.steps.map((item, i) => (
        <article
          key={item.number}
          data-active={step === i}
          className={`panel ${panelPosition(Math.sign(PROCESS_NODES[i][0]))}`}
        >
          <Fade index={0}>
            <Label className="text-signal">Stage {item.number}</Label>
          </Fade>
          <h2 className="display fit mt-3" style={fit(item.title, 7.5)}>
            <Line index={1}>{item.title}</Line>
          </h2>
          <Fade index={3} className="relative mt-5 pt-5">
            <span className="rule absolute inset-x-0 top-0 block h-px bg-line" />
            <p className="accent text-2xl leading-tight text-bone sm:text-4xl">{item.line}</p>
          </Fade>
        </article>
      ))}

      <article
        data-active={step === finale}
        className="panel absolute inset-x-5 bottom-[7vh] text-center sm:inset-x-10"
      >
        <h2 className="sr-only">{PROCESS.outcome.join(', ')}</h2>
        <Fade index={4}>
          <Label className="text-signal">✦</Label>
        </Fade>
        <Line index={5} className="mt-2">
          <span className="accent block text-3xl text-bone sm:text-5xl">{PROCESS.heading}</span>
        </Line>
      </article>
    </SceneSection>
  );
}
