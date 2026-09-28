import type { CSSProperties, ReactNode } from 'react';

/** Custom property carrying the stagger index used by the reveal styles. */
const order = (index: number) => ({ '--i': index }) as CSSProperties;

/**
 * A line that rises from behind a mask when its stage becomes active.
 * Pair with a parent carrying `data-active`.
 */
export function Line({
  children,
  index = 0,
  className = '',
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <span className={`mask ${className}`} style={order(index)}>
      <span>{children}</span>
    </span>
  );
}

/** Content that fades and lifts in, staggered by index. */
export function Fade({
  children,
  index = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: 'div' | 'p' | 'span' | 'li' | 'ul' | 'dl';
}) {
  return (
    <Tag className={`fade ${className}`} style={order(index)}>
      {children}
    </Tag>
  );
}

/** Small uppercase mono label. */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`label ${className}`}>{children}</span>;
}

export function Arrow({ className = '', diagonal = false }: { className?: string; diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
      className={`h-[1em] w-[1em] ${className}`}
    >
      {diagonal ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}
    </svg>
  );
}
