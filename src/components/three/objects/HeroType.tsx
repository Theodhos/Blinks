'use client';

import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { HERO } from '@/data/agency';
import { smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { FOV, PALETTE } from '@/lib/world';
import { FitText, useSceneFrame, type FitTextHandle } from '../helpers';

interface Line {
  text: string;
  y: number;
  z: number;
  /** Fraction of the visible width the line spans. */
  fit: number;
  /** Direction the line leaves in as the story begins. */
  drift: number;
}

const [first, second] = HERO.lineOne.split(' ');

const WIDE: Line[] = [
  { text: HERO.lineOne, y: 1.05, z: -2.6, fit: 0.86, drift: -1 },
  { text: HERO.lineTwo, y: -1.2, z: 2.3, fit: 0.52, drift: 1 },
];

const STACKED: Line[] = [
  { text: first, y: 2.05, z: -2.6, fit: 0.92, drift: -1 },
  { text: second, y: -1.35, z: 2.3, fit: 0.42, drift: 1 },
  { text: HERO.lineTwo, y: -2.2, z: 2.3, fit: 0.88, drift: 1 },
];

const START = { wide: 9.5, stacked: 12.5 };

/**
 * The headline lives in the scene: one line sits behind the monolith and is
 * cut by it, the other floats in front. Scrolling pulls them apart.
 */
export function HeroType() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const wide = size.width / size.height >= 1.1 && size.width >= 900;
  const lines = wide ? WIDE : STACKED;
  const refs = useRef<(FitTextHandle | null)[]>([]);

  useSceneFrame(-1, 2.05, (u) => {
    const leave = smoothstep(u, 0.04, 0.7);
    const arrive = runtime.intro;
    const aspect = camera.aspect;
    const fov = wide ? FOV.wide : FOV.stacked;
    const tan = Math.tan((fov * Math.PI) / 360);

    lines.forEach((line, i) => {
      const handle = refs.current[i];
      const mesh = handle?.mesh;
      if (!handle || !mesh) return;
      const distance = (wide ? START.wide : START.stacked) - line.z;
      const span = 2 * distance * tan * aspect;
      handle.fit(span * line.fit);
      mesh.position.set(
        line.drift * leave * span * 0.55,
        line.y - (1 - arrive) * 0.5 * (i + 1),
        line.z + line.drift * leave * 3.5,
      );
      mesh.fillOpacity = arrive * (1 - leave);
      mesh.visible = mesh.fillOpacity > 0.002;
    });
  });

  return (
    <group key={wide ? 'wide' : 'stacked'}>
      {lines.map((line, i) => (
        <FitText
          key={line.text}
          ref={(handle) => {
            refs.current[i] = handle;
          }}
          color={PALETTE.bone}
          fillOpacity={0}
        >
          {line.text}
        </FitText>
      ))}
    </group>
  );
}
