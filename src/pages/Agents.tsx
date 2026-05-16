import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Agents = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Agents" description="Autonomous AI agents including Dev-01, Research-01, and Design-01 for planning, coding, and creative work." path="/agents" />
    <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black">Agents</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Link to="/agents/dev-01" className="col-span-2 bg-black text-white border border-gray-800 p-12 flex flex-col justify-center items-center text-center space-y-6 aspect-video rounded-xl relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-medium mb-2 group-hover:scale-105 transition-transform">Dev-01</h2>
          <p className="text-gray-400 max-w-md text-lg">An autonomous software engineer capable of planning, coding, and deploying full-stack applications.</p>
          <button className="mt-8 px-6 py-3 bg-white text-black hover:bg-gray-200 transition-all font-mono text-xs tracking-widest uppercase rounded">
            View Details
          </button>
        </div>
      </Link>
      <Link to="/agents/research-01" className="bg-gray-50 border border-gray-100 p-8 flex flex-col justify-between rounded-xl hover:border-black transition-colors">
        <h3 className="text-xl font-mono font-medium">Research-01</h3>
        <p className="text-gray-600 text-sm">Automated literature review and hypothesis generation agent.</p>
      </Link>
      <Link to="/agents/design-01" className="bg-gray-50 border border-gray-100 p-8 flex flex-col justify-between rounded-xl hover:border-black transition-colors">
        <h3 className="text-xl font-mono font-medium">Design-01</h3>
        <p className="text-gray-600 text-sm">Generative UI/UX designer aligning with design systems.</p>
      </Link>
    </div>
  </div>
);

export default Agents;
