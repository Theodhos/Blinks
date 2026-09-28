import type {
  AwardItem,
  ExperimentItem,
  ProcessStep,
  Project,
  ServiceItem,
  StatItem,
  TestimonialItem,
} from '@/types';

export const STUDIO = {
  name: 'KINETIK',
  legalName: 'Kinetik Labs GmbH',
  descriptor: 'Creative Technology & Digital Studio',
  established: '2012',
  tenure: '14+ years shaping digital direction.',
  summary: 'Websites, AI products, brands, and systems built for clarity, scale and impact.',
  footnote:
    'An independent creative technology & spatial engineering studio. Built for clarity, scale, and lasting cultural impact.',
  coordinates: 'LAT 52.5200° N — LON 13.4050° E',
  capacity: 'Studio capacity: 1 commission available',
};

export const HERO = {
  lineOne: 'DESIGNED WITH',
  lineTwo: 'PURPOSE.',
  primaryCta: 'Discuss your project',
  secondaryCta: 'Book a 30-minute call',
};

export const MANIFESTO = {
  statement:
    'Kinetik is an independent digital studio crafting meaningful brand experiences through strategy, design, and technology.',
  credo: ['We design for longevity.', 'Clarity first, craft always.', 'Built to scale.'],
  mission:
    'Our mission is to make technology feel human by designing digital products that are intuitive, purposeful, and meaningful to people.',
};

export const SERVICES_INTRO =
  'Different disciplines. One standard of relentless craft. We merge cutting-edge AI computation with emotive spatial design.';

export const SERVICES: ServiceItem[] = [
  {
    id: 'ai-automation',
    number: '01',
    title: 'A.I. & Intelligent Automation',
    tagline: 'From static UI to dynamic cognitive agents',
    description:
      'We architect and build intelligent agent interfaces, real-time generative models, and contextual workflow systems that elevate how humans interact with machine intelligence.',
    deliverables: [
      'Custom LLM Integration',
      'Generative UI Systems',
      'Real-time Workflow Engines',
      'Predictive Modeling UX',
    ],
    color: '#e2e8f0',
  },
  {
    id: 'creative-dev',
    number: '02',
    title: 'Creative Development & WebGL',
    tagline: 'Cinema-grade interactive web performance',
    description:
      'Pushing the boundaries of the browser through custom GLSL shaders, procedural geometry, hardware-accelerated 3D, and butter-smooth frame rates.',
    deliverables: [
      'Custom Three.js / WebGL',
      'GLSL Shader Development',
      'GSAP Scroll Systems',
      'Physics-Driven Interactions',
    ],
    color: '#ff5533',
  },
  {
    id: 'product-design',
    number: '03',
    title: 'Digital Product & Interface Design',
    tagline: 'Precision craft engineered for clarity',
    description:
      'Obsessive attention to typography, spatial hierarchy, interaction kinetics, and tactile design systems that transform complex utilities into effortless rituals.',
    deliverables: [
      'Design Systems & Tokens',
      'SaaS Architecture',
      'Micro-interaction Choreography',
      'Prototyping & User Testing',
    ],
    color: '#60a5fa',
  },
  {
    id: 'brand-systems',
    number: '04',
    title: 'Kinetic Brand Systems',
    tagline: 'Identities built for high-velocity screens',
    description:
      'We define dynamic visual languages that thrive in motion: reactive logomarks, proprietary typography, sound design, and bespoke 3D artifacts.',
    deliverables: [
      'Dynamic Brand Identity',
      'Sonic Branding & Sound',
      '3D Asset Production',
      'Guidelines & Token Toolkits',
    ],
    color: '#f59e0b',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'synapse-ai',
    title: 'Synapse AI',
    category: 'AI & Digital Workers',
    year: '2025',
    client: 'Synapse Neurotech',
    description:
      'An autonomous enterprise orchestration platform turning natural-language directives into parallelized agent swarms with deterministic precision.',
    accentColor: '#d4af37',
    tags: ['WebGL', 'AI Agents', 'Real-time Canvas', 'React 19'],
    metrics: '+340% Execution Velocity',
    image: '/images/work/synapse-ai.jpg',
  },
  {
    id: 'sonic-labs',
    title: 'Sonic Labs',
    category: 'Spatial Audio & WebGL',
    year: '2025',
    client: 'Sonic Acoustics Inc.',
    description:
      'An independent audio-first spatial sandbox shaped by sound waves, interactive frequencies, and real-time GPU audio-reactive shaders.',
    accentColor: '#ff3e3e',
    tags: ['Web Audio API', 'Three.js', 'Shader Art', 'Brand Identity'],
    metrics: '2.1M Active Sessions',
    image: '/images/work/sonic-labs.jpg',
  },
  {
    id: 'valo-residences',
    title: 'Valo Residences',
    category: 'Luxury Architecture & 3D',
    year: '2024',
    client: 'Valo Nordic Group',
    description:
      'Cinematic real estate portal featuring photorealistic WebGL walk-throughs, sunlight angle simulators, and ultra-high-definition interactive floorplans.',
    accentColor: '#93c5fd',
    tags: ['Photorealistic 3D', 'Next-Gen UI', 'Interaction Design'],
    metrics: '$180M Sold in 14 Days',
    image: '/images/work/valo-residences.jpg',
  },
  {
    id: 'neura-glass',
    title: 'Neura Glass',
    category: 'Spatial OS & Mixed Reality',
    year: '2024',
    client: 'Neura Computing Corp',
    description:
      'The interface paradigm for spatial computing. We defined the design language, gesture mechanics, and depth-based typography standards.',
    accentColor: '#a78bfa',
    tags: ['Spatial UX', '3D Design', 'Design Systems', 'Micro-interactions'],
    metrics: 'Awwwards Site of the Month',
    image: '/images/work/neura-glass.jpg',
  },
  {
    id: 'kromatik-motion',
    title: 'Kromatik Motion',
    category: 'Kinetic Brand Identity',
    year: '2024',
    client: 'Kromatik Studio Berlin',
    description:
      'A responsive kinetic typography suite that flexes according to ambient microphone input, user velocity, and device gyroscopes.',
    accentColor: '#fbbf24',
    tags: ['Kinetic Typography', 'Variable Fonts', 'Motion Design'],
    metrics: '14 International Awards',
    image: '/images/work/kromatik-motion.jpg',
  },
];

export const EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp-01',
    title: 'Loose Sketches to Visuals',
    subtitle: 'Real-time sketch diffusion in canvas',
    category: 'Generative AI',
    year: '2025',
    image: '/images/lab/exp-01.jpg',
    tech: 'WebGPU + Web Workers',
  },
  {
    id: 'exp-02',
    title: 'Building the Future of Music',
    subtitle: 'Synthesizer pads reacting to cursor drag',
    category: 'Web Audio',
    year: '2025',
    image: '/images/lab/exp-02.jpg',
    tech: 'Oscillator Nodes',
  },
  {
    id: 'exp-03',
    title: 'Swank Style Character',
    subtitle: '3D cloth simulation with variable wind',
    category: 'Physics',
    year: '2024',
    image: '/images/lab/exp-03.jpg',
    tech: 'Verlet Integration',
  },
  {
    id: 'exp-04',
    title: 'Chronograph 2026',
    subtitle: 'Tactile titanium mechanical watchmaker UI',
    category: 'Micro-interactions',
    year: '2024',
    image: '/images/lab/exp-04.jpg',
    tech: 'Spring Physics',
  },
  {
    id: 'exp-05',
    title: 'NovaGlam Studio',
    subtitle: 'Chromatic aberration mouse distortion',
    category: 'GLSL Shaders',
    year: '2024',
    image: '/images/lab/exp-05.jpg',
    tech: 'Post-processing',
  },
  {
    id: 'exp-06',
    title: 'Raymarched Caustics',
    subtitle: 'Real-time underwater light ray refraction',
    category: 'Raymarching',
    year: '2025',
    image: '/images/lab/exp-06.jpg',
    tech: 'SDF + Volumetric GLSL',
  },
  {
    id: 'exp-07',
    title: 'Kinetic Particle Lattice',
    subtitle: '100,000 interactive cursor-repulsed atoms',
    category: 'Compute Shaders',
    year: '2025',
    image: '/images/lab/exp-07.jpg',
    tech: 'WebGL2 Instancing',
  },
];

/* Assembled from the studio's own manifesto language — no new claims. */
export const PROCESS = {
  heading: 'From idea to outcome.',
  steps: [
    { number: '01', title: 'Strategy', line: 'Focused vision.' },
    { number: '02', title: 'Design', line: 'Clarity first, craft always.' },
    { number: '03', title: 'Technology', line: 'Measured execution. Built to scale.' },
  ] satisfies ProcessStep[],
  outcome: ['IMPACT', 'INSPIRE', 'INNOVATE'],
};

export const STATS: StatItem[] = [
  {
    number: '50+',
    label: 'Featured & Honors',
    sublabel: 'Awwwards, FWA, Red Dot, and Cannes Lions recognition.',
  },
  {
    number: '1.5K+',
    label: 'Projects Delivered',
    sublabel: '92% of our partners return for multi-year product expansions.',
  },
  {
    number: '20+',
    label: 'Specialized Artisans',
    sublabel: 'Creative engineers, 3D sculptors, and brand architects worldwide.',
  },
];

export const AWARDS: AwardItem[] = [
  { year: '2025', title: 'Synapse Spatial Engine', category: 'Site of the Month', organization: 'Awwwards', badge: 'SOTM' },
  { year: '2025', title: 'Sonic Acoustics WebGL', category: 'Best Web Audio Experience', organization: 'FWA of the Day', badge: 'FWA' },
  { year: '2024', title: 'Valo Residences Real Estate', category: 'UI/UX Craft Excellence', organization: 'CSS Design Awards', badge: 'WOTD' },
  { year: '2024', title: 'Kinetik Design System', category: 'Design Systems Pioneer', organization: 'Red Dot Best of Best', badge: 'RED DOT' },
  { year: '2023', title: 'Neura Computing Identity', category: 'Digital Innovation Grand Prix', organization: 'Cannes Lions', badge: 'LIONS' },
];

export const CLIENTS = [
  { name: 'Credible', category: 'Fintech' },
  { name: 'Yellowtail', category: 'Venture Studio' },
  { name: 'Technis AI', category: 'Cognitive' },
  { name: 'Dockto', category: 'Healthcare' },
  { name: 'Ventrice', category: 'Robotics' },
  { name: 'Aetheria', category: 'Spatial' },
  { name: 'Kromatik', category: 'Media' },
  { name: 'Nordic Light', category: 'Luxury' },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    quote:
      'Working with the Kinetik team redefined what we thought was possible in a browser. They bridge high-art typography with zero-lag WebGL performance. Truly rare talent.',
    author: 'Malte Kramer',
    role: 'Founder & CEO',
    company: 'Luxury Presence • USA',
  },
  {
    id: '2',
    quote:
      'Their obsession with tactile micro-interactions and spatial motion transformed our AI product launch into a landmark event. Conversion jumped 240% in our first quarter.',
    author: 'Elena Rostova',
    role: 'Chief Product Officer',
    company: 'Synapse Global • Zurich',
  },
];

export const CONTACT = {
  eyebrow: 'Start a conversation',
  headlineOne: 'Ready to build',
  headlineTwo: 'something bold?',
  cta: 'Initiate brief',
  email: 'hello@kinetik-studios.com',
  partnersEmail: 'partners@kinetik-studios.com',
  pressEmail: 'press@kinetik-studios.com',
  phone: '+49 (0) 30 8920 4410',
  phoneHref: '+493089204410',
  responseTime: 'Average response time: < 4 hours',
  callTitle: '30-Minute Architecture Call',
  callBody:
    'Prefer an exploratory sync? Book a 30-minute introductory architecture session directly with our creative director.',
  projectTypes: [
    'AI & Intelligent Agents',
    'WebGL & 3D Experience',
    'Digital Product & UI/UX',
    'Kinetic Brand System',
    'Full-Stack Architecture',
  ],
  budgets: ['$25k — $50k', '$50k — $100k', '$100k — $250k', '$250k+'],
};

export const STUDIOS = [
  { label: 'Berlin / HQ', address: 'Torstraße 140, Mitte', zone: 'CET', timeZone: 'Europe/Berlin' },
  { label: 'New York / Lab', address: '45 Crosby St, SoHo', zone: 'EST', timeZone: 'America/New_York' },
];

export const CLOCKS = [
  { city: 'Berlin', timeZone: 'Europe/Berlin' },
  { city: 'New York', timeZone: 'America/New_York' },
  { city: 'Tokyo', timeZone: 'Asia/Tokyo' },
];

export const NETWORK = ['LinkedIn', 'Instagram', 'X (Twitter)', 'Dribbble', 'GitHub', 'Awwwards'];
