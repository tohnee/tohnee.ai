import SEO from '../components/SEO';

const OPC = () => (
  <div className="container-custom py-24 space-y-24">
    <SEO title="OPC OS" description="The One-Person Company Operating System — a framework for maximizing individual leverage through AI." path="/opc" />
    <div className="text-center space-y-6 max-w-4xl mx-auto relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 pointer-events-none">
         <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" 
            alt="Background" 
            className="w-full h-full object-contain opacity-20"
          />
      </div>
      <h1 className="text-5xl md:text-8xl font-medium tracking-tighter text-black relative z-10">OPC OS</h1>
      <p className="text-xl text-gray-500 font-mono relative z-10">One Person Company Operating System</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24 max-w-5xl mx-auto">
      <div className="space-y-4 group">
        <div className="h-48 overflow-hidden rounded-lg mb-6 bg-gray-50">
           <img
              src="https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=800&q=80"
              alt="Strategy"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <h2 className="text-sm font-mono uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-2 mb-4">01. Strategy</h2>
        <p className="text-2xl font-medium text-black">"The Niche is You."</p>
        <p className="text-lg leading-relaxed text-gray-600">
          Leveraging specific knowledge to identify high-value opportunities that scale with code and media.
        </p>
      </div>
      <div className="space-y-4 group">
        <div className="h-48 overflow-hidden rounded-lg mb-6 bg-gray-50">
           <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
              alt="Execution"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <h2 className="text-sm font-mono uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-2 mb-4">02. Execution</h2>
        <p className="text-2xl font-medium text-black">"Ship Fast."</p>
        <p className="text-lg leading-relaxed text-gray-600">
          A streamlined pipeline for rapid prototyping, validation, and deployment using AI-augmented workflows.
        </p>
      </div>
      <div className="space-y-4 group">
         <div className="h-48 overflow-hidden rounded-lg mb-6 bg-gray-50">
           <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
              alt="Growth"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <h2 className="text-sm font-mono uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-2 mb-4">03. Growth</h2>
        <p className="text-2xl font-medium text-black">"Content OS."</p>
        <p className="text-lg leading-relaxed text-gray-600">
          Systematic content creation and distribution to build a loyal audience and attract inbound opportunities.
        </p>
      </div>
      <div className="space-y-4 group">
         <div className="h-48 overflow-hidden rounded-lg mb-6 bg-gray-50">
           <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80"
              alt="System"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <h2 className="text-sm font-mono uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-2 mb-4">04. System</h2>
        <p className="text-2xl font-medium text-black">"Atomic Habits."</p>
        <p className="text-lg leading-relaxed text-gray-600">
          Automating routine tasks and building sustainable habits to maintain long-term productivity and health.
        </p>
      </div>
    </div>
  </div>
);

export default OPC;
