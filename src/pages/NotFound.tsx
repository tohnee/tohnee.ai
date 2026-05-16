import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] as const }}
    className="container-custom min-h-[70vh] flex flex-col items-center justify-center text-center py-24"
  >
    <SEO title="Page Not Found" description="The page you are looking for does not exist." />
    <h1 className="text-8xl font-medium tracking-tight text-black mb-6">404</h1>
    <p className="text-xl text-gray-500 mb-12 max-w-md">
      This page does not exist. Check the URL or head back.
    </p>
    <Link
      to="/"
      className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
    >
      Go home
    </Link>
  </motion.div>
);

export default NotFound;
