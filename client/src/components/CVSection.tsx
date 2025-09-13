import React, { useState, useEffect } from 'react';
import { translations } from '../constants';
import { portfolioAPI } from '../api';
import { Portfolio } from '../types';

interface CVSectionProps {
    language: string;
}

const CVSection: React.FC<CVSectionProps> = ({ language }) => {
    const [portfolioData, setPortfolioData] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadClicked, setDownloadClicked] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                setLoading(true);
                const data = await portfolioAPI.getProfile();
                setPortfolioData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching portfolio data:', err);
                // Public pages should not require authentication; just show neutral message
                setError('Failed to load CV data from API.');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioData();
    }, []);

    // Only use data from API
    const viewCvUrl = portfolioData?.cvViewUrl || '';
    const downloadCvUrl = portfolioData?.cvDownloadUrl || '';

    if (loading) {
        return (
            <section id="cv" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto mb-8"></div>
                        <div className="flex justify-center gap-4">
                            <div className="h-12 bg-gray-700 rounded w-40"></div>
                            <div className="h-12 bg-gray-700 rounded w-40"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // If CV URLs are not available, show a message instead of the buttons
    if (!viewCvUrl && !downloadCvUrl) {
        return (
            <section id="cv" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4">
                            {translations[language].about.cv}
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-400">
                            {(
                                language === 'de'
                                    ? 'Leider ist mein Lebenslauf derzeit nicht verfügbar.'
                                    : 'My CV is currently not available.'
                            )}
                        </p>
                        {error && !authError && (
                            <div className="text-amber-400 mt-2 text-sm">
                                <span className="material-symbols-outlined mr-1 text-sm align-middle">info</span>
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="cv" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4">
                        {translations[language].about.cv}
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400">
                        {language === 'de'
                            ? 'Hier können Sie meinen Lebenslauf einsehen oder herunterladen.'
                            : 'View or download my CV to learn more about my education and experience.'}
                    </p>
                    {/* No auth prompts on public page */}
                    {error && !authError && (
                        <div className="text-amber-400 mt-2 text-sm">
                            <span className="material-symbols-outlined mr-1 text-sm align-middle">info</span>
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8 max-w-2xl w-full">
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            {viewCvUrl && (
                                <a
                                    href={viewCvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <span className="material-symbols-outlined mr-2">visibility</span>
                                    {translations[language].about.viewCV}
                                </a>
                            )}

                            {downloadCvUrl && (
                                <a
                                    href={downloadCvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setDownloadClicked(true)}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                                >
                                    <span className="material-symbols-outlined mr-2">download</span>
                                    {translations[language].about.downloadCV}
                                </a>
                            )}

                            {downloadClicked && (
                                <div className="text-center mt-4 text-sm text-gray-400">
                                    <p>
                                        {language === 'de'
                                            ? 'Falls der Download nicht automatisch startet, überprüfen Sie bitte Ihre Popup-Einstellungen oder versuchen Sie es erneut.'
                                            : 'If the download does not start automatically, please check your popup settings or try again.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CVSection;
