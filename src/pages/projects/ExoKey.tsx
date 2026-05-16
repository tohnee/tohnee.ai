import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Sparkles, MessageSquare, Shield, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const ExoKey = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="ExoKey" description="Context-aware AI keyboard assistant for desktop — Ghost Chat, Skill Engine, IM Broadcast, and local vector memory." path="/projects/exokey" />

    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white p-12 md:p-24">
      <div className="relative z-10 max-w-2xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-purple-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-mono" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          ExoKey
        </motion.h1>
        <motion.p className="text-xl text-purple-200 mb-4 font-medium" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          External Cortex Keyboard
        </motion.p>
        <motion.p className="text-lg text-gray-300 leading-relaxed mb-8" variants={fadeUp} custom={2} initial="hidden" animate="visible">
          Your AI-Powered Exocortex for Desktop. Context-aware keyboard assistant that connects your input, clipboard, and application context to a powerful local or cloud brain.
        </motion.p>
        <motion.div className="flex flex-wrap gap-3" variants={fadeUp} custom={3} initial="hidden" animate="visible">
          <a href="https://github.com/tohnee/ExoKey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-purple-100 transition-all active:scale-95">
            <Github size={16} /> GitHub
          </a>
          <a href="https://github.com/tohnee/ExoKey/releases" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/30 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-all active:scale-95">
            Downloads
          </a>
        </motion.div>
      </div>
    </div>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: Sparkles, title: 'Context Awareness', desc: 'Auto-captures selected text, clipboard, and active window title to understand what you are working on.' },
        { icon: MessageSquare, title: 'Ghost Chat', desc: 'Transparent floating chat window (Alt+Space) that sits on top of your apps without breaking flow.' },
        { icon: Terminal, title: 'Skill Engine', desc: 'Built-in skills: //fix, //polite, //sum. Run AI actions on selected text from any app.' },
        { icon: Shield, title: 'Privacy First', desc: 'Local vector memory (RAG). Supports local LLMs via Ollama or secure cloud providers.' },
      ].map((f, i) => (
        <motion.div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-3" variants={fadeUp} custom={i + 3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <f.icon size={24} className="text-purple-600" />
          <h3 className="font-medium">{f.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>

    <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-gray-100 pt-16" variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <div className="space-y-6">
        <h2 className="text-3xl font-medium tracking-tight">IM Broadcast</h2>
        <p className="text-gray-600 leading-relaxed">
          One-click broadcast AI-generated replies to multiple IM apps including WeChat and Lark/Feishu via local automation.
          After getting a reply, check the target app at the bottom and click "Send" to automatically paste and send.
        </p>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 space-y-4">
        <h3 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider">Architecture</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Frontend</span><span className="font-mono">React + TypeScript</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Desktop</span><span className="font-mono">Tauri (Rust)</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Agent Loop</span><span className="font-mono">Zeroclaw Engine</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Memory</span><span className="font-mono">Local Vector DB</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">LLM Providers</span><span className="font-mono">OpenAI, Anthropic, Gemini</span></div>
        </div>
      </div>
    </motion.section>

    <motion.section className="border-t border-gray-100 pt-16" variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h2 className="text-2xl font-medium mb-6">Quick Start</h2>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 font-mono text-sm space-y-2">
        <p className="text-gray-400"># Install</p>
        <p>Download .dmg from <span className="text-purple-600">Releases page</span></p>
        <p className="text-gray-400 mt-4"># Or build from source</p>
        <p>git clone https://github.com/tohnee/ExoKey.git</p>
        <p>cd ExoKey/app && npm install</p>
        <p>npm run tauri dev</p>
      </div>
    </motion.section>
  </div>
);

export default ExoKey;
