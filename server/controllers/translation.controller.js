const Translation = require('../models/translation.model');
const fetch = require('node-fetch');
const crypto = require('crypto');

const LINGVA_API_BASE = 'https://lingva.ml/api/v1';

// Simple hash function
const createHash = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

exports.translate = async (req, res) => {
    const { text, source = 'en', target = 'de' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    if (source === target) {
        return res.json({ translation: text });
    }

    const hash = createHash(text);

    try {
        // Check for cached translation in the database
        const cachedTranslation = await Translation.findOne({
            hash,
            sourceLanguage: source,
            targetLanguage: target,
        });

        if (cachedTranslation) {
            return res.json({ translation: cachedTranslation.translatedText, source: 'cache' });
        }

        // If not in cache, call the external API
        const encodedText = encodeURIComponent(text);
        const response = await fetch(`${LINGVA_API_BASE}/${source}/${target}/${encodedText}`);

        if (!response.ok) {
            throw new Error(`Lingva API failed with status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translation;

        // Save the new translation to the database
        if (translatedText) {
            const newTranslation = new Translation({
                hash,
                sourceLanguage: source,
                targetLanguage: target,
                originalText: text,
                translatedText,
            });
            await newTranslation.save();
        }

        res.json({ translation: translatedText, source: 'api' });

    } catch (error) {
        console.error('Translation error:', error);
        // Fallback to returning original text if translation fails
        res.status(500).json({ error: 'Translation failed', translation: text });
    }
};
