import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { addScrollListener } from '../../lib/lenis';

interface ServicesSceneProps {
  activeColor?: string;
  modelVariant?: 'faceted' | 'torus' | 'lattice' | 'cube';
}

export const ServicesScene: React.FC<ServicesSceneProps> = ({
  activeColor = '#e2e8f0',
  modelVariant = 'faceted'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const glowLightRef = useRef<THREE.PointLight | null>(null);
  const lettersGroupRef = useRef<THREE.Group | null>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  // Update light and materials when activeColor changes
  useEffect(() => {
    if (glowLightRef.current) {
      glowLightRef.current.color.set(activeColor);
    }
  }, [activeColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 6, 4);
    scene.add(dirLight);

    const dynamicGlow = new THREE.PointLight(new THREE.Color(activeColor), 6.0, 18);
    dynamicGlow.position.set(0, 0, 1.5);
    scene.add(dynamicGlow);
    glowLightRef.current = dynamicGlow;

    // Center Sculptural Geometry
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Carved rock/monolith procedural geometry
    const coreGeo = new THREE.DodecahedronGeometry(1.8, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.28,
      flatShading: true,
    });

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Glowing edge accents
    const wireGeo = new THREE.EdgesGeometry(coreGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    coreMesh.add(wireMesh);

    // Orbiting Floating Letter Glyphs (A, I, D, E, S, G, N, 0, 1) as seen in Trionn video at 00:27!
    const lettersGroup = new THREE.Group();
    scene.add(lettersGroup);
    lettersGroupRef.current = lettersGroup;

    // Create 18 small floating planar cards/glyphs
    const glyphs = ['A', 'I', 'D', 'E', 'V', 'S', 'G', 'N', '✦', '+', '0', '1'];
    const letterMeshes: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; yOffset: number }[] = [];

    glyphs.forEach((glyph, i) => {
      // Create canvas texture with letter
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 128, 128);
        ctx.font = 'bold 72px Syne, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(glyph, 64, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const glyphMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const glyphGeo = new THREE.PlaneGeometry(0.7, 0.7);
      const mesh = new THREE.Mesh(glyphGeo, glyphMat);

      const angle = (i / glyphs.length) * Math.PI * 2;
      const radius = 2.6 + (i % 3) * 0.4;
      const yOffset = ((i % 5) - 2) * 0.7;

      mesh.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
      lettersGroup.add(mesh);

      letterMeshes.push({
        mesh,
        angle,
        radius,
        speed: 0.3 + (i % 3) * 0.1,
        yOffset
      });
    });

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotation.current.y = x * 0.6;
      targetRotation.current.x = -y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize
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

    // Scroll listener for dynamic rotation and orbit acceleration
    let scrollRotY = 0;
    let scrollVelBoost = 0;

    const unsubscribeScroll = addScrollListener((data) => {
      scrollRotY = data.scroll * 0.002;
      scrollVelBoost = Math.min(Math.abs(data.velocity) * 0.03, 0.2);
    });

    // Render loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      scrollVelBoost *= 0.94; // decay boost

      // Smooth rotation
      coreGroup.rotation.y += 0.005 + scrollVelBoost;
      coreGroup.rotation.x = Math.sin(time * 0.5) * 0.15 + targetRotation.current.x + scrollRotY * 0.1;
      coreGroup.rotation.z = Math.cos(time * 0.3) * 0.1;

      // Orbit letters around monolith (speeds up with scroll)
      letterMeshes.forEach((item) => {
        const currentAngle = item.angle + time * (item.speed + scrollVelBoost * 2) * 0.4 + scrollRotY;
        item.mesh.position.x = Math.cos(currentAngle) * item.radius;
        item.mesh.position.z = Math.sin(currentAngle) * item.radius;
        item.mesh.position.y = item.yOffset + Math.sin(time * 2 + item.angle) * 0.2;
        item.mesh.lookAt(camera.position);
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

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
  }, [modelVariant]);

  return (
    <div
      ref={containerRef}
      id="services-3d-canvas"
      className="w-full h-full min-h-[420px] pointer-events-auto cursor-grab active:cursor-grabbing"
    />
  );
};
