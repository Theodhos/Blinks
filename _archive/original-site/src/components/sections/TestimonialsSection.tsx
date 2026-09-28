import React, { useState } from 'react';
import { Play, Pause, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TESTIMONIALS } from '../../data/agencyData';
import { SoundEngine } from '../../lib/audio';

interface TestimonialsSectionProps {
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onOpenContact,
  onSetCursorMode
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  const handleNext = () => {
    SoundEngine.playTick(1600);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    setIsPlayingAudio(false);
  };

  const handlePrev = () => {
    SoundEngine.playTick(1400);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setIsPlayingAudio(false);
  };

  const handlePlayVoiceNote = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      SoundEngine.playVoicenote();
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3500);
    }
  };

  return (
    <section
      id="testimonials"
      className="relative w-full bg-transparent text-white py-24 md:py-36 px-5 sm:px-8 md:px-12 border-t border-neutral-800/40 transition-colors duration-700 select-none"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-6 text-xs font-mono text-neutral-400 uppercase tracking-widest">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-neutral-200 font-semibold">CLIENT REPUTATION</span>
          </div>
          <span>[ 05 // ENDORSEMENTS ]</span>
        </div>

        {/* Main Grid: Left Partner List + Right Dynamic Quote Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Client List */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-3">
              SELECT PARTNERS
            </span>
            <div className="space-y-3">
              {['LUXURY PRESENCE', 'SYNAPSE GLOBAL', 'CREDIBLE TECH', 'TECHNIS AI', 'VENTRICE LABS'].map((client, i) => (
                <div
                  key={client}
                  onClick={() => {
                    SoundEngine.playTick(1300 + i * 80);
                    setActiveIndex(i % TESTIMONIALS.length);
                  }}
                  className={`px-4 py-3 rounded-xl border font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    (i % TESTIMONIALS.length) === activeIndex
                      ? 'bg-orange-500 text-black border-orange-400 font-bold shadow-lg shadow-orange-500/20'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-white backdrop-blur-sm'
                  }`}
                >
                  {client}
                </div>
              ))}
            </div>

            {/* Slider Navigation Arrows */}
            <div className="flex items-center space-x-3 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900/80 hover:bg-white hover:text-black flex items-center justify-center transition-colors cursor-pointer text-neutral-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900/80 hover:bg-white hover:text-black flex items-center justify-center transition-colors cursor-pointer text-neutral-300"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Big Editorial Quote Presentation */}
          <div className="lg:col-span-8 space-y-8 lg:pl-8 border-t lg:border-t-0 lg:border-l border-neutral-800/60 pt-8 lg:pt-0">
            <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug">
              &ldquo;{activeTestimonial.quote}&rdquo;
            </blockquote>

            {/* Author Meta + Voicenote Audio Pill */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-neutral-800/60">
              <div className="flex items-center space-x-4">
                <img
                  src={activeTestimonial.avatar}
                  alt={activeTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover border border-neutral-700 shadow-md"
                />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {activeTestimonial.author}
                  </h3>
                  <p className="font-mono text-xs text-neutral-400">
                    {activeTestimonial.role} — {activeTestimonial.company}
                  </p>
                </div>
              </div>

              {/* Interactive Voicenote Audio Player Pill */}
              <button
                type="button"
                onClick={handlePlayVoiceNote}
                onMouseEnter={() => {
                  SoundEngine.playHover();
                  onSetCursorMode?.('hover');
                }}
                onMouseLeave={() => onSetCursorMode?.('default')}
                className={`flex items-center space-x-3 px-5 py-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${
                  isPlayingAudio
                    ? 'bg-orange-500 border-orange-500 text-black shadow-orange-500/20'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-200 hover:border-neutral-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isPlayingAudio ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-200'
                }`}>
                  {isPlayingAudio ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 translate-x-0.5" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                    {isPlayingAudio ? 'PLAYING NOTE...' : 'LISTEN TO VOICENOTE'}
                  </span>
                  <span className="font-mono text-[9px] text-neutral-400">
                    {activeTestimonial.durationAudio} SEC • CLIENT AUDIO
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom CTA Pill */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  SoundEngine.playTick();
                  onOpenContact();
                }}
                className="group flex items-center space-x-3 text-xs font-mono uppercase tracking-widest text-white font-bold hover:text-orange-400 transition-colors cursor-pointer"
              >
                <span>BECOME A CLIENT</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
