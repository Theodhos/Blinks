import gsap from 'gsap';

interface MagneticOptions {
  /** How far the element follows the pointer, as a fraction of the offset. */
  strength?: number;
  /** How far an inner `[data-magnetic-inner]` child follows, for parallax depth. */
  innerStrength?: number;
  onEnter?: () => void;
  onLeave?: () => void;
}

/**
 * Pulls an element toward the pointer while hovered and springs it back on
 * leave. No-op on touch devices and when reduced motion is requested.
 */
export function magnetic(element: HTMLElement, options: MagneticOptions = {}) {
  const { strength = 0.35, innerStrength = 0.15, onEnter, onLeave } = options;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return () => {};

  const inner = element.querySelector<HTMLElement>('[data-magnetic-inner]');
  const x = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3.out' });
  const y = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3.out' });
  const innerX = inner ? gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
  const innerY = inner ? gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' }) : null;

  const move = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x(dx * strength);
    y(dy * strength);
    innerX?.(dx * innerStrength);
    innerY?.(dy * innerStrength);
  };

  const enter = () => onEnter?.();

  const leave = () => {
    gsap.to(element, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: true });
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: true });
    onLeave?.();
  };

  element.addEventListener('pointermove', move);
  element.addEventListener('pointerenter', enter);
  element.addEventListener('pointerleave', leave);

  return () => {
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerenter', enter);
    element.removeEventListener('pointerleave', leave);
    gsap.killTweensOf(element);
    if (inner) gsap.killTweensOf(inner);
  };
}
