import React from 'react';
import { Award, Trophy, ArrowUpRight } from 'lucide-react';
import { AWARDS } from '../../data/agencyData';
import { SoundEngine } from '../../lib/audio';

export const AwardsSection: React.FC = () => {
  return (
    <section
      id="awards"
      className="relative w-full bg-[#fbfbfd] text-neutral-900 py-24 md:py-36 px-5 sm:px-8 md:px-12 border-t border-neutral-200 select-none"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-orange-600 mb-2 font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>INDUSTRY RECOGNITION</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-neutral-900">
              Awards &amp; Honors<span className="text-orange-500">.</span>
            </h2>
          </div>
          <div className="font-mono text-xs text-neutral-500 uppercase tracking-wider font-semibold">
            TOTAL RECOGNITIONS: 54 • AWWWARDS • FWA • CANNES • RED DOT
          </div>
        </div>

        {/* Awards Editorial Table List */}
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {AWARDS.map((award, idx) => (
            <div
              key={`${award.title}-${idx}`}
              onMouseEnter={() => SoundEngine.playHover()}
              className="group py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-100/70 transition-colors px-4 -mx-4 rounded-xl cursor-pointer"
            >
              {/* Left: Year & Project Title */}
              <div className="flex items-baseline space-x-6">
                <span className="font-mono text-xs text-neutral-400 group-hover:text-orange-600 font-bold transition-colors">
                  {award.year}
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-800 group-hover:text-neutral-950 transition-colors">
                    {award.title}
                  </h3>
                  <span className="font-mono text-xs text-neutral-500">
                    {award.category}
                  </span>
                </div>
              </div>

              {/* Right: Organization & Badge */}
              <div className="flex items-center space-x-4 self-end md:self-auto">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                  {award.organization}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-900 text-white group-hover:bg-orange-500 group-hover:text-black transition-colors">
                  {award.badge}
                </span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
