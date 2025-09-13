import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm: React.FC = () => {
    const { register, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    // Navigation handled by AuthContext after successful registration

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError('');

        if (!email || !password || !linkedinUrl || !githubUrl) {
            setPasswordError('All fields are required');
            return;
        }

        // Prepend https:// to URLs if missing
        const processedLinkedinUrl = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
        const processedGithubUrl = githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`;

        try {
            const userData = {
                email,
                password,
                linkedinUrl: processedLinkedinUrl,
                githubUrl: processedGithubUrl
            };

            await register(userData);
            // No need for additional navigation here as we're using window.location in AuthContext
        } catch (err) {
            console.error('Registration failed:', err);
            // Error is handled by the auth context
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Portfolio</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-100 rounded-md">
                        {error}
                    </div>
                )}

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
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:ring-blue-500 ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                                }`}
                            placeholder="••••••••"
                            required
                        />
                        {passwordError && (
                            <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            LinkedIn Profile URL
                        </label>
                        <input
                            type="text"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="linkedin.com/in/yourprofile"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            GitHub Profile URL
                        </label>
                        <input
                            type="text"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="github.com/yourusername"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
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
