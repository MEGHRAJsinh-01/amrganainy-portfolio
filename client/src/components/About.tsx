import React, { useState, useEffect } from 'react';
import { translations } from '../constants';
import { IProfile } from '../types';
import { portfolioAPI } from '../api';
import ReactMarkdown from 'react-markdown';

interface AboutProps {
    language: string;
    isEditMode?: boolean;
    onProfileUpdate?: (data: any) => void;
    profile?: IProfile;
    username?: string;
}

const About: React.FC<AboutProps> = ({ language, isEditMode = false, onProfileUpdate, profile, username }) => {
    const [aggregatedData, setAggregatedData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (profile && username) {
                    // For user-specific profiles, fetch aggregated data using username
                    const data = await portfolioAPI.getAggregatedProfile(username);
                    setAggregatedData(data);
                } else if (profile) {
                    // For current user profile without username (fallback)
                    const data = await portfolioAPI.getProfile();
                    setAggregatedData(data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [profile, username]);

    if (isLoading) {
        return (
            <section id="about" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p>Loading profile data...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="about" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                        <p className="text-red-400">Error: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!aggregatedData) {
        return (
            <section id="about" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p>No profile data available.</p>
                </div>
            </section>
        );
    }

    const { skills, name, title, bio, profileImageUrl } = aggregatedData;

    return (
        <section id="about" className="py-20 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                    {profileImageUrl ? (
                        <div className="flex-shrink-0 relative">
                            <div
                                className="w-48 h-48 bg-center bg-no-repeat bg-cover rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20"
                                style={{
                                    backgroundImage: `url("${profileImageUrl}")`,
                                    backgroundColor: '#1e293b'
                                }}
                                aria-label={`Portrait of ${name || 'the portfolio owner'}`}
                            ></div>
                        </div>
                    ) : null}
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div>
                            <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {name || 'Name not available'}
                            </h1>
                            <h2 className="text-blue-400 text-xl lg:text-2xl font-medium leading-normal mb-6">
                                {title || 'Title not available'}
                            </h2>
                        </div>
                        <div className="text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                            {bio ? (
                                <div className="markdown-bio">
                                    <ReactMarkdown>
                                        {typeof bio === 'string' ? bio : (bio[language] || bio['en'] || 'No bio available')}
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">code</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.programmingLanguages}</h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {skills && skills.programmingLanguages && skills.programmingLanguages.length > 0 ? (
                            skills.programmingLanguages.map((lang: any, index: number) => (
                                <div key={typeof lang === 'string' ? lang : lang.name || `lang-${index}`} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-blue-900/50 to-blue-800/30 px-4 py-2 border border-blue-800/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                                    <p className="text-gray-300 text-sm font-medium leading-normal">
                                        {typeof lang === 'string' ? lang : lang.name || 'Unknown'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No programming languages detected from GitHub repositories.</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">construction</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.skills}</h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {skills && skills.otherSkills && skills.otherSkills.length > 0 ? (
                            skills.otherSkills.map((skill: any, index: number) => (
                                <div key={typeof skill === 'string' ? skill : skill.name || `skill-${index}`} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-green-900/50 to-green-800/30 px-4 py-2 border border-green-800/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                                    <p className="text-gray-300 text-sm font-medium leading-normal">
                                        {typeof skill === 'string' ? skill : skill.name || 'Unknown'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No additional skills detected.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;