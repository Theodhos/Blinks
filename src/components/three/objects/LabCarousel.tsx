'use client';

import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Color, Group } from 'three';
import { EXPERIMENTS } from '@/data/agency';
import { SCENE, pinProgress } from '@/lib/journey';
import { clamp, damp, smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { scroll } from '@/lib/scroll';
import { COUNTS, LAB_CENTER, LAB_FRONT_ANGLE, LAB_RADIUS } from '@/lib/world';
import { motion, useSceneFrame } from '../helpers';
import { ImagePanel, type ImagePanelHandle } from './ImagePanel';

const STEP = (Math.PI * 2) / COUNTS.lab;

/**
 * Scroll turns into a staircase: the carousel rests on each experiment, then
 * rotates quickly to the next. It finishes at rest so the camera can fly
 * through the gaps between panels.
 */
const turn = (progress: number) => {
  const scaled = progress * COUNTS.lab;
  const index = Math.floor(scaled);
  return Math.min(COUNTS.lab - 1, index + smoothstep(scaled - index, 0.62, 1));
};

/** Experiments from the lab, mounted on a slow carousel. */
export function LabCarousel() {
  const ring = useRef<Group>(null);
  const panels = useRef<(ImagePanelHandle | null)[]>([]);
  const scene = useThree((state) => state.scene);
  const bend = useRef(0);

  useSceneFrame(3.8, 5.2, (u, state, dt) => {
    const time = state.clock.elapsedTime * motion();
    const position = turn(pinProgress(u, SCENE.lab));
    const appear = smoothstep(u, 3.86, 4.02);
    const speed = runtime.reducedMotion ? 0 : clamp(scroll.velocity / 90, -1, 1);
    bend.current += (speed - bend.current) * damp(5, dt);

    if (ring.current) {
      ring.current.rotation.y = LAB_FRONT_ANGLE - position * STEP;
      ring.current.position.y = Math.sin(time * 0.4) * 0.08;
    }

    panels.current.forEach((panel, i) => {
      if (!panel?.group) return;
      const focus = 1 - clamp(Math.abs(i - position));
      panel.group.scale.setScalar(0.9 + focus * 0.16);
      panel.set(focus, appear, bend.current * 0.6, time + i, scene.background as Color);
    });
  });

  return (
    <group position={LAB_CENTER} rotation-x={0.08}>
      <group ref={ring}>
        {EXPERIMENTS.map((experiment, i) => (
          <group key={experiment.id} rotation-y={i * STEP}>
            <group position-z={LAB_RADIUS}>
              <ImagePanel
                ref={(handle) => {
                  panels.current[i] = handle;
                }}
                src={experiment.image}
                width={1.8}
                height={2.4}
              />
            </group>
          </group>
        ))}
      </group>
      <mesh rotation-x={Math.PI / 2} position-y={-1.75}>
        <torusGeometry args={[LAB_RADIUS, 0.006, 6, 200]} />
        <meshBasicMaterial color="#f2efe9" transparent opacity={0.22} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={1.75}>
        <torusGeometry args={[LAB_RADIUS, 0.006, 6, 200]} />
        <meshBasicMaterial color="#f2efe9" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
