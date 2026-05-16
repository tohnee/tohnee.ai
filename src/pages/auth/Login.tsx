import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const Login = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <SEO title="Log in" description="Log in to Tohnee.ai to access models, research, and your account." path="/login" />
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter uppercase font-mono inline-block mb-8">
            Tohnee.ai
          </Link>
          <h1 className="text-3xl font-medium mb-2">Welcome back</h1>
          <p className="text-gray-500">Enter your email to continue</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="name@company.com"
            />
          </div>

          <button className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
            Continue
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link to="/signup" className="text-black font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
