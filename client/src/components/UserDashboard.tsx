import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitHubRepo } from '../types';
import {
    fetchGitHubRepos,
    getCachedRepos,
    clearGitHubCache,
    clearSkillsCache,
    clearLinkedInCache,
    fetchLinkedInProfile // Import the function
} from '../githubService';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useProjects } from '../contexts/ProjectContext';
import type { ProjectData } from '../contexts/ProjectContext';
import { authAPI, adminAPI, profileAPI } from '../api/multiUserApi';

const UserDashboard: React.FC = () => {
    // Helper: resolve asset URLs served by backend static '/uploads' to absolute URLs
    const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';
    const resolveAssetUrl = (url?: string) => {
        if (!url) return url as any;
        if (/^https?:\/\//i.test(url)) return url;
        // Normalize legacy '/api/uploads' to '/uploads'
        const normalized = url.startsWith('/api/uploads') ? url.replace(/^\/api/, '') : url;
        if (normalized.startsWith('/uploads')) {
            const origin = new URL(API_BASE, window.location.origin).origin; // strips '/api' path
            return `${origin}${normalized}`;
        }
        return url;
    };
    const [activeTab, setActiveTab] = useState('profile');
    // Remove activeSection state - we'll use activeTab for everything
    const [allRepos, setAllRepos] = useState<GitHubRepo[]>([]);
    const [visibilitySettings, setVisibilitySettings] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshingGitHub, setIsRefreshingGitHub] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
    // Auto-hide toast that resets when a new message is set
    useEffect(() => {
        if (!updateMessage.text) return;
        const timer = setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        return () => clearTimeout(timer);
    }, [updateMessage.text]);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        location: '',
        contactEmail: '',
        bio: '',
        githubUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        websiteUrl: '',
        skills: [] as { name: string; source: string; isVisible: boolean }[],
        languages: [] as string[],
        experience: [] as { title: string; company: string; description: string; startDate: string; endDate: string }[],
        editingLanguage: undefined as string | undefined,
        editingSkill: undefined as string | undefined,
        editingExperience: undefined as number | undefined
    });

    // Get auth, profile, and project context
    const { user, logout, updatePassword } = useAuth();
    const {
        profile,
        loading: profileLoading,
        error: profileError,
        updateProfile,
        uploadProfileImage,
        uploadCV,
        getProfile
    } = useProfile();

    const {
        projects,
        loading: projectsLoading,
        error: projectsError,
        getUserProjects,
        createProject,
        updateProject,
        deleteProject,
        uploadProjectImage,
        reorderProjects
    } = useProjects();

    // Preserve last non-empty projects to avoid temporary disappearance during refresh
    const [lastNonEmptyProjects, setLastNonEmptyProjects] = useState<ProjectData[]>([]);
    useEffect(() => {
        console.log('UserDashboard: Projects changed:', projects?.length || 0, 'projects');
        if (projects && projects.length > 0) {
            setLastNonEmptyProjects(projects);
        }
    }, [projects]);

    // Ensure we load the freshest profile and projects when dashboard mounts
    useEffect(() => {
        getProfile().catch(() => {/* non-blocking */ });
        getUserProjects().catch(() => {/* non-blocking */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update form data when profile is loaded
    useEffect(() => {
        if (profile || user) {
            setFormData({
                name: profile?.name || '',
                title: profile?.title || '',
                location: profile?.location || '',
                contactEmail: profile?.contactEmail || '',
                bio: (profile as any)?.bio || profile?.about || '',
                githubUrl: profile?.socialLinks?.github || '',
                linkedinUrl: profile?.socialLinks?.linkedin || '',
                twitterUrl: profile?.socialLinks?.twitter || '',
                websiteUrl: profile?.socialLinks?.website || '',
                skills: profile?.skills || [],
                languages: profile?.languages || [],
                experience: profile?.experience || [],
                editingLanguage: undefined,
                editingSkill: undefined,
                editingExperience: undefined
            });
        }
    }, [profile, user]);

    // Additional state for account settings
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Load GitHub repos if GitHub URL is available
    useEffect(() => {
        const loadGitHubRepos = async () => {
            if (formData.githubUrl) {
                try {
                    setIsLoading(true);
                    // Extract username from GitHub URL
                    const githubUsername = formData.githubUrl.split('/').pop();
                    if (githubUsername) {
                        const repos = await fetchGitHubRepos(githubUsername);
                        setAllRepos(repos);
                    }
                } catch (error) {
                    console.error('Failed to load GitHub repos:', error);
                    // Only show an error if there are no cached repos to display
                    const cached = getCachedRepos();
                    if (!cached || cached.length === 0) {
                        setUpdateMessage({
                            text: 'Failed to load GitHub repositories. Please check your GitHub URL.',
                            type: 'error'
                        });
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadGitHubRepos();
    }, [formData.githubUrl]);

    // Handle password form input changes
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Update password
    const handleUpdatePassword = async () => {
        try {
            // Validate passwords
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setUpdateMessage({
                    text: 'New passwords do not match!',
                    type: 'error'
                });
                return;
            }

            if (passwordData.newPassword.length < 8) {
                setUpdateMessage({
                    text: 'Password must be at least 8 characters long!',
                    type: 'error'
                });
                return;
            }

            setIsLoading(true);

            // Call the API to update the password using the context method
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            // Clear form and show success message
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setUpdateMessage({
                text: 'Password updated successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to update password:', error);
            setUpdateMessage({
                text: 'Failed to update password. Please check your current password and try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        try {
            // Confirm deletion
            if (deleteConfirmation !== user?.username) {
                setUpdateMessage({
                    text: `Please type your username "${user?.username}" to confirm deletion.`,
                    type: 'error'
                });
                return;
            }

            setIsLoading(true);

            // Call admin API to delete the user
            // Note: In a real application, you might want a dedicated endpoint for this
            // rather than using the admin API
            await adminAPI.deleteUser(user?.id || '');

            // Logout after account deletion
            await logout();

        } catch (error) {
            console.error('Failed to delete account:', error);
            setUpdateMessage({
                text: 'Failed to delete account. Please try again later.',
                type: 'error'
            });
            setIsLoading(false);
        }
    };

    // Custom project form state
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        isPublic: true
    });
    const [projectImage, setProjectImage] = useState<File | null>(null);

    // Toggle project visibility
    const toggleVisibility = (projectId: string, isVisible: boolean) => {
        const newSettings = { ...visibilitySettings, [projectId]: !isVisible };
        setVisibilitySettings(newSettings);
        localStorage.setItem('projectVisibility', JSON.stringify(newSettings));

        // Update project visibility in the database
        updateProject(projectId, { isPublic: !isVisible });
    };

    // Handle custom project form input
    const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProject(prev => ({ ...prev, [name]: value }));
    };

    // Handle project image upload
    const handleProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProjectImage(file);
        }
    };

    // Submit new project
    const handleAddProject = async () => {
        try {
            setIsLoading(true);

            // Convert technologies string to array
            const technologiesArray = newProject.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech.length > 0);

            // Create the project first
            const response = await createProject({
                title: newProject.title,
                description: newProject.description,
                technologies: technologiesArray,
                githubUrl: newProject.githubUrl || undefined,
                liveUrl: newProject.liveUrl || undefined,
                isPublic: newProject.isPublic,
                order: projects.length, // Add at the end
                isImported: false,
                isVisibleInPortfolio: newProject.isPublic
            });

            // Upload image if available
            if (projectImage && response && response.id) {
                await uploadProjectImage(response.id, projectImage);
            }

            // Reset form
            setNewProject({
                title: '',
                description: '',
                technologies: '',
                githubUrl: '',
                liveUrl: '',
                isPublic: true
            });
            setProjectImage(null);
            setShowAddProject(false);

            setUpdateMessage({
                text: 'Project added successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to add project:', error);
            setUpdateMessage({
                text: 'Failed to add project. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle profile update
    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            const profileData = {
                name: formData.name,
                title: formData.title,
                location: formData.location,
                contactEmail: formData.contactEmail,
                bio: formData.bio,
                socialLinks: {
                    github: formData.githubUrl,
                    linkedin: formData.linkedinUrl,
                    twitter: formData.twitterUrl
                }
            };
            await updateProfile(profileData);

            setUpdateMessage({
                text: 'Profile updated successfully! The changes are now live on your portfolio.',
                type: 'success'
            });

            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setUpdateMessage({
                text: 'Failed to update profile. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle skills update
    const handleUpdateSkills = async () => {
        try {
            setIsLoading(true);
            await profileAPI.updateSkills(formData.skills);
            await getProfile(); // Refresh profile data
            setUpdateMessage({
                text: 'Skills updated successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to update skills:', error);
            setUpdateMessage({
                text: 'Failed to update skills. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle languages update
    const handleUpdateLanguages = async () => {
        try {
            setIsLoading(true);
            await profileAPI.updateLanguages(formData.languages);
            await getProfile(); // Refresh profile data
            setUpdateMessage({
                text: 'Languages updated successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to update languages:', error);
            setUpdateMessage({
                text: 'Failed to update languages. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle experience update
    const handleUpdateExperience = async () => {
        try {
            setIsLoading(true);
            await profileAPI.updateExperience(formData.experience);
            await getProfile(); // Refresh profile data
            setUpdateMessage({
                text: 'Work experience updated successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to update experience:', error);
            setUpdateMessage({
                text: 'Failed to update work experience. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle CV upload
    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            await uploadCV(file);
            await getProfile(); // Refresh profile data
            setUpdateMessage({
                text: 'CV uploaded successfully!',
                type: 'success'
            });
            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Failed to upload CV:', error);
            setUpdateMessage({
                text: 'Failed to upload CV. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete experience entry
    const handleDeleteExperience = (index: number) => {
        const newExperience = [...formData.experience];
        newExperience.splice(index, 1);
        setFormData(prev => ({ ...prev, experience: newExperience }));
    };

    // Add experience entry
    const handleAddExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [
                ...prev.experience,
                { title: '', company: '', description: '', startDate: '', endDate: '' }
            ]
        }));
    };

    // Save profile changes
    const handleSaveProfileChanges = async () => {
        try {
            setIsLoading(true);
            // Update profile data
            await updateProfile({
                name: formData.name,
                title: formData.title,
                location: formData.location,
                contactEmail: formData.contactEmail,
                bio: formData.bio,
                socialLinks: {
                    github: formData.githubUrl,
                    linkedin: formData.linkedinUrl,
                    twitter: formData.twitterUrl
                }
            });
            setUpdateMessage({
                text: 'Profile updated successfully!',
                type: 'success'
            });
        } catch (error) {
            console.error('Failed to update profile:', error);
            setUpdateMessage({
                text: 'Failed to update profile. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            // Validate password strength
            if (passwordData.newPassword.length < 8) {
                setUpdateMessage({
                    text: 'Password must be at least 8 characters long.',
                    type: 'error'
                });
                return;
            }
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setUpdateMessage({
                    text: 'New password and confirmation do not match.',
                    type: 'error'
                });
                return;
            }
            // Update password
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setUpdateMessage({
                text: 'Password updated successfully.',
                type: 'success'
            });
            // Clear form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Failed to update password:', error);
            setUpdateMessage({
                text: 'Failed to update password. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
                    <div className="flex gap-4">
                        <Link
                            to={`/u/${user?.username}`}
                            target="_blank"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View My Portfolio
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* User Info Header */}
                <div className="mb-8 bg-gray-800 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500">
                                {(() => {
                                    const rawAvatar = (profile as any)?.profileImageUrl || profile?.profileImage;
                                    const avatarUrl = resolveAssetUrl(rawAvatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.username || 'User')}&background=1e293b&color=fff&size=80`;
                                    return (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    );
                                })()}
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl font-bold text-white">{profile?.name || user?.username}</h1>
                                <p className="text-gray-400">{profile?.title || 'No title set'}</p>
                            </div>
                        </div>
                        <div className="flex-1 md:text-right">
                            <div className="text-gray-400 text-sm mb-2">Your Portfolio URL:</div>
                            {(() => {
                                const portfolioUrl = `${window.location.origin}/u/${user?.username}`;
                                return (
                                    <div className="bg-gray-700 p-2 rounded text-sm flex items-center gap-2 max-w-md mx-auto md:ml-auto md:mr-0">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-blue-400 block truncate" title={portfolioUrl}>{portfolioUrl}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(portfolioUrl);
                                                setUpdateMessage({ text: 'URL copied to clipboard!', type: 'success' });
                                                setTimeout(() => setUpdateMessage({ text: '', type: '' }), 2000);
                                            }}
                                            className="text-gray-400 hover:text-white flex-shrink-0"
                                            aria-label="Copy portfolio URL"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Horizontal Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-700">
                        <nav className="flex space-x-1 overflow-x-auto pb-1">
                            {[
                                { id: 'profile', label: 'Profile Settings' },
                                { id: 'skills', label: 'Skills' },
                                { id: 'languages', label: 'Languages' },
                                { id: 'experience', label: 'Work Experience' },
                                { id: 'projects', label: 'Projects' },
                                { id: 'cv', label: 'CV Management' },
                                { id: 'integrations', label: 'Integrations' },
                                { id: 'account', label: 'Account Settings' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-gray-800 rounded-lg p-6">
                    {/* Only show the active section */}
                    {activeTab === 'profile' && (
                        <div>
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
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
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
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
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
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
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
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleInputChange}
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
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleInputChange}
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
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleInputChange}
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
                                            name="twitterUrl"
                                            value={formData.twitterUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="https://twitter.com/yourusername"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Bio / About Me
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Tell visitors about yourself, your skills, and your experience..."
                                ></textarea>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={profileLoading || isLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading || isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'skills' && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6">Skills</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.skills.map((skillObj, index) => (
                                    <div key={index} className="flex items-center bg-gray-600 px-2 py-1 rounded-md">
                                        {skillObj.name === (formData.editingSkill ?? '') ? (
                                            <input
                                                type="text"
                                                defaultValue={skillObj.name}
                                                className="bg-gray-700 text-white px-2 py-1 rounded"
                                                onBlur={e => {
                                                    const newSkill = e.target.value.trim();
                                                    if (newSkill) {
                                                        const newSkills = [...formData.skills];
                                                        newSkills[index] = { ...skillObj, name: newSkill };
                                                        setFormData(prev => ({ ...prev, skills: newSkills, editingSkill: undefined }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, editingSkill: undefined }));
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <span className="text-sm">{skillObj.name}</span>
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, editingSkill: skillObj.name }))
                                                    }
                                                    className="ml-2 text-blue-400 hover:text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newSkills = [...formData.skills];
                                                        newSkills.splice(index, 1);
                                                        setFormData(prev => ({ ...prev, skills: newSkills }));
                                                    }}
                                                    className="ml-2 text-gray-400 hover:text-white"
                                                >
                                                    &times;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex mt-2">
                                <input
                                    type="text"
                                    id="new-skill-input"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Add a new skill"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const newSkill = (e.target as HTMLInputElement).value.trim();
                                            if (newSkill && !formData.skills.some(s => s.name === newSkill)) {
                                                setFormData(prev => ({ ...prev, skills: [...prev.skills, { name: newSkill, source: 'custom' as 'custom', isVisible: true }] }));
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('new-skill-input') as HTMLInputElement;
                                        const newSkill = input.value.trim();
                                        if (newSkill && !formData.skills.some(s => s.name === newSkill)) {
                                            setFormData(prev => ({ ...prev, skills: [...prev.skills, { name: newSkill, source: 'custom' as 'custom', isVisible: true }] }));
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleUpdateSkills}
                                    disabled={profileLoading || isLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading || isLoading ? 'Saving...' : 'Save Skills'}
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'languages' && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6">Languages</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.languages.map((lang, index) => (
                                    <div key={index} className="flex items-center bg-gray-600 px-2 py-1 rounded-md">
                                        {(typeof lang === 'string' ? lang : (lang as any)?.name || '') === (formData.editingLanguage ?? '') ? (
                                            <input
                                                type="text"
                                                defaultValue={typeof lang === 'string' ? lang : (lang as any)?.name || ''}
                                                className="bg-gray-700 text-white px-2 py-1 rounded"
                                                onBlur={e => {
                                                    const newLang = e.target.value.trim();
                                                    if (newLang) {
                                                        const newLangs = [...formData.languages];
                                                        if (typeof lang === 'string') {
                                                            newLangs[index] = newLang;
                                                        } else {
                                                            newLangs[index] = { ...(lang as any), name: newLang };
                                                        }
                                                        setFormData(prev => ({ ...prev, languages: newLangs, editingLanguage: undefined }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, editingLanguage: undefined }));
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <span className="text-sm">{typeof lang === 'string' ? lang : (lang as any)?.name || ''}</span>
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, editingLanguage: typeof lang === 'string' ? lang : (lang as any)?.name || '' }))}
                                                    className="ml-2 text-blue-400 hover:text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newLangs = [...formData.languages];
                                                        newLangs.splice(index, 1);
                                                        setFormData(prev => ({ ...prev, languages: newLangs }));
                                                    }}
                                                    className="ml-2 text-gray-400 hover:text-white"
                                                >
                                                    &times;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex mt-2">
                                <input
                                    type="text"
                                    id="new-lang-input"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Add a new language"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const newLang = (e.target as HTMLInputElement).value.trim();
                                            if (newLang && !formData.languages.some((l: any) => (typeof l === 'string' ? l : l?.name || '') === newLang)) {
                                                setFormData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('new-lang-input') as HTMLInputElement;
                                        const newLang = input.value.trim();
                                        if (newLang && !formData.languages.some((l: any) => (typeof l === 'string' ? l : l?.name || '') === newLang)) {
                                            setFormData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleUpdateLanguages}
                                    disabled={profileLoading || isLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading || isLoading ? 'Saving...' : 'Save Languages'}
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'experience' && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-6">Work Experience</h2>
                            <div className="mb-4">
                                {formData.experience.map((exp, index) => (
                                    <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-white">{exp.title}</div>
                                                <div className="text-gray-400 text-sm">{exp.company}</div>
                                                <div className="text-gray-400 text-xs">{exp.startDate} - {exp.endDate}</div>
                                                <div className="text-gray-300 text-sm mt-1">{exp.description}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newExp = [...formData.experience];
                                                    newExp.splice(index, 1);
                                                    setFormData(prev => ({ ...prev, experience: newExp }));
                                                }}
                                                className="ml-2 text-gray-400 hover:text-white"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                                <div className="mb-2">
                                    <input type="text" id="exp-title" placeholder="Job Title" className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-white" />
                                    <input type="text" id="exp-company" placeholder="Company" className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-white" />
                                    <input type="text" id="exp-start" placeholder="Start Date" className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-white" />
                                    <input type="text" id="exp-end" placeholder="End Date" className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-white" />
                                    <textarea id="exp-desc" placeholder="Description" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white" />
                                </div>
                                <button
                                    onClick={() => {
                                        const title = (document.getElementById('exp-title') as HTMLInputElement).value.trim();
                                        const company = (document.getElementById('exp-company') as HTMLInputElement).value.trim();
                                        const startDate = (document.getElementById('exp-start') as HTMLInputElement).value.trim();
                                        const endDate = (document.getElementById('exp-end') as HTMLInputElement).value.trim();
                                        const description = (document.getElementById('exp-desc') as HTMLTextAreaElement).value.trim();
                                        if (title && company) {
                                            setFormData(prev => ({
                                                ...prev,
                                                experience: [...prev.experience, { title, company, startDate, endDate, description }]
                                            }));
                                            (document.getElementById('exp-title') as HTMLInputElement).value = '';
                                            (document.getElementById('exp-company') as HTMLInputElement).value = '';
                                            (document.getElementById('exp-start') as HTMLInputElement).value = '';
                                            (document.getElementById('exp-end') as HTMLInputElement).value = '';
                                            (document.getElementById('exp-desc') as HTMLTextAreaElement).value = '';
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Add Experience
                                </button>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleUpdateExperience}
                                    disabled={profileLoading || isLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading || isLoading ? 'Saving...' : 'Save Experience'}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Projects Tab */}
                    {activeTab === 'projects' && !projectsLoading && (
                        <div className="bg-gray-800 rounded-lg p-6 mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Projects Management</h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                setIsLoading(true);
                                                setIsRefreshingGitHub(true);
                                                clearGitHubCache();
                                                // Immediately refetch repos to repopulate the list without affecting curated projects
                                                const githubUsername = formData.githubUrl.split('/').pop();
                                                const repos = await fetchGitHubRepos(githubUsername);
                                                setAllRepos(repos);
                                                // Keep curated projects untouched; refresh only GitHub repos
                                                await getProfile().catch(() => { });
                                                await getUserProjects().catch(() => { });
                                                setUpdateMessage({ text: 'GitHub cache cleared and data refreshed.', type: 'success' });
                                            } catch (e) {
                                                console.error('Refresh GitHub Data failed', e);
                                                setUpdateMessage({ text: 'Failed to refresh GitHub data. Please try again.', type: 'error' });
                                            } finally {
                                                setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                                                setIsLoading(false);
                                                setIsRefreshingGitHub(false);
                                            }
                                        }}
                                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                    >
                                        Refresh GitHub Data
                                    </button>
                                    <button
                                        onClick={() => setShowAddProject(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Add Custom Project
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-400">
                                    Manage your projects below. Toggle visibility to control which projects are displayed on your portfolio.
                                </p>
                            </div>

                            {/* Add Project Form */}
                            {showAddProject && (
                                <div className="mb-8 bg-gray-700 border border-gray-600 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium">Add New Project</h3>
                                        <button
                                            onClick={() => setShowAddProject(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Project Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={newProject.title}
                                                onChange={handleProjectInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="My Awesome Project"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Technologies (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                name="technologies"
                                                value={newProject.technologies}
                                                onChange={handleProjectInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="React, TypeScript, Node.js"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newProject.description}
                                            onChange={handleProjectInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Describe your project..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                GitHub URL
                                            </label>
                                            <input
                                                type="url"
                                                name="githubUrl"
                                                value={newProject.githubUrl}
                                                onChange={handleProjectInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="https://github.com/yourusername/repo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Live Demo URL
                                            </label>
                                            <input
                                                type="url"
                                                name="liveUrl"
                                                value={newProject.liveUrl}
                                                onChange={handleProjectInputChange}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="https://myproject.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Project Image
                                        </label>
                                        <label className="flex justify-center px-4 py-2 border-2 border-gray-500 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <div className="flex text-sm text-gray-400">
                                                    <span>Upload project image</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, WebP up to 5MB
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={handleProjectImageChange}
                                            />
                                        </label>
                                        {projectImage && (
                                            <p className="mt-2 text-sm text-green-400">
                                                Image selected: {projectImage.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={newProject.isPublic}
                                            onChange={() => setNewProject(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                                        />
                                        <label htmlFor="isPublic" className="ml-2 text-gray-300">
                                            Make project visible on portfolio
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddProject}
                                            disabled={!newProject.title || isLoading}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Adding...' : 'Add Project'}
                                        </button>
                                        <button
                                            onClick={() => setShowAddProject(false)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* User Projects */}
                            {(() => {
                                const projectsToShow = (isRefreshingGitHub && projects.length === 0) ? lastNonEmptyProjects : projects;
                                const sortedProjects = [...projectsToShow].sort((a, b) => {
                                    if (a.isImported && !b.isImported) return -1;
                                    if (!a.isImported && b.isImported) return 1;
                                    return a.order - b.order;
                                });
                                return sortedProjects.length > 0 ? (
                                    <div className="grid gap-4">
                                        {sortedProjects.map((project) => {
                                            const isVisible = project.isVisibleInPortfolio;

                                            return (
                                                <div key={project.id} className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                                                {project.isImported && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Imported</span>}
                                                            </div>
                                                            <p className="text-gray-400 text-sm mb-3">{project.description || 'No description'}</p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span>📅 {new Date(project.updatedAt).toLocaleDateString()}</span>
                                                                {project.technologies && <span>💻 {project.technologies.join(', ')}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="ml-6">
                                                            <label className="flex items-center gap-3 cursor-pointer">
                                                                <span className={`text-sm font-medium ${isVisible ? 'text-green-400' : 'text-gray-500'}`}>
                                                                    {isVisible ? 'Visible' : 'Hidden'}
                                                                </span>
                                                                <div
                                                                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isVisible ? 'bg-green-600' : 'bg-gray-600'}`}
                                                                    onClick={() => updateProject(project.id, { isVisibleInPortfolio: !isVisible })}
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
                                ) : (
                                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center">
                                        <p className="text-gray-400">You don't have any projects yet. Add a custom project or import from GitHub.</p>
                                    </div>
                                );
                            })()}

                            {/* GitHub Repos */}
                            {(() => {
                                const importedRepoIds = new Set(
                                    projects
                                        .filter(p => p.sourceType === 'github' && p.sourceId)
                                        .map(p => p.sourceId)
                                );

                                return allRepos.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium mb-4">GitHub Repositories</h3>
                                        <div className="grid gap-4">
                                            {allRepos.map((repo) => {
                                                const isImported = importedRepoIds.has(String(repo.id));
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
                                                                <button
                                                                    disabled={isImported}
                                                                    className={`px-3 py-1 rounded-md transition-colors text-sm ${isImported
                                                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                        }`}
                                                                    onClick={async () => {
                                                                        if (isImported) return;
                                                                        try {
                                                                            setIsLoading(true);
                                                                            const newProject = {
                                                                                title: repo.name,
                                                                                description: repo.description || '',
                                                                                technologies: repo.language ? [repo.language] : [],
                                                                                githubUrl: repo.html_url,
                                                                                isPublic: true,
                                                                                order: projects.length,
                                                                                isImported: true,
                                                                                isVisibleInPortfolio: true,
                                                                                sourceType: 'github',
                                                                                sourceId: String(repo.id)
                                                                            } as any;

                                                                            await createProject(newProject as any);
                                                                            setUpdateMessage({
                                                                                text: `Project "${repo.name}" imported successfully!`,
                                                                                type: 'success'
                                                                            });
                                                                            setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                                                                        } catch (e) {
                                                                            console.error('Import project failed', e);
                                                                            setUpdateMessage({
                                                                                text: 'Failed to import project. It might already exist.',
                                                                                type: 'error'
                                                                            });
                                                                        } finally {
                                                                            setIsLoading(false);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isImported ? 'Imported' : 'Import as Project'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* CV Management Tab */}
                    {activeTab === 'cv' && (
                        <div className="bg-gray-800 rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-6">CV Management</h2>

                            <div className="mb-6">
                                <p className="text-gray-400">
                                    Update your CV. You can upload a CV file directly or provide links to view and download your CV.
                                </p>
                            </div>

                            {(profile as any)?.cvFileUrl || profile?.cvFile ? (
                                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-white mb-1">Current CV</h3>
                                            <p className="text-sm text-gray-400">
                                                Your CV is available for viewing and download on your portfolio.
                                            </p>
                                        </div>
                                        <a
                                            href={resolveAssetUrl((profile as any)?.cvFileUrl || profile?.cvFile)}
                                            target="_blank"
                                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-2 mb-6">
                                <p className="text-sm text-gray-400 mb-2">
                                    Upload your CV file directly:
                                </p>
                                <label className="flex justify-center px-6 py-3 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
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
                                        onChange={handleCVUpload}
                                    />
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    CV View URL (e.g., Google Drive link)
                                </label>
                                <input
                                    type="text"
                                    value={profile?.cvViewUrl || ''}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                                    disabled
                                />
                                <p className="mt-1 text-sm text-gray-400">
                                    This URL is automatically generated when you upload a CV.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === 'integrations' && (
                        <div className="bg-gray-800 rounded-lg p-6 mt-8">
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
                                            <span className={`text-xs px-2 py-1 rounded ${formData.githubUrl ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-yellow-500 bg-opacity-20 text-yellow-400'}`}>
                                                {formData.githubUrl ? 'Connected' : 'Not Connected'}
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setIsLoading(true);
                                                        setIsRefreshingGitHub(true);
                                                        clearGitHubCache();
                                                        const githubUsername = formData.githubUrl.split('/').pop();
                                                        const repos = await fetchGitHubRepos(githubUsername);
                                                        setAllRepos(repos);
                                                        await getProfile().catch(() => { });
                                                        setUpdateMessage({ text: 'GitHub cache cleared and data refreshed.', type: 'success' });
                                                    } catch (e) {
                                                        console.error('Clear GitHub cache failed', e);
                                                        setUpdateMessage({ text: 'Failed to refresh GitHub data. Please try again.', type: 'error' });
                                                    } finally {
                                                        setTimeout(() => setUpdateMessage({ text: '', type: '' }), 3000);
                                                        setIsLoading(false);
                                                        setIsRefreshingGitHub(false);
                                                    }
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
                                            GitHub URL
                                        </label>
                                        <input
                                            type="text"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="https://github.com/yourusername"
                                        />
                                        <p className="mt-2 text-sm text-gray-400">
                                            Add your GitHub URL to import repositories automatically.
                                        </p>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Save GitHub URL
                                        </button>
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
                                            <span className={`text-xs px-2 py-1 rounded ${formData.linkedinUrl ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-yellow-500 bg-opacity-20 text-yellow-400'}`}>
                                                {formData.linkedinUrl ? 'Connected' : 'Not Connected'}
                                            </span>
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
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="https://linkedin.com/in/yourusername"
                                        />
                                        <p className="mt-2 text-sm text-gray-400">
                                            Add your LinkedIn URL to import your professional profile.
                                        </p>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Save LinkedIn URL
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setIsLoading(true);
                                                    const linkedInData = await fetchLinkedInProfile();

                                                    const locationString = typeof linkedInData.location === 'object' && linkedInData.location !== null
                                                        ? `${(linkedInData.location as any).city || ''}, ${(linkedInData.location as any).country || ''}`.replace(/^, |, $/g, '')
                                                        : linkedInData.location;

                                                    const newProfileData = {
                                                        name: linkedInData.name || formData.name,
                                                        title: linkedInData.headline || formData.title,
                                                        location: locationString || formData.location,
                                                        bio: linkedInData.summary || linkedInData.about || formData.bio,
                                                    };

                                                    // Update the form state
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        ...newProfileData
                                                    }));

                                                    // Also save the data to the backend
                                                    await updateProfile(newProfileData);

                                                    setUpdateMessage({ text: 'Profile data synced and saved from LinkedIn!', type: 'success' });
                                                    setActiveTab('profile'); // Switch to profile tab to see changes
                                                } catch (error) {
                                                    console.error('Failed to sync with LinkedIn:', error);
                                                    setUpdateMessage({ text: 'Failed to sync with LinkedIn. Please check your URL and try again.', type: 'error' });
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }}
                                            className="mt-2 ml-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Sync Profile from LinkedIn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === 'account' && (
                        <div className="bg-gray-800 rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-4">Change Password</h3>

                                <div className="mb-4">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
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
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
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
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Updating...' : 'Update Password'}
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

                                    <div className="mb-4">
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Type your username <span className="font-bold">{user?.username}</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-red-500/40 rounded-md text-white focus:border-red-500 focus:ring-red-500"
                                            placeholder={user?.username}
                                        />
                                    </div>

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading || deleteConfirmation !== user?.username}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Processing...' : 'Delete Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Floating toast (bottom-right) */}
            {updateMessage.text && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg border text-sm ${updateMessage.type === 'error'
                    ? 'bg-red-900/80 border-red-500/50 text-red-100'
                    : 'bg-green-900/80 border-green-500/50 text-green-100'}`}>
                    {updateMessage.text}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
