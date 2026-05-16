import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Cpu, Network, Terminal, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const InferenceAgent = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Inference Agent" description="End-to-end inference optimization toolkit — E2E pipelines, LLM serving, CUDA kernel optimization." path="/projects/inference-agent" />

    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-900 via-rose-800 to-black text-white p-12 md:p-24">
      <div className="relative z-10 max-w-2xl">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-rose-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-mono" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          Inference Agent
        </motion.h1>
        <motion.p className="text-xl text-rose-200 mb-4 font-medium" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          Inference Optimization Engineering
        </motion.p>
        <motion.p className="text-lg text-gray-300 leading-relaxed mb-8" variants={fadeUp} custom={2} initial="hidden" animate="visible">
          A complete inference optimization repository covering E2E pipelines, LLM serving (SGLang, vLLM, TensorRT-LLM), and CUDA kernel optimization — with exactness-first validation.
        </motion.p>
        <motion.div className="flex flex-wrap gap-3" variants={fadeUp} custom={3} initial="hidden" animate="visible">
          <a href="https://github.com/tohnee/inference-agent" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-rose-100 transition-all active:scale-95">
            <Github size={16} /> GitHub
          </a>
        </motion.div>
      </div>
    </div>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: Cpu, title: 'E2E Inference', desc: 'Small models, Diffusion, Transformers, SAM, ViT, tree models — full pipeline optimization.' },
        { icon: Network, title: 'LLM Serving', desc: 'SGLang, vLLM, TensorRT-LLM, Triton — TTFT, TPOT, throughput optimization.' },
        { icon: Terminal, title: 'CUDA Kernels', desc: 'NCU profiling, kernel debugging, backend selection, operator iteration.' },
        { icon: BarChart, title: 'Auto Profiling', desc: 'Automated baseline capture, correctness verification, and experiment iteration.' },
      ].map((f, i) => (
        <motion.div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-3" variants={fadeUp} custom={i + 3} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <f.icon size={24} className="text-rose-600" />
          <h3 className="font-medium">{f.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>

    <motion.section className="border-t border-gray-100 pt-16" variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h2 className="text-3xl font-medium tracking-tight mb-8">Design Principles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Correctness first — performance gains must not regress results',
          'Baseline before optimization — no credible baseline, no conclusion',
          'Single-variable experiments — one change per round, bounded',
          'Evidence-driven decisions — keep or rollback based on metric + exactness proof',
          'Resumable and handoff-friendly — interrupted sessions can continue',
        ].map((p, i) => (
          <div key={i} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold mt-0.5 shrink-0">{i + 1}</div>
            <p className="text-sm text-gray-700">{p}</p>
          </div>
        ))}
      </div>
    </motion.section>

    <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-16" variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <div className="space-y-6">
        <h2 className="text-2xl font-medium">Repository Structure</h2>
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <code className="text-sm font-mono text-rose-700">e2e-inference-opt-skill/</code>
            <p className="text-xs text-gray-500 mt-1">E2E optimization knowledge system</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <code className="text-sm font-mono text-rose-700">llm-serving-opt-skill/</code>
            <p className="text-xs text-gray-500 mt-1">LLM serving optimization knowledge</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <code className="text-sm font-mono text-rose-700">cuda-kernel-opt-skill/</code>
            <p className="text-xs text-gray-500 mt-1">CUDA/kernel optimization knowledge</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <code className="text-sm font-mono text-rose-700">auto-profiling/</code>
            <p className="text-xs text-gray-500 mt-1">Automated optimization runtime</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8">
        <h3 className="font-mono text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Language</h3>
        <p className="text-3xl font-medium mb-6">Python</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Frameworks</span><span className="font-mono">PyTorch, SGLang, vLLM, TRT-LLM</span></div>
          <div className="flex justify-between py-2 border-b border-gray-200"><span className="text-gray-500">Profiling</span><span className="font-mono">NCU, nsys, torch.profiler</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">Kernels</span><span className="font-mono">CUDA, CUTLASS, Triton</span></div>
        </div>
      </div>
    </motion.section>
  </div>
);

export default InferenceAgent;
