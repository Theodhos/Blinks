import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '../../data/agencyData';
import { ServiceItem } from '../../types';
import { ServicesScene } from '../three/ServicesScene';
import { SoundEngine } from '../../lib/audio';

gsap.registerPlugin(ScrollTrigger);

interface ServicesSectionProps {
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenContact,
  onSetCursorMode
}) => {
  const [activeService, setActiveService] = useState<ServiceItem>(SERVICES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const centerBoxRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const line4Ref = useRef<HTMLSpanElement>(null);

  const handleSelectService = (service: ServiceItem) => {
    SoundEngine.playTick(1600);
    setActiveService(service);
    window.dispatchEvent(new CustomEvent('kinetik_pulse_core'));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (centerBoxRef.current) {
        // Multi-layered typographic scrub
        if (line1Ref.current) {
          gsap.fromTo(
            line1Ref.current,
            { x: -35, y: -15 },
            {
              x: 35,
              y: 15,
              ease: 'none',
              scrollTrigger: {
                trigger: centerBoxRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }

        if (line2Ref.current) {
          gsap.fromTo(
            line2Ref.current,
            { x: 40 },
            {
              x: -40,
              ease: 'none',
              scrollTrigger: {
                trigger: centerBoxRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }

        if (line3Ref.current) {
          gsap.fromTo(
            line3Ref.current,
            { x: -30 },
            {
              x: 30,
              ease: 'none',
              scrollTrigger: {
                trigger: centerBoxRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }

        if (line4Ref.current) {
          gsap.fromTo(
            line4Ref.current,
            { x: 30, y: 15 },
            {
              x: -30,
              y: -15,
              ease: 'none',
              scrollTrigger: {
                trigger: centerBoxRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full bg-transparent text-white py-24 md:py-36 px-5 sm:px-8 md:px-12 border-t border-neutral-800/40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800/60 pb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CORE DISCIPLINES</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-white">
              Our Services<span className="text-orange-500">.</span>
            </h2>
          </div>
          <div className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed">
            Different disciplines. One standard of relentless craft. We merge cutting-edge AI computation with emotive spatial design.
          </div>
        </div>

        {/* Central Display: Monumental Typography overlaying the Interactive 3D WebGL Monolith */}
        <div
          ref={centerBoxRef}
          className="relative w-full min-h-[440px] sm:min-h-[500px] rounded-3xl bg-neutral-950/40 border border-neutral-800/60 backdrop-blur-[2px] overflow-hidden flex items-center justify-center p-6 sm:p-12 shadow-2xl"
        >
          {/* Background Interactive 3D Canvas with Stone Monolith and Orbiting Glyphs */}
          <div className="absolute inset-0 z-0 opacity-70">
            <ServicesScene
              activeColor={activeService.color}
              modelVariant={activeService.modelVariant}
            />
          </div>

          {/* Foreground Giant Editorial Title with Scroll Scrub Parallax (As seen on Trionn) */}
          <div className="relative z-10 text-center pointer-events-none select-none max-w-4xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400 block mb-3">
              // EXPERTISE MATRIX //
            </span>
            <div className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white/90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-[0.95] overflow-visible">
              <span ref={line1Ref} className="inline-block will-change-transform">A.I.</span><br />
              <span ref={line2Ref} className="inline-block text-neutral-400 will-change-transform">DESIGN</span><br />
              <span ref={line3Ref} className="inline-block will-change-transform">DEVELOPMENT</span><br />
              <span ref={line4Ref} className="inline-block text-orange-400 font-sans italic font-normal text-3xl sm:text-5xl md:text-6xl lowercase will-change-transform">
                &amp; branding
              </span>
            </div>
          </div>

          {/* Floating live active indicator pill */}
          <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-xs font-mono text-neutral-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeService.color }} />
            <span>ACTIVE: {activeService.title}</span>
          </div>
        </div>

        {/* Editorial Interactive List (Hover to shift 3D scene & inspect deliverables) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          {/* Left Column: Interactive Service Selector */}
          <div className="lg:col-span-7 space-y-4">
            {SERVICES.map((service) => {
              const isSelected = activeService.id === service.id;

              return (
                <div
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  onMouseEnter={() => {
                    handleSelectService(service);
                    onSetCursorMode?.('hover');
                  }}
                  onMouseLeave={() => onSetCursorMode?.('default')}
                  className={`group p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 border-white/40 shadow-2xl scale-[1.01]'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-4">
                      <span
                        className={`font-mono text-xs font-bold transition-colors ${
                          isSelected ? 'text-orange-400' : 'text-neutral-500'
                        }`}
                      >
                        {service.number}
                      </span>
                      <h3
                        className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-tight transition-colors ${
                          isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                        }`}
                      >
                        {service.title}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500 text-black'
                          : 'border-neutral-800 group-hover:border-neutral-600 text-neutral-400'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Service Deep Dive Panel */}
          <div className="lg:col-span-5 p-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl flex flex-col justify-between space-y-8 sticky top-28">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">
                  [ SPECIFICATION // {activeService.number} ]
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  STANDARD: PRODUCTION
                </span>
              </div>

              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                  {activeService.tagline}
                </span>
                <h4 className="font-display text-2xl font-bold uppercase text-white mt-1">
                  {activeService.title}
                </h4>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                  DELIVERABLES &amp; CAPABILITIES:
                </span>
                <div className="space-y-2.5">
                  {activeService.deliverables.map((item) => (
                    <div key={item} className="flex items-center space-x-3 text-xs font-mono text-neutral-300">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-orange-400">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  SoundEngine.playTick();
                  onOpenContact();
                }}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
              >
                <span>COMMISSION DISCIPLINE</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] text-neutral-500 uppercase">
                EST. 2-4 WEEKS SPRINT
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
