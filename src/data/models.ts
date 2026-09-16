export const APP_VERSION = '1.0.0';
export const APP_VERSION_DISPLAY = 'RGAMER AI VERSION 1.0.0';

export interface RGamerModel {
  id: string;
  name: string;
  version: string;
  versionDisplay: string;
  tag: string;
  badgeColor: string;
  description: string;
  capabilities: string[];
  isUnderConstruction?: boolean;
  isPowerModel?: boolean;
}

export const RGAMER_MODELS: RGamerModel[] = [
  {
    id: 'RGAMER ALLROUNDER',
    name: 'RGAMER ALLROUNDER',
    version: '1.0',
    versionDisplay: 'ALLROUNDER VERSION 1.0 (SUPER-BRAIN)',
    tag: 'Omniscient Universal AI',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Vast universal knowledge base: Live web grounding, Wikipedia encyclopedia facts, advanced science, world history, and high-IQ reasoning.',
    capabilities: [
      'Live web grounding & instant Wikipedia encyclopedia facts',
      'Quantum physics, advanced mathematics & universal science',
      'World history, geopolitics, philosophy & cultural analysis',
      'Creative strategy, storytelling & viral YouTube formulas'
    ]
  },
  {
    id: 'RGAMER THE CODER',
    name: 'RGAMER THE CODER',
    version: '1.0',
    versionDisplay: 'THE CODER VERSION 1.0 (COMPOUND ENGINE)',
    tag: 'Principal Software Architect',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Supreme coding intelligence powered by Groq Compound architecture. Full-stack websites, complex algorithms, Blender 3D bpy automation, and cloud deployments.',
    capabilities: [
      'Production-ready full websites (React, Next.js, HTML/Tailwind, Node.js, Python)',
      'Blender 3D bpy automation (procedural geometry, materials, camera rigs)',
      'Complex data structures, algorithms & database architecture',
      'End-to-end cloud deployment setups (Vercel, Netlify, Render, Cloudflare, Supabase)'
    ]
  },
  {
    id: 'RGAMER IMAGE GENERATION',
    name: 'RGAMER IMAGE GENERATION',
    version: '1.0',
    versionDisplay: 'IMAGE GENERATION VERSION 1.0 (FLUX HD)',
    tag: 'Visual Art Master',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Hyper-detailed 8K visual concept artist. Photorealistic portraits, cinematic lighting, 3D character concepts, and official RGAMER Cyber R emblems.',
    capabilities: [
      'Hyper-realistic 8k visual rendering via Flux engine',
      'Photorealistic portraits, Unreal Engine 5 Octane aesthetics',
      'Cyber R gaming monograms & high-tech product branding',
      'Direct in-chat render previews & widescreen wallpapers'
    ]
  },
  {
    id: 'RGAMER VIDEO GENERATION',
    name: 'RGAMER VIDEO GENERATION',
    version: '1.0',
    versionDisplay: 'VIDEO GENERATION VERSION 1.0',
    tag: 'Cinematic Motion Director',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Specialized in 5-second cinematic video production, dynamic camera choreographies (dolly, FPV orbit, speed ramp), and motion storyboarding.',
    isUnderConstruction: true,
    capabilities: [
      '5-second cinematic video timelines & motion choreography',
      'Camera framing (Lens mm, shutter speed, FPS, lighting transitions)',
      'Motion previews and animated concept visuals',
      'Blender, Unreal Engine & Premiere video generation pipelines'
    ]
  },
  {
    id: 'RGAMER POWER MODEL',
    name: 'RGAMER POWER MODEL',
    version: '1.0',
    versionDisplay: 'POWER MODEL VERSION 1.0 (AGENTIC)',
    tag: 'Hardware-Aware 3D Assistant',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Direct Blender integration. Hardware-aware procedural 3D generation, cinematography engine, and auto-rigging capabilities.',
    capabilities: [
      'Direct Blender execution via .exe app & auto-context mapping',
      'Hardware-aware generation (Potato to Powerhouse scaling)',
      'Cinematography Engine (Camera rigs, 3-point lighting, color gels)',
      'Rigging Assistant & Smart Scene Organizer (Auto-Culling)'
    ],
    isPowerModel: true
  }
];
