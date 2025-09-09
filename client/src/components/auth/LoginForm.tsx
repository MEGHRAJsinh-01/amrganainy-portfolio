import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
