import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Search = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="container-custom py-24 min-h-[60vh]">
      <SEO title="Search" description="Search Tohnee.ai research, models, and documentation." path="/search" />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-medium mb-8">Search Tohnee.ai</h1>
        
        <div className="relative mb-16">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, models, or documentation..."
            className="w-full text-xl px-6 py-6 pl-14 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
            autoFocus
          />
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        </div>

        {query.length > 0 && (
          <div className="space-y-8">
            <div className="text-sm font-mono uppercase text-gray-500 tracking-widest mb-4">Top Results</div>
            
            <Link to="/research/1" className="block group">
              <h3 className="text-xl font-medium mb-2 group-hover:underline">Sparse Autoencoders for Efficient Inference</h3>
              <p className="text-gray-600 mb-2">Research • Feb 21, 2026</p>
              <p className="text-gray-500 text-sm line-clamp-2">
                We introduce a novel architecture that leverages sparse activation patterns to reduce computational overhead during inference...
              </p>
            </Link>

            <Link to="/models/1" className="block group">
              <h3 className="text-xl font-medium mb-2 group-hover:underline">Tohnee-7B-Instruct v1.2</h3>
              <p className="text-gray-600 mb-2">Product • Feb 15, 2026</p>
              <p className="text-gray-500 text-sm line-clamp-2">
                A highly efficient 7B model fine-tuned for reasoning and code generation...
              </p>
            </Link>
          </div>
        )}

        {query.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-medium mb-4">Popular Searches</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="cursor-pointer hover:text-black hover:underline">AGI Safety</li>
                <li className="cursor-pointer hover:text-black hover:underline">Model Pricing</li>
                <li className="cursor-pointer hover:text-black hover:underline">Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Recent Research</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="cursor-pointer hover:text-black hover:underline">Scaling Laws</li>
                <li className="cursor-pointer hover:text-black hover:underline">Agent Alignment</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
