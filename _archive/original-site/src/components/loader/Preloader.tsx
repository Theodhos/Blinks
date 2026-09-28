import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import gsap from 'gsap';
import { SoundEngine } from '../../lib/audio';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const counterObj = { count: 1 };

    // Use Anime.js v4 animate for counter
    const counterAnim = animate(counterObj, {
      count: 100,
      duration: 1800,
      ease: 'inOutExpo',
      onUpdate: () => {
        if (counterRef.current) {
          const val = Math.min(100, Math.max(1, Math.floor(counterObj.count)));
          const formatted = String(val).padStart(3, '0');
          counterRef.current.innerText = formatted;
        }
      },
      onComplete: () => {
        SoundEngine.playTick(1800);
        // Animate out curtain using GSAP
        const tl = gsap.timeline({
          onComplete: () => {
            setIsDone(true);
            onComplete();
          }
        });

        tl.to('.preloader-content', {
          opacity: 0,
          y: -30,
          duration: 0.5,
          ease: 'power3.in'
        })
        .to(containerRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'expo.inOut'
        });
      }
    });

    return () => {
      counterAnim.pause?.();
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      id="preloader-overlay"
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-[#0f0f11] text-white p-8 md:p-14 select-none"
    >
      {/* Precision corner crosshairs */}
      <div className="w-full flex justify-between items-center text-xs font-mono text-neutral-500">
        <div className="flex items-center space-x-3">
          <span>+</span>
          <span className="tracking-widest uppercase text-[11px]">KINETIK STUDIO</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="tracking-widest uppercase text-[11px]">GLOBAL DIRECTORY</span>
          <span>+</span>
        </div>
      </div>

      {/* Central Monogram and Brand Manifesto */}
      <div className="preloader-content flex flex-col items-center justify-center space-y-8 my-auto">
        {/* Animated Geometric Monogram */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Subtle bounding target box */}
          <div className="absolute inset-0 border border-neutral-700/50" />
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

          <svg
            ref={logoRef}
            viewBox="0 0 100 100"
            className="w-16 h-16 fill-none stroke-white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Triangular multifaceted logo mark */}
            <path className="logo-path" d="M 50 15 L 85 75 L 15 75 Z" />
            <path className="logo-path" d="M 50 15 L 50 75" />
            <path className="logo-path" d="M 50 45 L 85 75" />
            <path className="logo-path" d="M 50 45 L 15 75" />
          </svg>
        </div>

        {/* Brand pillars */}
        <div className="flex items-center space-x-4 text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-neutral-400">
          <span>INSPIRE</span>
          <span className="text-neutral-600">•</span>
          <span>INNOVATE</span>
          <span className="text-neutral-600">•</span>
          <span>IMPACT</span>
        </div>
      </div>

      {/* Bottom Counter & Grid Crosshairs */}
      <div className="w-full flex justify-between items-end">
        <div className="flex items-center space-x-3 text-xs font-mono text-neutral-500">
          <span>+</span>
          <span className="text-[11px] tracking-wider uppercase">ARCHETYPE 2026</span>
        </div>

        {/* Counter Display */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-display text-4xl md:text-6xl font-bold tracking-tight text-white">
            <span ref={counterRef}>001</span>
            <span className="text-sm font-mono text-neutral-500 ml-1.5">%</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-neutral-500">
          <span className="text-[11px] tracking-wider uppercase">BERLIN / NYC / TOKYO</span>
          <span>+</span>
        </div>
      </div>
    </div>
  );
};
