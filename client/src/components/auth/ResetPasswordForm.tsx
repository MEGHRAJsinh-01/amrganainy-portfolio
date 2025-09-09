import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ResetPasswordProps {
  onSubmit: (password: string, token: string) => void;
  token: string;
  isLoading?: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordProps> = ({ onSubmit, token, isLoading = false }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordError('');
    onSubmit(password, token);
    setIsSuccess(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Set New Password</h2>
        
        {isSuccess ? (
          <div className="text-center">
            <div className="mb-4 mx-auto w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300 mb-2">Your password has been reset successfully!</p>
            <p className="text-gray-400 mb-6">Redirecting you to login...</p>
            <Link 
              to="/login" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Create a new password for your account.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Password
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
                  Confirm New Password
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
                    Updating...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
