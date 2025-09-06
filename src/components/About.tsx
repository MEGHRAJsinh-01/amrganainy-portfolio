import React, { useState, useEffect } from 'react';
import { translations, personalInfo } from '../constants';
import { getDynamicSkills, clearSkillsCache, SkillsData } from '../githubService';

interface AboutProps {
    language: string;
}

const About: React.FC<AboutProps> = ({ language }) => {
    const [skills, setSkills] = useState<SkillsData>({
        programmingLanguages: [],
        otherSkills: []
    });

    useEffect(() => {
        const loadSkills = async () => {
            try {
                // Force refresh by clearing cache first (uncomment to always get fresh data)
                // await clearSkillsCache();
                const dynamicSkills = await getDynamicSkills();
                setSkills(dynamicSkills);
            } catch (error) {
                console.error('Error loading dynamic skills:', error);
                // No fallback needed as we're fully relying on GitHub
            }
        };

        loadSkills();
    }, []);

    return (
        <section id="about" className="py-20 px-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                    <div className="flex-shrink-0 relative">
                        <div className="w-48 h-48 bg-center bg-no-repeat bg-cover rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20" style={{ backgroundImage: `url("${personalInfo.imageUrl}")` }} aria-label={`Portrait of ${personalInfo.name}`}></div>
                    </div>
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div>
                            <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {personalInfo.name}
                            </h1>
                            <h2 className="text-blue-400 text-xl lg:text-2xl font-medium leading-normal mb-6">
                                {personalInfo.title}
                            </h2>
                        </div>
                        <p className="text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                            {personalInfo.bio[language]}
                        </p>
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
                        {skills.programmingLanguages.map(lang => (
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
                        {skills.otherSkills.map(skill => (
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
