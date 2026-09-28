'use client';

import { useMemo, useRef } from 'react';
import { Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three';
import { seeded } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { VOICES_CENTER } from '@/lib/world';
import { motion, useSceneFrame } from '../helpers';

const matrix = new Matrix4();
const rotation = new Quaternion();
const euler = new Euler();
const position = new Vector3();
const scale = new Vector3();

/** Fragments of the monolith, suspended and quiet, while clients speak. */
export function FragmentField() {
  const mesh = useRef<InstancedMesh>(null);
  const count = runtime.lowPower ? 40 : 84;

  const fragments = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const side = seeded(i + 3) > 0.5 ? 1 : -1;
        return {
          // Keep the centre column clear so the quote stays readable.
          home: new Vector3(
            side * (2.6 + seeded(i + 9) * 8),
            (seeded(i + 19) - 0.5) * 9,
            (seeded(i + 29) - 0.5) * 38,
          ),
          size: 0.12 + seeded(i + 39) * 0.5,
          spin: (seeded(i + 49) - 0.5) * 0.5,
          phase: seeded(i + 59) * Math.PI * 2,
        };
      }),
    [count],
  );

  useSceneFrame(6.8, 8.3, (_, state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime * motion();
    fragments.forEach((fragment, i) => {
      position.copy(fragment.home);
      position.y += Math.sin(time * 0.3 + fragment.phase) * 0.35;
      euler.set(time * fragment.spin + fragment.phase, time * fragment.spin * 0.7, fragment.phase);
      rotation.setFromEuler(euler);
      scale.set(fragment.size, fragment.size * 1.6, fragment.size * 0.35);
      matrix.compose(position, rotation, scale);
      mesh.current!.setMatrixAt(i, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      position={VOICES_CENTER}
      frustumCulled={false}
    >
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#3a3a41" metalness={1} roughness={0.18} flatShading />
    </instancedMesh>
  );
}
