import React from 'react';
import { translations } from '../constants';

interface HeaderProps {
    language: string;
    setLanguage: (language: string) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => (
    <header className="sticky top-0 w-full h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
            <a href="#" className="text-xl font-bold">Amr Elganainy</a>
            <div className="flex items-center gap-8">
                <ul className="flex gap-8">
                    <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.about}</a></li>
                    <li><a href="#projects" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.projects}</a></li>
                    <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.contact}</a></li>
                </ul>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <img
                        src={`/flags/${language === 'en' ? 'de' : 'gb'}.svg`}
                        alt={language === 'en' ? 'German flag' : 'British flag'}
                        className="w-5 h-3.5 object-cover rounded-sm"
                    />
                    {language === 'en' ? 'DE' : 'EN'}
                </button>
            </div>
        </nav>
    </header>
);

export default Header;
