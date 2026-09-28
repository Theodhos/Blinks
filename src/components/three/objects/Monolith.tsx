'use client';

import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { damp, seeded } from '@/lib/math';
import { runtime } from '@/lib/runtime';
import { PALETTE, type V3 } from '@/lib/world';
import { glowTexture, motion, useSceneFrame } from '../helpers';

const RADIUS = 1.7;

interface Shard {
  geometry: BufferGeometry;
  /** Resting centre of the shard. */
  home: Vector3;
  direction: Vector3;
  axis: Vector3;
  seed: number;
  spin: number;
}

let cache: Shard[] | null = null;

/**
 * Split an icosphere into solid wedges. Each wedge has a dark outer shell and
 * an inner face that glows, so light leaks through the seams when assembled
 * and the core is revealed when it breaks apart.
 */
function buildShards(): Shard[] {
  if (cache) return cache;
  const source = new IcosahedronGeometry(RADIUS, 1);
  const position = source.attributes.position;
  const shards: Shard[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const normal = new Vector3();

  for (let face = 0; face < position.count / 3; face++) {
    const corners = [0, 1, 2].map((i) => new Vector3().fromBufferAttribute(position, face * 3 + i));
    const centre = corners.reduce((sum, v) => sum.add(v), new Vector3()).divideScalar(3);
    const outer = corners.map((v) => v.clone().lerp(centre, 0.055));
    const inner = corners.map((v) => v.clone().lerp(centre, 0.32).multiplyScalar(0.76));
    const home = [...outer, ...inner].reduce((sum, v) => sum.add(v), new Vector3()).divideScalar(6);

    const shell: Vector3[][] = [[outer[0], outer[1], outer[2]]];
    for (let e = 0; e < 3; e++) {
      const n = (e + 1) % 3;
      shell.push([outer[e], inner[e], inner[n]], [outer[e], inner[n], outer[n]]);
    }
    const triangles = [...shell, [inner[2], inner[1], inner[0]]];

    const vertices: number[] = [];
    for (const tri of triangles) {
      // Make every face point away from the wedge centre.
      const mid = tri.reduce((sum, v) => sum.add(v), new Vector3()).divideScalar(3);
      normal.crossVectors(a.subVectors(tri[1], tri[0]), b.subVectors(tri[2], tri[0]));
      const ordered = normal.dot(mid.sub(home)) < 0 ? [tri[0], tri[2], tri[1]] : tri;
      for (const v of ordered) vertices.push(v.x - home.x, v.y - home.y, v.z - home.z);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.addGroup(0, shell.length * 3, 0);
    geometry.addGroup(shell.length * 3, 3, 1);

    const seed = seeded(face + 1);
    shards.push({
      geometry,
      home,
      direction: home.clone().normalize(),
      axis: new Vector3(seeded(face + 101) - 0.5, seeded(face + 202) - 0.5, seeded(face + 303) - 0.5).normalize(),
      seed,
      spin: seeded(face + 404) > 0.5 ? 1 : -1,
    });
  }

  source.dispose();
  cache = shards;
  return shards;
}

const yAxis = new Vector3(0, 1, 0);
const offset = new Vector3();
const twist = new Quaternion();

interface MonolithProps {
  position: V3;
  from: number;
  to: number;
  /** Returns how far apart the form is, 0 (whole) to 1 (scattered). */
  explode: (u: number) => number;
  scale?: number;
}

/** The studio's central form: a faceted dark-chrome body around a burning core. */
export function Monolith({ position, from, to, explode, scale = 1 }: MonolithProps) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const halo = useRef<Sprite>(null);
  const spread = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });

  const { shards, meshes, materials } = useMemo(() => {
    const dark = new MeshStandardMaterial({ color: '#34343a', metalness: 1, roughness: 0.2 });
    const bright = new MeshStandardMaterial({ color: '#d5d5dc', metalness: 1, roughness: 0.1 });
    // Lit by the core itself, so each inner face carries a gradient, not a flat fill.
    const ember = new MeshStandardMaterial({
      color: '#c2410c',
      emissive: new Color(PALETTE.signal),
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.3,
    });
    const built = buildShards();
    const list = built.map((shard) => {
      const mesh = new Mesh(shard.geometry, [shard.seed > 0.84 ? bright : dark, ember]);
      mesh.position.copy(shard.home);
      return mesh;
    });
    return { shards: built, meshes: list, materials: { dark, bright, ember } };
  }, []);

  // White-hot at the centre, falling to the signal colour at the limb.
  const coreMaterial = useMemo(
    () =>
      new ShaderMaterial({
        toneMapped: false,
        uniforms: {
          uHot: { value: new Color('#ffc98a') },
          uWarm: { value: new Color('#ff6a14') },
          uEdge: { value: new Color(PALETTE.signal) },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vLocal;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            vLocal = position;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uHot;
          uniform vec3 uWarm;
          uniform vec3 uEdge;
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vLocal;
          void main() {
            float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
            float flicker = 0.5 + 0.5 * sin(vLocal.y * 9.0 + uTime * 1.7) * sin(vLocal.x * 7.0 - uTime * 1.1);
            vec3 color = mix(uEdge, uWarm, smoothstep(0.0, 0.55, facing));
            color = mix(color, uHot, smoothstep(0.62, 1.0, facing) * (0.75 + 0.25 * flicker));
            gl_FragColor = vec4(color, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );
  const haloMaterial = useMemo(
    () =>
      new SpriteMaterial({
        map: glowTexture(),
        color: PALETTE.signal,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );
  const ringMaterial = useMemo(
    () => new MeshBasicMaterial({ color: PALETTE.bone, transparent: true, opacity: 0.35 }),
    [],
  );

  useSceneFrame(from, to, (u, state, dt) => {
    const time = state.clock.elapsedTime;
    const live = motion();
    const breathing = (Math.sin(time * 0.9) * 0.5 + 0.5) * 0.025 * live;
    const target = Math.min(1, explode(u) + breathing + runtime.pulse * 0.1);
    spread.current += (target - spread.current) * damp(7, dt);
    const e = spread.current;

    for (let i = 0; i < meshes.length; i++) {
      const shard = shards[i];
      const mesh = meshes[i];
      const reach = e * (0.7 + shard.seed * 2.9) * RADIUS;
      offset.copy(shard.direction).multiplyScalar(reach).add(shard.home);
      offset.applyAxisAngle(yAxis, e * (shard.seed - 0.5) * 1.6);
      mesh.position.copy(offset);
      const angle = e * (1.6 + shard.seed * 4) * shard.spin + time * 0.12 * e * shard.spin * live;
      mesh.quaternion.setFromAxisAngle(shard.axis, angle);
    }

    if (body.current) {
      const t = tilt.current;
      t.x += (runtime.pointer.y * -0.18 - t.x) * damp(3, dt);
      t.y += (runtime.pointer.x * 0.28 - t.y) * damp(3, dt);
      twist.setFromAxisAngle(yAxis, time * 0.07 * live + u * 1.3 + t.y);
      body.current.quaternion.copy(twist);
      body.current.rotateX(Math.sin(time * 0.11) * 0.08 * live + t.x);
    }

    if (rings.current) {
      rings.current.rotation.set(time * 0.05 * live + u * 0.4, time * 0.08 * live, 0.5 + u * 0.6);
      rings.current.scale.setScalar(1 + e * 1.1);
      ringMaterial.opacity = 0.35 - e * 0.15;
    }

    if (halo.current) {
      const glow = 5.5 + e * 3 + Math.sin(time * 1.3) * 0.25 * live + runtime.pulse * 1.5;
      halo.current.scale.setScalar(glow);
      haloMaterial.opacity = 0.4 + e * 0.35 + runtime.pulse * 0.2;
    }
    materials.ember.emissiveIntensity = 0.3 + e * 0.25 + runtime.pulse * 0.6;
    coreMaterial.uniforms.uTime.value = time * live;
  });

  return (
    <group ref={root} position={position} scale={scale}>
      <group ref={body}>
        {meshes.map((mesh, i) => (
          <primitive key={i} object={mesh} />
        ))}
      </group>
      <mesh material={coreMaterial}>
        <icosahedronGeometry args={[0.5, 3]} />
      </mesh>
      <sprite ref={halo} material={haloMaterial} scale={5.5} />
      <group ref={rings}>
        <mesh material={ringMaterial} rotation-x={Math.PI / 2}>
          <torusGeometry args={[2.75, 0.006, 6, 160]} />
        </mesh>
        <mesh material={ringMaterial} rotation-y={Math.PI / 2.6}>
          <torusGeometry args={[3.15, 0.004, 6, 160]} />
        </mesh>
      </group>
    </group>
  );
}
