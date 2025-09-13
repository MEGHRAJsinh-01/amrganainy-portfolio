const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Project = require('../models/Project');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const fileStorageService = require('../services/fileStorageService');

// Configure multer for project image uploads using GridFS
const imageUpload = fileStorageService.createUploadMiddleware({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /jpeg|jpg|png|gif|webp/
});

// @route   GET api/projects
// @desc    Get current user's projects
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error('Get projects error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
    authMiddleware,
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty()
], async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        description,
        imageUrl,
        projectUrl,
        githubUrl,
        technologies,
        featured,
        order
    } = req.body;

    try {
        // Create new project
        const newProject = new Project({
            user: req.user.id,
            title,
            description,
            imageUrl,
            projectUrl,
            githubUrl,
            technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map(tech => tech.trim()),
            featured: featured || false,
            order: order || 0
        });

        const project = await newProject.save();

        res.json(project);
    } catch (err) {
        console.error('Create project error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/projects/upload-image/:id
// @desc    Upload project image
// @access  Private
router.post('/upload-image/:id', [authMiddleware, imageUpload.single('image')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get project
        const project = await Project.findById(req.params.id);

        if (!project) {
            // Delete uploaded file if project doesn't exist
            await fileStorageService.deleteFile(req.file.id);
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check project ownership
        if (project.user.toString() !== req.user.id) {
            // Delete uploaded file if user doesn't own the project
            await fileStorageService.deleteFile(req.file.id);
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete old image if exists
        if (project.imageId) {
            try {
                await fileStorageService.deleteFile(project.imageId);
            } catch (error) {
                console.log('Could not delete old project image:', error.message);
            }
        }

        // Update project with new image ID and URL
        project.imageId = req.file.id;
        project.imageUrl = fileStorageService.generateFileUrl(req.file.id, req);
        await project.save();

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: project.imageUrl,
            imageId: project.imageId
        });
    } catch (err) {
        console.error('Upload project image error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', [
    authMiddleware,
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty()
], async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Get project
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check project ownership
        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update project
        const {
            title,
            description,
            imageUrl,
            projectUrl,
            githubUrl,
            technologies,
            featured,
            order
        } = req.body;

        project.title = title;
        project.description = description;
        project.imageUrl = imageUrl || project.imageUrl;
        project.projectUrl = projectUrl;
        project.githubUrl = githubUrl;
        project.technologies = Array.isArray(technologies) ? technologies : technologies.split(',').map(tech => tech.trim());
        project.featured = featured !== undefined ? featured : project.featured;
        project.order = order !== undefined ? order : project.order;

        await project.save();

        res.json(project);
    } catch (err) {
        console.error('Update project error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Get project
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check project ownership
        if (project.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete project image if exists
        if (project.imageId) {
            try {
                await fileStorageService.deleteFile(project.imageId);
            } catch (error) {
                console.log('Could not delete project image file:', error.message);
                // Continue execution even if image deletion fails
            }
        }

        // Delete project - use findByIdAndDelete instead of remove()
        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Delete project error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET api/projects/:id
// @desc    Get a project by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error('Get project by ID error:', err.message);

        // Check if error is due to invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET api/projects/user/:username
// @desc    Get projects by username
// @access  Public
router.get('/user/:username', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get projects
        const projects = await Project.find({
            user: user._id
        }).sort({ order: 1, createdAt: -1 });

        res.json(projects);
    } catch (err) {
        console.error('Get projects by username error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   PATCH api/projects/reorder
// @desc    Reorder projects
// @access  Private
router.patch('/reorder', authMiddleware, async (req, res) => {
    try {
        const { projects } = req.body;

        if (!Array.isArray(projects)) {
            return res.status(400).json({ message: 'Projects must be an array' });
        }

        // Update each project's order
        const updatePromises = projects.map(async (p) => {
            if (!p.id || !p.hasOwnProperty('order')) {
                return null;
            }

            const project = await Project.findById(p.id);

            if (!project || project.user.toString() !== req.user.id) {
                return null;
            }

            project.order = p.order;
            return project.save();
        });

        await Promise.all(updatePromises.filter(p => p !== null));

        // Get updated projects
        const updatedProjects = await Project.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });

        res.json(updatedProjects);
    } catch (err) {
        console.error('Reorder projects error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
