import { motion } from 'framer-motion';

type RouteFallbackProps = {
  label?: string;
};

const RouteFallback = ({ label = 'Loading' }: RouteFallbackProps) => {
  return (
    <div className="container-custom py-24">
      <div className="max-w-4xl space-y-8">
        {/* Skeleton title */}
        <motion.div
          className="h-12 w-3/4 bg-gray-100 rounded-lg"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Skeleton text lines */}
        <div className="space-y-4">
          <motion.div
            className="h-4 w-full bg-gray-100 rounded"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          />
          <motion.div
            className="h-4 w-5/6 bg-gray-100 rounded"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.div
            className="h-4 w-2/3 bg-gray-100 rounded"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </div>
        <motion.p
          className="text-sm text-gray-400 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {label}...
        </motion.p>
      </div>
    </div>
  );
};

export default RouteFallback;
