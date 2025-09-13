import React from 'react';
import { translations } from '../constants';
import { authAPI, isAuthenticated } from '../api';

interface HeaderProps {
    language: string;
    setLanguage: (language: string) => void;
    onShare?: () => void;
    isViewMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ language = 'en', setLanguage = () => { }, onShare, isViewMode = false }) => {
    const handleLogout = () => {
        authAPI.logout();
        window.location.href = '/login'; // Redirect to login page
    };

    const handleShare = () => {
        if (onShare) {
            onShare();
        } else {
            // Generate shareable link
            const shareUrl = `${window.location.origin}${window.location.pathname}?view=public`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Shareable link copied to clipboard!');
            });
        }
    };

    // Guard language key
    const langKey = (language && (language in translations)) ? language : 'en';

    return (
        <header className="sticky top-0 w-full h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
            <nav className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                <a href="#" className="text-xl font-bold">Home</a>
                <div className="flex items-center gap-8">
                    <ul className="flex gap-8">
                        <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[langKey].nav.about}</a></li>
                        <li><a href="#projects" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[langKey].nav.projects}</a></li>
                        <li><a href="#cv" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[langKey].nav.cv}</a></li>
                        <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[langKey].nav.contact}</a></li>
                    </ul>
                    <div className="flex items-center gap-3">
                        {isAuthenticated() && !isViewMode && (
                            <>
                                <button
                                    onClick={handleShare}
                                    className="px-3 py-1 bg-blue-600 border border-blue-500 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                    title="Get shareable link"
                                >
                                    Share
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1 bg-red-600 border border-red-500 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setLanguage(langKey === 'en' ? 'de' : 'en')}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <img
                                src={`/flags/${langKey === 'en' ? 'de' : 'gb'}.svg`}
                                alt={langKey === 'en' ? 'German flag' : 'British flag'}
                                className="w-5 h-3.5 object-cover rounded-sm"
                            />
                            {langKey === 'en' ? 'DE' : 'EN'}
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
