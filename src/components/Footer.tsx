import React from 'react';
import { translations, personalInfo } from '../constants';

interface FooterProps {
    language: string;
    showAdminLink: boolean;
    onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ language, showAdminLink, onAdminClick }) => (
    <footer className="text-center py-8 border-t border-gray-800 bg-gray-900/50 relative">
        <p className="text-gray-400">{translations[language].footer.copyright.replace('{year}', new Date().getFullYear().toString()).replace('{name}', personalInfo.name)}</p>
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

export default Footer;
