import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const Blog = () => (
  <div className="container-custom py-24 space-y-16">
      <SEO title="Blog" description="Research updates, insights, and stories from Tohnee.ai." path="/blog" />
      <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black">Blog</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Link to={`/research/1`} key={i} className="group block space-y-4">
          <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden relative">
            <img 
              src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000}?auto=format&fit=crop&w=800&q=80`}
              alt={`Blog Post ${i}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"; // Fallback
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-gray-500">Update</div>
            <h3 className="text-xl font-medium leading-snug group-hover:underline decoration-1 underline-offset-4">
              Advancements in Agentic Workflows #{i}
            </h3>
            <p className="text-sm text-gray-500">March {i}, 2026</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Blog;
