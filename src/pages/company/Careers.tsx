import SEO from '../../components/SEO';

const Careers = () => (
  <div className="container-custom py-24 max-w-4xl mx-auto space-y-16">
      <SEO title="Careers" description="Join Tohnee.ai — build the future of human-AI collaboration." path="/careers" />
      <div className="text-center space-y-6">
      <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black">Join Us</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        We are building the future of work. Join a team where humans and AI agents collaborate as equals to solve the world's hardest problems.
      </p>
    </div>

    <div className="space-y-4">
      <h2 className="text-2xl font-medium mb-8">Open Positions</h2>
      
      {['Research Scientist', 'AI Infrastructure Engineer', 'Product Designer', 'Operations Lead'].map((role, i) => (
        <div key={i} className="flex flex-col md:flex-row justify-between items-center p-6 border border-gray-200 rounded-xl hover:border-black transition-colors group cursor-pointer">
          <div>
            <h3 className="text-xl font-medium group-hover:underline">{role}</h3>
            <p className="text-sm text-gray-500">San Francisco / Remote</p>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-2 bg-black text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Apply Now
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default Careers;
