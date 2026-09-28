'use client';

import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { STUDIO } from '@/data/agency';
import { smoothstep } from '@/lib/math';
import { PALETTE, WORDMARK_Z } from '@/lib/world';
import { FitText, useSceneFrame, visibleWidth, type FitTextHandle } from '../helpers';

/** The name, revealed behind the monolith as the journey comes to rest. */
export function Wordmark() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const text = useRef<FitTextHandle>(null);

  useSceneFrame(7.7, 11, (u) => {
    const handle = text.current;
    const mesh = handle?.mesh;
    if (!handle || !mesh) return;
    const reveal = smoothstep(u, 8.82, 9);
    const distance = Math.abs(camera.position.z - WORDMARK_Z);
    handle.fit(visibleWidth(camera, distance) * 0.9);
    mesh.position.set(0, 0.2 - (1 - reveal) * 1.5, WORDMARK_Z);
    mesh.fillOpacity = reveal * 0.95;
    mesh.visible = reveal > 0.01;
  });

  return (
    <FitText ref={text} color={PALETTE.bone} fillOpacity={0} letterSpacing={-0.05}>
      {STUDIO.name}
    </FitText>
  );
}
