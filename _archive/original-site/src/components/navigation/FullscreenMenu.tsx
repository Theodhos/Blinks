import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, X, Mail, Globe, MapPin } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';
import { scrollTo } from '../../lib/lenis';

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: () => void;
}

const MENU_ITEMS = [
  { id: 'hero', number: '01', title: 'Home', subtitle: 'Overview & Monolith' },
  { id: 'work', number: '02', title: 'Selected Work', subtitle: 'Award-winning projects' },
  { id: 'services', number: '03', title: 'Services & 3D', subtitle: 'AI, WebGL & Product' },
  { id: 'facts', number: '04', title: 'Studio Facts', subtitle: 'Key metrics & team' },
  { id: 'motion', number: '05', title: 'Design in Motion', subtitle: 'Interactive experiments' },
  { id: 'awards', number: '06', title: 'Recognition', subtitle: 'FWA & Awwwards' },
];

export const FullscreenMenu: React.FC<FullscreenMenuProps> = ({
  isOpen,
  onClose,
  onSelectContact
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'power2.out'
      })
      .fromTo(
        '.menu-link-row',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(
        '.menu-side-info',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
        '-=0.4'
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.3,
        ease: 'power2.in'
      });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (id: string) => {
    SoundEngine.playTick();
    onClose();
    setTimeout(() => {
      scrollTo(`#${id}`);
    }, 350);
  };

  return (
    <div
      ref={overlayRef}
      id="fullscreen-menu-overlay"
      className="fixed inset-0 z-[150] bg-[#09090b]/95 backdrop-blur-2xl opacity-0 pointer-events-none flex flex-col justify-between p-6 sm:p-12 md:p-16 text-white overflow-y-auto select-none"
    >
      {/* Top Bar inside Menu */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-6">
        <div className="flex items-center space-x-3">
          <span className="font-display font-bold tracking-wider text-xl uppercase">
            KINETIK<span className="text-orange-500">®</span>
          </span>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
            // INDEX NAVIGATION
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            SoundEngine.playTick();
            onClose();
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors text-xs font-mono tracking-widest uppercase cursor-pointer"
        >
          <span>CLOSE</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 my-auto py-10">
        {/* Left: Nav Links */}
        <div ref={linksRef} className="lg:col-span-7 flex flex-col space-y-4">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.id}
              className="menu-link-row group flex items-center justify-between border-b border-neutral-800/60 pb-3 cursor-pointer"
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={() => SoundEngine.playHover()}
            >
              <div className="flex items-baseline space-x-4">
                <span className="font-mono text-xs text-neutral-500 group-hover:text-orange-400 transition-colors">
                  {item.number}
                </span>
                <span className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-neutral-300 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                  {item.title}
                </span>
              </div>

              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-xs font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.subtitle}
                </span>
                <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {/* Contact Direct Nav Link */}
          <div
            className="menu-link-row group flex items-center justify-between pt-2 cursor-pointer"
            onClick={() => {
              SoundEngine.playTick();
              onClose();
              setTimeout(() => {
                onSelectContact();
              }, 300);
            }}
            onMouseEnter={() => SoundEngine.playHover()}
          >
            <div className="flex items-baseline space-x-4">
              <span className="font-mono text-xs text-orange-500">07</span>
              <span className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-orange-400 group-hover:text-orange-300 group-hover:translate-x-2 transition-all duration-300">
                INITIATE BRIEF
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right: Studio details & locations */}
        <div ref={infoRef} className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:pl-12 border-t lg:border-t-0 lg:border-l border-neutral-800/80 pt-8 lg:pt-0">
          {/* Studio Locations */}
          <div className="menu-side-info space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>GLOBAL STUDIOS</span>
            </span>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-neutral-800/80 bg-neutral-900/40">
                <span className="text-neutral-400 font-mono text-[10px]">BERLIN / HQ</span>
                <p className="text-white font-medium mt-1">Torstraße 140, Mitte</p>
                <span className="text-neutral-500 font-mono text-[10px]">CET (UTC+1)</span>
              </div>
              <div className="p-3 rounded-lg border border-neutral-800/80 bg-neutral-900/40">
                <span className="text-neutral-400 font-mono text-[10px]">NEW YORK / LAB</span>
                <p className="text-white font-medium mt-1">45 Crosby St, SoHo</p>
                <span className="text-neutral-500 font-mono text-[10px]">EST (UTC-5)</span>
              </div>
            </div>
          </div>

          {/* Direct Contact */}
          <div className="menu-side-info space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span>COMMISSIONS & PRESS</span>
            </span>
            <p className="text-lg font-mono text-white hover:text-orange-400 transition-colors">
              hello@kinetik-studios.com
            </p>
            <p className="text-xs font-mono text-neutral-500">
              Tel: +49 (0) 30 8920 4410
            </p>
          </div>

          {/* Social Links */}
          <div className="menu-side-info space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-orange-500" />
              <span>CONNECT</span>
            </span>
            <div className="flex flex-wrap gap-3 text-xs font-mono">
              {['TWITTER/X', 'INSTAGRAM', 'LINKEDIN', 'AWWWARDS', 'GITHUB'].map((net) => (
                <span
                  key={net}
                  className="px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  onClick={() => SoundEngine.playTick(1600)}
                >
                  {net}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer inside Menu */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-800/80 pt-6">
        <span>© 2026 KINETIK LABS GMBH. ALL RIGHTS RESERVED.</span>
        <span>AWARDS WON: 50+ • INDEPENDENT CREATIVE DIRECTION</span>
      </div>
    </div>
  );
};
