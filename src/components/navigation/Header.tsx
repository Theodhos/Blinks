'use client';

import { STUDIO } from '@/data/agency';
import { useJourneyValue } from '@/hooks/useJourney';
import { SCENES } from '@/lib/journey';
import { scrollToScene } from '@/lib/scroll';
import { Magnetic } from '@/components/ui/Magnetic';
import { Arrow } from '@/components/ui/Type';
import { useUI } from '@/components/ui/UIProvider';

const chapters = SCENES.filter((scene) => scene.nav);

export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 4 36 32H4L20 4Z" fill="currentColor" fillOpacity="0.28" />
      <path d="M20 14 29 32H11L20 14Z" fill="currentColor" />
    </svg>
  );
}

/** Minimal chrome: the mark, where you are, and two ways forward. */
export function Header() {
  const { entered, menuOpen, setMenuOpen, setBriefOpen } = useUI();
  const resting = useJourneyValue((u) => u > 8.93);
  const chapter = useJourneyValue((u) => Math.min(chapters.length - 1, Math.floor(u + 0.08)));

  return (
    <header
      data-active={entered}
      className="fixed inset-x-0 top-0 z-[120] flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7"
    >
      <a
        href="#origin"
        onClick={(event) => {
          event.preventDefault();
          setMenuOpen(false);
          scrollToScene(0);
        }}
        className="fade flex items-center gap-3"
        aria-label={`${STUDIO.name} — back to start`}
      >
        <Mark className="h-5 w-5 text-bone" />
        <span className="font-display text-base font-extrabold tracking-[0.08em]">
          {STUDIO.name}
          <span className="font-sans font-normal text-signal">®</span>
        </span>
      </a>

      <div className={`pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 transition-opacity duration-700 wide:flex ${entered && !resting ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden
      >
        <span className="label tabular-nums text-signal">{String(chapter + 1).padStart(2, '0')}</span>
        <span className="h-px w-8 bg-line" />
        <span key={chapter} className="label text-ash">
          {chapters[chapter].label}
        </span>
      </div>

      <div className="fade flex items-center gap-2 sm:gap-3">
        <Magnetic strength={0.3} className="hidden sm:inline-block">
          <button
            type="button"
            onClick={() => setBriefOpen(true)}
            className="label flex items-center gap-2 rounded-full bg-bone px-5 py-3 font-bold text-void transition-colors duration-500 hover:bg-signal"
          >
            <span data-magnetic-inner className="flex items-center gap-2">
              Let&apos;s talk <Arrow diagonal />
            </span>
          </button>
        </Magnetic>
        <Magnetic strength={0.3}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu"
            className="label group flex items-center gap-3 rounded-full border border-line bg-void/40 px-5 py-3 backdrop-blur-md transition-colors duration-500 hover:border-bone/60"
          >
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="relative block h-2.5 w-4" aria-hidden>
              <span
                className={`absolute left-0 top-0 h-px w-full bg-bone transition-transform duration-500 ease-out ${menuOpen ? 'translate-y-[5px] rotate-45' : ''}`}
              />
              <span
                className={`absolute bottom-0 right-0 h-px bg-bone transition-all duration-500 ease-out ${menuOpen ? 'w-full -translate-y-[4px] -rotate-45' : 'w-2.5 group-hover:w-full'}`}
              />
            </span>
          </button>
        </Magnetic>
      </div>
    </header>
  );
}
