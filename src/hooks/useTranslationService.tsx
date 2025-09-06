import { useState, useEffect } from 'react';
import { translateText } from '../translationService';

/**
 * Custom hook to translate dynamic content on language change
 * @param content The content to translate (string or object with language keys)
 * @param currentLanguage The current language code
 * @param sourceLanguage The source language code (default: 'en')
 * @returns Translated content and loading state
 */
export const useTranslationService = (
    content: string | { [key: string]: string } | null | undefined,
    currentLanguage: string,
    sourceLanguage: string = 'en'
) => {
    const [translatedContent, setTranslatedContent] = useState<string | { [key: string]: string } | null>(content);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Skip if no content or if currentLanguage is the same as sourceLanguage
        if (!content || currentLanguage === sourceLanguage) {
            setTranslatedContent(content);
            return;
        }

        const translateContent = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // If content is a string, translate directly
                if (typeof content === 'string') {
                    const result = await translateText(content, sourceLanguage, currentLanguage);
                    setTranslatedContent(result);
                }
                // If content is an object with language keys
                else if (typeof content === 'object' && content !== null) {
                    // If the target language already exists in the object, use it
                    if (content[currentLanguage]) {
                        setTranslatedContent(content[currentLanguage]);
                    }
                    // Otherwise translate from the source language
                    else if (content[sourceLanguage]) {
                        const result = await translateText(
                            content[sourceLanguage],
                            sourceLanguage,
                            currentLanguage
                        );

                        // Create a new object with the translated content
                        setTranslatedContent({
                            ...content,
                            [currentLanguage]: result
                        });
                    }
                }
            } catch (err) {
                console.error('Translation error:', err);
                setError(err instanceof Error ? err.message : 'Unknown translation error');
                // Return original content on error
                setTranslatedContent(content);
            } finally {
                setIsLoading(false);
            }
        };

        translateContent();
    }, [content, currentLanguage, sourceLanguage]);

    return { translatedContent, isLoading, error };
};
