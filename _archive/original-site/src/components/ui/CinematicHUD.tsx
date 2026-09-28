import React, { useEffect, useState } from 'react';
import { Sparkles, Radio, Zap, ChevronDown } from 'lucide-react';
import { scrollTo, addScrollListener } from '../../lib/lenis';
import { SoundEngine } from '../../lib/audio';

interface Chapter {
  id: string;
  number: string;
  name: string;
  targetId: string;
  progressStart: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'genesis', number: '01', name: 'GENESIS', targetId: '#hero', progressStart: 0.0 },
  { id: 'manifesto', number: '02', name: 'MANIFESTO', targetId: '#manifesto', progressStart: 0.18 },
  { id: 'metrics', number: '03', name: 'METRICS', targetId: '#facts', progressStart: 0.32 },
  { id: 'archive', number: '04', name: 'ARCHIVE', targetId: '#work', progressStart: 0.48 },
  { id: 'matrix', number: '05', name: 'MATRIX', targetId: '#services', progressStart: 0.65 },
  { id: 'resonance', number: '06', name: 'VOICES', targetId: '#testimonials', progressStart: 0.76 },
  { id: 'motion', number: '07', name: 'LAB', targetId: '#motion', progressStart: 0.84 },
  { id: 'honors', number: '08', name: 'HONORS', targetId: '#awards', progressStart: 0.90 },
  { id: 'nexus', number: '09', name: 'NEXUS', targetId: '#contact', progressStart: 0.96 },
];

export const CinematicHUD: React.FC = () => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isHoldingPulse, setIsHoldingPulse] = useState(false);

  useEffect(() => {
    const unsubscribe = addScrollListener((data) => {
      const maxScroll = Math.max(1, data.limit);
      const prog = Math.max(0, Math.min(1, data.scroll / maxScroll));
      setScrollProgress(prog);
      setScrollVelocity(Math.round(data.velocity || 0));

      // Determine active chapter
      let currentIdx = 0;
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        if (prog >= CHAPTERS[i].progressStart - 0.04) {
          currentIdx = i;
          break;
        }
      }
      setActiveChapterIndex(currentIdx);
    });

    return () => unsubscribe();
  }, []);

  const handleTeleportToChapter = (chapter: Chapter, index: number) => {
    SoundEngine.playTick(1200 + index * 80);
    scrollTo(chapter.targetId);
  };

  const triggerCorePulse = () => {
    window.dispatchEvent(new CustomEvent('kinetik_pulse_core'));
  };

  return (
    <>
      {/* Top Global Scroll Progress Meter (Precision Needle Line) */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[90] bg-neutral-900 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-white transition-all duration-75 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Floating Right Cinematic Flight Director / HUD Rail (Desktop) */}
      <div
        id="cinematic-flight-hud"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end space-y-4 transition-all duration-500 select-none opacity-100"
      >
        {/* Vertical Chapter Waypoint Rail */}
        <div className="relative py-2 pr-1 flex flex-col items-end space-y-2.5">
          {/* Vertical Tracking Line */}
          <div className="absolute right-[5px] top-0 bottom-0 w-[1px] bg-neutral-800/80 z-0" />

          {CHAPTERS.map((chapter, idx) => {
            const isActive = idx === activeChapterIndex;
            return (
              <div
                key={chapter.id}
                onClick={() => handleTeleportToChapter(chapter, idx)}
                onMouseEnter={() => SoundEngine.playTick(1600)}
                className="group relative z-10 flex items-center space-x-3 cursor-pointer py-0.5"
              >
                {/* Chapter Label (Expands smoothly on active/hover) */}
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ${
                    isActive
                      ? 'text-orange-400 font-bold translate-x-0 opacity-100'
                      : 'text-neutral-500 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2'
                  }`}
                >
                  {chapter.number} {chapter.name}
                </span>

                {/* Waypoint Dot Needle */}
                <div
                  className={`w-3 h-3 rounded-full border transition-all duration-300 flex items-center justify-center ${
                    isActive
                      ? 'border-orange-400 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] scale-125'
                      : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-400 group-hover:scale-110'
                  }`}
                >
                  {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Pulse 3D Core Button */}
        <button
          type="button"
          onClick={triggerCorePulse}
          onMouseDown={() => setIsHoldingPulse(true)}
          onMouseUp={() => setIsHoldingPulse(false)}
          onMouseLeave={() => setIsHoldingPulse(false)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-[10px] font-mono tracking-wider transition-all cursor-pointer shadow-lg ${
            isHoldingPulse
              ? 'bg-orange-500 border-white text-black scale-95 shadow-orange-500/50'
              : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 hover:border-orange-500/50 text-neutral-300 hover:text-white'
          }`}
          title="Emit sonic energy wave through 3D monolith"
        >
          <Zap className={`w-3 h-3 ${isHoldingPulse ? 'text-black' : 'text-orange-400'}`} />
          <span>PULSE 3D CORE</span>
        </button>
      </div>
    </>
  );
};
