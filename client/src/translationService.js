import { portfolioAPI } from './api';

/**
 * Translate text by calling the backend translation service.
 * The backend will handle caching in the database.
 * @param {string} text - Text to translate
 * @param {string} source - Source language code (e.g., "en")
 * @param {string} target - Target language code (e.g., "de")
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (
    text,
    source = 'en',
    target = 'de'
) => {
    // Skip translation if text is empty or source and target are the same
    if (!text || source === target) {
        return text;
    }

    try {
        console.log(`Requesting translation from ${source} to ${target} for:`, text.substring(0, 30) + '...');
        const response = await portfolioAPI.translate(text, source, target);
        return response.translation;
    } catch (error) {
        console.error('Error translating text via backend:', error);
        // Return original text if translation fails
        return text;
    }
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} source - Source language code
 * @param {string} target - Target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (
    texts,
    source = 'en',
    target = 'de'
) => {
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
 * Clear the translation cache
 */
export const clearTranslationCache = () => {
    Object.keys(translationCache).forEach(key => {
        delete translationCache[key];
    });
    console.log('Translation cache cleared');
};
