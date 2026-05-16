import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Models = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Models" description="State-of-the-art language models optimized for reasoning, coding, and autonomous agent workflows." path="/models" />
    <div className="relative rounded-2xl overflow-hidden bg-black text-white p-12 md:p-24 mb-24">
       <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"
            alt="Model Architecture"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-30"
          />
       </div>
       <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6">Models</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            State-of-the-art language models optimized for reasoning, coding, and autonomous agent workflows.
          </p>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <Link to={`/models/1`} key={i} className="block bg-gray-50 border border-gray-100 p-8 rounded-xl hover:border-gray-300 transition-colors group">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-mono font-medium group-hover:text-gray-900">Tohnee-7B-Instruct</h3>
            <span className="bg-white border border-gray-200 px-2 py-1 text-[10px] font-mono rounded uppercase text-gray-500">v1.2</span>
          </div>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            A highly efficient 7B model fine-tuned for reasoning and code generation, optimized for local deployment on consumer hardware.
          </p>
          <div className="flex space-x-4 text-xs font-mono">
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors pointer-events-none">Download Weights</button>
            <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition-colors pointer-events-none">View Benchmarks</button>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Models;
