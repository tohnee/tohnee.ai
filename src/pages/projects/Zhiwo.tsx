import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Layout, Brain, Database, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const Zhiwo = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Zhiwo" description="AI-native knowledge operating system prototype with DeepSeek integration and Neo4j graph persistence." path="/projects/zhiwo" />

    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-black text-white p-12 md:p-24">
      <div className="relative z-10 max-w-2xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-amber-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-mono" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          Zhiwo
        </motion.h1>
        <motion.p className="text-xl text-amber-200 mb-4 font-medium" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          AI-Native Knowledge Operating System
        </motion.p>
        <motion.p className="text-lg text-gray-300 leading-relaxed mb-8" variants={fadeUp} custom={2} initial="hidden" animate="visible">
          A prototype knowledge workbench with live DeepSeek workflow integration and Neo4j persistence adapters.
          Three-panel workspace for Sources, Workspace, and AI Debug.
        </motion.p>
        <motion.div className="flex flex-wrap gap-3" variants={fadeUp} custom={3} initial="hidden" animate="visible">
          <a href="https://github.com/tohnee/zhiwo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-100 transition-all active:scale-95">
            <Github size={16} /> GitHub
          </a>
        </motion.div>
      </div>
    </div>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: Layout, title: 'Three-Panel Workbench', desc: 'Sources, Workspace, and AI Debug panels for structured knowledge work.' },
        { icon: Brain, title: 'DeepSeek Integration', desc: 'Live DeepSeek V4 Pro for AI-assisted research and analysis.' },
        { icon: Database, title: 'Neo4j Persistence', desc: 'Graph database for knowledge representation and relationship mapping.' },
        { icon: Workflow, title: 'API Gateway', desc: 'Health, dashboard, ingest, and chat endpoints via Node API gateway.' },
      ].map((f, i) => (
        <motion.div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-3" variants={fadeUp} custom={i + 3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <f.icon size={24} className="text-amber-600" />
          <h3 className="font-medium">{f.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>

    <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-16" variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <div className="space-y-6">
        <h2 className="text-3xl font-medium tracking-tight">Workspace Views</h2>
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="font-medium mb-2">Graph View</h3>
            <p className="text-sm text-gray-500">Visual knowledge graph showing relationships between documents, concepts, and entities.</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="font-medium mb-2">Editor View</h3>
            <p className="text-sm text-gray-500">Rich text editor for creating and editing knowledge artifacts.</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="font-medium mb-2">Chat View</h3>
            <p className="text-sm text-gray-500">AI-powered chat interface with DeepSeek for interactive research assistance.</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 space-y-4">
        <h3 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider">Architecture</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Web UI</span><span className="font-mono">React + Vite</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">API Gateway</span><span className="font-mono">Node.js</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">AI Provider</span><span className="font-mono">DeepSeek V4 Pro</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Database</span><span className="font-mono">Neo4j Graph DB</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">Infra</span><span className="font-mono">Docker Compose</span></div>
        </div>
      </div>
    </motion.section>
  </div>
);

export default Zhiwo;
