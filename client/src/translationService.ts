import { CLOUD_API_URL, LOCAL_API_URL } from './constants';

export const translateText = async (text: string, source: string, target: string): Promise<string> => {
    const isProd = import.meta.env.MODE === 'production';
    const apiBaseUrl = isProd ? CLOUD_API_URL : LOCAL_API_URL;

    try {
        const response = await fetch(`${apiBaseUrl}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, source, target }),
        });

        if (!response.ok) {
            throw new Error('Translation failed');
        }

        const data = await response.json();
        return data.translation;
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Fallback to original text
    }
};