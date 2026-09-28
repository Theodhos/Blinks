import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowUpRight, CheckCircle2, Video, Eye, Radio, Layers, Cpu, Compass } from 'lucide-react';
import { SoundEngine } from '../../lib/audio';

gsap.registerPlugin(ScrollTrigger);

interface ExpertiseMatrixSectionProps {
  onOpenContact: () => void;
  onSetCursorMode?: (mode: 'default' | 'hover' | 'project' | 'drag' | 'explore', text?: string) => void;
}

const EXPERTISE_PILLARS = [
  {
    id: 'spatial-webgl',
    index: '01',
    title: 'Spatial WebGL & 3D Interaction',
    category: 'Graphics Engineering',
    desc: 'Custom GLSL shaders, procedural geometry, volumetric lighting, and GPU-accelerated interaction models crafted for immersive web presence.',
    tags: ['Three.js', 'WebGPU', 'GLSL Shaders', 'Raymarching', 'Physics Engines']
  },
  {
    id: 'ai-architecture',
    index: '02',
    title: 'Autonomous AI & Intelligent Agents',
    category: 'Cognitive Computing',
    desc: 'Production-ready generative AI integrations, neural conversational interfaces, real-time voice streaming, and multi-modal sensory workflows.',
    tags: ['Gemini 2.5', 'Neural Pipelines', 'Vector Stores', 'Agentic Logic', 'Live Audio']
  },
  {
    id: 'kinetic-branding',
    index: '03',
    title: 'Kinetic Brand Systems & Typography',
    category: 'Creative Direction',
    desc: 'High-contrast typography hierarchies, dynamic motion principles, responsive layout orchestration, and memorable digital identities.',
    tags: ['Design Systems', 'Micro-Interactions', 'Audio Branding', 'Variable Fonts']
  },
  {
    id: 'fullstack-eng',
    index: '04',
    title: 'Full-Stack Performance Architecture',
    category: 'Systems Engineering',
    desc: 'Low-latency server infrastructure, edge caching, real-time WebSocket state synchronization, and rock-solid deployment pipelines.',
    tags: ['Node / TypeScript', 'Cloud Run', 'WebSockets', 'Vite / Tailwind', 'CI / CD']
  }
];

export const ExpertiseMatrixSection: React.FC<ExpertiseMatrixSectionProps> = ({
  onOpenContact,
  onSetCursorMode
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scaleWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activePillar, setActivePillar] = useState(0);
  const [unfoldProgress, setUnfoldProgress] = useState(0);
  const [isFullyOpened, setIsFullyOpened] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);

  // 1. THREE.JS 3D STONE LETTER OBJECT (Letra në formë guri që hapet avash-avash me scroll)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222238, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.5);
    keyLight.position.set(-6, 8, 8);
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 2.8);
    cyanRimLight.position.set(8, -6, 6);
    scene.add(cyanRimLight);

    const purpleBackLight = new THREE.PointLight(0xa855f7, 3.2, 35);
    purpleBackLight.position.set(0, 5, -5);
    scene.add(purpleBackLight);

    // Stone Letter Master 3D Group
    const stoneLetterMaster = new THREE.Group();
    stoneLetterMaster.position.set(0, 0, 0);
    scene.add(stoneLetterMaster);

    // Materials
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c24,
      roughness: 0.32,
      metalness: 0.88,
    });

    const runeEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x050d18,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      roughness: 0.2,
      metalness: 0.95
    });

    const goldSealMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      metalness: 0.96,
      roughness: 0.22
    });

    // 1A. Central Base Tablet Slab
    const baseGeo = new THREE.BoxGeometry(3.0, 3.8, 0.22);
    const baseTablet = new THREE.Mesh(baseGeo, stoneMaterial);
    stoneLetterMaster.add(baseTablet);

    // Center Gold Seal
    const sealGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.28, 32);
    const centerSeal = new THREE.Mesh(sealGeo, goldSealMat);
    centerSeal.rotation.x = Math.PI * 0.5;
    centerSeal.position.z = 0.12;
    stoneLetterMaster.add(centerSeal);

    // Center Runic Inscription Lines on Base Tablet
    const runeLineGeo = new THREE.BoxGeometry(2.2, 0.04, 0.24);
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Leave center for seal
      const lineMesh = new THREE.Mesh(runeLineGeo, runeEmissiveMat);
      lineMesh.position.set(0, i * 0.42, 0.02);
      stoneLetterMaster.add(lineMesh);
    }

    // 1B. Top Flap: hinged at y = 1.9
    const topHinge = new THREE.Group();
    topHinge.position.set(0, 1.9, 0.12);
    stoneLetterMaster.add(topHinge);

    const topFlapGeo = new THREE.BoxGeometry(3.0, 1.9, 0.18);
    const topFlapMesh = new THREE.Mesh(topFlapGeo, stoneMaterial);
    topFlapMesh.position.set(0, -0.95, 0);
    topHinge.add(topFlapMesh);

    const topRune = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.2), runeEmissiveMat);
    topRune.position.set(0, -0.95, 0.05);
    topHinge.add(topRune);

    // 1C. Bottom Flap: hinged at y = -1.9
    const bottomHinge = new THREE.Group();
    bottomHinge.position.set(0, -1.9, 0.12);
    stoneLetterMaster.add(bottomHinge);

    const bottomFlapGeo = new THREE.BoxGeometry(3.0, 1.9, 0.18);
    const bottomFlapMesh = new THREE.Mesh(bottomFlapGeo, stoneMaterial);
    bottomFlapMesh.position.set(0, 0.95, 0);
    bottomHinge.add(bottomFlapMesh);

    const bottomRune = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.2), runeEmissiveMat);
    bottomRune.position.set(0, 0.95, 0.05);
    bottomHinge.add(bottomRune);

    // 1D. Left Flap: hinged at x = -1.5
    const leftHinge = new THREE.Group();
    leftHinge.position.set(-1.5, 0, 0.24);
    stoneLetterMaster.add(leftHinge);

    const leftFlapGeo = new THREE.BoxGeometry(1.5, 3.8, 0.18);
    const leftFlapMesh = new THREE.Mesh(leftFlapGeo, stoneMaterial);
    leftFlapMesh.position.set(0.75, 0, 0);
    leftHinge.add(leftFlapMesh);

    const leftRune = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.2), runeEmissiveMat);
    leftRune.position.set(0.75, 0, 0.05);
    leftHinge.add(leftRune);

    // 1E. Right Flap: hinged at x = 1.5
    const rightHinge = new THREE.Group();
    rightHinge.position.set(1.5, 0, 0.24);
    stoneLetterMaster.add(rightHinge);

    const rightFlapGeo = new THREE.BoxGeometry(1.5, 3.8, 0.18);
    const rightFlapMesh = new THREE.Mesh(rightFlapGeo, stoneMaterial);
    rightFlapMesh.position.set(-0.75, 0, 0);
    rightHinge.add(rightFlapMesh);

    const rightRune = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.2), runeEmissiveMat);
    rightRune.position.set(-0.75, 0, 0.05);
    rightHinge.add(rightRune);

    // Floating Stardust Motes
    const moteCount = 180;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 12;
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      size: 0.055,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75
    });
    const motesGroup = new THREE.Points(moteGeo, moteMat);
    scene.add(motesGroup);

    // Initial State: Tightly folded
    topHinge.rotation.x = Math.PI;
    bottomHinge.rotation.x = -Math.PI;
    leftHinge.rotation.y = -Math.PI;
    rightHinge.rotation.y = Math.PI;

    // Render loop
    let animId: number;
    const clock = new THREE.Clock();
    let currentProgress = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      // Idle levitation & gentle angle float
      stoneLetterMaster.position.y = Math.sin(time * 1.5) * 0.12;
      stoneLetterMaster.rotation.x = Math.sin(time * 0.9) * 0.05;
      stoneLetterMaster.rotation.y = Math.sin(time * 0.7) * 0.09;

      motesGroup.rotation.y = time * 0.15;

      // Scroll-driven unfolding calculation
      const p = currentProgress;

      // Stage 1: Left and right stone wings unfold
      const sideProgress = THREE.MathUtils.smoothstep(p, 0.12, 0.52);
      leftHinge.rotation.y = -Math.PI * (1 - sideProgress);
      rightHinge.rotation.y = Math.PI * (1 - sideProgress);

      // Stage 2: Top and bottom flaps swing unfold
      const vertProgress = THREE.MathUtils.smoothstep(p, 0.40, 0.82);
      topHinge.rotation.x = Math.PI * (1 - vertProgress);
      bottomHinge.rotation.x = -Math.PI * (1 - vertProgress);

      // Camera gently tracks forward as letter unfolds
      camera.position.z = 10.5 - p * 3.2;

      // Pulse runic glow with unfolding
      runeEmissiveMat.emissiveIntensity = 2.0 + p * 3.5;

      renderer.render(scene, camera);
    };

    render();

    // 2. GSAP SCROLLTRIGGER FOR SCALE ENTRANCE & CONTINUOUS UNFOLDING
    // "nuk do vije me zoom por do te dale pasi mbaron scroll i cards me scale beje shume mire kete pjese ketu"
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const scaleWrapper = scaleWrapperRef.current;
      if (!section || !scaleWrapper) return;

      // Scale in smoothly right after cards scroll ends (scale: 0.90 -> 1.0, opacity: 0.4 -> 1.0)
      gsap.fromTo(
        scaleWrapper,
        {
          scale: 0.90,
          opacity: 0.5,
          borderRadius: '32px',
        },
        {
          scale: 1.0,
          opacity: 1.0,
          borderRadius: '0px',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top top',
            scrub: 1.0,
          }
        }
      );

      // Pin the section to unfold the stone letter gradually with scroll
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          const prog = self.progress;
          currentProgress = prog;
          setUnfoldProgress(prog);
          setIsFullyOpened(prog > 0.78);
        }
      });
    }, sectionRef);

    const handleResize = () => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Auto-play cosmic video smoothly
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Video autoplay gracefully handled
      });
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
      renderer.dispose();
    };
  }, []);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
    SoundEngine.playTick();
  };

  return (
    <section
      ref={sectionRef}
      id="expertise"
      className="relative w-full bg-black text-white overflow-hidden select-none"
    >
      <span id="services" className="absolute -top-20 pointer-events-none" />

      {/* SCALE WRAPPER FOR SEAMLESS SCALE-IN ENTRANCE ("do te dale pasi mbaron scroll i cards me scale") */}
      <div
        ref={scaleWrapperRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* 1. GALAXY VIDEO BACKGROUND ("mbraoa ketij backgroundi vendos ate galaktike qe une te thashe por te jete nje video background") */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-65 scale-105 filter brightness-110 contrast-125"
          >
            {/* NASA / Deep Galaxy Collision Simulation */}
            <source
              src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c3/Galaxy_Collision_Animation-_James_Webb_Space_Telescope_Science.webm/Galaxy_Collision_Animation-_James_Webb_Space_Telescope_Science.webm.720p.vp9.webm"
              type="video/webm"
            />
            {/* Milky Way Timelapse secondary stream */}
            <source
              src="https://upload.wikimedia.org/wikipedia/commons/6/63/Milky_Way_Timelapse.webm"
              type="video/webm"
            />
            {/* MP4 fallback stream */}
            <source
              src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c3/Galaxy_Collision_Animation-_James_Webb_Space_Telescope_Science.webm/Galaxy_Collision_Animation-_James_Webb_Space_Telescope_Science.webm.360p.mpeg4.mov"
              type="video/mp4"
            />
          </video>

          {/* Cinematic Vignette & Deep Cosmic Contrast Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-radial-vignette opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.85)_100%)]" />
        </div>

        {/* 2. THREE.JS 3D CANVAS: UNFOLDING STONE LETTER OBJECT ("ndersa letra te jete 3d object") */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        />

        {/* 3. SECTION HEADER // TELEMETRY BAR */}
        <div className="relative z-20 max-w-7xl w-full mx-auto px-5 sm:px-8 md:px-12 pt-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STAGE 05 // EXPERTISE MATRIX</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Studio Capabilities<span className="text-orange-500">.</span>
            </h2>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleVideoPlayback}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-[11px] font-mono text-neutral-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>GALAXY FEED: {videoPlaying ? 'STREAMING' : 'PAUSED'}</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
                STONE CODEX STATUS
              </span>
              <span className="font-mono text-xs text-cyan-400 font-bold">
                {Math.round(unfoldProgress * 100)}% UNFOLDED
              </span>
            </div>
          </div>
        </div>

        {/* 4. MAIN INTERACTIVE CONTENT AREA (Left Pillars & Right Stone Codex Revealer) */}
        <div className="relative z-20 max-w-7xl w-full mx-auto px-5 sm:px-8 md:px-12 flex-1 flex flex-col md:flex-row items-center justify-between gap-8 py-4 pointer-events-none">
          {/* Left Column: Interactive Pillars Selector */}
          <div className="w-full md:w-5/12 space-y-3 pointer-events-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
              // SELECT SPECIALIZATION MATRIX
            </span>

            <div className="space-y-2">
              {EXPERTISE_PILLARS.map((pillar, idx) => {
                const isSelected = activePillar === idx;

                return (
                  <div
                    key={pillar.id}
                    onClick={() => {
                      SoundEngine.playTick(1400 + idx * 100);
                      setActivePillar(idx);
                    }}
                    onMouseEnter={() => SoundEngine.playHover()}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-neutral-900/85 border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.2)]'
                        : 'bg-black/50 border-white/10 hover:border-white/30 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-orange-400 font-bold">{pillar.index} // {pillar.category}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-sans text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {pillar.desc}
                    </p>

                    {isSelected && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10 mt-2.5">
                        {pillar.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-cyan-300 border border-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Holographic Codex Display (Revealed when 3D stone letter opens) */}
          <div className="w-full md:w-5/12 pointer-events-auto flex flex-col items-center justify-center">
            {isFullyOpened ? (
              <div className="w-full p-6 rounded-2xl border border-cyan-400/60 bg-black/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>STONE CODEX // DECRYPTED</span>
                  </div>
                  <span className="text-[10px] text-orange-400 font-mono">
                    SEC-CLEARANCE: ALPHA
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
                    {EXPERTISE_PILLARS[activePillar].title}
                  </h4>
                  <p className="text-xs font-sans text-neutral-300 leading-relaxed">
                    {EXPERTISE_PILLARS[activePillar].desc}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1">
                  <div className="flex justify-between">
                    <span>SECTOR TARGET:</span>
                    <span className="text-white">ENTERPRISE / GLOBAL SCALE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DELIVERY SPRINT:</span>
                    <span className="text-white">4 — 8 WEEKS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU LATENCY:</span>
                    <span className="text-emerald-400">&lt; 16.6ms (60 FPS FLUID)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    SoundEngine.playBlast();
                    onOpenContact();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <span>ENGAGE EXPERTISE TEAM</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md text-center space-y-2 max-w-xs">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-ping mr-2" />
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-bold">
                  SCROLL DOWN TO UNFOLD STONE LETTER
                </span>
                <p className="text-[11px] font-sans text-neutral-400">
                  Rotate the mouse wheel to hinge open the 3D stone flaps and decrypt studio expertise capabilities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. BOTTOM RUNWAY NEEDLE & TELEMETRY */}
        <div className="relative z-20 max-w-7xl w-full mx-auto px-5 sm:px-8 md:px-12 pb-6 flex items-center justify-between text-xs font-mono text-neutral-400 border-t border-white/10 pt-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-white uppercase tracking-wider font-semibold">
              EXPERTISE RUNWAY: {isFullyOpened ? 'LETRA E GURIT E HAPUR PLOTESISHT' : 'LEVITATING STONE OBJECT'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
              SCROLL PROGRESSION:
            </span>
            <div className="w-32 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 transition-all duration-75"
                style={{ width: `${Math.round(unfoldProgress * 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-white font-bold">
              {Math.round(unfoldProgress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
