import { useState, useEffect } from 'react';

/**
 * Translation service using Lingva Translate API
 * This is a free, open-source, privacy-focused translation API
 * It works as a proxy for Google Translate with no API key required
 */

// Lingva Translate API base URL
const LINGVA_API_BASE = 'https://lingva.ml/api/v1';

// Cache translations to reduce API calls
interface TranslationCache {
    [key: string]: {
        [key: string]: string;
    };
}

// In-memory cache
const translationCache: TranslationCache = {};

/**
 * Translate text from one language to another using Lingva Translate API
 * @param text Text to translate
 * @param source Source language code (e.g., "en")
 * @param target Target language code (e.g., "de")
 * @returns Translated text
 */
export const translateText = async (
    text: string,
    source: string = 'en',
    target: string = 'de'
): Promise<string> => {
    // Skip translation if text is empty or source and target are the same
    if (!text || source === target) {
        return text;
    }

    // Return from cache if available
    const cacheKey = `${source}_${target}`;
    if (translationCache[cacheKey] && translationCache[cacheKey][text]) {
        console.log('Using cached translation for:', text.substring(0, 30) + '...');
        return translationCache[cacheKey][text];
    }

    try {
        // URL encode the text for the API request
        const encodedText = encodeURIComponent(text);

        // Call Lingva Translate API
        console.log(`Translating from ${source} to ${target}:`, text.substring(0, 30) + '...');

        const response = await fetch(`${LINGVA_API_BASE}/${source}/${target}/${encodedText}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Translation API error:', errorData);
            throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Store in cache
        if (!translationCache[cacheKey]) {
            translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][text] = data.translation;

        return data.translation;
    } catch (error) {
        console.error('Error translating text:', error);
        // Return original text if translation fails
        return text;
    }
};

/**
 * Translate multiple texts in batch
 * @param texts Array of texts to translate
 * @param source Source language code
 * @param target Target language code
 * @returns Array of translated texts
 */
export const translateBatch = async (
    texts: string[],
    source: string = 'en',
    target: string = 'de'
): Promise<string[]> => {
    // Skip translation if source and target are the same
    if (source === target) {
        return texts;
    }

    try {
        // Lingva doesn't have a native batch API, so we'll make multiple requests
        console.log(`Translating ${texts.length} items from ${source} to ${target}`);

        // Create an array of promises for each translation
        const promises = texts.map(text => translateText(text, source, target));

        // Wait for all translations to complete
        const results = await Promise.all(promises);

        return results;
    } catch (error) {
        console.error('Error translating batch:', error);
        // Return original texts if translation fails
        return texts;
    }
};

/**
 * React hook for dynamic text translation
 * @param text Text to translate
 * @param language Current language code
 * @returns Translated text and loading state
 */
export const useTranslation = (text: string, language: string): { translatedText: string, isLoading: boolean } => {
    const [translatedText, setTranslatedText] = useState<string>(text);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const translateAsync = async () => {
            // Only translate if language is not English and text exists
            if (language !== 'en' && text) {
                setIsLoading(true);
                try {
                    const result = await translateText(text, 'en', language);
                    setTranslatedText(result);
                } catch (error) {
                    console.error('Translation hook error:', error);
                    setTranslatedText(text); // Fallback to original text
                } finally {
                    setIsLoading(false);
                }
            } else {
                setTranslatedText(text);
            }
        };

        translateAsync();
    }, [text, language]);

    return { translatedText, isLoading };
};

/**
 * Clear the translation cache
 */
export const clearTranslationCache = (): void => {
    Object.keys(translationCache).forEach(key => {
        delete translationCache[key];
    });
    console.log('Translation cache cleared');
};
