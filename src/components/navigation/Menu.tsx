'use client';

import { CONTACT, NETWORK, STUDIO, STUDIOS } from '@/data/agency';
import { SCENES } from '@/lib/journey';
import { scrollToScene } from '@/lib/scroll';
import { Arrow, Fade, Label, Line } from '@/components/ui/Type';
import { useUI } from '@/components/ui/UIProvider';

const chapters = SCENES.filter((scene) => scene.nav);

/** Full-screen index. The world stays visible, dimmed, behind it. */
export function Menu() {
  const { menuOpen, setMenuOpen, setBriefOpen } = useUI();

  const go = (index: number) => {
    setMenuOpen(false);
    // Let the scroll lock release before travelling.
    window.setTimeout(() => scrollToScene(index, index === 0 ? 0 : 0.04), 60);
  };

  return (
    <div
      id="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site index"
      data-active={menuOpen}
      inert={!menuOpen}
      data-lenis-prevent
      className={`fixed inset-0 z-[115] overflow-y-auto bg-void/90 backdrop-blur-2xl transition-[opacity,visibility] duration-700 ${
        menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div className="mx-auto grid min-h-full max-w-[1600px] gap-12 px-5 pb-10 pt-28 sm:px-10 wide:grid-cols-12 wide:items-end wide:gap-8 wide:pt-32">
        <nav aria-label="Primary" className="wide:col-span-7">
          <ul>
            {chapters.map((chapter, i) => (
              <li key={chapter.id} className="border-b border-line">
                <a
                  href={`#${chapter.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    if (chapter.id === 'contact') {
                      setMenuOpen(false);
                      window.setTimeout(() => scrollToScene(i, 0.6), 60);
                      return;
                    }
                    go(i);
                  }}
                  className="group flex items-baseline gap-5 py-2.5 sm:py-3"
                >
                  <Label className="w-6 text-ash transition-colors duration-500 group-hover:text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </Label>
                  <Line index={i} className="flex-1">
                    <span className="display block text-[clamp(1.75rem,5.2vh,3.75rem)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                      {chapter.label}
                    </span>
                  </Line>
                  <Arrow diagonal className="text-xl text-ash opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-8 wide:col-span-4 wide:col-start-9">
          <Fade index={4}>
            <Label className="text-ash">Studios</Label>
            <ul className="mt-3 grid grid-cols-2 gap-6">
              {STUDIOS.map((studio) => (
                <li key={studio.label}>
                  <Label className="text-signal">{studio.label}</Label>
                  <p className="mt-1 text-sm text-bone">{studio.address}</p>
                </li>
              ))}
            </ul>
          </Fade>

          <Fade index={6}>
            <Label className="text-ash">Commissions &amp; press</Label>
            <p className="mt-3">
              <a href={`mailto:${CONTACT.email}`} className="link font-mono text-base sm:text-lg">
                {CONTACT.email}
              </a>
            </p>
            <p className="mt-2">
              <a href={`tel:${CONTACT.phoneHref}`} className="font-mono text-sm text-ash transition-colors hover:text-bone">
                {CONTACT.phone}
              </a>
            </p>
          </Fade>

          <Fade index={8}>
            <Label className="text-ash">Network</Label>
            <ul className="label mt-3 flex flex-wrap gap-x-5 gap-y-2 text-bone/80">
              {NETWORK.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </Fade>

          <Fade index={10}>
            <button
              type="button"
              onClick={() => setBriefOpen(true)}
              className="label link link--solid font-bold text-signal"
            >
              {CONTACT.cta} <Arrow />
            </button>
          </Fade>
        </div>

        <Fade index={12} className="label flex flex-wrap justify-between gap-2 text-smoke wide:col-span-12">
          <span>© 2026 {STUDIO.legalName}. All rights reserved.</span>
          <span>{STUDIO.descriptor}</span>
        </Fade>
      </div>
    </div>
  );
}
