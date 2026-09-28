'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, useProgress } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { loader, runtime } from '@/lib/runtime';
import { warmup } from './helpers';
import { Scene } from './Scene';

/** Frames rendered with every scene visible before the world is revealed. */
const WARMUP_FRAMES = 6;

function LoadReporter() {
  const progress = useProgress((state) => state.progress);
  useEffect(() => {
    loader.set({ progress: Math.max(loader.get().progress, progress / 100) });
  }, [progress]);
  return null;
}

function Ready() {
  const frames = useRef(0);
  useFrame(() => {
    if (!warmup.active) return;
    frames.current += 1;
    if (frames.current < WARMUP_FRAMES) return;
    warmup.active = false;
    loader.set({ progress: 1, ready: true });
  });
  return null;
}

export default function Experience() {
  const ceiling = runtime.lowPower ? 1.5 : 1.75;
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, ceiling));

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.1, far: 140, position: [0, 0.1, 14] }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr((value) => Math.max(1, value - 0.25))}
        onIncline={() => setDpr((value) => Math.min(ceiling, value + 0.25))}
      />
      <LoadReporter />
      <Suspense fallback={null}>
        <Scene />
        <Ready />
      </Suspense>
    </Canvas>
  );
}
