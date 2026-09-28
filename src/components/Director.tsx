'use client';

import { useEffect } from 'react';
import { PIN, SCENES } from '@/lib/journey';
import { runtime } from '@/lib/runtime';
import { scrollToScene, startScroll } from '@/lib/scroll';

/**
 * Starts the scroll engine and pointer tracking. Supports deep links:
 * `#work` jumps to a scene, `?at=3.4` jumps to an exact journey position.
 */
export function Director() {
  useEffect(() => {
    history.scrollRestoration = 'manual';
    const stop = startScroll();

    const params = new URLSearchParams(window.location.search);
    const at = Number(params.get('at'));
    const hash = window.location.hash.slice(1);
    const linked = SCENES.findIndex((scene) => scene.id === hash);

    if (params.has('at') && Number.isFinite(at)) {
      const index = Math.floor(at);
      scrollToScene(index, (at - index) / PIN, true);
    } else if (linked > 0) {
      scrollToScene(linked, 0.04, true);
    } else {
      window.scrollTo(0, 0);
    }

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      runtime.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      runtime.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      stop();
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return null;
}
