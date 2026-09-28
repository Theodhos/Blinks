'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, type DirectionalLight, type Fog, type PointLight } from 'three';
import { damp } from '@/lib/math';
import { scroll } from '@/lib/scroll';
import { focusTrack, moodTrack } from '@/lib/world';

const mood: number[] = new Array(8).fill(0);
const focus: number[] = [0, 0, 0];
const accent = new Color();
const background = new Color();

/**
 * One fixed rig for the whole journey — the light count never changes, so
 * materials never recompile mid-scroll. Colour, intensity and the position of
 * the accent light are keyframed along the journey instead.
 */
export function Lighting() {
  const scene = useThree((state) => state.scene);
  const rim = useRef<DirectionalLight>(null);
  const point = useRef<PointLight>(null);
  const fill = useRef<PointLight>(null);
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const ease = damp(6, Math.min(delta, 0.05));
    moodTrack.sample(scroll.u, mood);
    focusTrack.sample(scroll.u, focus);

    background.setRGB(mood[0], mood[1], mood[2]);
    accent.setRGB(mood[3], mood[4], mood[5]);

    (scene.background as Color).lerp(background, ease);
    (scene.fog as Fog).color.copy(scene.background as Color);
    scene.environmentIntensity += (mood[7] - scene.environmentIntensity) * ease;

    if (point.current) {
      point.current.color.lerp(accent, ease);
      point.current.intensity += (mood[6] * 60 - point.current.intensity) * ease;
      point.current.position.set(focus[0], focus[1], focus[2]);
    }
    if (rim.current) rim.current.color.lerp(accent, ease);
    if (fill.current) fill.current.position.copy(camera.position);
  });

  return (
    <>
      <color attach="background" args={['#08080a']} />
      <fog attach="fog" args={['#08080a', 9, 54]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#fff6ee" />
      <directionalLight ref={rim} position={[-5, 2, -6]} intensity={2.2} />
      <pointLight ref={point} distance={34} decay={2} />
      <pointLight ref={fill} intensity={6} distance={18} decay={2} color="#cfd8ff" />
    </>
  );
}
