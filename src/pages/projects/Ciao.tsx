import { Link } from 'react-router-dom';
import { ArrowLeft, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const Ciao = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="CIAO" description="Full-stack monorepo foundation with TypeScript, Prisma ORM, and Docker-based infrastructure." path="/projects/ciao" />

    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white p-12 md:p-24">
      <div className="relative z-10 max-w-2xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-mono" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          CIAO
        </motion.h1>
        <motion.p className="text-xl text-blue-200 mb-4 font-medium" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          Monorepo Foundation v0.2
        </motion.p>
        <motion.p className="text-lg text-gray-300 leading-relaxed mb-8" variants={fadeUp} custom={2} initial="hidden" animate="visible">
          A modern full-stack application monorepo foundation built with TypeScript, featuring Prisma ORM for type-safe database access and Docker Compose for seamless local development.
        </motion.p>
        <motion.div className="flex flex-wrap gap-3" variants={fadeUp} custom={3} initial="hidden" animate="visible">
          <a href="https://github.com/tohnee/ciao" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-100 transition-all active:scale-95">
            <Github size={16} /> GitHub
          </a>
        </motion.div>
      </div>
    </div>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-2" variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3 className="font-mono text-sm text-gray-400 uppercase tracking-wider">Language</h3>
        <p className="text-2xl font-medium">TypeScript</p>
      </motion.div>
      <motion.div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-2" variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3 className="font-mono text-sm text-gray-400 uppercase tracking-wider">Database</h3>
        <p className="text-2xl font-medium">Prisma + SQL</p>
      </motion.div>
      <motion.div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-2" variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3 className="font-mono text-sm text-gray-400 uppercase tracking-wider">Infra</h3>
        <p className="text-2xl font-medium">Docker</p>
      </motion.div>
    </section>

    <motion.section className="border-t border-gray-100 pt-16" variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h2 className="text-2xl font-medium mb-6">Getting Started</h2>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 font-mono text-sm space-y-2">
        <p className="text-gray-400"># Clone & setup</p>
        <p>git clone https://github.com/tohnee/ciao.git</p>
        <p>cp .env.example .env</p>
        <p>docker compose up -d</p>
        <p>npm install</p>
        <p>npm run prisma:generate</p>
        <p>npm run dev</p>
      </div>
    </motion.section>
  </div>
);

export default Ciao;
