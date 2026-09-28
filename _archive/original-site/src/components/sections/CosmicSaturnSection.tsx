import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Sparkles, Orbit, Compass, Radio } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';

gsap.registerPlugin(ScrollTrigger);

interface CosmicSaturnSectionProps {
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

export const CosmicSaturnSection: React.FC<CosmicSaturnSectionProps> = ({
  onOpenContact,
  onSetCursorMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const letterOverlayRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [unfoldProgress, setUnfoldProgress] = useState(0);
  const [isFullyOpened, setIsFullyOpened] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. THREE.JS SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020208, 0.018);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0x18182e, 1.2);
    scene.add(ambientLight);

    // Light coming from the Huge Star
    const starLight = new THREE.PointLight(0xfff4d6, 3.8, 120);
    starLight.position.set(-18, 12, -25);
    scene.add(starLight);

    // Rim light on the stone letter
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    rimLight.position.set(10, -5, 8);
    scene.add(rimLight);

    // 3. BACKGROUND: MILKY WAY (Rruga e Qumështit) STARFIELD & NEBULA
    const milkyWayGroup = new THREE.Group();
    scene.add(milkyWayGroup);

    // 3A. 3,500 Multi-spectral Stars
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const colorPalette = [
      new THREE.Color(0xdbeafe), // Icy celestial white
      new THREE.Color(0x38bdf8), // Cyan star
      new THREE.Color(0xa855f7), // Galactic violet
      new THREE.Color(0xfde047), // Stellar gold
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0xf97316), // Warm solar orange
    ];

    for (let i = 0; i < starCount; i++) {
      // Swirling galactic disk distribution
      const radius = THREE.MathUtils.randFloat(8, 70);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const heightOffset = (Math.random() - 0.5) * 26;

      starPositions[i * 3 + 0] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = heightOffset + Math.sin(angle * 2) * 6;
      starPositions[i * 3 + 2] = Math.sin(angle) * radius - 30;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3 + 0] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    milkyWayGroup.add(starPoints);

    // 3B. Cosmic Nebula Clouds (800 luminous dust nodes)
    const nebulaCount = 800;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      nebulaPositions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      nebulaPositions[i * 3 + 2] = (Math.random() - 0.5) * 45 - 20;
    }
    const nebulaGeo = new THREE.BufferGeometry();
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.28,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const nebulaPoints = new THREE.Points(nebulaGeo, nebulaMat);
    milkyWayGroup.add(nebulaPoints);

    // 4. THE HUGE GLOWING STAR (Dielli Gjigand / Hypergiant Star)
    const hugeStarGroup = new THREE.Group();
    hugeStarGroup.position.set(-20, 11, -38);
    scene.add(hugeStarGroup);

    // Star Core
    const starCoreGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const starCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff0c2,
    });
    const starCoreMesh = new THREE.Mesh(starCoreGeo, starCoreMat);
    hugeStarGroup.add(starCoreMesh);

    // Outer Solar Corona / Atmosphere Glow
    const coronaGeo = new THREE.SphereGeometry(8.8, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    hugeStarGroup.add(coronaMesh);

    // Solar Flares Halo Ring
    const flareRingGeo = new THREE.RingGeometry(8.5, 14.5, 48);
    const flareRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const flareRingMesh = new THREE.Mesh(flareRingGeo, flareRingMat);
    flareRingMesh.rotation.x = Math.PI * 0.2;
    hugeStarGroup.add(flareRingMesh);

    // 5. SATURN & ITS MAJESTIC RINGS
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(13.5, -3.5, -22);
    saturnGroup.rotation.z = 0.47; // Saturn's real ~27 degree axial tilt
    scene.add(saturnGroup);

    // Procedural Atmospheric Bands Texture for Saturn
    const saturnCanvas = document.createElement('canvas');
    saturnCanvas.width = 512;
    saturnCanvas.height = 512;
    const saturnCtx = saturnCanvas.getContext('2d');
    if (saturnCtx) {
      const grad = saturnCtx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#3d3024');
      grad.addColorStop(0.15, '#c5a059');
      grad.addColorStop(0.28, '#ecd599');
      grad.addColorStop(0.38, '#b88a44');
      grad.addColorStop(0.5, '#e4c988');
      grad.addColorStop(0.62, '#cf9c4a');
      grad.addColorStop(0.75, '#b07f3a');
      grad.addColorStop(0.88, '#e7ce92');
      grad.addColorStop(1.0, '#33271b');
      saturnCtx.fillStyle = grad;
      saturnCtx.fillRect(0, 0, 512, 512);
    }
    const saturnTexture = new THREE.CanvasTexture(saturnCanvas);

    const saturnGeo = new THREE.SphereGeometry(4.8, 64, 64);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnTexture,
      roughness: 0.65,
      metalness: 0.15,
    });
    const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
    saturnGroup.add(saturnMesh);

    // Saturn's Colossal Planetary Ring System
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 32;
    const ringCtx = ringCanvas.getContext('2d');
    if (ringCtx) {
      const ringGrad = ringCtx.createLinearGradient(0, 0, 512, 0);
      ringGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
      ringGrad.addColorStop(0.12, 'rgba(215, 185, 140, 0.75)');
      ringGrad.addColorStop(0.38, 'rgba(230, 205, 160, 0.9)');
      ringGrad.addColorStop(0.44, 'rgba(10, 8, 12, 0.05)'); // Cassini Division!
      ringGrad.addColorStop(0.48, 'rgba(195, 165, 120, 0.7)');
      ringGrad.addColorStop(0.78, 'rgba(175, 140, 95, 0.55)');
      ringGrad.addColorStop(0.95, 'rgba(140, 110, 75, 0.2)');
      ringGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
      ringCtx.fillStyle = ringGrad;
      ringCtx.fillRect(0, 0, 512, 32);
    }
    const ringTexture = new THREE.CanvasTexture(ringCanvas);

    const saturnRingsGeo = new THREE.RingGeometry(6.4, 11.5, 128);
    const saturnRingsMat = new THREE.MeshBasicMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const saturnRingsMesh = new THREE.Mesh(saturnRingsGeo, saturnRingsMat);
    saturnRingsMesh.rotation.x = Math.PI * 0.5;
    saturnGroup.add(saturnRingsMesh);

    // 6. THE CENTRAL 3D STONE LETTER OBJECT (Objekti në formë guri që hapet me scroll)
    const stoneLetterMaster = new THREE.Group();
    stoneLetterMaster.position.set(0, 0, 0);
    scene.add(stoneLetterMaster);

    // Dark Basalt / Volcanic Meteorite Stone Material
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x181820,
      roughness: 0.35,
      metalness: 0.85,
      envMapIntensity: 1.5,
    });

    const runeEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.9,
    });

    const goldSealMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.2,
    });

    // 6A. Base Tablet Slab (Center of the Letter)
    const baseTabletGeo = new THREE.BoxGeometry(3.0, 3.8, 0.22);
    const baseTablet = new THREE.Mesh(baseTabletGeo, stoneMaterial);
    stoneLetterMaster.add(baseTablet);

    // Center illuminated wax-seal rune
    const centerSealGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 24);
    const centerSeal = new THREE.Mesh(centerSealGeo, goldSealMat);
    centerSeal.rotation.x = Math.PI * 0.5;
    centerSeal.position.z = 0.12;
    stoneLetterMaster.add(centerSeal);

    // 6B. Top Flap: Hinged at top of base tablet (y = 1.9)
    const topHinge = new THREE.Group();
    topHinge.position.set(0, 1.9, 0.12);
    stoneLetterMaster.add(topHinge);

    const topFlapGeo = new THREE.BoxGeometry(3.0, 1.9, 0.18);
    const topFlapMesh = new THREE.Mesh(topFlapGeo, stoneMaterial);
    topFlapMesh.position.set(0, -0.95, 0); // local offset from hinge
    topHinge.add(topFlapMesh);

    // Add runic wireframe and glowing line on top flap
    const topRuneGeo = new THREE.BoxGeometry(2.4, 0.06, 0.2);
    const topRune = new THREE.Mesh(topRuneGeo, runeEmissiveMat);
    topRune.position.set(0, -0.95, 0.05);
    topHinge.add(topRune);

    // 6C. Bottom Flap: Hinged at bottom of base tablet (y = -1.9)
    const bottomHinge = new THREE.Group();
    bottomHinge.position.set(0, -1.9, 0.12);
    stoneLetterMaster.add(bottomHinge);

    const bottomFlapGeo = new THREE.BoxGeometry(3.0, 1.9, 0.18);
    const bottomFlapMesh = new THREE.Mesh(bottomFlapGeo, stoneMaterial);
    bottomFlapMesh.position.set(0, 0.95, 0);
    bottomHinge.add(bottomFlapMesh);

    const bottomRuneGeo = new THREE.BoxGeometry(2.4, 0.06, 0.2);
    const bottomRune = new THREE.Mesh(bottomRuneGeo, runeEmissiveMat);
    bottomRune.position.set(0, 0.95, 0.05);
    bottomHinge.add(bottomRune);

    // 6D. Left Flap: Hinged at left edge (x = -1.5)
    const leftHinge = new THREE.Group();
    leftHinge.position.set(-1.5, 0, 0.24);
    stoneLetterMaster.add(leftHinge);

    const leftFlapGeo = new THREE.BoxGeometry(1.5, 3.8, 0.18);
    const leftFlapMesh = new THREE.Mesh(leftFlapGeo, stoneMaterial);
    leftFlapMesh.position.set(0.75, 0, 0);
    leftHinge.add(leftFlapMesh);

    const leftRuneGeo = new THREE.BoxGeometry(0.06, 3.0, 0.2);
    const leftRune = new THREE.Mesh(leftRuneGeo, runeEmissiveMat);
    leftRune.position.set(0.75, 0, 0.05);
    leftHinge.add(leftRune);

    // 6E. Right Flap: Hinged at right edge (x = 1.5)
    const rightHinge = new THREE.Group();
    rightHinge.position.set(1.5, 0, 0.24);
    stoneLetterMaster.add(rightHinge);

    const rightFlapGeo = new THREE.BoxGeometry(1.5, 3.8, 0.18);
    const rightFlapMesh = new THREE.Mesh(rightFlapGeo, stoneMaterial);
    rightFlapMesh.position.set(-0.75, 0, 0);
    rightHinge.add(rightFlapMesh);

    const rightRuneGeo = new THREE.BoxGeometry(0.06, 3.0, 0.2);
    const rightRune = new THREE.Mesh(rightRuneGeo, runeEmissiveMat);
    rightRune.position.set(-0.75, 0, 0.05);
    rightHinge.add(rightRune);

    // Floating Stardust near the Stone Letter (60 small orbiting crystals)
    const stoneMotesGeo = new THREE.TetrahedronGeometry(0.08);
    const motesGroup = new THREE.Group();
    stoneLetterMaster.add(motesGroup);
    for (let i = 0; i < 40; i++) {
      const mote = new THREE.Mesh(stoneMotesGeo, runeEmissiveMat);
      mote.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      );
      motesGroup.add(mote);
    }

    // Initialize in Closed Folded State:
    // Flaps fold tightly inward over the center
    topHinge.rotation.x = Math.PI; // Folded down over center
    bottomHinge.rotation.x = -Math.PI; // Folded up over center
    leftHinge.rotation.y = -Math.PI; // Folded right over center
    rightHinge.rotation.y = Math.PI; // Folded left over center

    // 7. ANIMATION RENDER LOOP
    let animId: number;
    const clock = new THREE.Clock();
    let currentScrollProgress = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      // Saturn rotation and ring tilt drift
      saturnGroup.rotation.y = time * 0.035;
      saturnGroup.rotation.x = Math.sin(time * 0.2) * 0.03;

      // Milky way slow cosmic drift
      milkyWayGroup.rotation.y = time * 0.008;
      milkyWayGroup.rotation.z = time * 0.004;

      // Huge Star corona pulse
      const coronaPulse = 1.0 + Math.sin(time * 2.0) * 0.06;
      coronaMesh.scale.set(coronaPulse, coronaPulse, coronaPulse);
      flareRingMesh.rotation.z = time * 0.05;

      // Stone Letter idle levitation & hover rotation
      stoneLetterMaster.position.y = Math.sin(time * 1.4) * 0.15;
      stoneLetterMaster.rotation.x = Math.sin(time * 0.8) * 0.08;
      stoneLetterMaster.rotation.y = Math.sin(time * 0.6) * 0.12;

      // Motes orbit around stone letter
      motesGroup.rotation.y = time * 0.4;

      // 8. SCROLL-DRIVEN UNFOLDING INTERACTION ("hapet avash avash duke bere scroll deri sa te haoet letra e gjitha")
      // unfold: 0.0 (closed boulder) -> 1.0 (completely flat opened stone letter)
      const p = currentScrollProgress;

      // Stage 1: Left and Right flaps unfold (scroll 0.15 -> 0.55)
      const sideFlapsProgress = THREE.MathUtils.smoothstep(p, 0.15, 0.55);
      leftHinge.rotation.y = -Math.PI * (1 - sideFlapsProgress);
      rightHinge.rotation.y = Math.PI * (1 - sideFlapsProgress);

      // Stage 2: Top and Bottom flaps unfold (scroll 0.45 -> 0.85)
      const vertFlapsProgress = THREE.MathUtils.smoothstep(p, 0.45, 0.85);
      topHinge.rotation.x = Math.PI * (1 - vertFlapsProgress);
      bottomHinge.rotation.x = -Math.PI * (1 - vertFlapsProgress);

      // Camera focal adjustment: when letter opens, camera glides slightly closer
      camera.position.z = 11 - p * 3.5;

      // Runes glow brighter as it opens
      runeEmissiveMat.emissiveIntensity = 1.8 + p * 3.0;

      renderer.render(scene, camera);
    };

    render();

    // 9. GSAP SCROLLTRIGGER PINNING & SCALE ZOOM ENTRANCE
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const letterOverlay = letterOverlayRef.current;
      if (!section) return;

      // The section pins for 250vh of buttery scroll
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=2600',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          const prog = self.progress;
          currentScrollProgress = prog;
          setUnfoldProgress(prog);

          if (prog > 0.82) {
            setIsFullyOpened(true);
          } else {
            setIsFullyOpened(false);
          }

          // Scale Zoom entrance as requested:
          // "seksini i radhes do te vie me scale zoom"
          if (container) {
            if (prog < 0.25) {
              const scale = 0.35 + (prog / 0.25) * 0.65;
              const op = Math.min(1, prog / 0.15);
              container.style.transform = `scale(${scale.toFixed(3)})`;
              container.style.opacity = op.toFixed(3);
            } else {
              container.style.transform = 'scale(1)';
              container.style.opacity = '1';
            }
          }

          // Unfolded letter text overlay appearance
          if (letterOverlay) {
            if (prog >= 0.75) {
              const textOp = Math.min(1, (prog - 0.75) / 0.18);
              letterOverlay.style.opacity = textOp.toFixed(3);
              letterOverlay.style.transform = `translate(-50%, -50%) scale(${(0.95 + textOp * 0.05).toFixed(3)})`;
              letterOverlay.style.pointerEvents = 'auto';
            } else {
              letterOverlay.style.opacity = '0';
              letterOverlay.style.transform = 'translate(-50%, -50%) scale(0.9)';
              letterOverlay.style.pointerEvents = 'none';
            }
          }
        },
      });
    }, sectionRef);

    // Resize handling
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="saturn-codex"
      className="relative w-full h-screen bg-[#020208] text-white overflow-hidden select-none"
    >
      {/* Zoom Container: Scales from small to full size upon entrance */}
      <div
        ref={containerRef}
        className="relative w-full h-full will-change-transform flex items-center justify-center"
      >
        {/* WebGL 3D Canvas with Saturn, Milky Way, Huge Star & Stone Letter */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

        {/* Top Section Header & Astrometric Data */}
        <div className="absolute top-8 left-6 md:left-12 right-6 md:right-12 z-20 flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono text-neutral-400 pointer-events-none">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-white font-bold tracking-widest uppercase">
              DEEP SPACE TELEMETRY // SATURN ORBIT
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-neutral-500 font-mono text-[11px]">
              MILKY WAY CORE • G-TYPE HYPERGIANT
            </span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] uppercase font-bold tracking-wider">
              {unfoldProgress < 0.2
                ? 'SEALED STONE TABLET'
                : unfoldProgress < 0.8
                ? `UNFOLDING: ${Math.round(unfoldProgress * 100)}%`
                : 'LETTER FULLY UNVEILED'}
            </span>
          </div>
        </div>

        {/* Interactive Scroll Prompt Badge at Bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-700 backdrop-blur-md text-xs font-mono text-neutral-300">
            <Orbit className="w-3.5 h-3.5 text-orange-400 animate-spin" />
            <span>
              {unfoldProgress < 0.8
                ? 'SCROLL DOWN SLOWLY TO UNFOLD THE STONE LETTER'
                : 'STONE CODEX FULLY TRANSCRIBED'}
            </span>
          </div>
          <div className="w-36 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-orange-500 transition-all duration-75"
              style={{ width: `${Math.min(100, Math.round(unfoldProgress * 100))}%` }}
            />
          </div>
        </div>

        {/* Unfolded High-Definition Stone Letter Content Overlay */}
        <div
          ref={letterOverlayRef}
          style={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 max-w-xl w-[90%] md:w-full p-8 md:p-10 rounded-3xl bg-neutral-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_80px_rgba(0,240,255,0.2)] text-white transition-opacity duration-300 pointer-events-none"
        >
          {/* Header of the Unfolded Stone Letter */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
                  TRANSMISSION // CODEX 001
                </span>
                <h3 className="font-display text-lg font-black uppercase text-white tracking-wide">
                  The Saturn Manifesto
                </h3>
              </div>
            </div>
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
              KINETIK • 2026
            </span>
          </div>

          {/* Letter Body Text */}
          <div className="space-y-4 font-sans text-sm md:text-base text-neutral-300 leading-relaxed">
            <p className="font-serif italic text-base md:text-lg text-neutral-100">
              “To those who seek clarity across the boundless noise of the digital universe:”
            </p>
            <p className="text-neutral-300">
              We engineer not for transient moments, but for enduring permanence. In this vast celestial expanse, every interface we build is an orbit, and every line of code an indelible monument carved into timeless digital granite.
            </p>
            <p className="font-mono text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
              PRECISION SHADERS • ZERO-COMPROMISE WEBGL • BESPOKE ARTIFACTS
            </p>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>SATURN ORBIT • LAT: 09.04° • LON: 44.12°</span>
            </div>

            <button
              type="button"
              onClick={() => {
                SoundEngine.playTick(1600);
                onOpenContact();
              }}
              onMouseEnter={() => {
                SoundEngine.playHover();
                onSetCursorMode?.('hover');
              }}
              onMouseLeave={() => onSetCursorMode?.('default')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <span>ACCEPT TRANSMISSION</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
