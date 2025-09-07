import React from 'react';
import { useTranslationService } from '../hooks/useTranslationService';

interface DynamicTextProps {
    content: string | { [key: string]: string } | null | undefined;
    language: string;
    sourceLanguage?: string;
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
    showLoading?: boolean;
}

/**
 * Component for dynamic text translation
 * Automatically translates content when language changes
 */
const DynamicText: React.FC<DynamicTextProps> = ({
    content,
    language,
    sourceLanguage = 'en',
    as = 'span',
    className = '',
    showLoading = false,
}) => {
    const { translatedContent, isLoading, error } = useTranslationService(
        content,
        language,
        sourceLanguage
    );

    if (!content) return null;

    // Handle different content types
    let displayText: string = '';

    if (typeof translatedContent === 'string') {
        displayText = translatedContent;
    } else if (
        typeof translatedContent === 'object' &&
        translatedContent !== null
    ) {
        // Use the translated version for the current language, or fall back to the source language
        displayText = translatedContent[language] || translatedContent[sourceLanguage] || '';
    }

    // Render the appropriate element based on the 'as' prop
    const renderElement = () => {
        switch (as) {
            case 'p':
                return <p className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</p>;
            case 'div':
                return <div className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</div>;
            case 'h1':
                return <h1 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h1>;
            case 'h2':
                return <h2 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h2>;
            case 'h3':
                return <h3 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h3>;
            case 'h4':
                return <h4 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h4>;
            case 'h5':
                return <h5 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h5>;
            case 'h6':
                return <h6 className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</h6>;
            case 'span':
            default:
                return <span className={className}>{displayText}{showLoading && isLoading && <span className="inline-block ml-2 opacity-60 text-sm">(translating...)</span>}</span>;
        }
    };

    if (error) {
        console.error('Translation error:', error);
    }

    return renderElement();
};

export default DynamicText;
