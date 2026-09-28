'use client';

import { useEffect, useRef, useState } from 'react';
import { activeStep, isPinned } from '@/lib/journey';
import { onFrame, scroll } from '@/lib/scroll';

/**
 * Derive a React value from the journey position. The selector runs every
 * frame, but a render only happens when its result actually changes.
 */
export function useJourneyValue<T>(select: (u: number) => T): T {
  const selector = useRef(select);
  selector.current = select;
  const [value, setValue] = useState<T>(() => select(scroll.u));
  const last = useRef(value);

  useEffect(
    () =>
      onFrame(() => {
        const next = selector.current(scroll.u);
        if (Object.is(next, last.current)) return;
        last.current = next;
        setValue(next);
      }),
    [],
  );

  return value;
}

export const useActiveStep = (scene: number, count: number) =>
  useJourneyValue((u) => activeStep(u, scene, count));

export const usePinned = (scene: number) => useJourneyValue((u) => isPinned(u, scene));
