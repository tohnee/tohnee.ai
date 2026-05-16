import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] as const }}
          className="container-custom py-24"
        >
          <div className="max-w-xl space-y-6">
            <h1 className="text-3xl font-medium tracking-tight">Something went wrong</h1>
            <p className="text-gray-600 leading-relaxed">
              An unexpected error occurred. Try refreshing or return to the home page.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Refresh page
              </button>
              <Link
                to="/"
                className="border border-gray-300 text-black px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Go home
              </Link>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
