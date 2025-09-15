const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Full name of the portfolio owner (optional)
    name: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    skills: [{
        name: { type: String, trim: true },
        source: { type: String, enum: ['github', 'linkedin', 'custom'], default: 'custom' },
        isVisible: { type: Boolean, default: true }
    }],
    languages: [{
        label: { type: String, trim: true },
        source: { type: String, enum: ['linkedin', 'custom'], default: 'custom' },
        isVisible: { type: Boolean, default: true }
    }],
    experience: [{
        title: { type: String, trim: true },
        company: { type: String, trim: true },
        description: { type: String, trim: true },
        startDate: { type: String, trim: true },
        endDate: { type: String, trim: true },
        source: { type: String, enum: ['linkedin', 'custom'], default: 'custom' },
        isVisible: { type: Boolean, default: true }
    }],
    location: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: {
        type: String,
        trim: true
    },
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String,
        portfolio: String,
        behance: String,
        dribbble: String,
        medium: String,
        dev: String,
        stackoverflow: String,
        youtube: String
    },
    headerImageUrl: String,
    profileImageUrl: String,
    cvViewUrl: String,
    cvDownloadUrl: String,
    cvFileUrl: String, // For uploaded CVs
    integrations: {
        github: {
            username: String,
            accessToken: String,
            enabled: {
                type: Boolean,
                default: false
            }
        },
        linkedin: {
            profileId: String,
            accessToken: String,
            enabled: {
                type: Boolean,
                default: false
            }
        }
    },
    settings: {
        theme: {
            type: String,
            default: 'dark'
        },
        showSkills: {
            type: Boolean,
            default: true
        },
        showContact: {
            type: Boolean,
            default: true
        },
        showGitHub: {
            type: Boolean,
            default: true
        },
        showLinkedIn: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
