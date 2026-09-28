'use client';

import { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  Group,
  ShaderMaterial,
  Sprite,
  TubeGeometry,
  Vector3,
} from 'three';
import { PROCESS } from '@/data/agency';
import { SCENE, stepAt } from '@/lib/journey';
import { createTrack, smoothstep } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { COUNTS, OUTCOME_WORDS, PALETTE, PROCESS_NODES } from '@/lib/world';
import { FONT_DISPLAY, FitText, glowTexture, motion, useSceneFrame, type FitTextHandle, type TextMesh } from '../helpers';

const trailVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const trailFragment = /* glsl */ `
uniform float uProgress;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uHead;
varying vec2 vUv;
void main() {
  float drawn = 1.0 - smoothstep(uProgress - 0.002, uProgress, vUv.x);
  float head = smoothstep(0.09, 0.0, uProgress - vUv.x) * drawn;
  float flow = 0.5 + 0.5 * sin(vUv.x * 160.0 - uTime * 3.0);
  vec3 color = mix(uColor, uHead, head);
  float alpha = drawn * (0.22 + 0.2 * flow + head * 0.9);
  gl_FragColor = vec4(color, alpha);
}
`;

const out: number[] = [0];

/** Strategy → Design → Technology, drawn as one line of light the camera follows. */
export function ProcessPath() {
  const nodes = useRef<(Group | null)[]>([]);
  const halos = useRef<(Sprite | null)[]>([]);
  const numbers = useRef<(TextMesh | null)[]>([]);
  const words = useRef<(FitTextHandle | null)[]>([]);

  const { tube, material, marks, reveal } = useMemo(() => {
    const points = [
      new Vector3(0.6, -1.4, -244),
      ...PROCESS_NODES.map((p) => new Vector3(...p)),
      // Ends just past the last node, so the line never runs through the lens.
      new Vector3(-1.1, -0.5, -290.5),
    ];
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);

    // Where along the line (by arc length) each node sits.
    const samples = 600;
    const nodeMarks = PROCESS_NODES.map((node) => {
      const target = new Vector3(...node);
      let best = 0;
      let bestDistance = Infinity;
      for (let i = 0; i <= samples; i++) {
        const d = curve.getPointAt(i / samples).distanceToSquared(target);
        if (d < bestDistance) {
          bestDistance = d;
          best = i / samples;
        }
      }
      return best;
    });

    const track = createTrack(
      [
        4.9,
        ...nodeMarks.map((_, i) => stepAt(SCENE.process, i, COUNTS.process, 0.12)),
        stepAt(SCENE.process, 3, COUNTS.process, 0.3),
      ],
      [[0], ...nodeMarks.map((m) => [m]), [1]],
    );

    const mat = new ShaderMaterial({
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uColor: { value: new Color(PALETTE.bone) },
        uHead: { value: new Color(PALETTE.signal).multiplyScalar(2) },
      },
    });

    return {
      tube: new TubeGeometry(curve, runtime.lowPower ? 200 : 360, 0.016, 6, false),
      material: mat,
      marks: nodeMarks,
      reveal: track,
    };
  }, []);

  const haloMaterial = useMemo(
    () => ({
      map: glowTexture(),
      color: PALETTE.signal,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
    [],
  );

  useSceneFrame(4.8, 6.2, (u, state) => {
    const time = state.clock.elapsedTime;
    const live = motion();
    const progress = reveal.sample(u, out)[0];
    material.uniforms.uProgress.value = progress;
    material.uniforms.uTime.value = time * live;

    PROCESS_NODES.forEach((_, i) => {
      const lit = smoothstep(progress, marks[i] - 0.04, marks[i] + 0.01);
      const node = nodes.current[i];
      if (node) {
        node.scale.setScalar(0.45 + lit * 0.55);
        node.rotation.set(time * 0.25 * live + i, time * 0.35 * live, 0);
      }
      const halo = halos.current[i];
      if (halo) {
        halo.scale.setScalar(0.6 + lit * 2.4 + Math.sin(time * 1.4 + i) * 0.1 * live);
        halo.material.opacity = 0.15 + lit * 0.5;
      }
      const number = numbers.current[i];
      if (number) {
        number.strokeOpacity = lit * 0.5;
        number.position.y = PROCESS_NODES[i][1] + 0.55 - (1 - lit) * 0.6;
        number.visible = lit > 0.01;
      }
    });

    const arrive = smoothstep(
      u,
      stepAt(SCENE.process, 3, COUNTS.process, -0.15),
      stepAt(SCENE.process, 3, COUNTS.process, 0.3),
    );
    OUTCOME_WORDS.forEach((position, i) => {
      const handle = words.current[i];
      const mesh = handle?.mesh;
      if (!handle || !mesh) return;
      const staged = smoothstep(arrive, i * 0.22, 0.56 + i * 0.22);
      handle.fit(runtime.wide ? 5.8 : 4);
      mesh.position.set(
        position[0] * (runtime.wide ? 1 : 0.35),
        position[1] * (runtime.wide ? 1 : 1.5),
        position[2] - (1 - staged) * 6,
      );
      mesh.fillOpacity = staged;
      mesh.visible = staged > 0.01;
    });
  });

  return (
    <>
      <mesh geometry={tube} material={material} frustumCulled={false} />

      {PROCESS_NODES.map((position, i) => (
        <group key={i} position={position}>
          <group
            ref={(group) => {
              nodes.current[i] = group;
            }}
          >
            <mesh>
              <octahedronGeometry args={[0.36, 0]} />
              <meshStandardMaterial color="#d5d5dc" metalness={1} roughness={0.14} flatShading />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.72, 0.005, 6, 96]} />
              <meshBasicMaterial color={PALETTE.bone} transparent opacity={0.5} />
            </mesh>
            <mesh rotation-y={Math.PI / 2}>
              <torusGeometry args={[0.92, 0.004, 6, 96]} />
              <meshBasicMaterial color={PALETTE.signal} transparent opacity={0.7} toneMapped={false} />
            </mesh>
          </group>
          <sprite
            ref={(sprite) => {
              halos.current[i] = sprite;
            }}
          >
            <spriteMaterial {...haloMaterial} />
          </sprite>
        </group>
      ))}

      {PROCESS.steps.map((step, i) => (
        <Text
          key={step.number}
          ref={(mesh: TextMesh) => {
            numbers.current[i] = mesh;
          }}
          font={FONT_DISPLAY}
          fontSize={3}
          letterSpacing={-0.04}
          anchorX="center"
          anchorY="middle"
          position={[PROCESS_NODES[i][0] * 1.3, PROCESS_NODES[i][1] + 0.55, PROCESS_NODES[i][2] - 2.4]}
          fillOpacity={0}
          strokeWidth="0.9%"
          strokeColor={PALETTE.bone}
          strokeOpacity={0}
        >
          {step.number}
        </Text>
      ))}

      {PROCESS.outcome.map((word, i) => (
        <FitText
          key={word}
          ref={(handle) => {
            words.current[i] = handle;
          }}
          color={i === 0 ? PALETTE.signal : PALETTE.bone}
          fillOpacity={0}
        >
          {word}
        </FitText>
      ))}
    </>
  );
}
