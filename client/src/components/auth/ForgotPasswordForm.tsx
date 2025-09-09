import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ForgotPasswordProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordProps> = ({ onSubmit, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
        
        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-4 mx-auto w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">
              If an account exists with the email <span className="font-semibold">{email}</span>, 
              you will receive a password reset link shortly.
            </p>
            <Link 
              to="/login" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
            <div className="mt-6 text-center text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
