const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    detailedDescription: {
        type: String
    },
    imageUrl: String,
    projectUrl: String,
    githubUrl: String,
    technologies: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    isImported: {
        type: Boolean,
        default: false
    },
    sourceType: {
        type: String,
        enum: ['manual', 'github', 'external'],
        default: 'manual'
    },
    sourceId: String, // Original ID if imported from external source
    isVisibleInPortfolio: {
        type: Boolean,
        default: true
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

// Create compound index on userId and order for efficient sorting
projectSchema.index({ userId: 1, order: 1 });

// Create compound index on userId and featured for efficient querying
projectSchema.index({ userId: 1, featured: 1 });

// Create compound index on userId and visible for efficient filtering
projectSchema.index({ userId: 1, visible: 1 });

module.exports = mongoose.model('Project', projectSchema);
