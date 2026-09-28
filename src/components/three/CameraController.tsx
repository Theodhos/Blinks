'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import { clamp, damp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { scroll } from '@/lib/scroll';
import { FOV, cameraTrack } from '@/lib/world';

const sample: number[] = [0, 0, 0];
const targetPos = new Vector3();
const targetLook = new Vector3();
const right = new Vector3();
const up = new Vector3();

/**
 * The storyteller. Scroll position picks a point on the keyframed journey;
 * the camera eases toward it, with a little pointer parallax and a subtle
 * lens widening at speed.
 */
export function CameraController() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const pos = useRef(new Vector3(0, 0.1, 14));
  const look = useRef(new Vector3(0, 0, 0));
  const parallax = useRef({ x: 0, y: 0 });
  const started = useRef(false);

  runtime.wide = size.width / size.height >= 1.1 && size.width >= 900;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const track = runtime.wide ? cameraTrack.wide : cameraTrack.stacked;

    track.pos.sample(scroll.u, sample);
    targetPos.set(sample[0], sample[1], sample[2]);
    track.look.sample(scroll.u, sample);
    targetLook.set(sample[0], sample[1], sample[2]);

    // Intro: start pulled back, settle as the preloader lifts.
    targetPos.z += (1 - runtime.intro) * 5;

    if (!started.current) {
      pos.current.copy(targetPos);
      look.current.copy(targetLook);
      started.current = true;
    }

    const ease = damp(runtime.reducedMotion ? 12 : 5.5, dt);
    pos.current.lerp(targetPos, ease);
    look.current.lerp(targetLook, ease);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);

    if (!runtime.reducedMotion) {
      const p = parallax.current;
      p.x += (runtime.pointer.x - p.x) * damp(2.5, dt);
      p.y += (runtime.pointer.y - p.y) * damp(2.5, dt);
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(right, p.x * 0.28).addScaledVector(up, p.y * 0.16);
      camera.lookAt(look.current);
      camera.rotation.z += clamp(scroll.velocity * 0.00035, -0.02, 0.02);
    }

    const base = runtime.wide ? FOV.wide : FOV.stacked;
    const rush = runtime.reducedMotion ? 0 : Math.min(Math.abs(scroll.velocity) * 0.07, 7);
    const fov = camera.fov + (base + rush - camera.fov) * damp(4, dt);
    if (Math.abs(fov - camera.fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
