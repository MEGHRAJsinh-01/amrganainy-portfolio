const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
    },
    sourceLanguage: {
        type: String,
        required: true,
    },
    targetLanguage: {
        type: String,
        required: true,
    },
    originalText: {
        type: String,
        required: true,
    },
    translatedText: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Create a compound index for efficient lookups
translationSchema.index({ hash: 1, sourceLanguage: 1, targetLanguage: 1 }, { unique: true });

module.exports = mongoose.model('Translation', translationSchema);
