import SEO from '../components/SEO';

const Company = () => (
  <div className="container-custom py-24 space-y-24">
    <SEO title="Company" description="About Tohnee.ai — an experimental research lab exploring the limits of individual leverage through AGI." path="/company" />
    <section className="max-w-4xl">
      <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 text-black">About</h1>
      <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
        Tohnee.ai is an experimental research lab exploring the limits of individual leverage through Artificial General Intelligence. We believe the future of work is not about replacing humans, but amplifying them to the power of thousands.
      </p>
    </section>

    <section>
      <h2 className="text-sm font-mono uppercase text-gray-400 mb-12 tracking-widest border-b border-gray-100 pb-4">Leadership & Structure</h2>
      
      {/* Executive Leadership */}
      <div className="mb-20">
        <h3 className="text-xs font-mono uppercase text-gray-400 mb-8 tracking-widest">Executive Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
           
           {/* CAO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">T</div>
             <div>
               <h3 className="text-xl font-medium text-black">Tohnee</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief AI Officer (CAO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Leads strategic vision, AGI research, and technical architecture. Orchestrates the collaboration between human creativity and autonomous AI agents.
               </p>
             </div>
           </div>

           {/* CEO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">S</div>
             <div>
               <h3 className="text-xl font-medium text-black">Strategy-01</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief Executive Officer (CEO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Responsible for high-level decision making, resource allocation, and long-term company roadmap execution.
               </p>
             </div>
           </div>

           {/* CBO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">B</div>
             <div>
               <h3 className="text-xl font-medium text-black">Business-01</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief Business Officer (CBO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Manages partnerships, market analysis, and commercialization strategies for our models and research.
               </p>
             </div>
           </div>

           {/* CCO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">C</div>
             <div>
               <h3 className="text-xl font-medium text-black">Creative-01</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief Creative Officer (CCO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Oversees brand identity, design systems, and the user experience across all products and media.
               </p>
             </div>
           </div>

           {/* CDO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">D</div>
             <div>
               <h3 className="text-xl font-medium text-black">Data-01</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief Data Officer (CDO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Ensures data integrity, manages training datasets, and oversees data privacy and governance protocols.
               </p>
             </div>
           </div>

           {/* CFO */}
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium">F</div>
             <div>
               <h3 className="text-xl font-medium text-black">Finance-01</h3>
               <p className="text-xs font-mono text-gray-500 uppercase mb-2 tracking-widest">Chief Financial Officer (CFO)</p>
               <p className="text-sm text-gray-600 leading-relaxed">
                 Optimizes capital allocation, manages operational costs, and forecasts financial growth trajectories.
               </p>
             </div>
           </div>

        </div>
      </div>

      {/* Organizational Structure */}
      <div>
        <h3 className="text-xs font-mono uppercase text-gray-400 mb-8 tracking-widest">Autonomous Workforce</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-8">
          
          {/* Engineering Division */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-black">Engineering</h4>
            <div className="pl-4 border-l border-gray-200 space-y-6">
              <div>
                <h5 className="font-medium text-black">Dev-01</h5>
                <p className="text-xs font-mono text-gray-500 uppercase mb-1">Senior AI Engineer</p>
                <p className="text-sm text-gray-600">Specializes in full-stack development, system architecture, and deployment pipelines.</p>
              </div>
              <div>
                <h5 className="font-medium text-black">Dev-02</h5>
                <p className="text-xs font-mono text-gray-500 uppercase mb-1">Frontend Specialist</p>
                <p className="text-sm text-gray-600">Focuses on UI/UX implementation and interactive component design.</p>
              </div>
            </div>
          </div>

          {/* Research Division */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-black">Research</h4>
            <div className="pl-4 border-l border-gray-200 space-y-6">
              <div>
                <h5 className="font-medium text-black">Research-01</h5>
                <p className="text-xs font-mono text-gray-500 uppercase mb-1">Lead Researcher</p>
                <p className="text-sm text-gray-600">Conducts literature reviews, synthesizes data, and generates hypotheses for AGI alignment.</p>
              </div>
            </div>
          </div>

          {/* Design & Product Division */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-black">Product & Design</h4>
            <div className="pl-4 border-l border-gray-200 space-y-6">
              <div>
                <h5 className="font-medium text-black">Design-01</h5>
                <p className="text-xs font-mono text-gray-500 uppercase mb-1">Generative Designer</p>
                <p className="text-sm text-gray-600">Creates visual assets, design systems, and user interface prototypes.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
);

export default Company;
