import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Shield, Cpu } from 'lucide-react';
import SEO from '../../components/SEO';

const agents: Record<string, { title: string; role: string; description: string; features: string[]; imagePrompt: string }> = {
  'dev-01': {
    title: 'Dev-01',
    role: 'Senior AI Engineer',
    description: 'Dev-01 is an autonomous software engineer capable of planning, coding, debugging, and deploying full-stack applications. It integrates directly with your version control system and CI/CD pipelines.',
    features: [
      'Autonomous PR generation and review',
      'Full-stack architectural planning',
      'Automated test generation and execution',
      'Security vulnerability scanning'
    ],
    imagePrompt: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
  },
  'research-01': {
    title: 'Research-01',
    role: 'Lead AI Researcher',
    description: 'Research-01 accelerates scientific discovery by automating literature reviews, synthesizing data from multiple sources, and generating testable hypotheses.',
    features: [
      'Automated literature review',
      'Data synthesis and meta-analysis',
      'Hypothesis generation',
      'Experiment design'
    ],
    imagePrompt: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
  },
  'design-01': {
    title: 'Design-01',
    role: 'Generative Designer',
    description: 'Design-01 creates high-fidelity UI/UX designs, ensuring consistency with your design system while optimizing for user engagement and accessibility.',
    features: [
      'Generative UI prototyping',
      'Design system enforcement',
      'Accessibility auditing',
      'Asset generation'
    ],
    imagePrompt: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
  }
};

const AgentView = () => {
  const { slug } = useParams();
  const agent = agents[slug || 'dev-01'];

  if (!agent) return <div className="container-custom py-24">Agent not found.</div>;

  return (
    <div className="container-custom py-24">
      <SEO title={agent ? `${agent.title} — Tohnee.ai Agents` : 'Agent'} description={agent?.description || 'Tohnee.ai autonomous agent details.'} path={`/agents/${slug}`} />
      <Link to="/agents" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-12 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight">{agent.title}</h1>
            <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-mono">{agent.role}</span>
          </div>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            {agent.description}
          </p>
          
          <div className="space-y-6">
            <h3 className="font-medium text-lg uppercase tracking-widest text-gray-400">Core Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <Cpu size={20} className="text-black mt-1 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-colors font-medium inline-flex items-center gap-2">
              <Play size={16} /> Deploy Agent
            </button>
            <button className="border border-gray-300 px-8 py-4 rounded-full hover:bg-gray-50 transition-colors font-medium inline-flex items-center gap-2">
              <Shield size={16} /> View Safety Card
            </button>
          </div>
        </div>

        <div className="aspect-square bg-gray-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-2xl">
          <img 
            src={agent.imagePrompt}
            alt={agent.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AgentView;
