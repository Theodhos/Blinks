import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Globe } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SoundEngine } from '../../lib/audio';
import { scrollTo } from '../../lib/lenis';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  isPreloaderDone?: boolean;
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isPreloaderDone = true,
  onOpenContact,
  onSetCursorMode
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [isHoldingBlast, setIsHoldingBlast] = useState(false);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerLightning = (e?: React.MouseEvent) => {
    const clientX = e?.clientX ?? (window.innerWidth * 0.55);
    const clientY = e?.clientY ?? (window.innerHeight * 0.45);
    window.dispatchEvent(
      new CustomEvent('kinetik_lightning_strike', {
        detail: { clientX, clientY }
      })
    );
  };

  const handleHoldBlastStart = () => {
    setIsHoldingBlast(true);
    SoundEngine.playHover();
    window.dispatchEvent(new CustomEvent('kinetik_blast_hold', { detail: { holding: true } }));

    holdIntervalRef.current = setTimeout(() => {
      SoundEngine.playBlast();
      window.dispatchEvent(new CustomEvent('kinetik_blast_trigger'));
      window.dispatchEvent(new CustomEvent('kinetik_pulse_core'));
      setIsHoldingBlast(false);
    }, 1200);
  };

  const handleHoldBlastEnd = () => {
    if (holdIntervalRef.current) {
      clearTimeout(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHoldingBlast(false);
    window.dispatchEvent(new CustomEvent('kinetik_blast_hold', { detail: { holding: false } }));
  };

  // Entrance animation for text when website opens
  useEffect(() => {
    if (!isPreloaderDone || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Staggered reveal of headline lines from overflow mask
      tl.fromTo(
        '.hero-title-line',
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.14,
          ease: 'power4.out',
        }
      );

      // CTA action underline buttons slide in
      tl.fromTo(
        '.hero-cta-btn',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        },
        '-=0.7'
      );

      // Bottom bar entrance
      if (bottomBarRef.current) {
        tl.fromTo(
          bottomBarRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' },
          '-=0.6'
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isPreloaderDone]);

  // Scroll animations for subtle parallax
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textColRef.current) {
        gsap.to(textColRef.current, {
          y: 80,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom 15%',
            scrub: 0.8,
          }
        });
      }

      if (bottomBarRef.current) {
        gsap.to(bottomBarRef.current, {
          opacity: 0,
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '30% top',
            scrub: true,
          }
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          handleTriggerLightning(e);
        }
      }}
      className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-8 px-5 sm:px-8 md:px-12 bg-transparent text-white overflow-hidden cursor-pointer select-none"
    >
      {/* Subtle coordinate watermark */}
      <div className="absolute top-1/3 left-10 text-neutral-600/60 font-mono text-[9px] hidden lg:block tracking-widest pointer-events-none">
        LAT: 52.5200° N • LON: 13.4050° E
      </div>

      {/* Main Hero Typography & 2 Underline Buttons (Identical to reference screenshot) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-6">
        <div
          ref={textColRef}
          className="max-w-2xl lg:max-w-3xl flex flex-col space-y-7 will-change-transform"
        >
          {/* Headline: Smaller, balanced and elegant */}
          <div className="space-y-1">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] uppercase text-neutral-100">
              <span className="block overflow-hidden pb-1">
                <span className="hero-title-line block hover:text-orange-400 transition-colors duration-300 will-change-transform">
                  Designed to
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-title-line block text-neutral-100 will-change-transform">
                  mean pur po s <span className="text-orange-500">.</span>
                </span>
              </span>
            </h1>
          </div>

          {/* EXACTLY 2 BUTTONS WITH WHITE BOTTOM BORDER ONLY (Pa paragraf, identik si fotoja) */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                SoundEngine.playTick(1400);
                onOpenContact();
              }}
              onMouseEnter={() => {
                SoundEngine.playHover();
                onSetCursorMode?.('hover');
              }}
              onMouseLeave={() => onSetCursorMode?.('default')}
              className="hero-cta-btn group flex items-center justify-between gap-6 sm:gap-8 pb-1.5 border-b border-white text-xs sm:text-sm font-mono uppercase tracking-widest text-white hover:text-orange-400 hover:border-orange-400 transition-all cursor-pointer"
            >
              <span>DISCUSS YOUR PROJECT</span>
              <span className="text-base group-hover:translate-x-1.5 transition-transform duration-200">→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                SoundEngine.playTick(1200);
                onOpenContact();
              }}
              onMouseEnter={() => {
                SoundEngine.playHover();
                onSetCursorMode?.('hover');
              }}
              onMouseLeave={() => onSetCursorMode?.('default')}
              className="hero-cta-btn group flex items-center justify-between gap-6 sm:gap-8 pb-1.5 border-b border-white text-xs sm:text-sm font-mono uppercase tracking-widest text-white hover:text-orange-400 hover:border-orange-400 transition-all cursor-pointer"
            >
              <span>BOOK A 30-MINUTE CALL</span>
              <span className="text-base group-hover:translate-x-1.5 transition-transform duration-200">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Control Rail & Meta (Exact layout from reference screenshot) */}
      <div
        ref={bottomBarRef}
        className="relative z-20 max-w-7xl mx-auto w-full pt-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 text-xs text-neutral-400 will-change-transform pointer-events-auto"
      >
        {/* Left: Circular Arrow Indicator */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => {
            SoundEngine.playTick();
            scrollTo('#manifesto');
          }}
        >
          <div className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center group-hover:border-neutral-500 group-hover:bg-neutral-800 transition-all">
            <ArrowDown className="w-3.5 h-3.5 text-neutral-300 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Center: Hold to Blast Trigger & Lines Dare (Unobstructed, exact match to Photo 1) */}
        <div className="flex flex-col items-center text-center">
          <button
            type="button"
            onPointerDown={handleHoldBlastStart}
            onPointerUp={handleHoldBlastEnd}
            onPointerLeave={handleHoldBlastEnd}
            className={`flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-orange-400 transition-colors cursor-pointer active:scale-95 ${
              isHoldingBlast ? 'text-orange-400 animate-pulse' : ''
            }`}
          >
            <span>{isHoldingBlast ? 'CHARGING ENERGY...' : 'HOLD TO'}</span>
            <span className="text-orange-400">💥 BLAST</span>
          </button>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mt-0.5">
            DARE <span className="text-amber-400">⚡</span> TO TOUCH THE LINES.
          </span>
        </div>

        {/* Right: EST. 2012 / 14+ YEARS Box + Narrative */}
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center space-x-3 px-3.5 py-2 rounded-lg border border-neutral-800/90 bg-neutral-950/80 backdrop-blur-md">
            <div className="pr-2 border-r border-neutral-800 text-neutral-400 flex flex-col items-center">
              <Globe className="w-4 h-4 text-neutral-300" />
              <span className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 mt-0.5">EST. 2012</span>
            </div>
            <div className="text-[10px] font-mono leading-tight text-neutral-300 uppercase tracking-wide">
              <span className="text-white font-bold block">14+ YEARS SHAPING</span>
              <span>DIGITAL DIRECTION.</span>
            </div>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-neutral-400 mt-2 max-w-[260px] hidden sm:block">
            Websites, AI products, brands, and systems built for clarity, scale and impact.
          </p>
        </div>
      </div>
    </section>
  );
};

