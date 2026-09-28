'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial, Vector3 } from 'three';
import { damp } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { scroll } from '@/lib/scroll';
import { moodTrack } from '@/lib/world';

const BOX = new Vector3(34, 20, 46);
const mood: number[] = new Array(8).fill(0);
const tint = new Color();

const vertex = /* glsl */ `
uniform vec3 uCamera;
uniform vec3 uBox;
uniform float uTime;
uniform float uSize;
uniform float uRush;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.18 + aSeed * 6.2831) * 0.35;
  p.x += cos(uTime * 0.12 + aSeed * 12.566) * 0.25;
  // Wrap the field around the camera so dust exists everywhere on the journey.
  vec3 local = mod(p - uCamera, uBox) - uBox * 0.5;
  vec4 mv = viewMatrix * vec4(uCamera + local, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = max(-mv.z, 0.001);
  gl_PointSize = uSize * (0.4 + aSeed) * (1.0 + uRush * 1.5) / depth;
  vAlpha = smoothstep(uBox.z * 0.5, uBox.z * 0.22, depth) * smoothstep(0.4, 2.5, depth);
  vAlpha *= 0.35 + 0.65 * aSeed;
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity);
}
`;

/** Atmospheric dust that follows the camera through every scene. */
export function Particles() {
  const count = runtime.lowPower ? 700 : 1800;
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const height = useThree((state) => state.size.height);
  const rush = useRef(0);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * BOX.x;
      positions[i * 3 + 1] = Math.random() * BOX.y;
      positions[i * 3 + 2] = Math.random() * BOX.z;
      seeds[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));

    const mat = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uCamera: { value: new Vector3() },
        uBox: { value: BOX },
        uTime: { value: 0 },
        uSize: { value: 40 },
        uRush: { value: 0 },
        uColor: { value: new Color('#f2efe9') },
        uOpacity: { value: 0.55 },
      },
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useFrame((state, delta) => {
    const uniforms = material.uniforms;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uCamera.value.copy(state.camera.position);
    uniforms.uSize.value = height * 0.045 * pixelRatio;

    const speed = runtime.reducedMotion ? 0 : Math.min(Math.abs(scroll.velocity) / 60, 1);
    rush.current += (speed - rush.current) * damp(4, Math.min(delta, 0.05));
    uniforms.uRush.value = rush.current;

    moodTrack.sample(scroll.u, mood);
    tint.setRGB(mood[3], mood[4], mood[5]);
    (uniforms.uColor.value as Color).set('#f2efe9').lerp(tint, 0.35);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
