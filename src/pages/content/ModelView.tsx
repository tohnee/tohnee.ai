import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Terminal } from 'lucide-react';
import SEO from '../../components/SEO';

const models: Record<string, { title: string; version: string; description: string; capabilities: string[] }> = {
  '1': {
    title: 'Tohnee-7B-Instruct',
    version: 'v1.2',
    description: 'A highly efficient 7B model fine-tuned for reasoning and code generation, optimized for local deployment on consumer hardware.',
    capabilities: [
      'Advanced reasoning capabilities surpassing larger models',
      'Context window of 32k tokens',
      'Optimized for structured JSON output',
      'Low latency inference on M-series chips'
    ]
  }
};

const ModelView = () => {
  const { slug } = useParams();
  const model = models[slug || '1'];

  if (!model) return <div className="container-custom py-24">Model not found.</div>;

  return (
    <div className="container-custom py-24">
      <SEO title={model ? `${model.title} ${model.version} — Tohnee.ai Models` : 'Model'} description={model?.description || 'Tohnee.ai model details.'} path={`/models/${slug}`} />
      <Link to="/models" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-12 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Models
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">{model.title}</h1>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-mono">{model.version}</span>
          </div>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {model.description}
          </p>
          
          <div className="flex gap-4 mb-12">
            <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
              Get API Key
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium">
              Read Documentation
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-4">Capabilities</h3>
            {model.capabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-3 text-gray-600">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 text-gray-300 font-mono text-sm overflow-hidden shadow-2xl">
          <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2 text-gray-500">
              <Terminal size={16} />
              <span>curl https://api.tohnee.ai/v1/chat/completions \</span>
            </div>
            <div className="pl-6">
              -H "Content-Type: application/json" \<br/>
              -H "Authorization: Bearer $TOHNEE_API_KEY" \<br/>
              -d &#123;<br/>
              &nbsp;&nbsp;"model": "{model.title}",<br/>
              &nbsp;&nbsp;"messages": [<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&#123;"role": "user", "content": "Explain quantum computing"&#125;<br/>
              &nbsp;&nbsp;]<br/>
              &#125;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelView;
