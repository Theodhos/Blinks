import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Sparkles, MoveHorizontal, ArrowLeft, ArrowRight, Grid, Compass } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../../data/agencyData';
import { Project } from '../../types';
import { SoundEngine } from '../../lib/audio';
import { ProjectModal } from '../ui/ProjectModal';
import { scrollTo } from '../../lib/lenis';

gsap.registerPlugin(ScrollTrigger);

interface SelectedWorkSectionProps {
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const SelectedWorkSection: React.FC<SelectedWorkSectionProps> = ({
  onOpenContact,
  onSetCursorMode
}) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [horizontalProgress, setHorizontalProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const pinTriggerRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const shutterRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageElementsRef = useRef<(HTMLImageElement | null)[]>([]);

  // Editorial Grid refs
  const gridCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleOpenProject = (proj: Project) => {
    SoundEngine.playTick(1500);
    setActiveProject(proj);
  };

  const handleNextProject = () => {
    const nextIdx = Math.min(PROJECTS.length - 1, currentProjectIndex + 1);
    setCurrentProjectIndex(nextIdx);
    SoundEngine.playTick(1600);
    const card = cardElementsRef.current[nextIdx];
    if (card && horizontalTrackRef.current) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handlePrevProject = () => {
    const prevIdx = Math.max(0, currentProjectIndex - 1);
    setCurrentProjectIndex(prevIdx);
    SoundEngine.playTick(1400);
    const card = cardElementsRef.current[prevIdx];
    if (card && horizontalTrackRef.current) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Horizontal Pinned Scroll Animation with GSAP
  useEffect(() => {
    if (viewMode !== 'horizontal') return;

    const ctx = gsap.context(() => {
      const pinTrigger = pinTriggerRef.current;
      const track = horizontalTrackRef.current;
      if (!pinTrigger || !track) return;

      const getScrollAmount = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinTrigger,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 2.2, getScrollAmount() * 1.3) + window.innerHeight * 0.8}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const prog = self.progress;
            setHorizontalProgress(prog);
            const idx = Math.min(
              PROJECTS.length - 1,
              Math.floor(prog * PROJECTS.length)
            );
            setCurrentProjectIndex(idx);
          },
        },
      });

      // Parallax shifts on inner images inside the horizontal cards
      imageElementsRef.current.forEach((img, idx) => {
        if (!img) return;
        gsap.fromTo(
          img,
          { xPercent: 12, scale: 1.1 },
          {
            xPercent: -12,
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: pinTrigger,
              start: 'top top',
              end: () => `+=${Math.max(window.innerHeight * 2.2, getScrollAmount() * 1.3)}`,
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    // Refresh ScrollTrigger when images load or size changes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [viewMode]);

  // Editorial Grid Scroll Animations (when Grid mode is active)
  useEffect(() => {
    if (viewMode !== 'grid') return;

    const ctx = gsap.context(() => {
      gridCardRefs.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { scale: 0.94, y: 40, opacity: 0.8 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'center 60%',
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [viewMode]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative w-full bg-transparent text-white border-t border-neutral-800/40 overflow-hidden"
    >
      {/* 1. SECTION HEADER CONTAINER */}
      <div className="max-w-7xl mx-auto pt-24 md:pt-32 pb-12 px-5 sm:px-8 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800/80 pb-8 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-orange-500 text-xs font-mono tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCROLL-DRIVEN ARCHIVE • 04</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase text-neutral-100">
              Selected Work<span className="text-orange-500">.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="font-sans text-neutral-400 max-w-xs text-xs leading-relaxed">
              Scroll down to glide horizontally through featured case studies, or switch layout view.
            </p>

            {/* Layout Mode Selector (Horizontal Runway vs Grid) */}
            <div className="flex items-center p-1 rounded-xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  SoundEngine.playTick(1600);
                  setViewMode('horizontal');
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  viewMode === 'horizontal'
                    ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Cards glide horizontally on vertical scroll"
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
                <span>HORIZONTAL RUNWAY</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  SoundEngine.playTick(1400);
                  setViewMode('grid');
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Traditional editorial list"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>GRID LIST</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL PINNED CARDS RUNWAY VIEW */}
      {viewMode === 'horizontal' && (
        <div
          ref={pinTriggerRef}
          className="relative w-full h-screen overflow-hidden flex flex-col justify-between py-6 select-none"
        >
          {/* Top Runway Telemetry Bar */}
          <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 md:px-12 flex items-center justify-between text-xs font-mono text-neutral-400">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-white font-bold tracking-wider uppercase">
                ACTIVE REEL: [ {String(currentProjectIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')} ]
              </span>
              <span className="hidden sm:inline text-neutral-600">|</span>
              <span className="hidden sm:inline text-orange-400 uppercase tracking-widest font-semibold">
                {PROJECTS[currentProjectIndex]?.title}
              </span>
            </div>

            {/* Quick Next / Prev Arrows */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden md:inline mr-2">
                SCROLL DOWN TO ADVANCE CARDS
              </span>
              <button
                type="button"
                onClick={handlePrevProject}
                disabled={currentProjectIndex === 0}
                aria-label="Previous card"
                className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextProject}
                disabled={currentProjectIndex === PROJECTS.length - 1}
                aria-label="Next card"
                className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master Horizontal Track (Cards glide horizontally on scroll) */}
          <div
            ref={horizontalTrackRef}
            className="flex items-center space-x-8 sm:space-x-12 px-6 sm:px-12 md:px-24 my-auto will-change-transform"
          >
            {PROJECTS.map((proj, idx) => {
              const isCurrent = idx === currentProjectIndex;

              return (
                <div
                  key={proj.id}
                  ref={(el) => {
                    cardElementsRef.current[idx] = el;
                  }}
                  onClick={() => handleOpenProject(proj)}
                  onMouseEnter={() => {
                    SoundEngine.playHover();
                    onSetCursorMode?.('project', 'EXPLORE');
                  }}
                  onMouseLeave={() => onSetCursorMode?.('default')}
                  className={`group relative shrink-0 w-[84vw] sm:w-[72vw] md:w-[58vw] lg:w-[48vw] max-w-[760px] rounded-3xl overflow-hidden bg-neutral-950/70 border backdrop-blur-md transition-all duration-500 cursor-pointer shadow-2xl flex flex-col justify-between ${
                    isCurrent
                      ? 'border-neutral-600 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                      : 'border-neutral-800/80 scale-[0.97] opacity-85 hover:border-neutral-600 hover:opacity-100'
                  }`}
                >
                  {/* Card Visual with Parallax Window */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                    <img
                      ref={(el) => {
                        imageElementsRef.current[idx] = el;
                      }}
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />

                    {/* Top Index & Year Pill */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">
                        0{idx + 1} // 0{PROJECTS.length}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-400">
                        {proj.year}
                      </span>
                    </div>

                    {/* Metric Tag Badge */}
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.accentColor }} />
                      <span className="font-bold">{proj.metrics}</span>
                    </div>

                    {/* Hover Circular View Badge */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-xl">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Editorial Footer */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-orange-400 uppercase tracking-widest font-semibold">
                        {proj.category}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        <span>OPEN CASE STUDY</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-orange-400" />
                      </div>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-white group-hover:text-orange-400 transition-colors">
                      {proj.title}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800/80">
                      {proj.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-neutral-900/90 border border-neutral-800 text-neutral-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Runway Status & Progress Rail */}
          <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 md:px-12 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>HORIZONTAL DISPLACEMENT</span>
              <span className="text-orange-400 font-bold">{(horizontalProgress * 100).toFixed(0)}% SCROLLED</span>
              <span>KINETIC ACCELERATION: ACTIVE</span>
            </div>

            {/* Horizontal Progress Needle Bar */}
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-white transition-all duration-75 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                style={{ width: `${Math.max(8, horizontalProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. ALTERNATIVE EDITORIAL GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pb-24 space-y-28">
          {PROJECTS.map((proj, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div
                key={proj.id}
                ref={(el) => {
                  gridCardRefs.current[idx] = el;
                }}
                onClick={() => handleOpenProject(proj)}
                onMouseEnter={() => {
                  SoundEngine.playHover();
                  onSetCursorMode?.('project', 'VIEW');
                }}
                onMouseLeave={() => onSetCursorMode?.('default')}
                className={`group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center cursor-pointer will-change-transform ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Visual Image */}
                <div
                  className={`lg:col-span-8 relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 transition-all duration-500 group-hover:border-neutral-600 shadow-2xl ${
                    isEven ? 'order-1' : 'order-1 lg:order-2'
                  }`}
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.accentColor }} />
                      <span>{proj.metrics}</span>
                    </div>

                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Text Details */}
                <div
                  className={`lg:col-span-4 space-y-6 ${
                    isEven ? 'order-2' : 'order-2 lg:order-1'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">
                      {proj.category}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">
                      {proj.year}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white group-hover:text-orange-400 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="font-sans text-sm text-neutral-400 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4">
                    <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-white group-hover:text-orange-400 transition-colors">
                      <span>EXPLORE CASE STUDY</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SECTION BOTTOM BANNER */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pb-24">
        <div className="p-8 sm:p-12 rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-display text-2xl font-bold uppercase text-white">
              Discover our complete collection of digital experiences.
            </h4>
            <p className="text-xs font-mono text-neutral-400">
              EXPLORE OUR ARCHIVE OF BRAND, WEBGL &amp; AI DEPLOYMENTS.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenProject(PROJECTS[0])}
            className="flex items-center space-x-3 px-6 py-3 rounded-full border border-neutral-700 bg-neutral-800 hover:bg-white hover:text-black transition-all text-xs font-mono uppercase tracking-wider cursor-pointer shadow-lg"
          >
            <span>VIEW ALL PROJECTS</span>
            <span className="font-bold">+</span>
          </button>
        </div>
      </div>

      {/* Project Case Study Drawer Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onOpenContact={onOpenContact}
      />
    </section>
  );
};

