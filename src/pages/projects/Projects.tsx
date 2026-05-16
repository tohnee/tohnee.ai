import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const projects = [
  {
    slug: 'exokey',
    name: 'ExoKey',
    tagline: 'AI-Powered Exocortex for Desktop',
    description: 'Context-aware AI keyboard assistant built with Tauri. Ghost Chat, Skill Engine, IM Broadcast, and local vector memory.',
    tech: ['Rust', 'React', 'Tauri', 'TypeScript'],
    gradient: 'from-purple-900 to-black',
  },
  {
    slug: 'ciao',
    name: 'CIAO',
    tagline: 'Full-Stack Monorepo Foundation',
    description: 'Modern full-stack application monorepo with TypeScript, Prisma ORM, and Docker-based infrastructure.',
    tech: ['TypeScript', 'Prisma', 'Docker', 'React'],
    gradient: 'from-blue-900 to-black',
  },
  {
    slug: 'freeapi',
    name: 'freeAPI',
    tagline: 'Free LLM API Aggregation Platform',
    description: 'OpenRouter-compatible free API gateway providing unified access to multiple LLMs through a single OpenAI-compatible API.',
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    gradient: 'from-emerald-900 to-black',
  },
  {
    slug: 'zhiwo',
    name: 'Zhiwo',
    tagline: 'AI-Native Knowledge Operating System',
    description: 'Three-panel knowledge workbench with DeepSeek integration, Neo4j graph persistence, and AI-assisted research workflows.',
    tech: ['TypeScript', 'React', 'DeepSeek', 'Neo4j'],
    gradient: 'from-amber-900 to-black',
  },
  {
    slug: 'inference-agent',
    name: 'Inference Agent',
    tagline: 'Inference Optimization Engineering',
    description: 'End-to-end inference optimization toolkit covering E2E pipelines, LLM serving (SGLang/vLLM), and CUDA kernel optimization.',
    tech: ['Python', 'CUDA', 'SGLang', 'vLLM'],
    gradient: 'from-rose-900 to-black',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const Projects = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Open Source" description="Open source projects from Tohnee — ExoKey, CIAO, freeAPI, Zhiwo, and Inference Agent." path="/projects" />

    <div className="relative rounded-2xl overflow-hidden bg-black text-white p-12 md:p-24 mb-8">
      <div className="relative z-10 max-w-2xl">
        <motion.p
          className="text-sm font-mono uppercase text-gray-400 tracking-widest mb-6"
          variants={fadeUp} custom={0} initial="hidden" animate="visible"
        >
          Open Source
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl font-medium tracking-tight mb-6"
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
        >
          Our projects
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 leading-relaxed"
          variants={fadeUp} custom={2} initial="hidden" animate="visible"
        >
          Open-source tools and platforms we build to amplify individual potential —
          from AI desktop assistants to inference optimization toolkits.
        </motion.p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p, i) => (
        <motion.div
          key={p.slug}
          variants={fadeUp}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Link
            to={`/projects/${p.slug}`}
            className="group block h-full bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-300 transition-all duration-200 overflow-hidden"
          >
            <div className={`h-32 bg-gradient-to-br ${p.gradient} p-6 flex items-end`}>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{p.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-900">{p.tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {p.tech.map(t => (
                  <span key={t} className="text-[10px] font-mono px-2 py-1 bg-gray-200 text-gray-600 rounded uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-black transition-colors pt-2">
                View project <ArrowUpRight size={14} />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>

    <section className="border-t border-gray-100 pt-20 text-center">
      <div className="max-w-xl mx-auto space-y-6">
        <h2 className="text-3xl font-medium tracking-tight">Explore all repositories</h2>
        <p className="text-gray-500 leading-relaxed">
          All our projects are open source and available on GitHub. Contributions, issues, and stars are welcome.
        </p>
        <a
          href="https://github.com/tohnee"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95"
        >
          <Github size={18} /> View GitHub Organization <ExternalLink size={14} />
        </a>
      </div>
    </section>
  </div>
);

export default Projects;
