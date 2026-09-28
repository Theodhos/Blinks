'use client';

import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { SERVICES } from '@/data/agency';
import { SCENE, stepAt } from '@/lib/journey';
import { damp, plateau, seeded } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { COUNTS, PALETTE, servicePosition } from '@/lib/world';
import { motion, useSceneFrame } from '../helpers';
import { simplexNoise } from '../shaders/noise';

const FROM = 1.8;
const TO = 3.15;

/** How dominant a service is: 1 while its step is active, easing to 0 either side. */
const presence = (u: number, i: number) =>
  plateau(
    u,
    stepAt(SCENE.services, i, COUNTS.services, -0.12),
    stepAt(SCENE.services, i, COUNTS.services, 0.18),
    stepAt(SCENE.services, i, COUNTS.services, 0.9),
    stepAt(SCENE.services, i, COUNTS.services, 1.35),
  );

/** Forms condense out of nothing as the camera travels toward them. */
const emerge = (root: Group | null, energy: number, base: number, gain: number) => {
  if (!root) return;
  root.visible = energy > 0.002;
  root.scale.setScalar((base + energy * gain) * (0.35 + 0.65 * Math.min(1, energy * 1.6)));
};

/* -------------------------------------------------------------------------- */
/* 01 — A.I. & Intelligent Automation: a network that thinks                   */
/* -------------------------------------------------------------------------- */

const latticeVertex = /* glsl */ `
attribute float aAlong;
attribute float aSeed;
varying float vAlong;
varying float vSeed;
void main() {
  vAlong = aAlong;
  vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const latticeFragment = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec3 uBase;
uniform vec3 uPulse;
varying float vAlong;
varying float vSeed;
void main() {
  float head = fract(uTime * (0.16 + vSeed * 0.22) + vSeed * 7.0);
  float pulse = smoothstep(0.16, 0.0, abs(vAlong - head));
  vec3 color = mix(uBase, uPulse, pulse);
  float alpha = 0.1 + 0.16 * uEnergy + pulse * (0.35 + 0.65 * uEnergy);
  gl_FragColor = vec4(color, alpha);
}
`;

function NeuralLattice({ index }: { index: number }) {
  const root = useRef<Group>(null);
  const nodes = useRef<InstancedMesh>(null);
  const energy = useRef(0);

  const { points, lines, material } = useMemo(() => {
    const list: Vector3[] = [];
    const outer = runtime.lowPower ? 60 : 96;
    for (let i = 0; i < outer; i++) {
      const y = 1 - (i / (outer - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * 2.399963;
      const jitter = 1.25 + (seeded(i + 11) - 0.5) * 0.3;
      list.push(new Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(jitter));
    }
    for (let i = 0; i < 16; i++) {
      list.push(
        new Vector3(seeded(i + 500) - 0.5, seeded(i + 600) - 0.5, seeded(i + 700) - 0.5)
          .normalize()
          .multiplyScalar(0.45 + seeded(i + 800) * 0.3),
      );
    }

    const seen = new Set<string>();
    const positions: number[] = [];
    const along: number[] = [];
    const seeds: number[] = [];
    list.forEach((point, i) => {
      const nearest = list
        .map((other, j) => ({ j, d: i === j ? Infinity : point.distanceToSquared(other) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of nearest) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const seed = seeded(seen.size + 31);
        positions.push(point.x, point.y, point.z, list[j].x, list[j].y, list[j].z);
        along.push(0, 1);
        seeds.push(seed, seed);
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aAlong', new Float32BufferAttribute(along, 1));
    geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));

    const mat = new ShaderMaterial({
      vertexShader: latticeVertex,
      fragmentShader: latticeFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0 },
        uBase: { value: new Color(SERVICES[index].color) },
        uPulse: { value: new Color(PALETTE.signal) },
      },
    });

    return { points: list, lines: new LineSegments(geometry, mat), material: mat };
  }, [index]);

  const setNodes = (mesh: InstancedMesh | null) => {
    nodes.current = mesh;
    if (!mesh) return;
    const dummy = new Object3D();
    points.forEach((point, i) => {
      dummy.position.copy(point);
      dummy.scale.setScalar(0.6 + seeded(i + 77) * 0.9);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useSceneFrame(FROM, TO, (u, state, dt) => {
    const w = presence(u, index);
    energy.current += (w - energy.current) * damp(5, dt);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uEnergy.value = energy.current;
    if (root.current) {
      const time = state.clock.elapsedTime * motion();
      root.current.rotation.set(Math.sin(time * 0.2) * 0.2, time * 0.12 + u * 2, 0);
    }
    emerge(root.current, energy.current, 0.8, 0.25);
  });

  return (
    <group ref={root}>
      <primitive object={lines} />
      <instancedMesh ref={setNodes} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshBasicMaterial color={PALETTE.bone} toneMapped={false} />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#d5d5dc" metalness={1} roughness={0.12} flatShading />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* 02 — Creative Development & WebGL: liquid chrome, shaped by a shader        */
/* -------------------------------------------------------------------------- */

function LiquidChrome({ index }: { index: number }) {
  const root = useRef<Group>(null);
  const energy = useRef(0);

  const { geometry, material, uniforms } = useMemo(() => {
    const detail = runtime.lowPower ? 72 : 128;
    const shared = { uTime: { value: 0 }, uAmp: { value: 0.6 } };
    const mat = new MeshStandardMaterial({ color: '#e9e9ee', metalness: 1, roughness: 0.07 });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shared.uTime;
      shader.uniforms.uAmp = shared.uAmp;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          /* glsl */ `#include <common>
          uniform float uTime;
          uniform float uAmp;
          ${simplexNoise}
          vec3 liquid(vec3 p) {
            vec3 n = normalize(p);
            float d = snoise(n * 0.95 + uTime * 0.22) * 0.3 + snoise(n * 2.1 - uTime * 0.17) * 0.05;
            return p + n * d * uAmp;
          }`,
        )
        .replace(
          '#include <beginnormal_vertex>',
          /* glsl */ `
          vec3 liquidAxis = abs(normal.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
          vec3 liquidT = normalize(cross(normal, liquidAxis));
          vec3 liquidB = normalize(cross(normal, liquidT));
          float liquidR = length(position);
          vec3 liquidP = liquid(position);
          vec3 liquidPT = liquid(normalize(position + liquidT * 0.03) * liquidR);
          vec3 liquidPB = liquid(normalize(position + liquidB * 0.03) * liquidR);
          vec3 objectNormal = normalize(cross(liquidPT - liquidP, liquidPB - liquidP));
          if (dot(objectNormal, normal) < 0.0) objectNormal = -objectNormal;
          `,
        )
        .replace('#include <begin_vertex>', 'vec3 transformed = liquidP;');
    };
    return { geometry: new SphereGeometry(1.12, detail, detail), material: mat, uniforms: shared };
  }, []);

  useSceneFrame(FROM, TO, (u, state, dt) => {
    const w = presence(u, index);
    energy.current += (w - energy.current) * damp(5, dt);
    uniforms.uTime.value = state.clock.elapsedTime * (0.6 + energy.current * 0.6) * motion();
    uniforms.uAmp.value = 0.5 + energy.current * 0.4;
    if (root.current) {
      root.current.rotation.y = state.clock.elapsedTime * 0.1 * motion() + u * 1.5;
    }
    emerge(root.current, energy.current, 0.82, 0.22);
  });

  return (
    <group ref={root}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 — Digital Product & Interface Design: an interface, layer by layer       */
/* -------------------------------------------------------------------------- */

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: 'bone' | 'accent' | 'signal' | 'faint';
}

const LAYERS: Block[][] = [
  // Grid
  Array.from({ length: 6 }, (_, i) => ({ x: -0.875 + i * 0.35, y: 0, w: 0.012, h: 1.3, tone: 'faint' as const })),
  // Structure
  [
    { x: -0.62, y: 0.12, w: 0.8, h: 0.78, tone: 'faint' },
    { x: 0.44, y: 0.31, w: 1.06, h: 0.4, tone: 'faint' },
    { x: 0.44, y: -0.1, w: 1.06, h: 0.34, tone: 'faint' },
  ],
  // Content
  [
    { x: -0.62, y: 0.12, w: 0.62, h: 0.6, tone: 'accent' },
    { x: 0.2, y: 0.4, w: 0.5, h: 0.05, tone: 'bone' },
    { x: 0.34, y: 0.28, w: 0.78, h: 0.03, tone: 'bone' },
    { x: 0.27, y: 0.2, w: 0.64, h: 0.03, tone: 'bone' },
    { x: 0.2, y: -0.06, w: 0.5, h: 0.03, tone: 'bone' },
    { x: 0.3, y: -0.14, w: 0.7, h: 0.03, tone: 'bone' },
  ],
  // Action
  [
    { x: -0.72, y: -0.46, w: 0.42, h: 0.13, tone: 'signal' },
    { x: 0.82, y: 0.58, w: 0.16, h: 0.05, tone: 'bone' },
    { x: -0.86, y: 0.58, w: 0.22, h: 0.05, tone: 'bone' },
  ],
];

function InterfaceLayers({ index }: { index: number }) {
  const root = useRef<Group>(null);
  const layers = useRef<(Group | null)[]>([]);
  const energy = useRef(0);

  const assets = useMemo(() => {
    const accent = new Color(SERVICES[index].color);
    const pane = new PlaneGeometry(2.3, 1.5);
    return {
      pane,
      edges: new EdgesGeometry(pane),
      unit: new PlaneGeometry(1, 1),
      glass: new MeshStandardMaterial({
        color: accent,
        metalness: 0.6,
        roughness: 0.15,
        transparent: true,
        opacity: 0.07,
        side: DoubleSide,
        depthWrite: false,
      }),
      outline: new LineBasicMaterial({ color: PALETTE.bone, transparent: true, opacity: 0.55 }),
      tones: {
        bone: new MeshBasicMaterial({ color: PALETTE.bone, side: DoubleSide, transparent: true, opacity: 0.85 }),
        accent: new MeshBasicMaterial({ color: accent, side: DoubleSide, transparent: true, opacity: 0.55 }),
        signal: new MeshBasicMaterial({ color: PALETTE.signal, side: DoubleSide, toneMapped: false }),
        faint: new MeshBasicMaterial({ color: PALETTE.bone, side: DoubleSide, transparent: true, opacity: 0.1 }),
      },
    };
  }, [index]);

  useSceneFrame(FROM, TO, (u, state, dt) => {
    const w = presence(u, index);
    energy.current += (w - energy.current) * damp(5, dt);
    const time = state.clock.elapsedTime * motion();
    const gap = 0.12 + energy.current * 0.34;
    layers.current.forEach((layer, i) => {
      if (!layer) return;
      layer.position.z = (i - (LAYERS.length - 1) / 2) * gap;
      layer.position.y = Math.sin(time * 0.7 + i * 0.9) * 0.025;
    });
    if (root.current) {
      root.current.rotation.set(-0.42, 0.62 + Math.sin(time * 0.25) * 0.12 + (u - 2.5) * 0.8, 0.12);
    }
    emerge(root.current, energy.current, 0.9, 0.25);
  });

  return (
    <group ref={root}>
      {LAYERS.map((blocks, i) => (
        <group
          key={i}
          ref={(group) => {
            layers.current[i] = group;
          }}
        >
          <mesh geometry={assets.pane} material={assets.glass} />
          <lineSegments geometry={assets.edges} material={assets.outline} />
          {blocks.map((block, j) => (
            <mesh
              key={j}
              geometry={assets.unit}
              material={assets.tones[block.tone]}
              position={[block.x, block.y, 0.004]}
              scale={[block.w, block.h, 1]}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 — Kinetic Brand Systems: an identity that is always in motion            */
/* -------------------------------------------------------------------------- */

const AXES = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
const SPACING = 0.62;

function KineticCube({ index }: { index: number }) {
  const root = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const energy = useRef(0);

  const state = useMemo(() => {
    const cells: { position: Vector3; rotation: Quaternion }[] = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) cells.push({ position: new Vector3(x, y, z), rotation: new Quaternion() });
    return {
      cells,
      move: { axis: 0, layer: 0, direction: 1, progress: 1, rest: 0.4, count: 0 },
      geometry: new BoxGeometry(0.56, 0.56, 0.56),
    };
  }, []);

  // Same language as the monolith: dark metal outside, light held within.
  // The glow only escapes through the seams, and flares as a layer turns.
  const materials = useMemo(
    () => ({
      shell: new MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.2 }),
      light: new MeshBasicMaterial({
        color: new Color(SERVICES[index].color).multiplyScalar(1.6),
        toneMapped: false,
      }),
    }),
    [index],
  );

  const setMesh = (instance: InstancedMesh | null) => {
    mesh.current = instance;
    if (!instance) return;
    const tone = new Color();
    state.cells.forEach((_, i) => {
      instance.setColorAt(i, tone.set(seeded(i + 13) > 0.8 ? '#d5d5dc' : '#4a4a52'));
    });
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  };

  const helpers = useMemo(
    () => ({ matrix: new Matrix4(), turn: new Quaternion(), position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) }),
    [],
  );

  useSceneFrame(FROM, TO, (u, frame, dt) => {
    const w = presence(u, index);
    energy.current += (w - energy.current) * damp(5, dt);
    const { cells, move } = state;
    const live = motion();

    if (move.progress >= 1) {
      move.rest -= dt * live;
      if (move.rest <= 0) {
        move.count += 1;
        move.axis = Math.floor(seeded(move.count * 3.1) * 3);
        move.layer = Math.floor(seeded(move.count * 5.7) * 3) - 1;
        move.direction = seeded(move.count * 7.3) > 0.5 ? 1 : -1;
        move.progress = 0;
      }
    } else {
      move.progress = Math.min(1, move.progress + dt * (0.9 + energy.current * 0.9) * live);
      if (move.progress >= 1) {
        const axis = AXES[move.axis];
        helpers.turn.setFromAxisAngle(axis, (Math.PI / 2) * move.direction);
        for (const cell of cells) {
          if (Math.round(cell.position.getComponent(move.axis)) !== move.layer) continue;
          cell.position.applyQuaternion(helpers.turn).round();
          cell.rotation.premultiply(helpers.turn);
        }
        move.rest = 0.35;
      }
    }

    if (mesh.current) {
      const t = move.progress;
      const eased = t < 1 ? t * t * (3 - 2 * t) : 0;
      helpers.turn.setFromAxisAngle(AXES[move.axis], (Math.PI / 2) * move.direction * eased);
      cells.forEach((cell, i) => {
        helpers.position.copy(cell.position).multiplyScalar(SPACING);
        helpers.rotation.copy(cell.rotation);
        if (eased > 0 && Math.round(cell.position.getComponent(move.axis)) === move.layer) {
          helpers.position.applyQuaternion(helpers.turn);
          helpers.rotation.premultiply(helpers.turn);
        }
        helpers.matrix.compose(helpers.position, helpers.rotation, helpers.scale);
        mesh.current!.setMatrixAt(i, helpers.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }

    if (root.current) {
      const time = frame.clock.elapsedTime * live;
      root.current.rotation.set(0.5 + Math.sin(time * 0.2) * 0.1, time * 0.14 + u * 1.6, 0.2);
    }
    emerge(root.current, energy.current, 0.85, 0.22);
  });

  return (
    <group ref={root}>
      <instancedMesh ref={setMesh} args={[state.geometry, materials.shell, state.cells.length]} />
      <mesh material={materials.light}>
        <boxGeometry args={[1.72, 1.72, 1.72]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */

const FORMS = [NeuralLattice, LiquidChrome, InterfaceLayers, KineticCube];

/** Four disciplines, one material language, each with a form of its own. */
export function ServiceObjects() {
  return (
    <>
      {FORMS.map((Form, i) => (
        <group key={i} position={servicePosition(i)}>
          <Form index={i} />
        </group>
      ))}
    </>
  );
}
