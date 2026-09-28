import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { addScrollListener, ScrollEventData } from '../../lib/lenis';
import { SoundEngine } from '../../lib/audio';

interface CinematicWorld3DProps {
  onProgressUpdate?: (progress: number, waypointIndex: number) => void;
}

// 4 Cinematic Waypoints specifically tuned for Sections 1, 2, and 3
// Below Section 3 (progress > 0.42), the 3D landscape descends into the abyss and fades out completely.
interface Waypoint {
  progress: number;
  camPos: [number, number, number];
  camLookAt: [number, number, number];
  monolithPos: [number, number, number];
  monolithRot: [number, number, number];
  shardSpread: number;
  ringsTilt: [number, number, number];
  lightColor: number;
  rimColor: number;
  ambientIntensity: number;
}

const WAYPOINTS: Waypoint[] = [
  // 00. Section 1: Hero - Trionn Prismatic Knot with Amber Rim
  {
    progress: 0.0,
    camPos: [0, 0, 8.2],
    camLookAt: [0.15, 0.0, 0],
    monolithPos: [0.65, 0.05, 0],
    monolithRot: [0.12, 0.35, 0.04],
    shardSpread: 0.06,
    ringsTilt: [0.3, 0.4, 0],
    lightColor: 0xffffff,
    rimColor: 0xff7722, // Warm Amber Rim Light
    ambientIntensity: 0.95,
  },
  // 01. Smooth Transition to Section 2 (About)
  {
    progress: 0.06,
    camPos: [0.3, 0.1, 7.6],
    camLookAt: [0.2, -0.1, 0],
    monolithPos: [0.35, -0.15, 0],
    monolithRot: [0.2, 0.7, -0.05],
    shardSpread: 0.25,
    ringsTilt: [0.4, 0.6, 0.1],
    lightColor: 0xffffff,
    rimColor: 0xff8833,
    ambientIntensity: 0.95,
  },
  // 02. Section 2: About (Photo 2) - Monolith glides behind 3 lines of statement
  {
    progress: 0.13,
    camPos: [0.0, 0.0, 7.2],
    camLookAt: [0.0, -0.2, 0],
    monolithPos: [0.0, -0.3, 0],
    monolithRot: [0.25, 1.6, 0.08],
    shardSpread: 0.65, // Wireframe/spread allows text legibility
    ringsTilt: [0.8, 0.5, 0.3],
    lightColor: 0xffffff,
    rimColor: 0xffaa44,
    ambientIntensity: 0.9,
  },
  // 03. Section 3: Infinite Marquee (Photo 3) - Monolith MERGES completely in the center
  {
    progress: 0.22,
    camPos: [0.0, -0.8, 6.8],
    camLookAt: [0.0, -0.8, 0],
    monolithPos: [0.0, -0.8, 0], // Perfectly centered in marquee
    monolithRot: [0.0, 3.14159, 0.0], // Facing camera directly as in Photo 3
    shardSpread: 0.0, // Fully merged, solid metallic emblem ("bashkimi i objektit 3d")
    ringsTilt: [1.57, 0, 0],
    lightColor: 0xffffff,
    rimColor: 0xff6600,
    ambientIntensity: 1.1,
  },
  // 04. Transition into Key Facts & Lower Sections
  {
    progress: 0.32,
    camPos: [-0.6, -1.8, 6.2],
    camLookAt: [0, -2.2, 0],
    monolithPos: [0, -3.2, 0],
    monolithRot: [-0.25, 4.2, 0.15],
    shardSpread: 0.3,
    ringsTilt: [1.57, 0, 0],
    lightColor: 0xe0f2fe,
    rimColor: 0x00f0ff,
    ambientIntensity: 1.0,
  },
  // 05. Final Plunge: Past Section 3/Facts, descends into the abyss
  {
    progress: 0.42,
    camPos: [0, -2.0, 6.5],
    camLookAt: [0, -5.0, 0],
    monolithPos: [0, -16.0, 0],
    monolithRot: [0, 5.0, 0],
    shardSpread: 0.0,
    ringsTilt: [1.57, 0, 0],
    lightColor: 0x000000,
    rimColor: 0x000000,
    ambientIntensity: 0.0,
  },
];

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function lerpVec3(
  out: THREE.Vector3,
  a: [number, number, number],
  b: [number, number, number],
  t: number
) {
  out.x = a[0] + (b[0] - a[0]) * t;
  out.y = a[1] + (b[1] - a[1]) * t;
  out.z = a[2] + (b[2] - a[2]) * t;
}

export const CinematicWorld3D: React.FC<CinematicWorld3DProps> = ({ onProgressUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashOverlayRef = useRef<HTMLDivElement>(null);

  const scrollProgressRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseLerpRef = useRef({ x: 0, y: 0 });
  const pulseEnergyRef = useRef(0);

  // Lightning system state
  const lightningActiveRef = useRef(false);
  const lightningTimerRef = useRef(0);
  const lightningStrobeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup with Universal Space Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060c, 0.026);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    camera.position.set(0, 0, 8.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    container.appendChild(renderer.domElement);

    // 2. Cosmic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x16162a, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(6, 9, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 4.0);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    const cosmicFill = new THREE.PointLight(0x6366f1, 2.0, 22);
    cosmicFill.position.set(3, -4, 4);
    scene.add(cosmicFill);

    // Lightning Flash Point Light (ultra bright strobe)
    const lightningLight = new THREE.PointLight(0xa5f3fc, 0, 50);
    lightningLight.position.set(1.6, 2.5, 2.0);
    scene.add(lightningLight);

    // 3. Cosmic Universal Landscape Environment
    const cosmicEnvGroup = new THREE.Group();
    scene.add(cosmicEnvGroup);

    // 3A. Celestial Orbital Horizon Ring (planetary curvature / cosmic atmosphere)
    const horizonGeo = new THREE.RingGeometry(22, 34, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.rotation.x = Math.PI * 0.46;
    horizonMesh.position.set(0, -9, -15);
    cosmicEnvGroup.add(horizonMesh);

    // Secondary deep purple cosmic ring
    const horizonInnerGeo = new THREE.RingGeometry(18, 22, 64);
    const horizonInnerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const horizonInnerMesh = new THREE.Mesh(horizonInnerGeo, horizonInnerMat);
    horizonInnerMesh.rotation.x = Math.PI * 0.46;
    horizonInnerMesh.position.set(0, -9.1, -15);
    cosmicEnvGroup.add(horizonInnerMesh);

    // 3B. Multi-spectral Deep Space Starfield (2,400 twinkling cosmic stars)
    const starCount = 2400;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);

    const palette = [
      new THREE.Color(0xdbeafe), // Icy celestial white-blue
      new THREE.Color(0x38bdf8), // Electric cyan
      new THREE.Color(0xa855f7), // Cosmic violet
      new THREE.Color(0xfde047), // Distant stellar gold
      new THREE.Color(0xffffff), // Pure white
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 65;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 15;

      const col = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3 + 0] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;

      starScales[i] = Math.random() * 0.8 + 0.2;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('scale', new THREE.BufferAttribute(starScales, 1));

    const starMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    cosmicEnvGroup.add(starField);

    // 3C. Volumetric Cosmic Nebula Dust Particles (650 glowing dust nodes)
    const nebulaCount = 650;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      nebulaPositions[i * 3 + 0] = (Math.random() - 0.5) * 35;
      nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      nebulaPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
    }
    const nebulaGeo = new THREE.BufferGeometry();
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.16,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const nebulaField = new THREE.Points(nebulaGeo, nebulaMat);
    cosmicEnvGroup.add(nebulaField);

    // 4. The Artifact: Trionn 3-Arm Prismatic Knot & Celestial Shards
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Knot Group containing the 3 interlocking beveled arms
    const knotGroup = new THREE.Group();
    masterGroup.add(knotGroup);

    // Warm Amber directional and point lighting catching the beveled chamfers
    const amberRimLight = new THREE.DirectionalLight(0xff7722, 4.8);
    amberRimLight.position.set(-6, -3, 3);
    scene.add(amberRimLight);

    const warmPointLight = new THREE.PointLight(0xff8833, 3.5, 14);
    warmPointLight.position.set(0.6, 0.2, 2.5);
    scene.add(warmPointLight);

    // 3D Perspective Lines ("DARE TO TOUCH THE LINES")
    const perspectiveLinesGroup = new THREE.Group();
    scene.add(perspectiveLinesGroup);

    const linePoints: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(-14, 7, -3), new THREE.Vector3(14, -5, 2)],
      [new THREE.Vector3(-12, -6, -2), new THREE.Vector3(12, 6, 1)],
      [new THREE.Vector3(-9, 9, -4), new THREE.Vector3(15, -3, -1)],
      [new THREE.Vector3(-16, 1, -2), new THREE.Vector3(14, 4, 3)],
      [new THREE.Vector3(-7, -8, -1), new THREE.Vector3(9, 8, 2)],
      [new THREE.Vector3(-13, 5, -5), new THREE.Vector3(11, -7, 0)],
      [new THREE.Vector3(-6, 10, -2), new THREE.Vector3(10, -9, 1)],
      [new THREE.Vector3(-15, -4, -3), new THREE.Vector3(16, 3, -2)],
    ];

    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
    });

    const amberLinesMaterial = new THREE.LineBasicMaterial({
      color: 0xff7722,
      transparent: true,
      opacity: 0.35,
    });

    linePoints.forEach((pts, i) => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, i % 2 === 0 ? amberLinesMaterial : linesMaterial);
      perspectiveLinesGroup.add(line);
    });

    // Dark obsidian titanium metallic material
    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: 0x141418,
      metalness: 0.94,
      roughness: 0.18,
      envMapIntensity: 2.5,
    });

    const conduitEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x060201,
      emissive: 0xff7722,
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Construct 1 beveled angular arm for the Trionn triangular knot
    const createTrionnArm = () => {
      const arm = new THREE.Group();
      const shape = new THREE.Shape();
      // Angular chevron arm profile
      shape.moveTo(-1.25, -0.36);
      shape.lineTo(0.75, -0.36);
      shape.lineTo(1.65, 1.20);
      shape.lineTo(1.15, 1.48);
      shape.lineTo(0.38, 0.16);
      shape.lineTo(-1.25, 0.16);
      shape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: 0.42,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.08,
        bevelOffset: 0,
        bevelSegments: 3,
      };

      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();

      const mesh = new THREE.Mesh(geo, titaniumMaterial);
      arm.add(mesh);

      // Warm amber glowing edge lines (as seen in the screenshot)
      const edgesGeo = new THREE.EdgesGeometry(geo, 22);
      const edgesMat = new THREE.LineBasicMaterial({
        color: 0xff8833,
        transparent: true,
        opacity: 0.85,
      });
      const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
      arm.add(edgeLines);

      // Inner glowing conduit strip
      const stripGeo = new THREE.BoxGeometry(1.6, 0.04, 0.44);
      const strip = new THREE.Mesh(stripGeo, conduitEmissiveMat);
      strip.position.set(-0.15, -0.1, 0);
      arm.add(strip);

      return arm;
    };

    const arm0 = createTrionnArm();
    const arm1 = createTrionnArm();
    const arm2 = createTrionnArm();

    const baseArmRadius = 0.58;
    const armAngle0 = 0;
    const armAngle1 = (2 * Math.PI) / 3;
    const armAngle2 = (4 * Math.PI) / 3;

    // Left, Right and Top Wing sub-groups for dynamic physical splitting & re-merging
    const leftWingGroup = new THREE.Group();
    const rightWingGroup = new THREE.Group();
    const topArmGroup = new THREE.Group();

    knotGroup.add(leftWingGroup);
    knotGroup.add(rightWingGroup);
    knotGroup.add(topArmGroup);

    arm0.position.set(Math.cos(armAngle0) * baseArmRadius, Math.sin(armAngle0) * baseArmRadius, 0.12);
    arm0.rotation.z = armAngle0;

    arm1.position.set(Math.cos(armAngle1) * baseArmRadius, Math.sin(armAngle1) * baseArmRadius, 0.0);
    arm1.rotation.z = armAngle1;

    arm2.position.set(Math.cos(armAngle2) * baseArmRadius, Math.sin(armAngle2) * baseArmRadius, -0.12);
    arm2.rotation.z = armAngle2;

    // Attach each arm directly to its respective kinetic wing group
    rightWingGroup.add(arm0);
    leftWingGroup.add(arm1);
    topArmGroup.add(arm2);

    // Warm Golden Faceted Cubes/Polyhedra (matching Photo 2 assembled centerpiece)
    const goldCubeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x92400e,
      emissiveIntensity: 0.35,
      metalness: 0.8,
      roughness: 0.22,
      envMapIntensity: 2.2,
    });
    const goldCubeEdgesMat = new THREE.LineBasicMaterial({
      color: 0x18181b,
      linewidth: 2,
    });

    const createGoldenBlock = (w: number, h: number, d: number) => {
      const gGroup = new THREE.Group();
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, goldCubeMat);
      gGroup.add(mesh);
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeLines = new THREE.LineSegments(edgeGeo, goldCubeEdgesMat);
      gGroup.add(edgeLines);
      return gGroup;
    };

    // Golden companion blocks clustered near the arms as shown in Photo 2
    const goldBlockL = createGoldenBlock(0.65, 0.65, 0.65);
    goldBlockL.position.set(-1.15, 0.85, 0.35);
    goldBlockL.rotation.set(0.3, 0.5, 0.2);
    leftWingGroup.add(goldBlockL);

    const goldBlockR = createGoldenBlock(0.6, 0.6, 0.6);
    goldBlockR.position.set(1.05, -0.7, 0.28);
    goldBlockR.rotation.set(-0.2, 0.4, -0.3);
    rightWingGroup.add(goldBlockR);

    const goldBlockT = createGoldenBlock(0.72, 0.72, 0.72);
    goldBlockT.position.set(0.15, 1.35, -0.2);
    goldBlockT.rotation.set(0.4, -0.3, 0.5);
    topArmGroup.add(goldBlockT);

    // 5. Kinetic Orbiting Crystalline Shards
    interface ShardInfo {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      explodeVec: THREE.Vector3;
      rotSpeed: THREE.Vector3;
    }

    const shards: ShardInfo[] = [];
    const shardGeos = [
      new THREE.OctahedronGeometry(0.75, 0),
      new THREE.TetrahedronGeometry(0.85, 0),
      new THREE.ConeGeometry(0.5, 1.4, 4),
      new THREE.CylinderGeometry(0.2, 0.5, 1.6, 5),
      new THREE.BoxGeometry(0.6, 1.2, 0.6),
      new THREE.IcosahedronGeometry(0.65, 0),
    ];

    const shardPositions: [number, number, number, number, number, number][] = [
      [0.9, 0.8, 0.4, 2.2, 1.6, 1.2],
      [-0.9, 0.8, -0.4, -2.2, 1.6, -1.2],
      [1.1, -0.6, -0.3, 2.4, -1.4, -1.0],
      [-1.1, -0.6, 0.3, -2.4, -1.4, 1.0],
      [0, 1.8, 0.2, 0, 3.2, 0.8],
      [0, -1.8, -0.2, 0, -3.2, -0.8],
      [1.3, 0.1, 0.7, 3.0, 0.3, 1.8],
      [-1.3, 0.1, -0.7, -3.0, 0.3, -1.8],
      [0.6, -1.2, 0.8, 1.5, -2.6, 2.0],
      [-0.6, 1.2, -0.8, -1.5, 2.6, -2.0],
      [0.8, 1.4, -0.6, 2.0, 2.8, -1.6],
      [-0.8, -1.4, 0.6, -2.0, -2.8, 1.6],
    ];

    shardPositions.forEach((pos, idx) => {
      const geo = shardGeos[idx % shardGeos.length];
      const mat = idx % 3 === 0 ? conduitEmissiveMat : titaniumMaterial;
      const mesh = new THREE.Mesh(geo, mat);

      const basePos = new THREE.Vector3(pos[0], pos[1], pos[2]);
      const explodeVec = new THREE.Vector3(pos[3], pos[4], pos[5]);
      mesh.position.copy(basePos);

      // Fine wireframe edges
      const wireGeo = new THREE.WireframeGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: idx % 3 === 0 ? 0x00f0ff : 0x4a4a58,
        transparent: true,
        opacity: 0.4,
      });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wire);

      // Shards distributed to Left and Right wings
      if (pos[0] < 0) {
        leftWingGroup.add(mesh);
      } else {
        rightWingGroup.add(mesh);
      }

      shards.push({
        mesh,
        basePos,
        explodeVec,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      });
    });

    // 6. Dual Concentric Gyroscopic Halo Rings
    const ringsGroup = new THREE.Group();
    masterGroup.add(ringsGroup);

    const outerRingGeo = new THREE.TorusGeometry(2.6, 0.038, 16, 100);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f28,
      metalness: 0.95,
      roughness: 0.15,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringsGroup.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(1.9, 0.032, 16, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    ringsGroup.add(innerRing);

    // Glowing white orbital tracking beacon tracing along inner cyan ring (as seen in Photo 2)
    const ringBeaconGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const ringBeaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ringBeacon = new THREE.Mesh(ringBeaconGeo, ringBeaconMat);
    innerRing.add(ringBeacon);

    // 7. Branching Procedural 3D Lightning System
    const lightningGroup = new THREE.Group();
    scene.add(lightningGroup);

    // Materials for the lightning core and electric cyan halo
    const lightningCoreMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      linewidth: 3,
    });
    const lightningHaloMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      linewidth: 6,
    });

    let activeLightningCore: THREE.LineSegments | null = null;
    let activeLightningHalo: THREE.LineSegments | null = null;

    // Helper: generate fractal branching lightning segments
    const generateBranchingLightning = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      branchProbability = 0.65
    ) => {
      const linePositions: number[] = [];

      function subdivide(p1: THREE.Vector3, p2: THREE.Vector3, depth: number) {
        if (depth <= 0) {
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
          return;
        }

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const distance = p1.distanceTo(p2);
        const jitter = distance * 0.28;

        mid.x += (Math.random() - 0.5) * jitter;
        mid.y += (Math.random() - 0.5) * jitter * 0.4;
        mid.z += (Math.random() - 0.5) * jitter;

        subdivide(p1, mid, depth - 1);
        subdivide(mid, p2, depth - 1);

        // Chance to spawn a lightning branch fork
        if (Math.random() < branchProbability && depth >= 2) {
          const forkEnd = mid
            .clone()
            .add(
              new THREE.Vector3(
                (Math.random() - 0.5) * 3.5,
                -(Math.random() * 2.2 + 0.5),
                (Math.random() - 0.5) * 3.5
              )
            );
          subdivide(mid, forkEnd, depth - 2);
        }
      }

      subdivide(start, end, 5);
      return new Float32Array(linePositions);
    };

    // Execute a lightning strike
    const triggerLightningBolt = (targetPos?: THREE.Vector3) => {
      // Clean up any old bolt lines
      if (activeLightningCore) {
        lightningGroup.remove(activeLightningCore);
        activeLightningCore.geometry.dispose();
        activeLightningCore = null;
      }
      if (activeLightningHalo) {
        lightningGroup.remove(activeLightningHalo);
        activeLightningHalo.geometry.dispose();
        activeLightningHalo = null;
      }

      // Target is either clicked point or top of monolith
      const target = targetPos
        ? targetPos.clone()
        : new THREE.Vector3(masterGroup.position.x, masterGroup.position.y + 1.8, 0);

      // Start high in the cosmic sky
      const skyStart = new THREE.Vector3(
        target.x + (Math.random() - 0.5) * 3.5,
        target.y + 9.0,
        target.z + (Math.random() - 0.5) * 3.5
      );

      const positions = generateBranchingLightning(skyStart, target);
      const boltGeo = new THREE.BufferGeometry();
      boltGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      activeLightningCore = new THREE.LineSegments(boltGeo, lightningCoreMat);
      activeLightningHalo = new THREE.LineSegments(boltGeo, lightningHaloMat);

      lightningGroup.add(activeLightningHalo);
      lightningGroup.add(activeLightningCore);

      // Flash point light positioned near impact
      lightningLight.position.set(target.x, target.y + 0.8, target.z + 1.2);
      lightningLight.intensity = 38;

      lightningActiveRef.current = true;
      lightningTimerRef.current = 1.0;
      lightningStrobeRef.current = 0;

      // Synthesize realistic thunder & electric arc sound
      SoundEngine.playLightningThunder();

      // Trigger Screen Flash Overlay in DOM
      if (flashOverlayRef.current) {
        flashOverlayRef.current.style.opacity = '0.75';
        setTimeout(() => {
          if (flashOverlayRef.current) flashOverlayRef.current.style.opacity = '0.0';
        }, 60);
        setTimeout(() => {
          if (flashOverlayRef.current) flashOverlayRef.current.style.opacity = '0.45';
        }, 120);
        setTimeout(() => {
          if (flashOverlayRef.current) flashOverlayRef.current.style.opacity = '0.0';
        }, 220);
      }
    };

    // Listen for custom lightning trigger event from Hero or HUD
    const handleLightningEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ clientX?: number; clientY?: number }>;
      let targetVec: THREE.Vector3 | undefined;

      if (customEvent.detail?.clientX !== undefined && customEvent.detail?.clientY !== undefined) {
        const normX = (customEvent.detail.clientX / window.innerWidth) * 2 - 1;
        const normY = -(customEvent.detail.clientY / window.innerHeight) * 2 + 1;
        targetVec = new THREE.Vector3(normX * 3.8, normY * 2.8 + masterGroup.position.y, 0);
      }

      triggerLightningBolt(targetVec);
    };
    window.addEventListener('kinetik_lightning_strike', handleLightningEvent);

    // Blast Hold and Trigger Listeners
    let blastCharge = 0;
    let blastRecoil = 0;
    let isHoldingBlast = false;

    const handleBlastHold = (e: Event) => {
      const customEvent = e as CustomEvent<{ holding: boolean }>;
      isHoldingBlast = customEvent.detail?.holding ?? false;
    };
    window.addEventListener('kinetik_blast_hold', handleBlastHold);

    const handleBlastTrigger = () => {
      blastRecoil = 1.0;
      pulseEnergyRef.current = 1.2;
      triggerLightningBolt();
    };
    window.addEventListener('kinetik_blast_trigger', handleBlastTrigger);

    // Shockwave pulse trigger listener
    const handleTriggerPulse = () => {
      pulseEnergyRef.current = 1.0;
      triggerLightningBolt();
    };
    window.addEventListener('kinetik_pulse_core', handleTriggerPulse);

    // Choreography Progress Mapping:
    // The WAYPOINTS/split/merge timeline below is authored against a 0.0-0.5 "progress" domain
    // (Hero -> About -> Reconverge). Rather than deriving that from the whole page's scroll
    // fraction (which shrinks as more sections are added further down the page and desyncs the
    // monolith timing from the sections it's meant to accompany), we map it directly from the
    // real pixel boundaries of #hero, #about, #reconverge and #facts so the open/merge animation
    // always lines up with those sections regardless of total page length.
    let choreographyBreakpoints: { y: number; p: number }[] = [{ y: 0, p: 0 }];

    const recomputeChoreographyBreakpoints = () => {
      const heroEl = document.querySelector('#hero');
      const aboutEl = document.querySelector('#about');
      const reconvergeEl = document.querySelector('#reconverge');
      const factsEl = document.querySelector('#facts');
      if (!heroEl || !aboutEl || !reconvergeEl) return;

      const topOf = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
      const heroTop = topOf(heroEl);
      const aboutTop = topOf(aboutEl);
      const reconvergeTop = topOf(reconvergeEl);
      const reconvergeBottom = factsEl
        ? topOf(factsEl)
        : reconvergeTop + (reconvergeEl as HTMLElement).offsetHeight;

      // Sized as fractions of each section's own (real, measured) height so the open/merge/hold/
      // descend phases always fit proportionally, however tall a section renders on a given
      // viewport/breakpoint - a fixed pixel buffer could exceed a section's actual height and
      // collapse a plateau to nothing.
      const aboutHeight = Math.max(1, reconvergeTop - aboutTop);
      const closeStartPx = aboutHeight * 0.8;
      const mergeCompletePx = Math.max(1, reconvergeBottom - reconvergeTop) * 0.12;
      // Key Facts has an opaque background, so it already hides the 3D canvas once it fills the
      // viewport - the descent/fade only needs to finish sometime after that boundary, not before it.
      const descentFadeBufferPx = window.innerHeight * 0.5;

      choreographyBreakpoints = [
        { y: heroTop, p: 0.0 }, // Section 1: Hero - monolith solid, holds pose
        { y: aboutTop, p: 0.11 }, // Fully open, framing the About statement
        { y: aboutTop + closeStartPx, p: 0.165 }, // Stays open through most of the About section, starts closing near its tail
        { y: reconvergeTop + mergeCompletePx, p: 0.21 }, // Fully merged shortly after Reconverge begins - not deferred to the section's end
        { y: reconvergeBottom, p: 0.32 }, // Stays fully merged & centered all the way to the end of the Reconverge section
        { y: reconvergeBottom + descentFadeBufferPx, p: 0.5 }, // Only then descends & fades, already hidden behind Key Facts' opaque background
      ];
    };

    recomputeChoreographyBreakpoints();
    window.addEventListener('resize', recomputeChoreographyBreakpoints);
    window.addEventListener('load', recomputeChoreographyBreakpoints);

    const scrollYToChoreographyProgress = (scrollY: number): number => {
      const points = choreographyBreakpoints;
      if (scrollY <= points[0].y) return points[0].p;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (scrollY >= a.y && scrollY <= b.y) {
          const span = Math.max(1, b.y - a.y);
          return a.p + (b.p - a.p) * ((scrollY - a.y) / span);
        }
      }
      return points[points.length - 1].p;
    };

    // Lenis Scroll Listener
    const unsubscribeScroll = addScrollListener((data: ScrollEventData) => {
      scrollProgressRef.current = scrollYToChoreographyProgress(data.scroll);
      scrollVelocityRef.current = data.velocity || 0;
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Master Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();
    const currentCamPos = new THREE.Vector3(0, 0, 8.6);
    const currentCamLookAt = new THREE.Vector3(0, 0, 0);
    const targetCamPos = new THREE.Vector3();
    const targetCamLookAt = new THREE.Vector3();
    const targetMonolithPos = new THREE.Vector3();

    const targetColorRim = new THREE.Color();
    const targetColorLight = new THREE.Color();

    let lastActiveWaypointIndex = -1;

    const render = () => {
      animId = requestAnimationFrame(render);

      const delta = Math.min(0.05, clock.getDelta());
      const time = clock.getElapsedTime();
      const progress = scrollProgressRef.current;
      const velocity = scrollVelocityRef.current;

      // Mouse smoothing
      mouseLerpRef.current.x += (mouseRef.current.x - mouseLerpRef.current.x) * 0.05;
      mouseLerpRef.current.y += (mouseRef.current.y - mouseLerpRef.current.y) * 0.05;

      // Pulse decay
      if (pulseEnergyRef.current > 0.001) {
        pulseEnergyRef.current *= 0.94;
      } else {
        pulseEnergyRef.current = 0;
      }

      // CRITICAL REQUIREMENT:
      // "imazhi mbrapa do te jete 3d dhe do zbrese poshte deri ne seksioni e trete aty nuk do te dale me poshte"
      // Section 1 (Hero: 0.0 - 0.12) -> Section 2 (Manifesto: 0.12 - 0.25) -> Section 3 (Key Facts: 0.25 - 0.38)
      // As progress crosses Section 3 (> 0.38), the 3D scene descends into the abyss and fades out completely.
      // For progress >= 0.43, opacity is strictly 0 and will not show below section 3.
      let canvasOpacity = 1.0;
      if (progress > 0.37) {
        // Fade out smoothly between progress 0.37 and 0.43
        canvasOpacity = Math.max(0, 1 - (progress - 0.37) / 0.06);
      }
      if (container) {
        container.style.opacity = canvasOpacity.toFixed(3);
        container.style.visibility = canvasOpacity <= 0.001 ? 'hidden' : 'visible';
      }

      // Find waypoint interpolation segment (defaults to the final segment once progress
      // moves past the last defined waypoint, e.g. once scrolled beyond the Reconverge section)
      let segIdx = WAYPOINTS.length - 2;
      for (let i = 0; i < WAYPOINTS.length - 1; i++) {
        if (progress >= WAYPOINTS[i].progress && progress <= WAYPOINTS[i + 1].progress) {
          segIdx = i;
          break;
        }
      }

      if (segIdx !== lastActiveWaypointIndex) {
        lastActiveWaypointIndex = segIdx;
        onProgressUpdate?.(progress, segIdx);
      }

      const wA = WAYPOINTS[segIdx];
      const wB = WAYPOINTS[Math.min(WAYPOINTS.length - 1, segIdx + 1)];
      const segmentSpan = Math.max(0.0001, wB.progress - wA.progress);
      const rawT = (progress - wA.progress) / segmentSpan;
      const t = smoothstep(0, 1, rawT);

      // Compute targets for this frame
      lerpVec3(targetCamPos, wA.camPos, wB.camPos, t);
      lerpVec3(targetCamLookAt, wA.camLookAt, wB.camLookAt, t);
      lerpVec3(targetMonolithPos, wA.monolithPos, wB.monolithPos, t);

      // On mobile keep monolith centered
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        targetMonolithPos.x *= 0.25;
        targetCamPos.x *= 0.3;
      }

      // Add mouse parallax
      targetCamPos.x += mouseLerpRef.current.x * 0.45;
      targetCamPos.y += mouseLerpRef.current.y * 0.35;

      // Inertial smoothing
      currentCamPos.lerp(targetCamPos, 0.08);
      currentCamLookAt.lerp(targetCamLookAt, 0.08);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentCamLookAt);

      // Update monolith position and rotation
      masterGroup.position.lerp(targetMonolithPos, 0.08);

      const rotX = wA.monolithRot[0] + (wB.monolithRot[0] - wA.monolithRot[0]) * t;
      const rotY = wA.monolithRot[1] + (wB.monolithRot[1] - wA.monolithRot[1]) * t;
      const rotZ = wA.monolithRot[2] + (wB.monolithRot[2] - wA.monolithRot[2]) * t;

      masterGroup.rotation.x = rotX + Math.sin(time * 0.7) * 0.05 + mouseLerpRef.current.y * 0.15;
      masterGroup.rotation.y = rotY + time * 0.08 + mouseLerpRef.current.x * 0.2;
      masterGroup.rotation.z = rotZ;

      // Split and Recombination Progression:
      // Section 1 (Hero: 0.00 - 0.05): Monolith solid on the right side
      // Transition to Section 2 (0.05 - 0.11): Moves to center, splits wide open MAJTAS & DJATHTAS
      // Section 2 (About, Photo 1: 0.11 - 0.165): Object is OPEN WIDE left & right framing the 3 lines of text
      // Transition to Section 3 (0.165 - 0.21): Wings glide inward, interlocking back together
      // Section 3 (Marquee, Photo 2: 0.21 - 0.29): Object is COMPLETELY ASSEMBLED & MERGED in center ("bashkimi i objektit 3d")
      let splitFactor = 0;
      if (progress >= 0.05 && progress < 0.11) {
        splitFactor = smoothstep(0.05, 0.11, progress);
      } else if (progress >= 0.11 && progress <= 0.165) {
        splitFactor = 1.0;
      } else if (progress > 0.165 && progress < 0.21) {
        splitFactor = 1.0 - smoothstep(0.165, 0.21, progress);
      } else {
        splitFactor = 0.0;
      }

      // After Section 3 (progress > 0.32): descent behavior
      let openFactor = 0;
      if (progress > 0.32 && progress < 0.40) {
        openFactor = smoothstep(0.32, 0.38, progress);
      }

      // Update blast energy and recoil decay
      if (isHoldingBlast) {
        blastCharge = Math.min(1.0, blastCharge + delta * 2.5);
      } else {
        blastCharge = Math.max(0.0, blastCharge - delta * 3.5);
      }
      blastRecoil = Math.max(0.0, blastRecoil - delta * 1.6);

      // Trionn Knot Arms micro-jitter and blast response within each wing group
      const chargeShake = blastCharge * 0.05;
      const armMicroRecoil = blastRecoil * 1.8;
      const armDist = baseArmRadius + armMicroRecoil;

      arm0.position.x = Math.cos(armAngle0) * armDist + (Math.random() - 0.5) * chargeShake;
      arm0.position.y = Math.sin(armAngle0) * armDist + (Math.random() - 0.5) * chargeShake;
      arm0.rotation.z = armAngle0 + (blastRecoil * 0.8);

      arm1.position.x = Math.cos(armAngle1) * armDist + (Math.random() - 0.5) * chargeShake;
      arm1.position.y = Math.sin(armAngle1) * armDist + (Math.random() - 0.5) * chargeShake;
      arm1.rotation.z = armAngle1 + (blastRecoil * 0.8);

      arm2.position.x = Math.cos(armAngle2) * armDist + (Math.random() - 0.5) * chargeShake;
      arm2.position.y = Math.sin(armAngle2) * armDist + (Math.random() - 0.5) * chargeShake;
      arm2.rotation.z = armAngle2 + (blastRecoil * 0.8);

      // 3D Perspective lines subtle parallax
      perspectiveLinesGroup.rotation.x = mouseLerpRef.current.y * 0.05;
      perspectiveLinesGroup.rotation.y = mouseLerpRef.current.x * 0.06;

      // Left Wing translation & rotation: HAPET MAJTAS (Opens to the left in Section 2)
      const leftX = -(splitFactor * 4.8) - (openFactor * 1.6);
      const leftZ = -(splitFactor * 0.9) - (openFactor * 0.4);
      const leftRotZ = -(splitFactor * 0.25) - (openFactor * 0.22);
      const leftRotY = -(splitFactor * 0.45) - (openFactor * 0.25);

      leftWingGroup.position.set(leftX, 0, leftZ);
      leftWingGroup.rotation.set(0, leftRotY, leftRotZ);

      // Right Wing translation & rotation: HAPET DJATHTAS (Opens to the right in Section 2)
      const rightX = (splitFactor * 4.8) + (openFactor * 1.6);
      const rightZ = -(splitFactor * 0.9) - (openFactor * 0.4);
      const rightRotZ = (splitFactor * 0.25) + (openFactor * 0.22);
      const rightRotY = (splitFactor * 0.45) + (openFactor * 0.25);

      rightWingGroup.position.set(rightX, 0, rightZ);
      rightWingGroup.rotation.set(0, rightRotY, rightRotZ);

      // Top Wing translation & rotation: Hapet lart (Elevates up to clear center text)
      const topY = (splitFactor * 3.4) + (openFactor * 1.2);
      const topZ = -(splitFactor * 1.5) - (openFactor * 0.5);
      const topRotX = (splitFactor * 0.35);

      topArmGroup.position.set(0, topY, topZ);
      topArmGroup.rotation.set(topRotX, 0, 0);

      // Animate the white glowing orbital beacon along inner ring (as seen in Photo 2)
      const beaconAngle = time * 2.4;
      ringBeacon.position.set(Math.cos(beaconAngle) * 1.9, Math.sin(beaconAngle) * 1.9, 0);

      // Shard separation interpolation
      const baseShardSpread = wA.shardSpread + (wB.shardSpread - wA.shardSpread) * t;
      const totalSpread = baseShardSpread + (splitFactor * 1.6) + (openFactor * 1.5) + pulseEnergyRef.current * 1.8;

      shards.forEach((item, idx) => {
        item.mesh.position.x = item.basePos.x + item.explodeVec.x * totalSpread;
        item.mesh.position.y =
          item.basePos.y + item.explodeVec.y * totalSpread + Math.sin(time * 1.5 + idx) * 0.04;
        item.mesh.position.z = item.basePos.z + item.explodeVec.z * totalSpread;

        item.mesh.rotation.x += item.rotSpeed.x * (1 + totalSpread);
        item.mesh.rotation.y += item.rotSpeed.y * (1 + totalSpread);
        item.mesh.rotation.z += item.rotSpeed.z * (1 + totalSpread);
      });

      // Rings gyroscopic rotation
      const ringTiltX = wA.ringsTilt[0] + (wB.ringsTilt[0] - wA.ringsTilt[0]) * t + (openFactor * 0.4);
      const ringTiltY = wA.ringsTilt[1] + (wB.ringsTilt[1] - wA.ringsTilt[1]) * t;
      const ringTiltZ = wA.ringsTilt[2] + (wB.ringsTilt[2] - wA.ringsTilt[2]) * t;

      ringsGroup.rotation.set(ringTiltX, ringTiltY, ringTiltZ);
      outerRing.rotation.z += 0.008 + Math.abs(velocity) * 0.004 + (openFactor * 0.02);
      innerRing.rotation.x += 0.012 + Math.abs(velocity) * 0.006 + (openFactor * 0.02);

      // Cosmic background drift & twinkle
      cosmicEnvGroup.rotation.y = time * 0.015;
      horizonMesh.rotation.z = time * 0.02;
      horizonInnerMesh.rotation.z = -time * 0.025;

      // Dynamic lighting transition
      targetColorRim.setHex(wA.rimColor).lerp(new THREE.Color(wB.rimColor), t);
      targetColorLight.setHex(wA.lightColor).lerp(new THREE.Color(wB.lightColor), t);

      rimLight.color.copy(targetColorRim);
      keyLight.color.copy(targetColorLight);

      const targetAmb = wA.ambientIntensity + (wB.ambientIntensity - wA.ambientIntensity) * t;
      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmb, 0.05);

      // Core emissive pulse
      const emissivePulse = 2.0 + Math.sin(time * 2.5) * 0.6 + pulseEnergyRef.current * 4.0;
      conduitEmissiveMat.emissiveIntensity = emissivePulse;

      // 9. Lightning Strobe and Decay Animation Loop
      if (lightningActiveRef.current) {
        lightningTimerRef.current -= 0.045;
        lightningStrobeRef.current += 1;

        // Rapid staccato strobe flicker
        const strobeOn = lightningStrobeRef.current % 2 === 0;
        const currentIntensity = strobeOn ? lightningTimerRef.current * 38 : lightningTimerRef.current * 10;
        lightningLight.intensity = Math.max(0, currentIntensity);

        if (activeLightningCore && activeLightningHalo) {
          activeLightningCore.visible = strobeOn;
          activeLightningHalo.visible = true;
          lightningCoreMat.opacity = Math.max(0, lightningTimerRef.current * 1.2);
          lightningHaloMat.opacity = Math.max(0, lightningTimerRef.current * 0.9);
        }

        if (lightningTimerRef.current <= 0) {
          lightningActiveRef.current = false;
          lightningLight.intensity = 0;
          if (activeLightningCore) activeLightningCore.visible = false;
          if (activeLightningHalo) activeLightningHalo.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      unsubscribeScroll();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('kinetik_lightning_strike', handleLightningEvent);
      window.removeEventListener('kinetik_pulse_core', handleTriggerPulse);
      window.removeEventListener('kinetik_blast_hold', handleBlastHold);
      window.removeEventListener('kinetik_blast_trigger', handleBlastTrigger);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', recomputeChoreographyBreakpoints);
      window.removeEventListener('load', recomputeChoreographyBreakpoints);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onProgressUpdate]);

  return (
    <>
      {/* 3D Master WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="cinematic-3d-canvas-container"
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ease-out"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Screen Lightning Flash Overlay (Strobes electric white/cyan on strike) */}
      <div
        ref={flashOverlayRef}
        id="lightning-flash-overlay"
        className="fixed inset-0 w-full h-full pointer-events-none z-30 bg-cyan-200/50 mix-blend-screen opacity-0 transition-opacity duration-75"
      />
    </>
  );
};
