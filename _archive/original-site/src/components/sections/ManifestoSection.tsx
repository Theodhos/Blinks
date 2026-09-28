import React, { useEffect, useRef, useState } from 'react';
import { SoundEngine } from '../../lib/audio';
import { scrollTo, addScrollListener } from '../../lib/lenis';

export const ManifestoSection: React.FC = () => {
  const handleAboutClick = () => {
    SoundEngine.playTick(1300);
    scrollTo('#facts');
  };

  // Pins the Reconverge stage (marquee + annotations) in the viewport while the user scrolls
  // through its extra-tall wrapper, so the 3D merge has room to play out fully on screen.
  // Implemented as a manual scroll-driven `position: fixed`, NOT CSS `position: sticky`:
  // the app root wrapper has `overflow-x-hidden`, which per spec computes `overflow-y: auto`,
  // making it (rather than the viewport) the nearest CSS scroll container - so a real `sticky`
  // element never actually engages there.
  const reconvergeSectionRef = useRef<HTMLElement>(null);
  const [pinStyle, setPinStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100vh',
  });

  useEffect(() => {
    const updatePin = () => {
      const section = reconvergeSectionRef.current;
      if (!section) return;

      const sectionTop = section.getBoundingClientRect().top; // relative to viewport
      const vh = window.innerHeight;
      const pinDistance = Math.max(0, section.offsetHeight - vh);

      if (sectionTop > 0) {
        setPinStyle({ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh' });
      } else if (-sectionTop >= pinDistance) {
        setPinStyle({ position: 'absolute', top: pinDistance, left: 0, right: 0, height: '100vh' });
      } else {
        setPinStyle({ position: 'fixed', top: 0, left: 0, right: 0, height: '100vh' });
      }
    };

    updatePin();
    const unsubscribe = addScrollListener(updatePin);
    window.addEventListener('resize', updatePin);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', updatePin);
    };
  }, []);

  return (
    <div id="manifesto" className="relative w-full bg-transparent text-white select-none">
      {/* =========================================================================
          SECTION 2: ABOUT / STUDIO CREED (Exact Match to User Reference Photo 2)
          - Tight top spacing to remove empty buffer from Hero
          - ABOUT tag on top-left
          - Exactly 3 lines of statement text with smaller, balanced typography
          - Thin architectural divider with '+' crosshair
          - Left: WE DESIGN FOR LONGEVITY...
          - Right: Our mission is to make technology feel human... + MORE ABOUT US →
          - 3D wireframe / chiseled object flows behind the text
         ========================================================================= */}
      <section id="about" className="relative w-full pt-8 sm:pt-12 pb-16 sm:pb-24 px-5 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-[94rem] mx-auto flex flex-col justify-between min-h-[85vh]">
          {/* Top Row: ABOUT tag */}
          <div className="pt-2 pb-6">
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-neutral-400">
              ABOUT
            </span>
          </div>

          {/* Main Statement: Large, confident, exactly 3 lines with amber accent dot (Exact Match to User Photo 1) */}
          <div className="my-auto py-8 w-full">
            <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem] 2xl:text-[5.8rem] font-medium leading-[1.12] sm:leading-[1.08] tracking-[-0.035em] text-neutral-100">
              <span className="block">
                Trionn is an independent digital studio crafting
              </span>
              <span className="block">
                meaningful brand experiences through strategy,
                <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 ml-3 align-baseline shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              </span>
              <span className="block">
                design, and technology.
              </span>
            </h2>
          </div>

          {/* Dividing Hairline with '+' Crosshair */}
          <div className="relative w-full border-t border-neutral-800/80 my-8 sm:my-12">
            <span className="absolute right-1/3 -top-2 text-neutral-500 font-mono text-xs select-none">
              +
            </span>
          </div>

          {/* Bottom Columns: Left Credo & Right Narrative with CTA */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end text-neutral-300">
            {/* Bottom-Left Block */}
            <div className="md:col-span-5 font-mono text-[11px] sm:text-xs uppercase leading-relaxed tracking-widest text-neutral-400 space-y-1">
              <p>WE DESIGN FOR LONGEVITY</p>
              <p>CLARITY FIRST, CRAFT ALWAYS,</p>
              <p>BUILT TO SCALE.</p>
            </div>

            {/* Bottom-Right Block */}
            <div className="md:col-span-7 md:pl-8 flex flex-col items-start space-y-5">
              <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl">
                Our mission is to make technology feel human by designing digital products that are intuitive, purposeful, and meaningful to people.
              </p>

              <button
                type="button"
                onClick={handleAboutClick}
                onMouseEnter={() => SoundEngine.playHover()}
                className="group flex items-center space-x-3 pb-1 border-b border-neutral-300 text-xs font-mono uppercase tracking-widest text-neutral-100 hover:text-orange-400 hover:border-orange-400 transition-colors cursor-pointer"
              >
                <span>MORE ABOUT US</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INFINITE MARQUEE & 3D RECONVERGENCE (Photo 3)
          - FOCUSED VISION. MEASURED EXECUTION. on top left
          - Infinite running horizontal marquee typography:
            + INSPIRE + INNOVATE + IMPACT + INSPIRE + INNOVATE + IMPACT +
          - Center stage for the 3D Knot to merge together ("bashkimi i objektit 3d")
          - Bottom center annotation: ✦ FROM IDEA TO OUTCOME.
         ========================================================================= */}
      <section id="reconverge" ref={reconvergeSectionRef} className="relative w-full min-h-[220vh]">
        {/* Pinned viewport-height stage: keeps the marquee/annotations in place for the full
            scroll range below so the 3D object has room to assemble, hold merged, and be seen
            fully formed - without Key Facts bleeding into the same viewport early. */}
        <div
          style={pinStyle}
          className="w-full flex flex-col justify-between py-12 sm:py-16 px-5 sm:px-8 md:px-12 overflow-hidden"
        >
          {/* Top-Left Annotation */}
          <div className="max-w-7xl mx-auto w-full">
            <div className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-neutral-400 leading-relaxed">
              <p>FOCUSED VISION.</p>
              <p>MEASURED EXECUTION.</p>
            </div>
          </div>

          {/* Center Infinite Horizontal Display Marquee */}
          <div className="relative my-auto w-full overflow-hidden py-10 pointer-events-none select-none">
            <div className="animate-marquee flex items-center whitespace-nowrap">
              {[0, 1].map((copyIdx) => (
                <div key={copyIdx} className="flex items-center space-x-12 sm:space-x-16 pr-12 sm:pr-16">
                  <span className="font-display text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight uppercase text-neutral-100/90">
                    IMPACT
                  </span>
                  <span className="text-3xl sm:text-5xl md:text-6xl text-neutral-600 font-light">+</span>

                  <span className="font-display text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight uppercase text-neutral-100/90">
                    INSPIRE
                  </span>
                  <span className="text-3xl sm:text-5xl md:text-6xl text-neutral-600 font-light">+</span>

                  <span className="font-display text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight uppercase text-neutral-100/90">
                    INNOVATE
                  </span>
                  <span className="text-3xl sm:text-5xl md:text-6xl text-neutral-600 font-light">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-Center Annotation */}
          <div className="max-w-7xl mx-auto w-full flex justify-center text-center">
            <div className="font-mono text-[11px] sm:text-xs tracking-widest uppercase text-neutral-400 flex items-center space-x-2">
              <span className="text-orange-400">✦</span>
              <span>FROM IDEA TO OUTCOME.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
