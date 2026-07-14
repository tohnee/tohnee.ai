// src/data/searchIndex.ts
// Local search index used by the Search page for client-side filtering.
// Add new entries as you add pages.

export type SearchResultType = 'Research' | 'Model' | 'Agent' | 'Project' | 'Page';

export interface SearchEntry {
  title: string;
  type: SearchResultType;
  url: string;
  description: string;
  date?: string;
  tags?: string[];
}

export const searchIndex: SearchEntry[] = [
  // ── Research ──────────────────────────────────────────────
  {
    title: 'Sparse Autoencoders for Efficient Inference',
    type: 'Research',
    url: '/research/1',
    description:
      'A novel architecture leveraging sparse activation patterns to reduce computational overhead during inference by up to 40% while maintaining performance parity.',
    date: 'Feb 21, 2026',
    tags: ['agi', 'alignment', 'autoencoders', 'inference', 'efficiency'],
  },
  {
    title: 'Scaling Laws for One-Person Companies',
    type: 'Research',
    url: '/research/scaling-laws',
    description:
      'Investigating how AI leverage scales non-linearly with individual agency. Proposes a new productivity metric: Intelligence Per Human (IPH).',
    date: 'Feb 10, 2026',
    tags: ['economics', 'scaling', 'productivity', 'opc'],
  },

  // ── Models ────────────────────────────────────────────────
  {
    title: 'Tohnee-7B-Instruct',
    type: 'Model',
    url: '/models/1',
    description:
      'A highly efficient 7B model fine-tuned for reasoning and code generation, optimized for local deployment on consumer hardware. 32k context window.',
    tags: ['model', '7b', 'instruct', 'reasoning', 'code', 'pricing'],
  },

  // ── Agents ───────────────────────────────────────────────
  {
    title: 'Dev-01',
    type: 'Agent',
    url: '/agents/dev-01',
    description:
      'Autonomous software engineer capable of planning, coding, debugging, and deploying full-stack applications. Integrates with version control and CI/CD.',
    tags: ['agent', 'dev', 'engineering', 'autonomous', 'safety'],
  },
  {
    title: 'Research-01',
    type: 'Agent',
    url: '/agents/research-01',
    description:
      'Accelerates scientific discovery by automating literature reviews, synthesizing data from multiple sources, and generating testable hypotheses.',
    tags: ['agent', 'research', 'literature', 'hypothesis'],
  },
  {
    title: 'Design-01',
    type: 'Agent',
    url: '/agents/design-01',
    description:
      'Generative UI/UX designer creating high-fidelity designs, enforcing design system consistency, and auditing accessibility.',
    tags: ['agent', 'design', 'ui', 'ux', 'accessibility'],
  },

  // ── Projects ─────────────────────────────────────────────
  {
    title: 'ExoKey',
    type: 'Project',
    url: '/projects/exokey',
    description:
      'Context-aware AI keyboard assistant built with Tauri. Ghost Chat, Skill Engine, IM Broadcast, and local vector memory for desktop.',
    tags: ['project', 'exokey', 'tauri', 'rust', 'keyboard', 'desktop'],
  },
  {
    title: 'CIAO',
    type: 'Project',
    url: '/projects/ciao',
    description:
      'Modern full-stack application monorepo foundation with TypeScript, Prisma ORM, and Docker-based infrastructure.',
    tags: ['project', 'ciao', 'monorepo', 'typescript', 'prisma', 'docker'],
  },
  {
    title: 'freeAPI',
    type: 'Project',
    url: '/projects/freeapi',
    description:
      'OpenRouter-compatible free API gateway providing unified access to multiple LLMs through a single OpenAI-compatible API endpoint.',
    tags: ['project', 'freeapi', 'llm', 'api', 'gateway', 'openrouter'],
  },
  {
    title: 'Zhiwo',
    type: 'Project',
    url: '/projects/zhiwo',
    description:
      'AI-native knowledge operating system with DeepSeek integration, Neo4j graph persistence, and AI-assisted research workflows.',
    tags: ['project', 'zhiwo', 'knowledge', 'deepseek', 'neo4j', 'graph'],
  },
  {
    title: 'Inference Agent',
    type: 'Project',
    url: '/projects/inference-agent',
    description:
      'End-to-end inference optimization toolkit covering E2E pipelines, LLM serving (SGLang/vLLM), and CUDA kernel optimization.',
    tags: ['project', 'inference', 'cuda', 'sglang', 'vllm', 'optimization'],
  },

  // ── Pages ────────────────────────────────────────────────
  {
    title: 'OPC OS - One-Person Company Operating System',
    type: 'Page',
    url: '/opc',
    description:
      'A framework for maximizing individual leverage through AI: Strategy, Execution, Growth, and System pillars.',
    tags: ['opc', 'framework', 'productivity', 'company', 'strategy'],
  },
  {
    title: 'About Tohnee.ai',
    type: 'Page',
    url: '/company',
    description:
      'An experimental research lab exploring the limits of individual leverage through Artificial General Intelligence.',
    tags: ['company', 'about', 'team', 'leadership'],
  },
  {
    title: 'Charter',
    type: 'Page',
    url: '/company/charter',
    description:
      'Our mission to ensure AGI benefits all of humanity: broadly distributed benefits, long-term safety, technical leadership, and cooperative orientation.',
    tags: ['charter', 'mission', 'safety', 'agi'],
  },
  {
    title: 'Careers',
    type: 'Page',
    url: '/company/careers',
    description:
      'Join Tohnee.ai - build the future of human-AI collaboration. Open positions in research, engineering, design, and operations.',
    tags: ['careers', 'jobs', 'hiring'],
  },
  {
    title: 'Blog',
    type: 'Page',
    url: '/company/blog',
    description: 'Research updates, insights, and stories from Tohnee.ai on AGI, agents, and the One-Person Company.',
    tags: ['blog', 'updates', 'insights'],
  },
  {
    title: 'Try Tohnee-7B',
    type: 'Page',
    url: '/try',
    description:
      'Chat with Tohnee-7B directly in your browser. A 7B model fine-tuned for reasoning, coding, and autonomous agent workflows.',
    tags: ['try', 'chat', 'demo', '7b'],
  },
];

export const popularSearches = ['AGI Safety', 'Model Pricing', 'Careers', 'Scaling Laws', 'Agent Alignment'];
