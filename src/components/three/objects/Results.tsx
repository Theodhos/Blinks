'use client';

import { useRef } from 'react';
import type { Group } from 'three';
import { STATS } from '@/data/agency';
import { SCENE, stepAt } from '@/lib/journey';
import { plateau, smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { COUNTS, HALO, PALETTE, resultPosition } from '@/lib/world';
import { FitText, motion, useSceneFrame, type FitTextHandle } from '../helpers';

/** The numbers, at architectural scale. The camera passes each one in turn. */
export function Results() {
  const figures = useRef<(FitTextHandle | null)[]>([]);
  const halo = useRef<Group>(null);

  useSceneFrame(5.8, 7.15, (u, state) => {
    const time = state.clock.elapsedTime * motion();

    STATS.forEach((_, i) => {
      const handle = figures.current[i];
      const mesh = handle?.mesh;
      if (!handle || !mesh) return;
      const [x, y, z] = resultPosition(i);
      const side = Math.sign(x);
      const enter = smoothstep(
        u,
        stepAt(SCENE.results, i, COUNTS.results, -0.45),
        stepAt(SCENE.results, i, COUNTS.results, 0.2),
      );
      const active = plateau(
        u,
        stepAt(SCENE.results, i, COUNTS.results, -0.45),
        stepAt(SCENE.results, i, COUNTS.results, 0.2),
        stepAt(SCENE.results, i, COUNTS.results, 0.95),
        stepAt(SCENE.results, i, COUNTS.results, 1.4),
      );
      handle.fit(runtime.wide ? 3.6 : 3.9);
      mesh.position.set(x, y + Math.sin(time * 0.6 + i) * 0.05 - (1 - enter) * 1.2, z - (1 - enter) * 5);
      mesh.rotation.set((1 - enter) * -0.5, runtime.wide ? -side * (0.18 + (1 - enter) * 0.7) : 0, 0);
      mesh.fillOpacity = 0.05 + active * 0.95;
    });

    if (halo.current) {
      const enter = smoothstep(u, stepAt(SCENE.results, 2, COUNTS.results, 0.6), stepAt(SCENE.results, 3, COUNTS.results, 0.3));
      halo.current.scale.setScalar(0.5 + enter * 0.5);
      halo.current.rotation.set(0.5 + time * 0.12, time * 0.2 + u * 2, 0);
    }
  });

  return (
    <>
      {STATS.map((stat, i) => (
        <FitText
          key={stat.label}
          ref={(handle) => {
            figures.current[i] = handle;
          }}
          color={PALETTE.bone}
          position={resultPosition(i)}
          // troika option, not in drei's prop types: the trailing "+" takes the accent.
          {...({ colorRanges: { 0: PALETTE.bone, [stat.number.length - 1]: PALETTE.signal } } as object)}
        >
          {stat.number}
        </FitText>
      ))}

      <group position={HALO}>
        <group ref={halo}>
          <mesh>
            <torusGeometry args={[1.5, 0.045, 24, 160]} />
            <meshStandardMaterial color="#e9e9ee" metalness={1} roughness={0.08} />
          </mesh>
          <mesh rotation-x={Math.PI / 2.4}>
            <torusGeometry args={[1.18, 0.02, 16, 140]} />
            <meshStandardMaterial color="#34343a" metalness={1} roughness={0.2} />
          </mesh>
          <mesh rotation-y={Math.PI / 2.2}>
            <torusGeometry args={[0.86, 0.008, 8, 120]} />
            <meshBasicMaterial color={PALETTE.signal} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </>
  );
}
