import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const WebGLBackground = lazy(() => import('../components/WebGLBackground'));

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const staggerCard = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
};

const Home = () => (
  <div className="container-custom relative">
    <SEO
      title="Research Lab"
      description="Research lab building safe and beneficial AGI, amplifying individual potential through autonomous agents and the One-Person Company operating system."
    />

    <Suspense fallback={null}>
      <WebGLBackground />
    </Suspense>

    {/* Hero Section */}
    <section className="min-h-[80vh] flex flex-col justify-center relative z-10">
      <div className="max-w-4xl">
        <motion.p
          className="text-sm font-mono uppercase text-gray-400 tracking-widest mb-6"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          Tohnee AI Research Lab
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-8"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
        >
          Scaling intelligence <br />per human.
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl leading-relaxed"
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          We are a research lab dedicated to building safe and beneficial AGI, amplifying individual potential through autonomous agents and the One-Person Company operating system.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-wrap gap-4"
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
        >
          <Link
            to="/research"
            className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-200 inline-flex items-center gap-2 active:scale-95"
          >
            Read our research <ArrowUpRight size={20} />
          </Link>
          <Link
            to="/try"
            className="border border-gray-300 text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            Try Tohnee-7B
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Updates Grid */}
    <section className="py-24 border-t border-gray-100">
      <div className="flex justify-between items-baseline mb-12">
        <h2 className="text-3xl font-medium tracking-tight">Latest updates</h2>
        <Link to="/research" className="text-sm font-medium hover:underline underline-offset-4">View all updates</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {[
          {
            to: '/research/1',
            img: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?auto=format&fit=crop&w=800&q=80',
            alt: 'Research Abstract',
            tag: 'Research',
            title: 'Sparse Autoencoders for Efficient Inference',
            date: 'Feb 21, 2026',
          },
          {
            to: '/company',
            img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            alt: 'Organization',
            tag: 'Organization',
            title: 'Meet the Autonomous Executive Team',
            date: 'Feb 20, 2026',
          },
          {
            to: '/agents/dev-01',
            img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
            alt: 'Agents',
            tag: 'Safety',
            title: 'Alignment Protocols for Autonomous Agents',
            date: 'Jan 28, 2026',
          },
          {
            to: '/opc',
            img: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
            alt: 'OPC',
            tag: 'Company',
            title: 'The One-Person Company Operating System',
            date: 'Jan 10, 2026',
          },
        ].map((card, i) => (
          <motion.div
            key={card.to}
            variants={staggerCard}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <Link to={card.to} className="group block space-y-4">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src={card.img}
                  alt={card.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-gray-500">{card.tag}</div>
                <h3 className="text-lg font-medium leading-snug group-hover:underline decoration-1 underline-offset-4">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500">{card.date}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Featured Section */}
    <motion.section
      className="py-24 border-t border-gray-100"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] as const }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-medium tracking-tight">Pioneering research on the path to AGI</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe our research will eventually lead to artificial general intelligence, a system that can solve human-level problems. Building safe and beneficial AGI is our mission.
          </p>
          <Link to="/research" className="text-black font-medium hover:underline underline-offset-4 inline-flex items-center gap-2">
            View research index <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="aspect-square bg-black rounded-2xl overflow-hidden relative group">
           <img
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"
              alt="AGI Research"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 opacity-90"
            />
        </div>
      </div>
    </motion.section>
  </div>
);

export default Home;
