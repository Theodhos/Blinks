import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';
import { scrollTo } from '../../lib/lenis';

interface NavbarProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMenu,
  isMenuOpen,
  onOpenContact
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    SoundEngine.initFromStorage();
    setIsMuted(SoundEngine.isMuted);

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSound = () => {
    const muted = SoundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-5 sm:px-8 md:px-12 py-5 ${
        scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-neutral-800/80 py-4 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#hero');
            SoundEngine.playTick();
          }}
          className="group flex items-center space-x-3 cursor-pointer select-none"
        >
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/70 flex items-center justify-center group-hover:border-white transition-colors duration-300">
            <svg viewBox="0 0 40 40" className="w-4 h-4 fill-white">
              <path d="M20 4L34 28H6L20 4Z" fill="currentColor" fillOpacity="0.3" />
              <path d="M20 12L28 28H12L20 12Z" fill="currentColor" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-display font-bold tracking-wider text-base md:text-lg uppercase text-white group-hover:tracking-widest transition-all duration-300">
              KINETIK<span className="text-orange-500 font-normal">®</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 -mt-1 uppercase hidden sm:inline">
              CREATIVE LABS
            </span>
          </div>
        </a>

        {/* Right Navigation Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Interactive Sound Audio Button with Visualizer Wave Bars */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={handleToggleSound}
            onMouseEnter={() => SoundEngine.playTick(1500)}
            aria-label={isMuted ? 'Unmute ambient sound' : 'Mute sound'}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-md hover:border-neutral-600 transition-all text-xs font-mono text-neutral-300 hover:text-white cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <div className="flex items-center space-x-1 h-3 px-0.5">
                <span className="wave-bar w-0.5 bg-orange-400 rounded-full inline-block" />
                <span className="wave-bar w-0.5 bg-orange-400 rounded-full inline-block" />
                <span className="wave-bar w-0.5 bg-orange-400 rounded-full inline-block" />
                <span className="wave-bar w-0.5 bg-orange-400 rounded-full inline-block" />
              </div>
            )}
            <span className="hidden md:inline text-[11px] uppercase tracking-wider">
              {isMuted ? 'SOUND OFF' : 'SOUND ON'}
            </span>
          </button>

          {/* Let's Talk CTA Pill */}
          <button
            id="nav-lets-talk-btn"
            type="button"
            onClick={() => {
              SoundEngine.playTick(1400);
              onOpenContact();
            }}
            className="group relative hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-all cursor-pointer shadow-md hover:shadow-white/10"
          >
            <span>LET&apos;S TALK</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Fullscreen Menu Trigger */}
          <button
            id="fullscreen-menu-toggle"
            type="button"
            onClick={() => {
              SoundEngine.playTick(1300);
              onOpenMenu();
            }}
            className="flex items-center space-x-2.5 px-4 sm:px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-md hover:border-neutral-600 transition-all text-xs font-mono text-neutral-200 hover:text-white cursor-pointer"
          >
            <span className="uppercase tracking-widest text-[11px]">
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </span>
            <div className="relative w-4 h-3 flex flex-col justify-between items-end">
              <span
                className={`h-[1.5px] bg-white transition-all duration-300 ${
                  isMenuOpen ? 'w-4 rotate-45 translate-y-[5px]' : 'w-4'
                }`}
              />
              <span
                className={`h-[1.5px] bg-white transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'w-2.5'
                }`}
              />
              <span
                className={`h-[1.5px] bg-white transition-all duration-300 ${
                  isMenuOpen ? 'w-4 -rotate-45 -translate-y-[5px]' : 'w-3.5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
