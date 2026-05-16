import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white antialiased grain">
      {/* Minimal sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tighter uppercase font-mono flex items-center gap-2 group">
            <motion.span
              className="w-3 h-3 bg-black rounded-full group-hover:scale-125 transition-transform duration-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            ></motion.span>
            Tohnee.ai
          </Link>

          <div className="hidden md:flex items-center space-x-1 text-sm font-medium tracking-tight">
            {[
              { to: '/research', label: 'Research' },
              { to: '/models', label: 'Products' },
              { to: '/agents', label: 'Agents' },
              { to: '/projects', label: 'Projects' },
              { to: '/company', label: 'Company' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  location.pathname.startsWith(to)
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <Link to="/search" className="text-sm text-gray-600 hover:text-black transition-colors">
               Search
             </Link>
             <Link to="/login" className="hidden md:block text-sm text-gray-600 hover:text-black transition-colors">
               Log in
             </Link>
             <motion.div
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.97 }}
             >
               <Link to="/try" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors block">
                 Try Tohnee
               </Link>
             </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* OpenAI-style Footer */}
      <footer className="bg-black text-white py-20 px-6 mt-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-6 tracking-tighter">Tohnee.ai</h3>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Our mission is to ensure that artificial general intelligence benefits all of humanity.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Research</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/research" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">Index</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">Latest</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
             <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">API</h4>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><Link to="/models" className="hover:text-white transition-colors">Overview</Link></li>
               <li><Link to="/models" className="hover:text-white transition-colors">Pricing</Link></li>
               <li><Link to="/models" className="hover:text-white transition-colors">Docs</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Open Source</h4>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><Link to="/projects" className="hover:text-white transition-colors">Projects</Link></li>
               <li><Link to="/projects/exokey" className="hover:text-white transition-colors">ExoKey</Link></li>
               <li><Link to="/projects/freeapi" className="hover:text-white transition-colors">freeAPI</Link></li>
               <li><Link to="/projects/zhiwo" className="hover:text-white transition-colors">Zhiwo</Link></li>
             </ul>
           </div>

           <div className="space-y-4">
             <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Company</h4>
             <ul className="space-y-2 text-sm text-gray-300">
               <li><Link to="/company" className="hover:text-white transition-colors">About</Link></li>
               <li><Link to="/company/blog" className="hover:text-white transition-colors">Blog</Link></li>
               <li><Link to="/company/careers" className="hover:text-white transition-colors">Careers</Link></li>
               <li><Link to="/company/charter" className="hover:text-white transition-colors">Charter</Link></li>
             </ul>
           </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
           <div className="flex gap-6 mb-4 md:mb-0">
             <span>© 2026 Tohnee.ai</span>
             <a href="/terms" className="hover:text-white">Terms & policies</a>
             <a href="/privacy" className="hover:text-white">Privacy policy</a>
             <a href="/brand" className="hover:text-white">Brand guidelines</a>
           </div>
           <div className="flex gap-6">
             <a href="https://twitter.com/tohnee_ai" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a>
             <a href="https://github.com/tohnee" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
             <a href="https://youtube.com/@tohnee_ai" target="_blank" rel="noopener noreferrer" className="hover:text-white">YouTube</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
