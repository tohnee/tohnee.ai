import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const articles: Record<string, { title: string; date: string; category: string; content: React.ReactNode }> = {
  '1': {
    title: 'Sparse Autoencoders for Efficient Inference',
    date: 'Feb 21, 2026',
    category: 'AGI / Alignment',
    content: (
      <>
        <div className="aspect-video w-full rounded-xl overflow-hidden mb-12 bg-gray-50">
          <img 
            src="https://images.unsplash.com/photo-1614854262318-831574f15f1f?auto=format&fit=crop&w=1200&q=80" 
            alt="Sparse Autoencoders" 
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        <p className="lead text-xl md:text-2xl font-light mb-8">
          We introduce a novel architecture that leverages sparse activation patterns to reduce computational overhead during inference by up to 40% while maintaining performance parity with dense models.
        </p>
        <h3 className="text-2xl font-medium mt-12 mb-4">Introduction</h3>
        <p className="text-lg text-gray-600 mb-6">
          Large Language Models (LLMs) have traditionally relied on dense activation patterns, where every neuron in a layer participates in every computation. This approach, while effective, is computationally expensive and energy-intensive. Our research into biological neural networks suggests that intelligence operates on principles of sparsity—activating only the necessary neurons for a given task.
        </p>
        <h3 className="text-2xl font-medium mt-12 mb-4">Methodology</h3>
        <p className="text-lg text-gray-600 mb-6">
          By implementing a k-sparse autoencoder layer within the transformer block, we enforce a sparsity constraint that compels the model to learn disentangled feature representations. This not only improves interpretability but also allows for significant pruning of inactive pathways during runtime.
        </p>
        <div className="bg-gray-50 p-8 rounded-xl my-12 border border-gray-100">
          <h4 className="font-mono text-sm uppercase text-gray-500 mb-4">Key Findings</h4>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>40% reduction in FLOPs during inference.</li>
            <li>Zero degradation in perplexity scores on standard benchmarks (MMLU, HumanEval).</li>
            <li>Enhanced interpretability of internal model states.</li>
          </ul>
        </div>
        <h3 className="text-2xl font-medium mt-12 mb-4">Conclusion</h3>
        <p className="text-lg text-gray-600 mb-6">
          This work represents a significant step towards efficient, sustainable AGI. By mimicking the energy efficiency of the human brain, we can scale intelligence to more devices and use cases without proportional increases in energy consumption.
        </p>
      </>
    )
  },
  'scaling-laws': {
    title: 'Scaling Laws for One-Person Companies',
    date: 'Feb 10, 2026',
    category: 'Economics',
    content: (
      <>
        <div className="aspect-video w-full rounded-xl overflow-hidden mb-12 bg-gray-50">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
            alt="Scaling Laws"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        <p className="lead text-xl md:text-2xl font-light mb-8">
          Investigating how AI leverage scales non-linearly with individual agency. We propose a new metric for productivity: Intelligence Per Human (IPH).
        </p>
        <p className="text-lg text-gray-600 mb-6">
          Traditional corporate structures rely on linear scaling of human capital. As tasks become more complex, more people are hired. However, with the advent of autonomous agents, we are observing a phase shift where a single individual's output can scale exponentially rather than linearly.
        </p>
      </>
    )
  }
};

const ArticleView = () => {
  const { slug } = useParams();
  const article = articles[slug || '1'];

  if (!article) {
    return <div className="container-custom py-24">Article not found.</div>;
  }

  return (
    <article className="container-custom py-24 max-w-3xl mx-auto">
      <SEO title={article ? `${article.title} — Tohnee.ai Research` : 'Article'} description={article?.title ? `Read "${article.title}" — Tohnee.ai research.` : 'Research article'} path={`/research/${slug}`} />
      <Link to="/research" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-12 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Research
      </Link>
      
      <header className="mb-16">
        <div className="text-xs font-mono uppercase text-gray-500 tracking-widest mb-4">
          {article.date} • {article.category}
        </div>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-black leading-tight">
          {article.title}
        </h1>
      </header>

      <div className="prose prose-lg prose-gray max-w-none">
        {article.content}
      </div>
    </article>
  );
};

export default ArticleView;
