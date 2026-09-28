import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STATS, CLIENT_LOGOS } from '../../data/agencyData';
import { SoundEngine } from '../../lib/audio';

gsap.registerPlugin(ScrollTrigger);

interface KeyFactsSectionProps {
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const KeyFactsSection: React.FC<KeyFactsSectionProps> = ({ onSetCursorMode }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const logosRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Horizontal White Bands Reveal with Scroll ("ne vije horisontale njera pas tjeters deri sa te dale ky seksion")
      gsap.fromTo(
        '.horizontal-bg-panel',
        {
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          scaleX: 1,
          stagger: 0.14,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 25%',
            scrub: 1.0,
          },
        }
      );

      // 2. Horizontal Architectural Dividing Lines
      gsap.fromTo(
        '.horizontal-divider-line',
        {
          scaleX: 0,
          transformOrigin: 'left center',
        },
        {
          scaleX: 1,
          stagger: 0.15,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: 'top 20%',
            scrub: 1.0,
          },
        }
      );

      // 3. Cards Opening Animation with Scroll
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length >= 3 && cardsContainerRef.current) {
        const cardsTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 82%',
            end: 'top 36%',
            scrub: 1.2,
          },
        });

        // Left card (0): opens outward to the left with dynamic perspective rotation
        cardsTl.fromTo(
          cards[0],
          {
            xPercent: 65,
            rotateY: 22,
            rotateZ: -4,
            scale: 0.88,
            opacity: 0.25,
          },
          {
            xPercent: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
          },
          0
        );

        // Center card (1): opens forward from depth
        cardsTl.fromTo(
          cards[1],
          {
            yPercent: 20,
            scale: 0.84,
            opacity: 0.3,
          },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
          },
          0
        );

        // Right card (2): opens outward to the right with dynamic perspective rotation
        cardsTl.fromTo(
          cards[2],
          {
            xPercent: -65,
            rotateY: -22,
            rotateZ: 4,
            scale: 0.88,
            opacity: 0.25,
          },
          {
            xPercent: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
          },
          0
        );
      }

      // 3. Animated Number Count-Up Roll on ScrollTrigger enter
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const targets = [50, 1500, 20];
          targets.forEach((target, index) => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2.2,
              ease: 'power2.out',
              onUpdate: () => {
                setCounts((prev) => ({
                  ...prev,
                  [index]: Math.floor(obj.val),
                }));
              },
            });
          });
        },
      });

      // 4. Logos reveal
      if (logosRef.current) {
        gsap.fromTo(
          logosRef.current.children,
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: logosRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D card tilt effect on mouse move
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / (rect.height / 2)) * 7;
    const rotY = (x / (rect.width / 2)) * 7;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  };

  const handleCardMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  const formatDisplayStat = (idx: number, original: string) => {
    const val = counts[idx] ?? 0;
    if (idx === 0) return `${val}+`;
    if (idx === 1) return `${(val / 1000).toFixed(1)}K+`;
    return `${val}+`;
  };

  return (
    <section
      ref={sectionRef}
      id="facts"
      className="relative w-full bg-white text-neutral-950 py-28 md:py-36 px-5 sm:px-8 md:px-12 overflow-hidden select-none"
    >
      {/* Horizontal Architectural White Slices ("me ndarje te cilat do te vijne nga scroll por ne vije horisontale njera pas tjeters") */}
      <div className="absolute inset-0 pointer-events-none flex flex-col z-0">
        {[0, 1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="horizontal-bg-panel relative w-full flex-1 bg-white border-b border-neutral-200/80 will-change-transform"
          >
            <div className="absolute top-2 right-4 font-mono text-[8px] text-neutral-400 uppercase tracking-widest hidden lg:block">
              HORIZONTAL DIVISION // 0{row + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Top Architectural Divider Line (animates horizontally from left) */}
        <div className="horizontal-divider-line w-full h-[1px] bg-neutral-300/80 will-change-transform" />

        {/* Header Title: High-contrast Dark on White */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-2 font-semibold">
              [ 03 // PROVEN SCALE ]
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight uppercase text-neutral-950">
              Key facts<span className="text-orange-600">.</span>
            </h2>
          </div>
          <p className="font-sans text-neutral-600 max-w-sm text-sm leading-relaxed">
            A snapshot of our worldwide impact, relentless standards, and enduring partner relationships.
          </p>
        </div>

        {/* Mid Architectural Divider Line */}
        <div className="horizontal-divider-line w-full h-[1px] bg-neutral-200 will-change-transform" />

        {/* 3 Editorial Cards with Scroll Opening Animation on White Background */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 [perspective:1200px]"
        >
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              onMouseMove={(e) => handleCardMouseMove(e, idx)}
              onMouseLeave={() => {
                handleCardMouseLeave(idx);
                onSetCursorMode?.('default');
              }}
              onMouseEnter={() => {
                SoundEngine.playHover();
                onSetCursorMode?.('explore');
              }}
              className="group relative rounded-2xl overflow-hidden bg-white border border-neutral-200/90 text-neutral-950 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out flex flex-col justify-between h-[440px] cursor-pointer will-change-transform hover:border-neutral-400"
            >
              {/* Background Image with Crisp Light Gradient Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={stat.image}
                  alt={stat.label}
                  className="w-full h-full object-cover grayscale opacity-25 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
              </div>

              {/* Card Header */}
              <div className="relative z-10 p-7 flex items-center justify-between border-b border-neutral-100 bg-white/40 backdrop-blur-sm">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-600 font-semibold">
                  {stat.label}
                </span>
                <span className="font-mono text-xs font-bold text-orange-600">0{idx + 1}</span>
              </div>

              {/* Card Footer: Animated Numeric Roll & Sublabel */}
              <div className="relative z-10 p-7 space-y-3">
                <div className="font-display text-6xl md:text-7xl font-black tracking-tight text-neutral-950 group-hover:text-orange-600 transition-colors font-mono">
                  {formatDisplayStat(idx, stat.number)}
                </div>
                <p className="font-sans text-xs text-neutral-600 leading-relaxed max-w-xs font-medium">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Third Architectural Divider Line */}
        <div className="horizontal-divider-line w-full h-[1px] bg-neutral-200 will-change-transform" />

        {/* Client & Partner Logos Bar on White Canvas */}
        <div className="pt-4 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
            <span>TRUSTED BY GLOBAL VENTURES</span>
            <span>VENTURE • AI • CONSUMER • LUXURY</span>
          </div>

          <div
            ref={logosRef}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {CLIENT_LOGOS.map((client) => (
              <div
                key={client.name}
                onMouseEnter={() => SoundEngine.playTick(1600)}
                className="group p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 cursor-pointer text-center"
              >
                <span className="font-display font-bold text-sm tracking-wider uppercase text-neutral-900 group-hover:text-black transition-colors">
                  {client.name}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-orange-600 mt-1">
                  {client.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Architectural Boundary Line */}
        <div className="horizontal-divider-line w-full h-[1px] bg-neutral-300/80 will-change-transform" />
      </div>
    </section>
  );
};
