import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const FreeAPI = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="freeAPI" description="Free LLM API aggregation platform — OpenRouter-compatible, unified access to multiple LLMs via OpenAI-compatible API." path="/projects/freeapi" />

    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-black text-white p-12 md:p-24">
      <div className="relative z-10 max-w-2xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-mono" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          freeAPI
        </motion.h1>
        <motion.p className="text-xl text-emerald-200 mb-4 font-medium" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          Free LLM API Aggregation Platform
        </motion.p>
        <motion.p className="text-lg text-gray-300 leading-relaxed mb-8" variants={fadeUp} custom={2} initial="hidden" animate="visible">
          An OpenRouter-compatible free API gateway providing unified access to multiple large language models
          through a single OpenAI-compatible API endpoint.
        </motion.p>
        <motion.div className="flex flex-wrap gap-3" variants={fadeUp} custom={3} initial="hidden" animate="visible">
          <a href="https://github.com/tohnee/freeAPI" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-100 transition-all active:scale-95">
            <Github size={16} /> GitHub
          </a>
        </motion.div>
      </div>
    </div>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { icon: Zap, title: 'Unified API', desc: 'OpenAI-compatible /v1/chat/completions and /v1/embeddings endpoints. Drop-in replacement for any OpenAI SDK.' },
        { icon: Globe, title: 'Multi-Provider', desc: 'Intelligent provider routing based on latency, reliability, and cost. Automatic failover between providers.' },
        { icon: Shield, title: 'Auth & Quota', desc: 'JWT authentication, API key management, daily quota tracking, and usage auditing built in.' },
      ].map((f, i) => (
        <motion.div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-3" variants={fadeUp} custom={i + 3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <f.icon size={24} className="text-emerald-600" />
          <h3 className="font-medium">{f.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>

    <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-gray-100 pt-16" variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <div className="space-y-6">
        <h2 className="text-3xl font-medium tracking-tight">Tech Stack</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-sm text-gray-700"><strong>Backend:</strong> Python / FastAPI with async SQLAlchemy</span></div>
          <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-sm text-gray-700"><strong>Database:</strong> PostgreSQL with Alembic migrations</span></div>
          <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-sm text-gray-700"><strong>Infrastructure:</strong> Docker Compose full-stack deployment</span></div>
          <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-sm text-gray-700"><strong>Proxy:</strong> Configurable provider routing with reputation scoring</span></div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8">
        <h3 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">API Example</h3>
        <pre className="text-xs font-mono text-gray-600 leading-relaxed">{`curl https://freeapi.tohnee.ai/v1/chat/completions \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</pre>
      </div>
    </motion.section>
  </div>
);

export default FreeAPI;
