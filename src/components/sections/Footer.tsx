'use client';

import { useEffect, useState } from 'react';
import { CLOCKS, CONTACT, NETWORK, STUDIO, STUDIOS } from '@/data/agency';
import { useJourneyValue } from '@/hooks/useJourney';
import { SCENE, SCENES } from '@/lib/journey';
import { scrollToScene } from '@/lib/scroll';
import { Magnetic } from '@/components/ui/Magnetic';
import { Arrow, Fade, Label } from '@/components/ui/Type';

function useClocks() {
  const [times, setTimes] = useState<string[]>(() => CLOCKS.map(() => '--:--'));

  useEffect(() => {
    const update = () =>
      setTimes(
        CLOCKS.map((clock) =>
          new Date().toLocaleTimeString('en-GB', { timeZone: clock.timeZone, hour: '2-digit', minute: '2-digit' }),
        ),
      );
    update();
    const interval = window.setInterval(update, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return times;
}

/**
 * The journey's resting place. The upper part of the frame is left open for
 * the monolith and the wordmark standing behind it in the scene.
 */
export function Footer() {
  const times = useClocks();
  const arrived = useJourneyValue((u) => u > SCENE.contact + 0.93);

  return (
    <footer
      id={SCENES[SCENE.footer].id}
      data-scene
      data-active={arrived}
      className="relative z-10 flex min-h-screen flex-col justify-end"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-void via-void/85 to-transparent" />

      <div className="relative px-5 pb-8 pt-[46vh] sm:px-10 sm:pb-10">
        <span className="rule block h-px bg-line" />

        <div className="grid gap-10 py-10 sm:grid-cols-2 wide:grid-cols-12 wide:gap-8">
          <Fade index={1} className="wide:col-span-4">
            <p className="max-w-xs text-sm leading-relaxed text-bone/80">{STUDIO.footnote}</p>
            <p className="label mt-5 flex items-center gap-2.5 text-ash">
              <span className="h-1.5 w-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-signal" />
              {STUDIO.capacity}
            </p>
          </Fade>

          <Fade index={2} className="wide:col-span-3">
            <Label className="text-smoke">Business enquiry</Label>
            <p className="mt-3">
              <a href={`mailto:${CONTACT.email}`} className="link font-mono text-sm">
                {CONTACT.email}
              </a>
            </p>
            <p className="mt-2">
              <a href={`tel:${CONTACT.phoneHref}`} className="font-mono text-sm text-ash transition-colors hover:text-bone">
                {CONTACT.phone}
              </a>
            </p>
            <ul className="mt-4 space-y-1">
              {STUDIOS.map((studio) => (
                <li key={studio.label} className="label text-ash">
                  {studio.address} — {studio.label.split(' / ')[0]}
                </li>
              ))}
            </ul>
          </Fade>

          <Fade index={3} className="wide:col-span-2">
            <Label className="text-smoke">Network</Label>
            <ul className="label mt-3 space-y-1.5 text-bone/80">
              {NETWORK.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </Fade>

          <Fade index={4} className="wide:col-span-3">
            <Label className="text-smoke">World clocks</Label>
            <ul className="mt-3">
              {CLOCKS.map((clock, i) => (
                <li key={clock.city} className="flex items-baseline justify-between border-b border-line py-2">
                  <Label className="text-ash">{clock.city}</Label>
                  <span className="font-mono text-sm tabular-nums text-bone">{times[i]}</span>
                </li>
              ))}
            </ul>
          </Fade>
        </div>

        <Fade index={6} className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Label className="text-smoke">
            © 2026 {STUDIO.legalName}. All rights reserved.
          </Label>
          <Magnetic strength={0.3}>
            <button type="button" onClick={() => scrollToScene(0)} className="label link text-bone">
              Back to top <Arrow className="-rotate-90" />
            </button>
          </Magnetic>
        </Fade>
      </div>
    </footer>
  );
}
