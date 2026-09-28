import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowUpRight, Volume2 } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';
import { scrollTo } from '../../lib/lenis';

export const FooterSection: React.FC = () => {
  const [times, setTimes] = useState({
    berlin: '',
    newYork: '',
    tokyo: ''
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimes({
        berlin: now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }),
        newYork: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' }),
        tokyo: now.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }),
      });
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStringHover = (index: number) => {
    const baseFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = baseFreqs[index % baseFreqs.length];
    SoundEngine.playTick(freq);
  };

  return (
    <footer
      id="footer"
      className="relative w-full bg-[#fbfbfd] text-neutral-900 pt-20 pb-12 px-5 sm:px-8 md:px-12 border-t border-neutral-200 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Top Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-200">
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-display font-extrabold text-2xl tracking-wider uppercase text-neutral-900">
              KINETIK<span className="text-orange-600">®</span>
            </span>
            <p className="text-xs font-sans text-neutral-600 max-w-xs leading-relaxed">
              An independent creative technology &amp; spatial engineering studio. Built for clarity, scale, and lasting cultural impact.
            </p>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-500 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>STUDIO CAPACITY: 1 COMMISSIONS AVAILABLE</span>
            </div>
          </div>

          {/* Col 2: Business Inquiry */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2 font-semibold">
              BUSINESS ENQUIRY
            </span>
            <p className="text-sm font-mono text-neutral-900 hover:text-orange-600 transition-colors font-bold">
              E: hello@kinetik-studios.com
            </p>
            <p className="text-xs font-mono text-neutral-600">
              P: +49 (0) 30 8920 4410
            </p>
            <p className="text-xs font-mono text-neutral-500 pt-2">
              TORSTRASSE 140, MITTE, BERLIN
            </p>
          </div>

          {/* Col 3: Social Links */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2 font-semibold">
              NETWORK
            </span>
            <div className="space-y-1 text-xs font-mono text-neutral-600">
              {['LinkedIn', 'Instagram', 'X (Twitter)', 'Dribbble', 'GitHub', 'Awwwards'].map((net) => (
                <div
                  key={net}
                  onClick={() => SoundEngine.playTick()}
                  className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <span>{net}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Live Global Clocks */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2 font-semibold">
              WORLD CLOCKS
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-neutral-200 shadow-sm">
                <span className="text-neutral-500">BERLIN [CET]</span>
                <span className="text-neutral-900 font-bold">{times.berlin || '14:30'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-neutral-200 shadow-sm">
                <span className="text-neutral-500">NEW YORK [EST]</span>
                <span className="text-neutral-900 font-bold">{times.newYork || '08:30'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white border border-neutral-200 shadow-sm">
                <span className="text-neutral-500">TOKYO [JST]</span>
                <span className="text-neutral-900 font-bold">{times.tokyo || '22:30'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trionn Signature Interactive Sound Strings ("HOVER THE LINES") */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-3.5 h-3.5 text-orange-600" />
              <span className="uppercase tracking-widest font-semibold">
                SOUND ON // GLIDE CURSOR OVER THE STRINGS
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold">HARMONIC SCALE</span>
          </div>

          {/* 36 Interactive Vertical Sound Harp Strings */}
          <div className="flex items-center justify-between h-20 bg-white border border-neutral-200 shadow-sm rounded-xl px-4 py-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                onMouseEnter={() => handleStringHover(i)}
                className="group relative flex-1 h-full flex items-center justify-center cursor-pointer"
              >
                <div className="w-[1px] h-full bg-neutral-300 group-hover:bg-orange-500 group-hover:w-[2px] transition-all group-hover:scale-y-110" />
              </div>
            ))}
          </div>
        </div>

        {/* Giant Watermark Typography */}
        <div className="relative w-full overflow-hidden select-none pointer-events-none py-6">
          <h2 className="font-display font-black text-[15vw] leading-none text-neutral-200/80 tracking-tighter text-center uppercase whitespace-nowrap">
            KINETIK
          </h2>
        </div>

        {/* Bottom Legal & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-200 text-xs font-mono text-neutral-500">
          <div className="flex items-center space-x-4">
            <span>© 2026 KINETIK LABS GMBH.</span>
            <span>ALL RIGHTS RESERVED.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              SoundEngine.playTick();
              scrollTo('#hero');
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm font-semibold"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
