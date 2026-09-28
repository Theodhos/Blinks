import { Project, ServiceItem, StatItem, AwardItem, TestimonialItem, ExperimentItem } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'synapse-ai',
    title: 'Synapse AI',
    category: 'AI & Digital Workers',
    year: '2025',
    client: 'Synapse Neurotech',
    description: 'An autonomous enterprise orchestration platform turning natural-language directives into parallelized agent swarms with deterministic precision.',
    accentColor: '#d4af37',
    tags: ['WebGL', 'AI Agents', 'Real-time Canvas', 'React 19'],
    metrics: '+340% Execution Velocity',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'sonic-labs',
    title: 'Sonic Labs',
    category: 'Spatial Audio & WebGL',
    year: '2025',
    client: 'Sonic Acoustics Inc.',
    description: 'An independent audio-first spatial sandbox shaped by sound waves, interactive frequencies, and real-time GPU audio-reactive shaders.',
    accentColor: '#ff3e3e',
    tags: ['Web Audio API', 'Three.js', 'Shader Art', 'Brand Identity'],
    metrics: '2.1M Active Sessions',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    featured: true,
  },
  {
    id: 'valo-residences',
    title: 'Valo Residences',
    category: 'Luxury Architecture & 3D',
    year: '2024',
    client: 'Valo Nordic Group',
    description: 'Cinematic real estate portal featuring photorealistic WebGL walk-throughs, sunlight angle simulators, and ultra-high-definition interactive floorplans.',
    accentColor: '#93c5fd',
    tags: ['Photorealistic 3D', 'Next-Gen UI', 'Interaction Design'],
    metrics: '$180M Sold in 14 Days',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'neura-spatial',
    title: 'Neura Glass',
    category: 'Spatial OS & Mixed Reality',
    year: '2024',
    client: 'Neura Computing Corp',
    description: 'The interface paradigm for spatial computing. We defined the design language, gesture mechanics, and depth-based typography standards.',
    accentColor: '#a78bfa',
    tags: ['Spatial UX', '3D Design', 'Design Systems', 'Micro-interactions'],
    metrics: 'Awwwards Site of the Month',
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'kromatik',
    title: 'Kromatik Motion',
    category: 'Kinetic Brand Identity',
    year: '2024',
    client: 'Kromatik Studio Berlin',
    description: 'A responsive kinetic typography suite that flexes according to ambient microphone input, user velocity, and device gyroscopes.',
    accentColor: '#fbbf24',
    tags: ['Kinetic Typography', 'Variable Fonts', 'Motion Design'],
    metrics: '14 International Awards',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    featured: false,
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'ai-automation',
    number: '01',
    title: 'A.I. & Intelligent Automation',
    tagline: 'From static UI to dynamic cognitive agents',
    description: 'We architect and build intelligent agent interfaces, real-time generative models, and contextual workflow systems that elevate how humans interact with machine intelligence.',
    deliverables: ['Custom LLM Integration', 'Generative UI Systems', 'Real-time Workflow Engines', 'Predictive Modeling UX'],
    color: '#e2e8f0',
    modelVariant: 'faceted'
  },
  {
    id: 'creative-dev',
    number: '02',
    title: 'Creative Development & WebGL',
    tagline: 'Cinema-grade interactive web performance',
    description: 'Pushing the boundaries of the browser through custom GLSL shaders, procedural geometry, hardware-accelerated 3D, and butter-smooth frame rates.',
    deliverables: ['Custom Three.js / WebGL', 'GLSL Shader Development', 'GSAP Scroll Systems', 'Physics-Driven Interactions'],
    color: '#ff5533',
    modelVariant: 'torus'
  },
  {
    id: 'product-design',
    number: '03',
    title: 'Digital Product & Interface Design',
    tagline: 'Precision craft engineered for clarity',
    description: 'Obsessive attention to typography, spatial hierarchy, interaction kinetics, and tactile design systems that transform complex utilities into effortless rituals.',
    deliverables: ['Design Systems & Tokens', 'SaaS Architecture', 'Micro-interaction Choreography', 'Prototyping & User Testing'],
    color: '#60a5fa',
    modelVariant: 'lattice'
  },
  {
    id: 'brand-systems',
    number: '04',
    title: 'Kinetic Brand Systems',
    tagline: 'Identities built for high-velocity screens',
    description: 'We define dynamic visual languages that thrive in motion: reactive logomarks, proprietary typography, sound design, and bespoke 3D artifacts.',
    deliverables: ['Dynamic Brand Identity', 'Sonic Branding & Sound', '3D Asset Production', 'Guidelines & Token Toolkits'],
    color: '#f59e0b',
    modelVariant: 'cube'
  }
];

export const STATS: StatItem[] = [
  {
    number: '50+',
    label: 'Featured & Honors',
    sublabel: 'Awwwards, FWA, Red Dot, and Cannes Lions recognition.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
  },
  {
    number: '1.5K+',
    label: 'Projects Delivered',
    sublabel: '92% of our partners return for multi-year product expansions.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop'
  },
  {
    number: '20+',
    label: 'Specialized Artisans',
    sublabel: 'Creative engineers, 3D sculptors, and brand architects worldwide.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
  }
];

export const CLIENT_LOGOS = [
  { name: 'Credible', category: 'Fintech' },
  { name: 'Yellowtail', category: 'Venture Studio' },
  { name: 'Technis AI', category: 'Cognitive' },
  { name: 'Dockto', category: 'Healthcare' },
  { name: 'Ventrice', category: 'Robotics' },
  { name: 'Aetheria', category: 'Spatial' },
  { name: 'Kromatik', category: 'Media' },
  { name: 'Nordic Light', category: 'Luxury' }
];

export const AWARDS: AwardItem[] = [
  { year: '2025', title: 'Synapse Spatial Engine', category: 'Site of the Month', organization: 'Awwwards', badge: 'SOTM' },
  { year: '2025', title: 'Sonic Acoustics WebGL', category: 'Best Web Audio Experience', organization: 'FWA of the Day', badge: 'FWA' },
  { year: '2024', title: 'Valo Residences Real Estate', category: 'UI/UX Craft Excellence', organization: 'CSS Design Awards', badge: 'WOTD' },
  { year: '2024', title: 'Kinetik Design System', category: 'Design Systems Pioneer', organization: 'Red Dot Best of Best', badge: 'RED DOT' },
  { year: '2023', title: 'Neura Computing Identity', category: 'Digital Innovation Grand Prix', organization: 'Cannes Lions', badge: 'LIONS' }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    quote: "Working with the Kinetik team redefined what we thought was possible in a browser. They bridge high-art typography with zero-lag WebGL performance. Truly rare talent.",
    author: 'Malte Kramer',
    role: 'Founder & CEO',
    company: 'Luxury Presence • USA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    location: 'San Francisco, CA',
    durationAudio: '0:42'
  },
  {
    id: '2',
    quote: "Their obsession with tactile micro-interactions and spatial motion transformed our AI product launch into a landmark event. Conversion jumped 240% in our first quarter.",
    author: 'Elena Rostova',
    role: 'Chief Product Officer',
    company: 'Synapse Global • Zurich',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    location: 'Zurich, CH',
    durationAudio: '0:35'
  }
];

export const EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp-01',
    title: 'Loose Sketches to Visuals',
    subtitle: 'Real-time sketch diffusion in canvas',
    category: 'Generative AI',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
    tech: 'WebGPU + Web Workers'
  },
  {
    id: 'exp-02',
    title: 'Building the Future of Music',
    subtitle: 'Synthesizer pads reacting to cursor drag',
    category: 'Web Audio',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    tech: 'Oscillator Nodes'
  },
  {
    id: 'exp-03',
    title: 'Swank Style Character',
    subtitle: '3D cloth simulation with variable wind',
    category: 'Physics',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    tech: 'Verlet Integration'
  },
  {
    id: 'exp-04',
    title: 'Chronograph 2026',
    subtitle: 'Tactile titanium mechanical watchmaker UI',
    category: 'Micro-interactions',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    tech: 'Spring Physics'
  },
  {
    id: 'exp-05',
    title: 'NovaGlam Studio',
    subtitle: 'Chromatic aberration mouse distortion',
    category: 'GLSL Shaders',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    tech: 'Post-processing'
  },
  {
    id: 'exp-06',
    title: 'Raymarched Caustics',
    subtitle: 'Real-time underwater light ray refraction',
    category: 'Raymarching',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    tech: 'SDF + Volumetric GLSL'
  },
  {
    id: 'exp-07',
    title: 'Kinetic Particle Lattice',
    subtitle: '100,000 interactive cursor-repulsed atoms',
    category: 'Compute Shaders',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    tech: 'WebGL2 Instancing'
  }
];
