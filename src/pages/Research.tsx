import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Research = () => (
  <div className="container-custom py-24 space-y-16">
    <SEO title="Research" description="Latest research from Tohnee.ai on AGI alignment, sparse autoencoders, and scaling laws for autonomous systems." path="/research" />
    <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black">Research</h1>
    <div className="space-y-12">
      <Link to="/research/1" className="block group border-t border-gray-200 pt-8 pb-4">
        <div className="flex justify-between items-baseline mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span>Feb 2026</span>
          <span>AGI / Alignment</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-medium mb-4 group-hover:underline underline-offset-4 decoration-1 transition-colors text-black">
          Sparse Autoencoders for Efficient Inference
        </h2>
        <p className="text-gray-600 leading-relaxed text-lg max-w-3xl">
          We introduce a novel architecture that leverages sparse activation patterns to reduce computational overhead during inference by up to 40% while maintaining performance parity.
        </p>
      </Link>

      <Link to="/research/scaling-laws" className="block group border-t border-gray-200 pt-8 pb-4">
        <div className="flex justify-between items-baseline mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span>Feb 2026</span>
          <span>Economics</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-medium mb-4 group-hover:underline underline-offset-4 decoration-1 transition-colors text-black">
          Scaling Laws for One-Person Companies
        </h2>
        <p className="text-gray-600 leading-relaxed text-lg max-w-3xl">
          Investigating how AI leverage scales non-linearly with individual agency. We propose a new metric for productivity: Intelligence Per Human (IPH).
        </p>
      </Link>
    </div>
  </div>
);

export default Research;
