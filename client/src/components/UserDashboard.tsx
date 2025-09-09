import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitHubRepo, Portfolio } from '../types';
import { fetchGitHubRepos, clearGitHubCache, getVisibilitySettings, saveVisibilitySettings, isProjectVisible, clearSkillsCache, clearLinkedInCache } from '../githubService';

// Mock data and functions for the UI prototype
const mockPortfolioData: Portfolio = {
  profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
  cvViewUrl: 'https://example.com/view-cv',
  cvDownloadUrl: 'https://example.com/download-cv',
  personalInfo: {
    name: 'John Doe',
    title: 'Full Stack Developer',
    email: 'john.doe@example.com',
    location: 'New York, USA',
    bio: 'Passionate developer with 5+ years of experience'
  },
  socialLinks: {
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe'
  }
};

const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'portfolio-website',
    description: 'My personal portfolio website built with React',
    html_url: 'https://github.com/johndoe/portfolio-website',
    language: 'TypeScript',
    topics: ['react', 'portfolio', 'typescript'],
    pushed_at: '2023-06-15T10:00:00Z',
    fork: false,
    private: false,
    stargazers_count: 12,
    forks_count: 5
  },
  {
    id: 2,
    name: 'task-manager-app',
    description: 'A full-stack task manager application with React and Node.js',
    html_url: 'https://github.com/johndoe/task-manager-app',
    language: 'JavaScript',
    topics: ['react', 'nodejs', 'express', 'mongodb'],
    pushed_at: '2023-05-20T10:00:00Z',
    fork: false,
    private: false,
    stargazers_count: 8,
    forks_count: 2
  },
  {
    id: 3,
    name: 'weather-dashboard',
    description: 'Weather dashboard using OpenWeather API',
    html_url: 'https://github.com/johndoe/weather-dashboard',
    language: 'JavaScript',
    topics: ['react', 'api', 'weather'],
    pushed_at: '2023-04-10T10:00:00Z',
    fork: false,
    private: false,
    stargazers_count: 5,
    forks_count: 1
  }
];

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [portfolioData, setPortfolioData] = useState<Portfolio | null>(mockPortfolioData);
  const [allRepos, setAllRepos] = useState<GitHubRepo[]>(mockRepos);
  const [visibilitySettings, setVisibilitySettings] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cvViewUrl, setCvViewUrl] = useState(mockPortfolioData.cvViewUrl || '');
  const [cvDownloadUrl, setCvDownloadUrl] = useState(mockPortfolioData.cvDownloadUrl || '');
  const [profileImageUrl, setProfileImageUrl] = useState(mockPortfolioData.profileImage || '');
  const [contactEmail, setContactEmail] = useState(mockPortfolioData.personalInfo?.email || '');
  const [githubUrl, setGithubUrl] = useState(mockPortfolioData.socialLinks?.github || '');
  const [linkedinUrl, setLinkedinUrl] = useState(mockPortfolioData.socialLinks?.linkedin || '');
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });

  const toggleVisibility = (repoName: string, repo?: GitHubRepo) => {
    const newSettings = {
      ...visibilitySettings,
      [repoName]: !isProjectVisible(repoName, repo)
    };
    setVisibilitySettings(newSettings);
    saveVisibilitySettings(newSettings);
  };

  const handleUpdateProfile = () => {
    // Mock function for UI prototype
    setUpdateMessage({ 
      text: 'Profile updated successfully! The changes are now live on your portfolio.', 
      type: 'success' 
    });
    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
          <div className="flex gap-4">
            <Link 
              to="/u/johndoe" 
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Portfolio
            </Link>
            <button
              onClick={() => {}} // Mock function
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 mb-3">
                <img
                  src={profileImageUrl || 'https://via.placeholder.com/80'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{portfolioData?.personalInfo?.name}</h3>
              <p className="text-gray-400 text-sm">{portfolioData?.personalInfo?.title}</p>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('cv')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'cv' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                CV Management
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'appearance' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'account' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Account Settings
              </button>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-gray-400 text-sm mb-2">
                Your Portfolio URL:
              </div>
              <div className="bg-gray-700 p-2 rounded text-sm flex items-center justify-between">
                <span className="text-blue-400">yourdomain.com/u/johndoe</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('yourdomain.com/u/johndoe');
                    setUpdateMessage({ text: 'URL copied to clipboard!', type: 'success' });
                    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 2000);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {updateMessage.text && (
              <div className={`mb-6 p-4 rounded-md ${
                updateMessage.type === 'error' 
                  ? 'bg-red-900/20 border border-red-500/50 text-red-300' 
                  : 'bg-green-900/20 border border-green-500/50 text-green-300'
              }`}>
                {updateMessage.text}
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={portfolioData?.personalInfo?.name || ''}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData!,
                          personalInfo: {
                            ...portfolioData!.personalInfo!,
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={portfolioData?.personalInfo?.title || ''}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData!,
                          personalInfo: {
                            ...portfolioData!.personalInfo!,
                            title: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g. Full Stack Developer"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={portfolioData?.personalInfo?.location || ''}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData!,
                          personalInfo: {
                            ...portfolioData!.personalInfo!,
                            location: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g. New York, USA"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Social Links</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={portfolioData?.socialLinks?.twitter || ''}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData!,
                          socialLinks: {
                            ...portfolioData!.socialLinks!,
                            twitter: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Profile Image
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                          <img
                            src={profileImageUrl || 'https://via.placeholder.com/80'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="flex-1 flex justify-center px-4 py-2 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-400">
                              <span>Upload a file</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const localUrl = URL.createObjectURL(file);
                                setProfileImageUrl(localUrl);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bio / About Me
                  </label>
                  <textarea
                    value={portfolioData?.personalInfo?.bio || ''}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData!,
                      personalInfo: {
                        ...portfolioData!.personalInfo!,
                        bio: e.target.value
                      }
                    })}
                    rows={5}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell visitors about yourself, your skills, and your experience..."
                  ></textarea>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Projects Management</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        clearGitHubCache();
                        setUpdateMessage({ text: 'GitHub cache cleared! The projects will reload with fresh data.', type: 'success' });
                        setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Refresh GitHub Data
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Custom Project
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-400">
                    Control which of your GitHub repositories are displayed in your portfolio.
                    Toggle visibility on/off for each project below.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {allRepos.map((repo) => {
                    const isVisible = isProjectVisible(repo.name, repo);

                    return (
                      <div key={repo.id} className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
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
                                className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isVisible ? 'bg-green-600' : 'bg-gray-600'}`}
                                onClick={() => toggleVisibility(repo.name, repo)}
                              >
                                <span
                                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${isVisible ? 'translate-x-6' : 'translate-x-0'}`}
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CV Management Tab */}
            {activeTab === 'cv' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">CV Management</h2>
                
                <div className="mb-6">
                  <p className="text-gray-400">
                    Update your CV URLs. These links are used in the CV section of your portfolio.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    CV View URL (e.g., Google Drive link)
                  </label>
                  <input
                    type="text"
                    value={cvViewUrl}
                    onChange={(e) => setCvViewUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    CV Download URL
                  </label>
                  <input
                    type="text"
                    value={cvDownloadUrl}
                    onChange={(e) => setCvDownloadUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
                  />
                </div>
                
                <div className="mt-2 mb-6">
                  <p className="text-sm text-gray-400">
                    Alternatively, upload your CV file directly:
                  </p>
                  <label className="mt-2 flex justify-center px-6 py-3 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-400">
                        <span>Upload CV file</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      className="sr-only"
                    />
                  </label>
                </div>
                
                <button
                  onClick={() => {
                    setUpdateMessage({ text: 'CV URLs updated successfully!', type: 'success' });
                    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Update CV URLs
                </button>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Integrations</h2>
                
                <div className="grid gap-6">
                  {/* GitHub Integration */}
                  <div className="border border-gray-700 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        <div>
                          <h3 className="text-lg font-medium">GitHub Integration</h3>
                          <p className="text-gray-400 text-sm">Automatically import your repositories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded">Connected</span>
                        <button
                          onClick={() => {
                            clearGitHubCache();
                            setUpdateMessage({ text: 'GitHub cache cleared! Your projects will be refreshed.', type: 'success' });
                            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        GitHub Username
                      </label>
                      <input
                        type="text"
                        value="johndoe"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Your GitHub username"
                      />
                      <p className="mt-2 text-sm text-gray-400">
                        Your GitHub username is extracted from your GitHub URL.
                      </p>
                    </div>
                  </div>
                  
                  {/* LinkedIn Integration */}
                  <div className="border border-gray-700 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <div>
                          <h3 className="text-lg font-medium">LinkedIn Integration</h3>
                          <p className="text-gray-400 text-sm">Import your professional profile and bio</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded">Connected</span>
                        <button
                          onClick={() => {
                            clearLinkedInCache();
                            setUpdateMessage({ text: 'LinkedIn cache cleared! Your profile data will be refreshed.', type: 'success' });
                            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="text"
                        value="https://linkedin.com/in/johndoe"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Your LinkedIn profile URL"
                      />
                      <p className="mt-2 text-sm text-gray-400">
                        Your LinkedIn profile is used to automatically import your bio, experience, and skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Theme Selection</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border-2 border-blue-500 rounded-lg overflow-hidden cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-gray-900 to-gray-800"></div>
                      <div className="p-3 bg-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Dark</span>
                          <span className="text-xs bg-blue-500 px-2 py-0.5 rounded text-white">Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-2 border-gray-700 hover:border-blue-500 rounded-lg overflow-hidden cursor-pointer transition-colors">
                      <div className="h-32 bg-gradient-to-br from-white to-gray-100"></div>
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">Light</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-2 border-gray-700 hover:border-blue-500 rounded-lg overflow-hidden cursor-pointer transition-colors">
                      <div className="h-32 bg-gradient-to-br from-blue-900 to-purple-900"></div>
                      <div className="p-3 bg-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Nebula</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Layout Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="showGithub" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="showGithub" className="text-gray-300">Show GitHub section</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="showLinkedIn" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="showLinkedIn" className="text-gray-300">Show LinkedIn data</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="showSkills" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="showSkills" className="text-gray-300">Show Skills section</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="showContact" 
                        checked={true}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="showContact" className="text-gray-300">Show Contact form</label>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setUpdateMessage({ text: 'Appearance settings saved successfully!', type: 'success' });
                    setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Appearance Settings
                </button>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Must be at least 8 characters
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium mb-4 text-red-400">Danger Zone</h3>
                  
                  <div className="bg-gray-700 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Delete Account</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Once you delete your account, all of your portfolio data will be permanently removed.
                      This action cannot be undone.
                    </p>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
