'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Procedural reflection environment — soft studio strips rendered once into a
 * cube map. No HDR download; chrome and metal read from these shapes.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#040405']} />
      <Lightformer form="rect" intensity={5} position={[0, 6, -1]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={3} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[9, 1.1, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[7, 2, 3]} rotation-y={-Math.PI / 2} scale={[9, 0.5, 1]} />
      <Lightformer
        form="rect"
        color="#ff5a1f"
        intensity={3}
        position={[6, -2, -3]}
        rotation-y={-Math.PI / 2}
        scale={[7, 0.9, 1]}
      />
      <Lightformer
        form="rect"
        color="#9db8ff"
        intensity={1.4}
        position={[0, -6, 0]}
        rotation-x={-Math.PI / 2}
        scale={[12, 2, 1]}
      />
      <Lightformer form="ring" intensity={3.5} position={[0, 0.5, -9]} scale={4.5} />
      <Lightformer form="ring" intensity={1.5} position={[0, 0, 9]} rotation-y={Math.PI} scale={6} />
    </Environment>
  );
}
