import React, { useState, useEffect } from 'react';
import { GitHubRepo, Portfolio } from '../types';
import { ADMIN_PASSWORD, VISIBILITY_KEY, GITHUB_USERNAME } from '../constants';
import { fetchGitHubRepos, clearGitHubCache, getVisibilitySettings, saveVisibilitySettings, isProjectVisible, clearSkillsCache, clearLinkedInCache } from '../githubService';
import { authAPI, portfolioAPI } from '../api';
import { ContactSection, SocialSection } from './admin-sections';

interface AdminPanelProps {
    onBackToPortfolio: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToPortfolio }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
    const [password, setPassword] = useState('');
    const [allRepos, setAllRepos] = useState<GitHubRepo[]>([]);
    const [visibilitySettings, setVisibilitySettings] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
    const [cvViewUrl, setCvViewUrl] = useState('');
    const [cvDownloadUrl, setCvDownloadUrl] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [linkedInProfileImageInfo, setLinkedInProfileImageInfo] = useState('');
    const [showCvSection, setShowCvSection] = useState(false);
    const [showProfileSection, setShowProfileSection] = useState(false);
    const [showContactSection, setShowContactSection] = useState(false);
    const [showSocialSection, setShowSocialSection] = useState(false);
    const [cvUpdateMessage, setCvUpdateMessage] = useState({ text: '', type: '' });
    const [profileUpdateMessage, setProfileUpdateMessage] = useState({ text: '', type: '' });
    const [contactUpdateMessage, setContactUpdateMessage] = useState({ text: '', type: '' });
    const [socialUpdateMessage, setSocialUpdateMessage] = useState({ text: '', type: '' });
    const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            loadAllRepos();
            loadPortfolioData();
        }
    }, [isAuthenticated]);

    const loadPortfolioData = async () => {
        setIsLoadingPortfolio(true);
        try {
            const portfolio = await portfolioAPI.getPortfolio();
            setPortfolioData(portfolio);

            // Set form fields from portfolio data
            if (portfolio.cvViewUrl) setCvViewUrl(portfolio.cvViewUrl);
            if (portfolio.cvDownloadUrl) setCvDownloadUrl(portfolio.cvDownloadUrl);
            if (portfolio.profileImage) {
                setProfileImageUrl(portfolio.profileImage);

                // Check if profile image is from LinkedIn
                if (portfolio.profileImage.includes('licdn.com') ||
                    portfolio.profileImage.includes('linkedin.com')) {
                    setLinkedInProfileImageInfo('Currently using LinkedIn profile picture. You can replace it with a custom image.');
                } else {
                    setLinkedInProfileImageInfo('');
                }
            }

            // Set contact email from portfolio data
            if (portfolio.personalInfo?.email) {
                setContactEmail(portfolio.personalInfo.email);
            }

            // Set social links from portfolio data
            if (portfolio.socialLinks?.github) {
                setGithubUrl(portfolio.socialLinks.github);
            }
            if (portfolio.socialLinks?.linkedin) {
                setLinkedinUrl(portfolio.socialLinks.linkedin);
            }

            setIsLoadingPortfolio(false);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            setIsLoadingPortfolio(false);
        }
    };

    const loadAllRepos = async () => {
        setIsLoading(true);
        try {
            // Extract GitHub username from the GitHub URL
            let username = 'ganainy'; // Default fallback

            if (githubUrl) {
                const match = githubUrl.match(/github\.com\/([^\/]+)/);
                if (match && match[1]) {
                    username = match[1];
                }
            }

            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authAPI.login('admin', password);
            setIsAuthenticated(true);
        } catch (error) {
            alert('Login failed. Please check your password and try again.');
            console.error('Login error:', error);
        }
    };

    const toggleVisibility = (repoName: string, repo?: GitHubRepo) => {
        const newSettings = {
            ...visibilitySettings,
            [repoName]: !isProjectVisible(repoName, repo)
        };
        setVisibilitySettings(newSettings);
        saveVisibilitySettings(newSettings);
    };

    const handleLogout = () => {
        authAPI.logout();
        setIsAuthenticated(false);
        setPassword('');
        onBackToPortfolio();
    };

    const handleCvUrlsUpdate = async () => {
        try {
            setCvUpdateMessage({ text: 'Updating CV URLs...', type: 'info' });

            const updatedPortfolio = await portfolioAPI.updatePortfolio({
                cvViewUrl,
                cvDownloadUrl
            });

            setPortfolioData(updatedPortfolio);
            setCvUpdateMessage({
                text: 'CV URLs updated successfully! The changes are now live on your portfolio.',
                type: 'info'
            });
        } catch (error) {
            console.error('Error updating CV URLs:', error);
            setCvUpdateMessage({
                text: 'Failed to update CV URLs. Please try again or check your connection.',
                type: 'error'
            });
        }
    };

    const handleProfileImageUpdate = async () => {
        try {
            setProfileUpdateMessage({ text: 'Updating profile image...', type: 'info' });

            // If it's a local file (blob URL), we need to upload it
            if (profileImageUrl.startsWith('blob:')) {
                // Find the file input and get the file
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const result = await portfolioAPI.uploadProfileImage(file);

                    // Update with the returned image URL
                    setProfileImageUrl(result.imageUrl);
                    setProfileUpdateMessage({
                        text: 'Profile image uploaded and updated successfully!',
                        type: 'info'
                    });

                    // Refresh portfolio data
                    loadPortfolioData();
                    return;
                } else {
                    throw new Error('No file selected');
                }
            }

            // If it's a URL string, just update the portfolio
            const updatedPortfolio = await portfolioAPI.updatePortfolio({
                profileImage: profileImageUrl
            });

            setPortfolioData(updatedPortfolio);
            setProfileUpdateMessage({
                text: 'Profile image updated successfully!',
                type: 'info'
            });
        } catch (error) {
            console.error('Error updating profile image:', error);
            setProfileUpdateMessage({
                text: 'Failed to update profile image. Please try again.',
                type: 'error'
            });
        }
    };

    const handleContactEmailUpdate = async () => {
        try {
            setContactUpdateMessage({ text: 'Updating contact email...', type: 'info' });

            const updatedPortfolio = await portfolioAPI.updatePortfolio({
                personalInfo: {
                    ...(portfolioData?.personalInfo || {}),
                    email: contactEmail
                }
            });

            setPortfolioData(updatedPortfolio);
            setContactUpdateMessage({
                text: 'Contact email updated successfully! The changes are now live on your portfolio.',
                type: 'info'
            });
        } catch (error) {
            console.error('Error updating contact email:', error);
            setContactUpdateMessage({
                text: 'Failed to update contact email. Please try again or check your connection.',
                type: 'error'
            });
        }
    };

    const handleSocialLinksUpdate = async () => {
        try {
            setSocialUpdateMessage({ text: 'Updating social links...', type: 'info' });

            const updatedPortfolio = await portfolioAPI.updatePortfolio({
                socialLinks: {
                    ...(portfolioData?.socialLinks || {}),
                    github: githubUrl,
                    linkedin: linkedinUrl
                }
            });

            setPortfolioData(updatedPortfolio);
            setSocialUpdateMessage({
                text: 'Social links updated successfully! The changes are now live on your portfolio.',
                type: 'info'
            });
        } catch (error) {
            console.error('Error updating social links:', error);
            setSocialUpdateMessage({
                text: 'Failed to update social links. Please try again or check your connection.',
                type: 'error'
            });
        }
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
                            onClick={() => {
                                if (clearLinkedInCache()) {
                                    alert('LinkedIn cache cleared! The bio will reload with fresh data from LinkedIn on the next visit.\n\nNOTE: LinkedIn API uses Apify, which is a paid service. Each profile fetch uses API credits, so please use this sparingly.');
                                    window.location.reload();
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            title="Clear LinkedIn cache and reload fresh data using Apify"
                        >
                            Clear LinkedIn Cache
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
                    {/* Profile Image Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Profile Image Management</h2>
                            <button
                                onClick={() => setShowProfileSection(!showProfileSection)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                {showProfileSection ? 'Hide' : 'Show'} Section
                            </button>
                        </div>

                        {showProfileSection && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                                <p className="text-gray-400 mb-4">
                                    Set your profile image. Leave empty to use your LinkedIn profile image automatically.
                                    {linkedInProfileImageInfo && (
                                        <span className="block mt-1 text-blue-500">{linkedInProfileImageInfo}</span>
                                    )}
                                </p>

                                <div className="mb-4">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Profile Image URL
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={profileImageUrl}
                                            onChange={(e) => setProfileImageUrl(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="photos/profile-pic.png or https://example.com/image.jpg"
                                        />
                                        <button
                                            onClick={() => setProfileImageUrl('')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            title="Clear image URL"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Or select image from your PC
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <label className="w-full flex justify-center px-6 py-3 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <div className="flex text-sm text-gray-400">
                                                    <span className="material-symbols-outlined mr-2">upload_file</span>
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
                                                        // In a real scenario, we would upload this file to a server
                                                        // For now, we'll create a local URL for preview and indicate this is a client-side demo
                                                        const localUrl = URL.createObjectURL(file);
                                                        setProfileImageUrl(localUrl);
                                                        setProfileUpdateMessage({
                                                            text: `File selected: ${file.name}. In a real implementation, this would be uploaded to a server and the URL would be saved.`,
                                                            type: 'info'
                                                        });
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {profileImageUrl && (
                                    <div className="mb-4 flex flex-col items-center">
                                        <p className="text-gray-400 mb-2 text-sm">Preview:</p>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600">
                                            <img
                                                src={profileImageUrl}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                                                    (e.target as HTMLImageElement).alt = 'Image not found';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleProfileImageUpdate}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Update Profile Image
                                    </button>

                                    {profileImageUrl && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setProfileUpdateMessage({ text: 'Removing profile image...', type: 'info' });

                                                    // If we have an API for deleting profile image
                                                    if (portfolioAPI.deleteProfileImage) {
                                                        await portfolioAPI.deleteProfileImage();
                                                    } else {
                                                        // Otherwise just update with empty string
                                                        await portfolioAPI.updatePortfolio({
                                                            profileImage: ''
                                                        });
                                                    }

                                                    setProfileImageUrl('');
                                                    setProfileUpdateMessage({
                                                        text: 'Profile image removed successfully!',
                                                        type: 'info'
                                                    });

                                                    // Refresh portfolio data
                                                    loadPortfolioData();
                                                } catch (error) {
                                                    console.error('Error removing profile image:', error);
                                                    setProfileUpdateMessage({
                                                        text: 'Failed to remove profile image. Please try again.',
                                                        type: 'error'
                                                    });
                                                }
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    )}
                                </div>

                                {profileUpdateMessage.text && (
                                    <div className={`mt-4 p-4 rounded-md ${profileUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                                        {profileUpdateMessage.text}
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-md">
                                    <p className="text-yellow-400 text-sm mb-1">
                                        <strong>Note:</strong> If you leave this field empty, your LinkedIn profile picture will be used automatically if available.
                                    </p>
                                    <p className="text-yellow-400 text-sm">
                                        You can either enter a URL for an existing image or upload a new image from your computer.
                                        Images are stored on the server and will be available immediately after upload.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CV URLs Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">CV URL Management</h2>
                            <button
                                onClick={() => setShowCvSection(!showCvSection)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                {showCvSection ? 'Hide' : 'Show'} Section
                            </button>
                        </div>

                        {showCvSection && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                                <p className="text-gray-400 mb-4">
                                    Update your CV URLs. These links are used in the CV section of your portfolio.
                                </p>

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

                                <button
                                    onClick={handleCvUrlsUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Update CV URLs
                                </button>

                                {cvUpdateMessage.text && (
                                    <div className={`mt-4 p-4 rounded-md ${cvUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                                        {cvUpdateMessage.text}
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-md">
                                    <p className="text-yellow-400 text-sm">
                                        <strong>Note:</strong> These URLs are stored in the database and are used for the CV section of your portfolio.
                                        Changes will be immediate once you click the "Update CV URLs" button.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact Email Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Contact Email Management</h2>
                            <button
                                onClick={() => setShowContactSection(!showContactSection)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                {showContactSection ? 'Hide' : 'Show'} Section
                            </button>
                        </div>

                        {showContactSection && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                                <p className="text-gray-400 mb-4">
                                    Update your contact email. This email is used in the Contact section of your portfolio.
                                </p>

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

                                <button
                                    onClick={handleContactEmailUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Update Contact Email
                                </button>

                                {contactUpdateMessage.text && (
                                    <div className={`mt-4 p-4 rounded-md ${contactUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                                        {contactUpdateMessage.text}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Social Links Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Social Links Management</h2>
                            <button
                                onClick={() => setShowSocialSection(!showSocialSection)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                {showSocialSection ? 'Hide' : 'Show'} Section
                            </button>
                        </div>

                        {showSocialSection && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                                <p className="text-gray-400 mb-4">
                                    Update your social media links. These links are used in the About section of your portfolio.
                                </p>

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

                                <button
                                    onClick={handleSocialLinksUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Update Social Links
                                </button>

                                {socialUpdateMessage.text && (
                                    <div className={`mt-4 p-4 rounded-md ${socialUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                                        {socialUpdateMessage.text}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
                                const isVisible = isProjectVisible(repo.name, repo);

                                return (
                                    <div key={repo.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
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
                                                        className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isVisible ? 'bg-green-600' : 'bg-gray-600'
                                                            }`}
                                                        onClick={() => toggleVisibility(repo.name, repo)}
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
                            <li>• Projects with stars or forks are visible by default, others are hidden</li>
                            <li>• Project visibility can be manually controlled with the toggle switches</li>
                            <li>• Project visibility changes are saved automatically to your browser's local storage</li>
                            <li>• Only authenticated users can access this admin panel</li>
                            <li>• Refresh the main portfolio to see project visibility changes</li>
                            <li>• <strong>Profile Image:</strong> Upload a custom image or leave empty to use your LinkedIn profile picture. Images are stored on the server and saved in the database.</li>
                            <li>• <strong>CV URLs:</strong> Update your CV URLs for viewing and downloading. All changes are saved to the database.</li>
                            <li>• <strong>Social Links:</strong> Your GitHub and LinkedIn URLs are stored in the database and managed through this panel.</li>
                            <li>• <strong>Contact Email:</strong> Your contact email is stored in the database and can be updated here.</li>
                            <li>• <strong>Projects Cache:</strong> Use "Clear Projects Cache" to reload fresh GitHub project data</li>
                            <li>• <strong>Skills Cache:</strong> Use "Clear Skills Cache" to reload fresh skills data from GitHub repositories</li>
                            <li>• <strong>LinkedIn Cache:</strong> Use "Clear LinkedIn Cache" to reload fresh bio data from LinkedIn API</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
