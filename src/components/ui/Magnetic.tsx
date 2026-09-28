'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { magnetic } from '@/components/animations/MagneticInteraction';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

/** Wraps interactive content so it leans toward the pointer. */
export function Magnetic({ children, strength, className = 'inline-block', onEnter, onLeave }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const handlers = useRef({ onEnter, onLeave });
  handlers.current = { onEnter, onLeave };

  useEffect(() => {
    if (!ref.current) return;
    return magnetic(ref.current, {
      strength,
      onEnter: () => handlers.current.onEnter?.(),
      onLeave: () => handlers.current.onLeave?.(),
    });
  }, [strength]);

  return (
    <span ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </span>
  );
}
