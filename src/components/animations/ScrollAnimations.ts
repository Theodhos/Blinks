import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A timeline scrubbed across a scene's pinned range. Author it on a 0..1
 * scale: positions and durations are fractions of the pinned scroll.
 */
export function pinnedTimeline(section: HTMLElement, build: (timeline: gsap.core.Timeline) => void) {
  const context = gsap.context(() => {
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    build(timeline);
    // Pad to exactly 1 so authored positions map directly onto scroll.
    timeline.set({}, {}, 1);
  }, section);

  return () => context.revert();
}
