'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { plateau } from '@/lib/math';
import { loader, runtime } from '@/lib/runtime';
import { onFrame, scroll } from '@/lib/scroll';

const Experience = dynamic(() => import('./three/Experience'), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** The fixed world behind the page: WebGL scene, lens flash, vignette and grain. */
export function World() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runtime.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    runtime.lowPower =
      window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 700;

    const ok = hasWebGL();
    if (!ok) loader.set({ progress: 1, ready: true, failed: true });
    setSupported(ok);
  }, []);

  // Passing through the monolith's core: the frame floods with its light.
  useEffect(
    () =>
      onFrame(() => {
        if (!flash.current) return;
        const amount = plateau(scroll.u, 1.87, 1.93, 1.95, 2.03);
        flash.current.style.opacity = amount > 0.001 ? String(amount * (runtime.reducedMotion ? 0.4 : 0.9)) : '0';
      }),
    [],
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {supported === false && <div className="fallback-world absolute inset-0" />}
      {supported && <Experience />}
      <div
        ref={flash}
        className="absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at center, #fff4ea 0%, #ff8a3d 38%, #ff4d00 72%, #2a0d02 100%)' }}
      />
      <div className="vignette absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
