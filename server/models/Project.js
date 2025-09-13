const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // File storage using GridFS
    imageUrl: {
        type: String,
        default: null // URL to access the file
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null // GridFS file ID
    },
    projectUrl: {
        type: String,
        default: null
    },
    githubUrl: {
        type: String,
        default: null
    },
    technologies: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
