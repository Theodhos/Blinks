import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Sparkles, Orbit, Play, Eye, Compass, Layers } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EXPERIMENTS } from '../../data/agencyData';
import { SoundEngine } from '../../lib/audio';

gsap.registerPlugin(ScrollTrigger);

interface DesignInMotionSectionProps {
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const DesignInMotionSection: React.FC<DesignInMotionSectionProps> = ({ onSetCursorMode }) => {
  const [activeExp, setActiveExp] = useState<number | null>(null);
  const [spiralProgress, setSpiralProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const transitionContainerRef = useRef<HTMLDivElement>(null);
  const spiralPinRef = useRef<HTMLDivElement>(null);
  const spiralCenterRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const transitionContainer = transitionContainerRef.current;
      const spiralPin = spiralPinRef.current;

      if (!section || !transitionContainer || !spiralPin) return;

      // 1. SEGMENTED WHITE TRANSITION SLATS ("pjese pjese si ne foto derisa te dale background i bardhe po jo shpejt te jete cdo gje smooth")
      // Horizontal white bands/stripes expanding sequentially on scroll to reveal the solid white background
      const whiteSlats = gsap.utils.toArray<HTMLElement>('.white-horizontal-slat');
      if (whiteSlats.length > 0) {
        gsap.fromTo(
          whiteSlats,
          {
            scaleY: 0,
            transformOrigin: 'top center',
          },
          {
            scaleY: 1,
            stagger: 0.12,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: transitionContainer,
              start: 'top 80%',
              end: 'bottom 40%',
              scrub: 1.2,
            },
          }
        );
      }

      // 2. SPIRAL CARDS OPENING ANIMATION ("cards do te hapen ne forme spiraleje me scroll animation")
      // Pinned runway where cards fan out from center in an Archimedean/Fibonacci spiral
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const totalCards = cards.length;

      // Pin the spiral arena for 2400px of smooth scroll
      ScrollTrigger.create({
        trigger: spiralPin,
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 1.3,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setSpiralProgress(p);

          // Center badge subtle scale and spin
          if (spiralCenterRef.current) {
            spiralCenterRef.current.style.transform = `translate(-50%, -50%) rotate(${p * 90}deg) scale(${1 - p * 0.12})`;
          }

          // Calculate spiral coordinates for each card
          // As progress goes from 0 to 1, cards smoothly spiral outward from center
          cards.forEach((card, idx) => {
            if (!card) return;

            // Spiral progression curve with staggered delay per card
            const cardP = Math.min(1, Math.max(0, (p - idx * 0.05) / (1 - idx * 0.05)));
            // Smooth ease for buttery movement
            const easedP = cardP * cardP * (3 - 2 * cardP);

            // Angle along spiral: cards follow a golden angle distribution + rotational drift
            const baseAngle = idx * ((Math.PI * 2) / totalCards) * 1.35;
            const currentAngle = baseAngle + (1 - easedP) * 0.8;

            // Radius scales outward in a spiral: outer cards reach further
            const maxRadius = 160 + idx * 52; // pixels
            const currentRadius = maxRadius * easedP;

            // Elliptical perspective mapping (isometric stage)
            const x = Math.cos(currentAngle) * currentRadius;
            const y = Math.sin(currentAngle) * currentRadius * 0.72;

            // Card rotation: tilts organically along the tangent of the spiral
            const rotZ = ((currentAngle * 180) / Math.PI - 90) * 0.28 * easedP;
            const rotY = Math.sin(currentAngle) * 12 * (1 - easedP);

            // Scale and opacity expansion
            const scale = 0.45 + 0.55 * easedP;
            const opacity = 0.15 + 0.85 * Math.min(1, cardP * 1.8);

            card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) rotateZ(${rotZ.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
            card.style.opacity = `${opacity.toFixed(3)}`;
            card.style.zIndex = `${10 + idx}`;
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="motion"
      className="relative w-full bg-[#fbfbfd] text-neutral-900 overflow-hidden select-none"
    >
      {/* 1. HORIZONTAL SEGMENTED WHITE TRANSITION SLATS ("pjese pjese si ne foto derisa te dale background i bardhe po jo shpejt te jete cdo gje smooth") */}
      <div
        ref={transitionContainerRef}
        className="relative w-full bg-black text-white pt-12 pb-0 overflow-hidden"
      >
        {/* Top Infinite Marquee Text as in the screenshot: ATE + IMPACT + INSPIRE + INNOVATE */}
        <div className="w-full overflow-hidden border-b border-white/10 pb-6 mb-6">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-8 text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight text-white uppercase shrink-0 px-4"
              >
                <span>IMPACT</span>
                <span className="text-orange-500 font-light">+</span>
                <span>INSPIRE</span>
                <span className="text-neutral-600 font-light">+</span>
                <span>INNOVATE</span>
                <span className="text-orange-500 font-light">+</span>
                <span>CREATE</span>
                <span className="text-neutral-600 font-light">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal White Stripes / Slats that expand piece-by-piece ("pjese pjese si ne foto") */}
        <div className="w-full space-y-3 px-4 sm:px-8 max-w-7xl mx-auto">
          {/* Slat 1: Thin White Bar */}
          <div className="relative w-full h-8 sm:h-12 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-md">
            <div className="white-horizontal-slat absolute inset-0 bg-white origin-top" />
          </div>

          {/* Slat 2: Medium White Band */}
          <div className="relative w-full h-14 sm:h-20 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-lg">
            <div className="white-horizontal-slat absolute inset-0 bg-white origin-top" />
          </div>

          {/* Slat 3: Thicker White Band with Telemetry */}
          <div className="relative w-full h-24 sm:h-36 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-xl">
            <div className="white-horizontal-slat absolute inset-0 bg-white origin-top" />
            <div className="absolute inset-0 flex items-center justify-between px-6 font-mono text-xs text-neutral-400 z-10 pointer-events-none">
              <span className="text-neutral-600 font-bold uppercase tracking-widest">
                STAGE 03 // BLINDS ALIGNMENT
              </span>
              <span className="text-orange-500 font-bold">100% TRANSITION COMPLETE</span>
            </div>
          </div>

          {/* Slat 4: Full Solid White Base */}
          <div className="relative w-full h-32 sm:h-44 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-2xl">
            <div className="white-horizontal-slat absolute inset-0 bg-[#fbfbfd] origin-top" />
          </div>
        </div>
      </div>

      {/* 2. PINNED SPIRAL CARDS ARENA ("design in motion ky seksin cards do te hapen ne forme spiraleje me scroll animation") */}
      <div
        ref={spiralPinRef}
        className="relative w-full h-screen bg-[#fbfbfd] text-neutral-900 overflow-hidden flex flex-col justify-between py-8 px-5 sm:px-8 md:px-12 select-none"
      >
        {/* Section Header with crisp white & dark typography */}
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-6 gap-4 z-20">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-600 mb-2 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CREATIVE LABS R&amp;D • SPIRAL DISPERSION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-neutral-900">
              Design in Motion<span className="text-orange-500">.</span>
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 block font-semibold">
                SPIRAL ROTATION
              </span>
              <span className="font-mono text-xs text-neutral-900 font-bold">
                {Math.round(spiralProgress * 360)}° RADIAL EXPANSION
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-orange-600 shadow-sm">
              <Orbit className="w-5 h-5 animate-spin" />
            </div>
          </div>
        </div>

        {/* The Central Spiral Stage where cards open in a spiral */}
        <div className="relative w-full flex-1 flex items-center justify-center my-auto overflow-hidden">
          {/* Subtle concentric spiral guide rings */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-neutral-200/60 pointer-events-none" />
          <div className="absolute w-[460px] h-[460px] rounded-full border border-neutral-200/40 pointer-events-none" />
          <div className="absolute w-[640px] h-[640px] rounded-full border border-neutral-200/30 pointer-events-none" />
          <div className="absolute w-[820px] h-[820px] rounded-full border border-neutral-200/20 pointer-events-none" />

          {/* Central Spiral Hub */}
          <div
            ref={spiralCenterRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white border border-neutral-200 shadow-xl flex flex-col items-center justify-center text-center p-3 z-10 transition-transform pointer-events-none"
          >
            <span className="text-[9px] font-mono uppercase tracking-widest text-orange-600 font-bold">
              SPIRAL 07
            </span>
            <span className="font-display font-black text-xs sm:text-sm uppercase text-neutral-900 leading-tight">
              LAB ARCHIVE
            </span>
            <span className="text-[8px] font-mono text-neutral-400 mt-1">
              {Math.round(spiralProgress * 100)}% UNVEILED
            </span>
          </div>

          {/* Cards that open in the form of a Spiral */}
          {EXPERIMENTS.map((exp, idx) => {
            const isActive = activeExp === idx;

            return (
              <div
                key={exp.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => {
                  SoundEngine.playTick(1400 + idx * 80);
                  setActiveExp(isActive ? null : idx);
                }}
                onMouseEnter={() => {
                  SoundEngine.playHover();
                  onSetCursorMode?.('hover', 'EXP');
                }}
                onMouseLeave={() => onSetCursorMode?.('default')}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[280px] md:w-[310px] rounded-2xl bg-white border border-neutral-200/90 shadow-2xl p-4 transition-shadow duration-300 cursor-pointer will-change-transform group hover:border-orange-500 hover:shadow-[0_20px_40px_rgba(249,115,22,0.15)] ${
                  isActive ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 mb-3.5">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-[9px] font-mono text-neutral-800 font-bold uppercase tracking-wider">
                    EXP // 0{idx + 1}
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Editorial Info */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider">
                    <span>{exp.category}</span>
                    <span className="text-neutral-400 font-normal">{exp.year}</span>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {exp.title}
                  </h3>

                  <p className="text-[11px] text-neutral-500 font-sans line-clamp-1 leading-relaxed">
                    {exp.subtitle}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-[10px] font-mono text-neutral-400">
                    <span>{exp.tech}</span>
                    <span className="group-hover:text-neutral-900 font-semibold transition-colors">
                      INSPECT
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Runway Telemetry Bar */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-xs font-mono text-neutral-500 border-t border-neutral-200 pt-4 z-20">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-neutral-900 font-semibold uppercase tracking-wider">
              SPIRAL RUNWAY: {EXPERIMENTS.length} EXPERIMENTS ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-neutral-400 hidden sm:inline uppercase tracking-widest">
              SCROLL DOWN TO ADVANCE SPIRAL TRAJECTORY
            </span>
            <div className="w-28 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-75"
                style={{ width: `${Math.round(spiralProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
