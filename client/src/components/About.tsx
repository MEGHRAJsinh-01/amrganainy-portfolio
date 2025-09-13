import React, { useState, useEffect } from 'react';
import { translations, personalInfo, API_URL } from '../constants';
import {
    getDynamicSkills,
    getDynamicBio,
    clearSkillsCache,
    clearLinkedInCache,
    SkillsData,
    getCachedLinkedInProfile,
    fetchLinkedInProfile
} from '../githubService';
import { LinkedInEducation, LinkedInExperience } from '../types';
import { LinkedInProfileData, Portfolio } from '../types';
import ReactMarkdown from 'react-markdown';
import DynamicText from './DynamicText';
import { portfolioAPI } from '../api';

interface AboutProps {
    language: string;
    isEditMode?: boolean;
    onProfileUpdate?: (data: any) => void;
}

// Interface for language proficiency data
interface LanguageProficiency {
    code: string;
    name: string;
    level: string;
    certificate?: string;
}

// Helper function to ensure image URLs are complete with domain
const ensureFullImageUrl = (url: string | undefined): string => {
    if (!url) return '';

    // If the URL already starts with http:// or https://, it's already complete
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it starts with /uploads/, prepend the API URL
    if (url.startsWith('/uploads/')) {
        // Extract the domain from API_URL or use localhost
        const apiUrlObj = new URL(API_URL);
        const domain = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        return `${domain}${url}`;
    }

    // For relative paths that don't start with /uploads/
    if (url.startsWith('/')) {
        const apiUrlObj = new URL(API_URL);
        const domain = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        return `${domain}${url}`;
    }

    // If it's an "undefined/uploads/" path, fix it
    if (url.includes('undefined/uploads/')) {
        const apiUrlObj = new URL(API_URL);
        const domain = `${apiUrlObj.protocol}//${apiUrlObj.host}`;
        return url.replace('undefined', domain);
    }

    // For all other cases, assume it's a relative path and prepend the origin
    const origin = window.location.origin;
    return `${origin}/${url.replace(/^\/+/, '')}`;
};

const About: React.FC<AboutProps> = ({ language, isEditMode = false, onProfileUpdate }) => {
    const [skills, setSkills] = useState<SkillsData>({
        programmingLanguages: [],
        otherSkills: []
    });
    const [bio, setBio] = useState<{ en: string; de: string }>({ en: '', de: '' });
    const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfileData | null>(null);
    const [educationData, setEducationData] = useState<LinkedInEducation[]>([]);
    const [experienceData, setExperienceData] = useState<LinkedInExperience[]>([]);
    const [languages, setLanguages] = useState<LanguageProficiency[]>([]);
    const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(false);
    const [bioError, setBioError] = useState<string | null>(null);
    const [portfolioError, setPortfolioError] = useState<string | null>(null);
    const [skillsError, setSkillsError] = useState<string | null>(null);

    // Edit mode state variables
    const [editName, setEditName] = useState<string>('');
    const [editTitle, setEditTitle] = useState<string>('');
    const [editBioEn, setEditBioEn] = useState<string>('');
    const [editBioDe, setEditBioDe] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load skills
                const dynamicSkills = await getDynamicSkills();
                setSkills(dynamicSkills);
                setSkillsError(null);

                // Load profile data from LinkedIn
                try {
                    // Try to get cached LinkedIn profile first
                    let profile = getCachedLinkedInProfile();

                    // If no cached profile, fetch from LinkedIn
                    if (!profile) {
                        profile = await fetchLinkedInProfile();
                    }

                    // Set the LinkedIn profile
                    if (profile) {
                        setLinkedInProfile(profile);
                        console.log("LinkedIn profile data:", profile);

                        // Set education data if available
                        if (profile.education && profile.education.length > 0) {
                            setEducationData(profile.education);
                            console.log("LinkedIn education data:", profile.education);
                        }

                        // Set experience data if available
                        if (profile.experiences && profile.experiences.length > 0) {
                            setExperienceData(profile.experiences);
                            console.log("LinkedIn experience data:", profile.experiences);
                        }
                    }

                    // Extract bio
                    const dynamicBio = await getDynamicBio();
                    setBio(dynamicBio);
                    setBioError(null); // Clear any previous errors

                    // Extract education data
                    if (profile?.education && profile.education.length > 0) {
                        setEducationData(profile.education);
                    }

                    // Now that we have LinkedIn data, load portfolio data
                    // This ensures LinkedIn profile pic is available when checking portfolio data
                    await loadPortfolioData();

                    // Extract languages from skills
                    if (profile?.languages && profile.languages.length > 0) {
                        // Use languages directly from the LinkedIn profile
                        const languageData = profile.languages.map(lang => {
                            return {
                                code: lang.code || lang.language?.substring(0, 2).toUpperCase() || '',
                                name: lang.name || lang.language || '',
                                level: lang.level || lang.proficiency || 'Unknown',
                                certificate: lang.certificate || ''
                            };
                        });

                        setLanguages(languageData);
                        console.log("LinkedIn languages data:", languageData);
                    }
                    // Fallback: try to extract languages from skills if no languages array is present
                    else if (profile?.skills && profile.skills.length > 0) {
                        // Find language skills (like German, English, etc.)
                        const languageSkills: LanguageProficiency[] = [];

                        // Look for language skills - typical patterns include "German (C1)", "English - B2", etc.
                        const languageKeywords = ['german', 'english', 'french', 'spanish', 'arabic', 'chinese'];
                        const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

                        profile.skills.forEach(skill => {
                            const skillName = typeof skill === 'string' ? skill : skill.name || '';
                            const skillNameLower = skillName.toLowerCase();

                            // Check if this is a language skill
                            const matchedLanguage = languageKeywords.find(lang =>
                                skillNameLower.includes(lang.toLowerCase())
                            );

                            if (matchedLanguage) {
                                // Try to extract level if present in skill name
                                let level = '';
                                let certificate = '';

                                languageLevels.forEach(lvl => {
                                    if (skillNameLower.includes(lvl.toLowerCase())) {
                                        level = lvl;
                                    }
                                });

                                // Look for certificate mentions
                                if (skillNameLower.includes('telc') || skillNameLower.includes('certificate')) {
                                    certificate = 'Telc Certificate';
                                }

                                // Get language code
                                let code = '';
                                switch (matchedLanguage.toLowerCase()) {
                                    case 'german': code = 'DE'; break;
                                    case 'english': code = 'EN'; break;
                                    case 'french': code = 'FR'; break;
                                    case 'spanish': code = 'ES'; break;
                                    case 'arabic': code = 'AR'; break;
                                    case 'chinese': code = 'CN'; break;
                                    default: code = matchedLanguage.substring(0, 2).toUpperCase();
                                }

                                // Format proper language name
                                const name = matchedLanguage.charAt(0).toUpperCase() + matchedLanguage.slice(1);

                                languageSkills.push({
                                    code,
                                    name,
                                    level: level || 'Unknown',
                                    certificate
                                });
                            }
                        });

                        // If we found any language skills, use them
                        if (languageSkills.length > 0) {
                            setLanguages(languageSkills);
                        }
                    }
                } catch (bioError) {
                    console.error('Error loading data from LinkedIn:', bioError);
                    if (bioError instanceof Error) {
                        if (bioError.message.includes('API token')) {
                            setBioError('LinkedIn API token is missing or invalid. Please check your Apify configuration.');
                        } else if (bioError.message.includes('scraping failed')) {
                            setBioError('LinkedIn profile scraping failed. This could be due to LinkedIn rate limits or changes.');
                        } else if (bioError.message.includes('timed out')) {
                            setBioError('LinkedIn profile scraping timed out. The operation took too long to complete.');
                        } else {
                            setBioError(bioError.message);
                        }
                    } else {
                        setBioError('Failed to load bio from LinkedIn.');
                    }
                    // Keep the existing bio (don't update it with fallback)

                    // Still load portfolio data even if LinkedIn fails
                    await loadPortfolioData();
                }
            } catch (error) {
                console.error('Error loading dynamic data:', error);
                // Set skills error if GitHub fails
                if (error instanceof Error && error.message.includes('GitHub username not configured')) {
                    setSkillsError('GitHub username is not configured. Please set it in the admin panel Social Links section.');
                } else {
                    setSkillsError('Failed to load skills from GitHub. Please check your GitHub configuration.');
                }
                // We don't fallback for bio (that shows error), but we still use empty arrays for skills

                // Try to load portfolio data even if other data loading fails
                try {
                    await loadPortfolioData();
                } catch (portfolioError) {
                    console.error('Error loading portfolio data:', portfolioError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Initialize edit state when data loads or edit mode changes
    useEffect(() => {
        if (isEditMode && (linkedInProfile || portfolioData)) {
            setEditName(linkedInProfile?.name || portfolioData?.personalInfo?.name || '');
            setEditTitle(linkedInProfile?.headline || portfolioData?.personalInfo?.title || '');
            setEditBioEn(bio.en || '');
            setEditBioDe(bio.de || '');
        }
    }, [isEditMode, linkedInProfile, portfolioData, bio]); const loadPortfolioData = async () => {
        setIsLoadingPortfolio(true);
        try {
            const portfolio = await portfolioAPI.getProfile();
            setPortfolioData(portfolio);

            // If LinkedIn profile is loaded and there's no custom profile image, 
            // use the LinkedIn profile picture
            if (linkedInProfile?.profile_pic_url &&
                (!portfolio.profileImage || portfolio.profileImage.trim() === '')) {
                console.log('Using LinkedIn profile picture as profile image:', linkedInProfile.profile_pic_url);

                // Only update the local state - don't save to DB (admin can do that if desired)
                setPortfolioData(prev => ({
                    ...prev,
                    profileImage: linkedInProfile.profile_pic_url
                }));
            }

            setPortfolioError(null);
            setIsLoadingPortfolio(false);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            setPortfolioError('Failed to load portfolio data from server.');
            setIsLoadingPortfolio(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!onProfileUpdate) return;

        setIsSaving(true);
        try {
            const updatedProfile = {
                personalInfo: {
                    name: editName,
                    title: editTitle
                },
                bio: {
                    en: editBioEn,
                    de: editBioDe
                }
            };

            await onProfileUpdate(updatedProfile);

            // Update local state
            setBio({ en: editBioEn, de: editBioDe });
            if (portfolioData) {
                setPortfolioData({
                    ...portfolioData,
                    personalInfo: {
                        ...portfolioData.personalInfo,
                        name: editName,
                        title: editTitle
                    }
                });
            }

            // Exit edit mode
            // Note: The parent component should handle this
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section id="about" className="py-20 px-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                    {/* Only show profile image if it's set from portfolio API or LinkedIn */}
                    {(portfolioData?.profileImage && portfolioData.profileImage.trim() !== '') ||
                        (linkedInProfile?.profile_pic_url && linkedInProfile.profile_pic_url.trim() !== '') ? (
                        <div className="flex-shrink-0 relative">
                            <div
                                className="w-48 h-48 bg-center bg-no-repeat bg-cover rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20"
                                style={{
                                    backgroundImage: `url("${ensureFullImageUrl(portfolioData?.profileImage || linkedInProfile?.profile_pic_url || '')}")`,
                                    backgroundColor: '#1e293b' // Add a background color in case image fails to load
                                }}
                                aria-label={`Portrait of ${portfolioData?.personalInfo?.name || linkedInProfile?.name || 'the portfolio owner'}`}
                                onError={(e) => {
                                    console.error("Image failed to load:", portfolioData?.profileImage || linkedInProfile?.profile_pic_url);
                                    // If image fails to load, hide the image container
                                    const parentElement = (e.target as HTMLElement).parentElement;
                                    if (parentElement && parentElement.parentElement) {
                                        parentElement.parentElement.style.display = 'none';
                                    }
                                }}
                            ></div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex-shrink-0 relative">
                            <div className="w-48 h-48 rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20 flex items-center justify-center bg-gray-800">
                                <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div>
                            {isEditMode ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-4xl lg:text-5xl font-bold leading-tight tracking-tighter focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter your name"
                                    />
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-blue-400 text-xl lg:text-2xl font-medium leading-normal focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter your title/profession"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                        {linkedInProfile?.name || portfolioData?.personalInfo?.name || (isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-400 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : 'Name not available')}
                                    </h1>
                                    <h2 className="text-blue-400 text-xl lg:text-2xl font-medium leading-normal mb-6">
                                        {linkedInProfile?.headline || portfolioData?.personalInfo?.title || (isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-blue-400 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : 'Title not available')}
                                    </h2>
                                </>
                            )}
                        </div>
                        <div className="text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                            {isEditMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Bio (English)</label>
                                        <textarea
                                            value={editBioEn}
                                            onChange={(e) => setEditBioEn(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 text-lg font-normal leading-relaxed focus:border-blue-500 focus:outline-none resize-vertical min-h-[120px]"
                                            placeholder="Enter your bio in English"
                                            rows={4}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Bio (German)</label>
                                        <textarea
                                            value={editBioDe}
                                            onChange={(e) => setEditBioDe(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 text-lg font-normal leading-relaxed focus:border-blue-500 focus:outline-none resize-vertical min-h-[120px]"
                                            placeholder="Enter your bio in German"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">save</span>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Reset to original values
                                                setEditName(linkedInProfile?.name || portfolioData?.personalInfo?.name || '');
                                                setEditTitle(linkedInProfile?.headline || portfolioData?.personalInfo?.title || '');
                                                setEditBioEn(bio.en || '');
                                                setEditBioDe(bio.de || '');
                                            }}
                                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading bio from LinkedIn...
                                </span>
                            ) : bioError ? (
                                <div className="text-red-400 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold">Error loading LinkedIn profile info</span>
                                    </div>
                                    <p className="text-gray-300">We couldn’t load the LinkedIn details right now.</p>
                                </div>
                            ) : portfolioError ? (
                                <div className="text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold">Some data couldn’t be loaded</span>
                                    </div>
                                    <p>{portfolioError}</p>
                                    {/* Hide admin link on public view */}
                                    {/^\/?u\//i.test(window.location.pathname) ? null : (
                                        <a href="/admin" className="mt-3 inline-block text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors">
                                            Go to Admin Panel
                                        </a>
                                    )}
                                </div>
                            ) : bio && (bio[language] || bio['en']) ? (
                                <div className="markdown-bio">
                                    <ReactMarkdown>
                                        {bio[language] || bio['en']}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold">Bio Data Not Available</span>
                                    </div>
                                    <p>Unable to load bio information. Please check your LinkedIn API connection or add a bio in the admin panel.</p>
                                    <button
                                        onClick={() => {
                                            clearLinkedInCache();
                                            window.location.reload();
                                        }}
                                        className="mt-3 text-sm bg-amber-700 hover:bg-amber-600 text-white py-1 px-3 rounded transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Education, Experience & Languages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Education Card - Only shown when data is available from LinkedIn */}
                    {educationData && educationData.length > 0 && (
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-400">school</span>
                                </div>
                                <h3 className="text-white text-2xl font-bold">{translations[language].about.education}</h3>
                            </div>
                            <div className="space-y-4">
                                {educationData.map((edu, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-gray-300 font-medium">
                                                <DynamicText
                                                    content={`${edu.degree || ''} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}`}
                                                    language={language}
                                                />
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                <DynamicText
                                                    content={`${edu.school || edu.schoolName || ''} ${edu.startDate || edu.endDate ? `(${edu.startDate || ''} - ${edu.endDate || 'Present'})` : ''}`}
                                                    language={language}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience Card - Only shown when data is available from LinkedIn */}
                    {experienceData && experienceData.length > 0 && (
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-400">work</span>
                                </div>
                                <h3 className="text-white text-2xl font-bold">{translations[language].about.experience}</h3>
                            </div>
                            <div className="space-y-4">
                                {experienceData.map((exp, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-gray-300 font-medium">
                                                <DynamicText
                                                    content={`${exp.title || ''} @ ${exp.company || exp.companyName || ''}`}
                                                    language={language}
                                                />
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                <DynamicText
                                                    content={`${exp.location ? `${exp.location}` : ''} ${exp.startDate || exp.endDate ? `(${exp.startDate || ''} - ${exp.endDate || 'Present'})` : ''}`}
                                                    language={language}
                                                />
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-400 text-sm mt-1">
                                                    <DynamicText
                                                        content={exp.description}
                                                        language={language}
                                                    />
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages Card - Only shown when data is available from LinkedIn */}
                    {languages && languages.length > 0 && (
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-400">language</span>
                                </div>
                                <h3 className="text-white text-2xl font-bold">{translations[language].about.languages}</h3>
                            </div>
                            <div className="space-y-4">
                                {languages.map((lang, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">{lang.code}</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-300 font-medium">
                                                <DynamicText
                                                    content={lang.name}
                                                    language={language}
                                                />
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                <DynamicText
                                                    content={`${lang.level}${lang.certificate ? ` - ${lang.certificate}` : ''}`}
                                                    language={language}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Programming Languages Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">code</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.programmingLanguages}</h3>
                    </div>
                    {skillsError ? (
                        <div className="text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold">GitHub Integration Issue</span>
                            </div>
                            <p className="mb-3">{skillsError}</p>
                            <div className="flex gap-2">
                                <a href="/admin" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                                    Go to Admin Panel
                                </a>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 flex-wrap">
                            {skills && skills.programmingLanguages && skills.programmingLanguages.length > 0 ? (
                                skills.programmingLanguages.map(lang => (
                                    <div key={lang} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/30 px-4 py-2 border border-blue-800/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                                        <p className="text-gray-300 text-sm font-medium leading-normal">
                                            {lang}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No programming languages detected from GitHub repositories.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Other Skills Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">construction</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.skills}</h3>
                    </div>
                    {skillsError ? (
                        <div className="text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold">Skills Loading Issue</span>
                            </div>
                            <p className="mb-3">{skillsError}</p>
                            <div className="flex gap-2">
                                <a href="/admin" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                                    Configure GitHub
                                </a>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 flex-wrap">
                            {skills && skills.otherSkills && skills.otherSkills.length > 0 ? (
                                skills.otherSkills.map(skill => (
                                    <div key={skill} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2 border border-gray-600 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                                        <p className="text-gray-300 text-sm font-medium leading-normal">
                                            {skill}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No additional skills detected from GitHub repositories.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
