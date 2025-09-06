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
import { LinkedInEducation } from '../types';
import { LinkedInProfileData, Portfolio } from '../types';
import ReactMarkdown from 'react-markdown';
import DynamicText from './DynamicText';
import { portfolioAPI } from '../api';

interface AboutProps {
    language: string;
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

const About: React.FC<AboutProps> = ({ language }) => {
    const [skills, setSkills] = useState<SkillsData>({
        programmingLanguages: [],
        otherSkills: []
    });
    const [bio, setBio] = useState<{ en: string; de: string }>({
        en: "Junior Android and cross-platform mobile developer with solid project experience. I love turning ideas into functional apps, am a team player, and always ready to learn. As a CS graduate and Cyber Security master's student, I'm currently writing my master's thesis.",
        de: "Junior Android- und cross-platform Mobile-Entwickler mit fundierter Projekterfahrung. Ich liebe es, Ideen in funktionierende Apps umzusetzen, bin Teamplayer und immer bereit, mehr zu lernen. Als CS-Absolvent und Master-Student in Cyber Security schreibe ich derzeit meine Masterarbeit."
    });
    const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfileData | null>(null);
    const [educationData, setEducationData] = useState<LinkedInEducation[]>([]);
    const [languages, setLanguages] = useState<LanguageProficiency[]>([
        { code: 'DE', name: 'German', level: 'C1', certificate: 'Telc University Certificate' },
        { code: 'EN', name: 'English', level: 'B2', certificate: 'B2 Level' }
    ]);
    const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(false);
    const [bioError, setBioError] = useState<string | null>(null);
    const [portfolioError, setPortfolioError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load portfolio data from API
                await loadPortfolioData();

                // Load skills
                const dynamicSkills = await getDynamicSkills();
                setSkills(dynamicSkills);

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
                    }

                    // Extract bio
                    const dynamicBio = await getDynamicBio();
                    setBio(dynamicBio);
                    setBioError(null); // Clear any previous errors

                    // Extract education data
                    if (linkedInProfile?.education && linkedInProfile.education.length > 0) {
                        setEducationData(linkedInProfile.education);
                    }

                    // Extract languages from skills
                    if (linkedInProfile?.skills && linkedInProfile.skills.length > 0) {
                        // Find language skills (like German, English, etc.)
                        const languageSkills: LanguageProficiency[] = [];

                        // Look for language skills - typical patterns include "German (C1)", "English - B2", etc.
                        const languageKeywords = ['german', 'english', 'french', 'spanish', 'arabic', 'chinese'];
                        const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

                        linkedInProfile.skills.forEach(skill => {
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
                            setBioError('LinkedIn profile scraping failed. This could be due to LinkedIn rate limits or changes. Using fallback bio instead.');
                        } else if (bioError.message.includes('timed out')) {
                            setBioError('LinkedIn profile scraping timed out. The operation took too long to complete. Using fallback bio instead.');
                        } else {
                            setBioError(bioError.message);
                        }
                    } else {
                        setBioError('Failed to load bio from LinkedIn. Using fallback bio instead.');
                    }
                    // Keep the existing bio (don't update it with fallback)
                }
            } catch (error) {
                console.error('Error loading dynamic data:', error);
                // We don't fallback for bio (that shows error), but we still use empty arrays for skills
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const loadPortfolioData = async () => {
        setIsLoadingPortfolio(true);
        try {
            const portfolio = await portfolioAPI.getPortfolio();
            setPortfolioData(portfolio);
            setPortfolioError(null);
            setIsLoadingPortfolio(false);
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            setPortfolioError('Failed to load portfolio data from server. Using fallback data.');
            setIsLoadingPortfolio(false);
        }
    };

    return (
        <section id="about" className="py-20 px-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                    {/* Only show profile image if it's set from portfolio API, LinkedIn or environment variables and is not empty */}
                    {(portfolioData?.profileImage && portfolioData.profileImage.trim() !== '') || 
                     (linkedInProfile?.profile_pic_url && linkedInProfile.profile_pic_url.trim() !== '') || 
                     (personalInfo.imageUrl && personalInfo.imageUrl.trim() !== '') ? (
                        <div className="flex-shrink-0 relative">
                            <div
                                className="w-48 h-48 bg-center bg-no-repeat bg-cover rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20"
                                style={{
                                    backgroundImage: `url("${ensureFullImageUrl(portfolioData?.profileImage || linkedInProfile?.profile_pic_url || personalInfo.imageUrl)}")`,
                                    backgroundColor: '#1e293b' // Add a background color in case image fails to load
                                }}
                                aria-label={`Portrait of ${portfolioData?.personalInfo?.name || linkedInProfile?.name || personalInfo.name}`}
                                onError={(e) => {
                                    console.error("Image failed to load:", portfolioData?.profileImage || linkedInProfile?.profile_pic_url || personalInfo.imageUrl);
                                    // If image fails to load, hide the image container
                                    const parentElement = (e.target as HTMLElement).parentElement;
                                    if (parentElement && parentElement.parentElement) {
                                        parentElement.parentElement.style.display = 'none';
                                    }
                                }}
                            ></div>
                        </div>
                    ) : null}
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div>
                            <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {personalInfo.name}
                            </h1>
                            <h2 className="text-blue-400 text-xl lg:text-2xl font-medium leading-normal mb-6">
                                {personalInfo.title}
                            </h2>
                        </div>
                        <div className="text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                            {isLoading ? (
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
                                        <span className="font-bold">Error Loading Bio</span>
                                    </div>
                                    <p>{bioError}</p>
                                    <button
                                        onClick={() => {
                                            clearLinkedInCache();
                                            window.location.reload();
                                        }}
                                        className="mt-3 text-sm bg-red-700 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors"
                                    >
                                        Clear Cache & Reload
                                    </button>
                                </div>
                            ) : (
                                <div className="markdown-bio">
                                    <ReactMarkdown>
                                        {bio[language] || bio['en']}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Education & Languages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Education Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400">school</span>
                            </div>
                            <h3 className="text-white text-2xl font-bold">{translations[language].about.education}</h3>
                        </div>
                        <div className="space-y-4">
                            {educationData && educationData.length > 0 ? (
                                educationData.map((edu, index) => (
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
                                ))
                            ) : (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-gray-300 font-medium">{translations[language].about.master}</p>
                                            <p className="text-gray-500 text-sm">Grade: 2.2</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-gray-300 font-medium">{translations[language].about.bachelor}</p>
                                            <p className="text-gray-500 text-sm">Grade: 2.3</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Languages Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-400">language</span>
                            </div>
                            <h3 className="text-white text-2xl font-bold">{translations[language].about.languages}</h3>
                        </div>
                        <div className="space-y-4">
                            {languages && languages.length > 0 ? (
                                languages.map((lang, index) => (
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
                                ))
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">DE</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-300 font-medium">{translations[language].about.german}</p>
                                            <p className="text-gray-500 text-sm">C1 Telc University Certificate</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">EN</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-300 font-medium">{translations[language].about.english}</p>
                                            <p className="text-gray-500 text-sm">B2 Level</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Programming Languages Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">code</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.programmingLanguages}</h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {skills && skills.programmingLanguages && skills.programmingLanguages.map(lang => (
                            <div key={lang} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/30 px-4 py-2 border border-blue-800/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                                <p className="text-gray-300 text-sm font-medium leading-normal">
                                    {lang}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Skills Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">construction</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.skills}</h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {skills && skills.otherSkills && skills.otherSkills.map(skill => (
                            <div key={skill} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2 border border-gray-600 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                                <p className="text-gray-300 text-sm font-medium leading-normal">
                                    {skill}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
