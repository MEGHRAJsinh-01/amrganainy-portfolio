import React, { useState } from 'react';
import { GitHubRepo } from '../types';
import { ADMIN_PASSWORD, VISIBILITY_KEY, FEATURED_REPOS, GITHUB_USERNAME } from '../constants';
import { fetchGitHubRepos, clearGitHubCache, getVisibilitySettings, saveVisibilitySettings, isProjectVisible, clearSkillsCache } from '../githubService';

interface AdminPanelProps {
    onBackToPortfolio: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToPortfolio }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [allRepos, setAllRepos] = useState<GitHubRepo[]>([]);
    const [visibilitySettings, setVisibilitySettings] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            loadAllRepos();
        }
    }, [isAuthenticated]);

    const loadAllRepos = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://api.github.com/users/ganainy/repos?sort=pushed&per_page=100`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();

            // Filter out forks and private repos
            const filteredRepos = repos.filter((repo: GitHubRepo) =>
                !repo.fork && !repo.private && !repo.name.toLowerCase().includes('fork')
            );

            setAllRepos(filteredRepos);
            setVisibilitySettings(getVisibilitySettings());
        } catch (error) {
            console.error('Error loading repos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const toggleVisibility = (repoName: string) => {
        const newSettings = {
            ...visibilitySettings,
            [repoName]: !isProjectVisible(repoName)
        };
        setVisibilitySettings(newSettings);
        saveVisibilitySettings(newSettings);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
        onBackToPortfolio();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Login
                        </button>
                    </form>
                    <button
                        onClick={onBackToPortfolio}
                        className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
                    >
                        Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Portfolio Admin Panel</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (clearGitHubCache()) {
                                    alert('GitHub cache cleared! The projects will reload with fresh data from GitHub.');
                                    window.location.reload();
                                }
                            }}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                            title="Clear GitHub cache and reload fresh data"
                        >
                            Clear Projects Cache
                        </button>
                        <button
                            onClick={() => {
                                if (clearSkillsCache()) {
                                    alert('Skills cache cleared! The skills section will reload with fresh data from GitHub.');
                                    window.location.reload();
                                }
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                            title="Clear skills cache and reload fresh data"
                        >
                            Clear Skills Cache
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                        <button
                            onClick={onBackToPortfolio}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Portfolio
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Project Visibility Control</h2>
                        <p className="text-gray-400 mb-6">
                            Control which of your GitHub repositories are displayed in the portfolio.
                            Toggle visibility on/off for each project below.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                            <span className="ml-4 text-gray-400">Loading repositories...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {allRepos.map((repo: GitHubRepo) => {
                                const isVisible = isProjectVisible(repo.name);
                                const isFeatured = FEATURED_REPOS.includes(repo.name);

                                return (
                                    <div key={repo.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                                                    {isFeatured && (
                                                        <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-3">{repo.description || 'No description'}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>⭐ {repo.stargazers_count}</span>
                                                    <span>🔄 {new Date(repo.pushed_at).toLocaleDateString()}</span>
                                                    {repo.language && <span>💻 {repo.language}</span>}
                                                </div>
                                            </div>
                                            <div className="ml-6">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <span className={`text-sm font-medium ${isVisible ? 'text-green-400' : 'text-gray-500'}`}>
                                                        {isVisible ? 'Visible' : 'Hidden'}
                                                    </span>
                                                    <div
                                                        className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isVisible ? 'bg-green-600' : 'bg-gray-600'
                                                            }`}
                                                        onClick={() => toggleVisibility(repo.name)}
                                                    >
                                                        <span
                                                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${isVisible ? 'translate-x-6' : 'translate-x-0'
                                                                }`}
                                                        />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <h3 className="text-blue-400 font-semibold mb-2">💡 Tips:</h3>
                        <ul className="text-blue-300 text-sm space-y-1">
                            <li>• Featured repositories are visible by default</li>
                            <li>• Changes are saved automatically to your browser's local storage</li>
                            <li>• Only you can access this admin panel with the password</li>
                            <li>• Refresh the main portfolio to see visibility changes</li>
                            <li>• <strong>Cache Control:</strong> Use "Clear Projects Cache" to reload fresh GitHub project data</li>
                            <li>• <strong>Skills Cache:</strong> Use "Clear Skills Cache" to reload fresh skills data from GitHub repositories</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
