'use client';

import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Color } from 'three';
import { PROJECTS } from '@/data/agency';
import { SCENE, stepAt } from '@/lib/journey';
import { clamp, damp, plateau, smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { scroll } from '@/lib/scroll';
import { COUNTS, projectPosition } from '@/lib/world';
import { motion, useSceneFrame } from '../helpers';
import { ImagePanel, type ImagePanelHandle } from './ImagePanel';

const WIDTH = 4.4;
const HEIGHT = 2.75;

/** The work, hung in depth. The camera walks the gallery one piece at a time. */
export function WorkGallery() {
  const panels = useRef<(ImagePanelHandle | null)[]>([]);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const bend = useRef(0);

  useSceneFrame(2.8, 4.2, (u, state, dt) => {
    const time = state.clock.elapsedTime * motion();
    const aspect = state.size.width / state.size.height;
    const size = runtime.wide ? clamp(aspect / 1.7, 0.72, 1) : 0.82;
    const speed = runtime.reducedMotion ? 0 : clamp(scroll.velocity / 90, -1, 1);
    bend.current += (speed - bend.current) * damp(5, dt);

    panels.current.forEach((panel, i) => {
      const group = panel?.group;
      if (!panel || !group) return;
      const [x, y, z] = projectPosition(i);
      const side = Math.sign(x);
      const active = plateau(
        u,
        stepAt(SCENE.work, i, COUNTS.projects, -0.3),
        stepAt(SCENE.work, i, COUNTS.projects, 0.12),
        stepAt(SCENE.work, i, COUNTS.projects, 0.88),
        stepAt(SCENE.work, i, COUNTS.projects, 1.2),
      );
      const distance = camera.position.z - z;
      const fade = smoothstep(distance, 22, 10);

      group.visible = fade > 0.004;
      group.position.set(x, y + Math.sin(time * 0.5 + i * 1.7) * 0.06, z);
      group.rotation.set(0, -side * (runtime.wide ? 0.22 - active * 0.1 : 0), side * 0.012);
      group.scale.setScalar(size * (0.94 + active * 0.06));
      panel.set(active, fade, bend.current, time, scene.background as Color);
    });
  });

  return (
    <>
      {PROJECTS.map((project, i) => (
        <ImagePanel
          key={project.id}
          ref={(handle) => {
            panels.current[i] = handle;
          }}
          src={project.image}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
    </>
  );
}
