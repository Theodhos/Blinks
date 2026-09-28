import type { CSSProperties, ReactNode } from 'react';
import { SCENES } from '@/lib/journey';

interface SceneSectionProps {
  index: number;
  /** Accessible name for the section. */
  title: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A scene's footprint in the document. The section itself is only scroll
 * length — the timeline. Its copy lives in a fixed stage that is shown while
 * the scene is pinned, so text never scrolls past: it arrives and leaves.
 */
export function SceneSection({ index, title, active, children, className = '' }: SceneSectionProps) {
  const scene = SCENES[index];
  return (
    <section
      id={scene.id}
      data-scene
      aria-label={title}
      style={{ height: `${(scene.length ?? 1) * 100}vh` }}
    >
      <div className={`stage ${className}`} data-active={active} inert={!active}>
        {children}
      </div>
    </section>
  );
}

/**
 * Size a display heading so its longest word exactly fits the panel, up to a
 * cap in rem. Works with the `.fit` class and the panel's container width.
 */
export const fit = (text: string, cap: number) =>
  ({
    '--fit': Math.max(...text.split(/\s+/).map((word) => word.length)),
    '--cap': `${cap}rem`,
  }) as CSSProperties;

/** Where a panel of copy sits: opposite its subject when wide, beneath it when stacked. */
export const panelPosition = (subjectSide: number) =>
  `@container absolute inset-x-5 bottom-[5vh] sm:inset-x-10 wide:inset-x-auto wide:bottom-auto wide:top-1/2 wide:w-[min(40vw,38rem)] wide:-translate-y-1/2 ${
    subjectSide > 0 ? 'wide:left-[7vw]' : 'wide:right-[9vw]'
  }`;
