import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface RegisterFormProps {
  onRegister: (firstName: string, lastName: string, email: string, password: string, username: string) => void;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, isLoading = false }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    onRegister(firstName, lastName, email, password, username);
  };

  // Generate portfolio URL preview from username
  const portfolioUrlPreview = username 
    ? `yourdomain.com/u/${username.toLowerCase().replace(/\s+/g, '-')}` 
    : 'yourdomain.com/u/your-username';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Portfolio</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Doe"
                required
              />
            </div>
          </div>

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

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '-'))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="johndoe"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Your portfolio URL: {portfolioUrlPreview}
            </p>
          </div>

          <div className="mb-4">
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
              minLength={8}
            />
            <p className="mt-1 text-sm text-gray-400">
              Must be at least 8 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:ring-blue-500 ${
                passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
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
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
