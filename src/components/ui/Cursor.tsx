'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * A dot that tracks the pointer exactly and a ring that trails it. The ring
 * opens over interactive elements and can carry a short label via
 * `data-cursor="View"`. Fine pointers only.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced || !dot.current || !ring.current) return;

    document.documentElement.classList.add('has-cursor');
    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3.out' });

    let visible = false;
    let mode = '';

    const apply = (next: string, text: string) => {
      if (next === mode) return;
      mode = next;
      if (label.current) label.current.textContent = text;
      gsap.to(ring.current, {
        scale: next === 'label' ? 3.2 : next === 'hover' ? 1.9 : 1,
        backgroundColor: next === 'label' ? 'rgba(255,77,0,1)' : 'rgba(255,77,0,0)',
        borderColor: next === 'label' ? 'rgba(255,77,0,1)' : next === 'hover' ? 'rgba(255,77,0,0.9)' : 'rgba(242,239,233,0.45)',
        duration: 0.45,
        ease: 'power3.out',
      });
      gsap.to(label.current, { opacity: next === 'label' ? 1 : 0, duration: 0.25 });
      gsap.to(dot.current, { scale: next ? 0 : 1, duration: 0.3 });
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      if (!visible) {
        visible = true;
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 });
      }
      const target = event.target as Element | null;
      const labelled = target?.closest<HTMLElement>('[data-cursor]');
      if (labelled) apply('label', labelled.dataset.cursor ?? '');
      else if (target?.closest('a, button, [role="button"], input, textarea, label')) apply('hover', '');
      else apply('', '');
    };

    const hide = () => {
      visible = false;
      gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);

    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden>
      <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-signal opacity-0" />
      <div
        ref={ring}
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-bone/45 opacity-0"
      >
        <span
          ref={label}
          className="font-mono text-[3.5px] font-bold uppercase tracking-[0.12em] text-void opacity-0"
        />
      </div>
    </div>
  );
}
