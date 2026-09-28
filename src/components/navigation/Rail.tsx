'use client';

import { useEffect, useRef } from 'react';
import { useJourneyValue } from '@/hooks/useJourney';
import { SCENES } from '@/lib/journey';
import { onFrame, scroll, scrollToScene } from '@/lib/scroll';
import { useUI } from '@/components/ui/UIProvider';

const chapters = SCENES.filter((scene) => scene.nav);

/** Chapter markers down the right edge, plus a hairline of overall progress. */
export function Rail() {
  const { entered } = useUI();
  const active = useJourneyValue((u) => Math.min(chapters.length - 1, Math.floor(u + 0.08)));
  const resting = useJourneyValue((u) => u > 8.93);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onFrame(() => {
        if (progress.current) progress.current.style.transform = `scaleX(${scroll.progress})`;
      }),
    [],
  );

  return (
    <>
      <span className="fixed inset-x-0 top-0 z-[130] block h-px" aria-hidden>
        <span ref={progress} className="block h-px origin-left scale-x-0 bg-signal" />
      </span>

      <nav
        data-active={entered && !resting}
        aria-label="Chapters"
        className="fixed right-10 top-1/2 z-[110] hidden -translate-y-1/2 wide:block"
      >
        <ol className="fade flex flex-col items-end gap-1">
          {chapters.map((chapter, i) => {
            const current = i === active;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => scrollToScene(i, i === 0 ? 0 : 0.04)}
                  aria-current={current ? 'step' : undefined}
                  className="group flex items-center gap-3 py-1.5"
                >
                  <span
                    className={`label transition-all duration-500 ${
                      current
                        ? 'translate-x-0 text-bone opacity-100'
                        : 'translate-x-2 text-ash opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                  >
                    {chapter.label}
                  </span>
                  <span
                    className={`block h-px transition-all duration-500 ${
                      current ? 'w-8 bg-signal' : 'w-3 bg-bone/40 group-hover:w-5 group-hover:bg-bone'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
