import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export type CursorMode = 'default' | 'hover' | 'project' | 'drag' | 'explore';

interface CustomCursorProps {
  cursorText?: string;
  cursorMode?: CursorMode;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  cursorText = 'VIEW',
  cursorMode = 'default'
}) => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if device has touch screen or coarse pointer
    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    if (checkTouch()) {
      setIsTouch(true);
      return;
    }

    const dot = cursorDotRef.current;
    const follower = cursorFollowerRef.current;
    if (!dot || !follower) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Instant dot positioning
      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.08,
        ease: 'power2.out',
      });
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth lerp follower loop
    let animationFrameId: number;
    const render = () => {
      followerX += (mouseX - followerX) * 0.16;
      followerY += (mouseY - followerY) * 0.16;

      if (follower) {
        gsap.set(follower, {
          x: followerX,
          y: followerY,
        });
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (isTouch) return null;

  const isProject = cursorMode === 'project';
  const isDrag = cursorMode === 'drag';
  const isHover = cursorMode === 'hover';
  const isExplore = cursorMode === 'explore';

  return (
    <div
      id="custom-cursor-container"
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Precision inner center dot */}
      <div
        ref={cursorDotRef}
        id="cursor-dot"
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-200 ${
          isProject || isDrag || isExplore
            ? 'w-0 h-0 opacity-0'
            : isHover
            ? 'w-3 h-3 bg-white scale-125'
            : 'w-2 h-2 bg-white'
        }`}
      />

      {/* Smooth outer follower orb with contextual badges */}
      <div
        ref={cursorFollowerRef}
        id="cursor-follower"
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center transition-all duration-300 ease-out backdrop-blur-[2px] ${
          isProject
            ? 'w-24 h-24 bg-white/95 text-black scale-100 shadow-[0_0_40px_rgba(255,255,255,0.4)]'
            : isExplore
            ? 'w-20 h-20 bg-white/90 text-black scale-100 shadow-xl'
            : isDrag
            ? 'w-16 h-16 bg-neutral-800/80 border border-white/30 text-white scale-100'
            : isHover
            ? 'w-12 h-12 border border-white/80 bg-white/10 scale-100'
            : 'w-8 h-8 border border-white/30 bg-transparent'
        }`}
      >
        {isProject && (
          <span className="font-display font-bold text-xs tracking-widest uppercase">
            {cursorText || 'VIEW'}
          </span>
        )}
        {isExplore && (
          <span className="font-display font-semibold text-[10px] tracking-wider uppercase text-black">
            EXPLORE
          </span>
        )}
        {isDrag && (
          <span className="font-mono text-[9px] tracking-wider uppercase text-neutral-200">
            DRAG
          </span>
        )}
      </div>
    </div>
  );
};
