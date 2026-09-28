import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { SoundEngine } from '../../lib/audio';
import { addScrollListener } from '../../lib/lenis';

interface HeroSceneProps {
  onBlastStateChange?: (holding: boolean) => void;
  onExplode?: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  onBlastStateChange,
  onExplode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoldingRef = useRef(false);
  const holdStartTimeRef = useRef(0);
  const holdProgressRef = useRef(0);
  const [isHoldingState, setIsHoldingState] = useState(false);
  const [holdPercent, setHoldPercent] = useState(0);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const monolithGroupRef = useRef<THREE.Group | null>(null);
  const shardsRef = useRef<{ mesh: THREE.Mesh; origPos: THREE.Vector3; velocity: THREE.Vector3 }[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });

  const triggerBlast = useCallback(() => {
    SoundEngine.playBlast();
    if (onExplode) onExplode();

    // Scatter shards outward
    shardsRef.current.forEach(({ mesh, velocity }) => {
      velocity.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );

      gsap.to(mesh.rotation, {
        x: mesh.rotation.x + Math.PI * (Math.random() * 4 - 2),
        y: mesh.rotation.y + Math.PI * (Math.random() * 4 - 2),
        duration: 2.2,
        ease: 'power3.out'
      });
    });

    // Animate camera subtle punch
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        z: 8,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
  }, [onExplode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Dramatic warm amber rim light (matching the Trionn aesthetic)
    const rimLight = new THREE.DirectionalLight(0xff6a28, 4.0);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // Subtle cool cyan fill light
    const fillLight = new THREE.PointLight(0x4080ff, 2.0, 15);
    fillLight.position.set(3, -4, 4);
    scene.add(fillLight);

    // 3. Monolithic Multi-faceted Sculpture (Composed of interlocking metallic faceted shards)
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);
    monolithGroupRef.current = monolithGroup;

    // Premium dark titanium metallic material with subtle roughness & reflections
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.95,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xff7733,
      transparent: true,
      opacity: 0.6,
      linewidth: 1.5
    });

    const shards: { mesh: THREE.Mesh; origPos: THREE.Vector3; velocity: THREE.Vector3 }[] = [];

    // Create a sculptural geometric triskelion / prism composed of 14 geometric facets
    const shardGeometries = [
      new THREE.ConeGeometry(1.2, 2.8, 4),
      new THREE.CylinderGeometry(0.4, 1.1, 2.2, 5),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TetrahedronGeometry(1.2, 0),
      new THREE.IcosahedronGeometry(0.9, 0),
      new THREE.BoxGeometry(0.8, 2.4, 0.8),
    ];

    const shardPositions = [
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0.9, -0.6, 0.3),
      new THREE.Vector3(-0.9, -0.6, -0.2),
      new THREE.Vector3(0, 1.4, -0.3),
      new THREE.Vector3(-0.7, 0.5, 0.6),
      new THREE.Vector3(0.7, 0.5, -0.5),
      new THREE.Vector3(0, -1.2, 0.4),
      new THREE.Vector3(1.2, 0.2, 0.6),
      new THREE.Vector3(-1.2, 0.1, 0.4),
    ];

    shardPositions.forEach((pos, idx) => {
      const geom = shardGeometries[idx % shardGeometries.length];
      const mesh = new THREE.Mesh(geom, metalMaterial);
      mesh.position.copy(pos);
      mesh.rotation.set(
        (idx * 0.4) % Math.PI,
        (idx * 0.7) % Math.PI,
        (idx * 0.3) % Math.PI
      );

      // Add wireframe edge highlights
      const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(geom), edgeMaterial);
      mesh.add(wireframe);

      monolithGroup.add(mesh);
      shards.push({
        mesh,
        origPos: pos.clone(),
        velocity: new THREE.Vector3(0, 0, 0)
      });
    });

    shardsRef.current = shards;

    // 4. Ambient Floating Dust Particle Field
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 2 + 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffaa66,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 5. Mouse Interaction Handler
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetRotationRef.current.y = normX * 0.85;
      targetRotationRef.current.x = -normY * 0.65;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Lenis Scroll connection & 3D Parallax
    let scrollRotY = 0;
    let scrollRotX = 0;
    let scrollDepth = 0;

    const unsubscribeScroll = addScrollListener((data) => {
      // Rotate with scroll depth and velocity inertia
      scrollRotY = data.scroll * 0.0025;
      scrollRotX = data.velocity * 0.02;
      scrollDepth = Math.min(data.scroll * 0.002, 1.2);

      if (monolithGroup) {
        monolithGroup.position.y = -data.scroll * 0.0018;
        monolithGroup.position.z = -scrollDepth * 1.5;
        const scaleVal = Math.max(0.7, 1 - scrollDepth * 0.15);
        monolithGroup.scale.set(scaleVal, scaleVal, scaleVal);
      }
    });

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 8. Animation Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      const elapsedTime = clock.getElapsedTime();

      // Continuous subtle idle rotation + scroll dynamics
      if (monolithGroup) {
        monolithGroup.rotation.y += (targetRotationRef.current.y + scrollRotY - monolithGroup.rotation.y) * 0.05 + 0.002;
        monolithGroup.rotation.x += (targetRotationRef.current.x + scrollRotX - monolithGroup.rotation.x) * 0.05;
        monolithGroup.rotation.z = scrollRotY * 0.2;

        // Holding "Charge" vibration effect
        if (isHoldingRef.current) {
          const jitter = 0.08 * (holdProgressRef.current + 0.2);
          monolithGroup.position.x = (Math.random() - 0.5) * jitter;
          monolithGroup.position.z = (Math.random() - 0.5) * jitter;
          edgeMaterial.opacity = 0.8 + Math.sin(elapsedTime * 30) * 0.2;
          rimLight.intensity = 4.0 + holdProgressRef.current * 8.0;
        } else {
          monolithGroup.position.x *= 0.9;
          monolithGroup.position.z *= 0.9;
          edgeMaterial.opacity = 0.6;
          rimLight.intensity = 4.0;
        }
      }

      // Shard physics (elastic return to origin after blast)
      shards.forEach(({ mesh, origPos, velocity }) => {
        if (velocity.lengthSq() > 0.0001) {
          mesh.position.add(velocity);
          velocity.multiplyScalar(0.92); // drag

          // Spring back towards original position
          const toOrigin = origPos.clone().sub(mesh.position);
          mesh.position.add(toOrigin.multiplyScalar(0.04));
        } else {
          mesh.position.lerp(origPos, 0.1);
        }
      });

      // Drift particle field
      if (particles) {
        particles.rotation.y = elapsedTime * 0.04;
        particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribeScroll();
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Hold Interaction Handlers
  const handlePointerDown = () => {
    isHoldingRef.current = true;
    holdStartTimeRef.current = Date.now();
    setIsHoldingState(true);
    if (onBlastStateChange) onBlastStateChange(true);
    SoundEngine.playHover();

    const interval = setInterval(() => {
      if (!isHoldingRef.current) {
        clearInterval(interval);
        return;
      }
      const elapsed = (Date.now() - holdStartTimeRef.current) / 1000;
      const progress = Math.min(elapsed / 1.4, 1);
      holdProgressRef.current = progress;
      setHoldPercent(Math.floor(progress * 100));

      if (progress >= 1) {
        clearInterval(interval);
        isHoldingRef.current = false;
        setIsHoldingState(false);
        setHoldPercent(0);
        if (onBlastStateChange) onBlastStateChange(false);
        triggerBlast();
      }
    }, 40);
  };

  const handlePointerUp = () => {
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsHoldingState(false);
      holdProgressRef.current = 0;
      setHoldPercent(0);
      if (onBlastStateChange) onBlastStateChange(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="hero-3d-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Interactive HUD Trigger: "HOLD TO BLAST / DARE TO TOUCH THE LINES" */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="group relative flex items-center space-x-3 px-6 py-2.5 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-md hover:border-neutral-600 transition-all active:scale-95 cursor-pointer shadow-2xl"
        >
          {/* Progress Ring or Indicator */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-orange-500 transition-all duration-75"
                strokeDasharray={`${holdPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono text-orange-400">✦</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider">
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              {isHoldingState ? `CHARGING ${holdPercent}%` : 'HOLD TO'}
            </span>
            <span className="font-bold text-orange-400 flex items-center">
              BLAST 💥
            </span>
          </div>
        </button>

        <span className="mt-2 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
          DARE TO TOUCH THE MONOLITH
        </span>
      </div>
    </div>
  );
};
