'use client';

import { useState, useEffect } from 'react';
import { initSmoothScroll, destroySmoothScroll } from '../lib/lenis';
import { Preloader } from '../components/loader/Preloader';
import { CustomCursor, CursorMode } from '../components/cursor/CustomCursor';
import { Navbar } from '../components/navigation/Navbar';
import { FullscreenMenu } from '../components/navigation/FullscreenMenu';
import { HeroSection } from '../components/sections/HeroSection';
import { ManifestoSection } from '../components/sections/ManifestoSection';
import { KeyFactsSection } from '../components/sections/KeyFactsSection';
import { SelectedWorkSection } from '../components/sections/SelectedWorkSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { DesignInMotionSection } from '../components/sections/DesignInMotionSection';
import { AwardsSection } from '../components/sections/AwardsSection';
import { ContactSection } from '../components/sections/ContactSection';
import { FooterSection } from '../components/sections/FooterSection';
import { CookieNotice } from '../components/ui/CookieNotice';
import { scrollTo } from '../lib/lenis';

export default function Home() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [cursorText, setCursorText] = useState('VIEW');

  // Initialize Lenis smooth scroll synchronized with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      destroySmoothScroll();
    };
  }, []);

  const handleSetCursorMode = (mode: CursorMode, text: string = 'VIEW') => {
    setCursorMode(mode);
    setCursorText(text);
  };

  const handleOpenContact = () => {
    scrollTo('#contact');
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#f4f4f5] overflow-x-hidden selection:bg-orange-500 selection:text-black">
      {/* Cinematic Preloader */}
      <Preloader onComplete={() => setIsPreloaderDone(true)} />

      {/* Desktop Custom Trailing Cursor */}
      <CustomCursor cursorMode={cursorMode} cursorText={cursorText} />

      {/* Fixed Luxury Navigation Header */}
      <Navbar
        isMenuOpen={isMenuOpen}
        onOpenMenu={() => setIsMenuOpen(prev => !prev)}
        onOpenContact={handleOpenContact}
      />

      {/* Fullscreen Staggered Navigation Overlay */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectContact={handleOpenContact}
      />

      {/* Main Page Sections */}
      <main className="relative z-10 w-full">
        {/* Section 01: Hero with 3D Monolith, Hold to Blast & Typography */}
        <HeroSection
          onOpenContact={handleOpenContact}
          onSetCursorMode={handleSetCursorMode}
        />

        {/* Section 02: Manifesto & Infinite Marquee */}
        <ManifestoSection />

        {/* Section 03: Studio Key Facts (3D Tilt Cards) & Client Logos */}
        <KeyFactsSection onSetCursorMode={handleSetCursorMode} />

        {/* Section 04: Selected Work Portfolio & Project Modal Case Studies */}
        <SelectedWorkSection
          onOpenContact={handleOpenContact}
          onSetCursorMode={handleSetCursorMode}
        />

        {/* Section 05: Our Services & Dedicated 3D WebGL Scene */}
        <ServicesSection
          onOpenContact={handleOpenContact}
          onSetCursorMode={handleSetCursorMode}
        />

        {/* Section 06: Testimonials & Client Voicenotes */}
        <TestimonialsSection
          onOpenContact={handleOpenContact}
          onSetCursorMode={handleSetCursorMode}
        />

        {/* Section 07: Design in Motion (Interactive 3D Carousel of Experiments) */}
        <DesignInMotionSection onSetCursorMode={handleSetCursorMode} />

        {/* Section 08: Awards & Recognition Table */}
        <AwardsSection />

        {/* Section 09: High-End Contact & Project Inquiries */}
        <ContactSection />
      </main>

      {/* Section 10: Footer with Interactive Sound Strings & Local Time Clocks */}
      <FooterSection />

      {/* Cookie Consent Banner */}
      <CookieNotice />
    </div>
  );
}
