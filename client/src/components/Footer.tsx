import React, { useState, useEffect } from 'react';
import { translations } from '../constants';
import { portfolioAPI } from '../api';
import { getCachedLinkedInProfile } from '../githubService';

interface FooterProps {
    language: string;
    showAdminLink: boolean;
    onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ language, showAdminLink, onAdminClick }) => {
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Try to get the name from LinkedInProfile first
                const linkedInProfile = getCachedLinkedInProfile();
                if (linkedInProfile?.name) {
                    setName(linkedInProfile.name);
                    return;
                }

                // If LinkedIn data isn't available, try to get from portfolio API
                const portfolioData = await portfolioAPI.getProfile();
                if (portfolioData?.personalInfo?.name) {
                    setName(portfolioData.personalInfo.name);
                    return;
                }

                // If no name is found, use a generic placeholder
                setName('Portfolio Owner');
            } catch (error) {
                console.error('Error loading name for footer:', error);
                // For 401 errors, don't show error in footer, just use placeholder
                if (error instanceof Error && error.message.includes('Token is not valid')) {
                    setName('Portfolio Owner');
                } else {
                    setName('Portfolio Owner');
                }
            }
        };

        loadData();
    }, []);

    return (
        <footer className="text-center py-8 border-t border-gray-800 bg-gray-900/50 relative">
            <p className="text-gray-400">{translations[language].footer.copyright.replace('{year}', new Date().getFullYear().toString()).replace('{name}', name)}</p>
            {showAdminLink && (
                <button
                    onClick={onAdminClick}
                    className="absolute bottom-2 right-4 text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
                    title="Admin Panel (Ctrl+Shift+A to toggle)"
                >
                    Admin
                </button>
            )}
        </footer>
    );
};

export default Footer;
