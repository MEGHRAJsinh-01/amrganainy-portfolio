const Project = require('../models/project.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/projects'));
    },
    filename: (req, file, cb) => {
        // Create unique filename with user ID and timestamp
        const uniqueSuffix = `${req.user._id}-${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `project-${uniqueSuffix}${extension}`);
    }
});

// Filter files to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Initialize multer upload
exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Get all projects for a user by userId or username
 */
exports.getUserProjects = async (req, res) => {
    try {
        const { userId, username } = req.params;
        let filter = {};

        if (userId) {
            filter.userId = userId;
        } else if (username) {
            // Find user by username
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            filter.userId = user._id;
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Either userId or username is required'
            });
        }

        // Only show visible projects for public requests
        if (!req.user || (req.user._id.toString() !== filter.userId.toString() && req.user.role !== 'admin')) {
            filter.isVisibleInPortfolio = true;
        }

        const projects = await Project.find(filter).sort({
            isImported: -1,
            order: 1,
            featured: -1,
            createdAt: -1,
        });

        res.status(200).json({
            status: 'success',
            results: projects.length,
            data: {
                projects
            }
        });
    } catch (error) {
        console.error('Error in getUserProjects:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user's projects
 */
exports.getCurrentUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id }).sort({
            isImported: -1,
            order: 1,
            featured: -1,
            createdAt: -1,
        });

        res.status(200).json({
            status: 'success',
            results: projects.length,
            data: {
                projects
            }
        });
    } catch (error) {
        console.error('Error in getCurrentUserProjects:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get a single project
 */
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found'
            });
        }

        // Check if user has permission to view this project
        if (
            !project.isVisibleInPortfolio &&
            (!req.user ||
                (req.user._id.toString() !== project.userId.toString() &&
                    req.user.role !== 'admin'))
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to view this project'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                project
            }
        });
    } catch (error) {
        console.error('Error in getProject:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Create a new project
 */
exports.createProject = async (req, res) => {
    try {
        // Add userId to request body
        req.body.userId = req.user._id;

        // Get highest order number for user's projects
        const highestOrder = await Project.findOne({ userId: req.user._id })
            .sort({ order: -1 })
            .select('order');

        // Set order to be one more than the highest, or 0 if no projects exist
        req.body.order = highestOrder ? highestOrder.order + 1 : 0;

        // If project is from GitHub, check for duplicates
        if (req.body.sourceType === 'github' && req.body.sourceId) {
            const existingProject = await Project.findOne({
                userId: req.user._id,
                sourceId: req.body.sourceId
            });

            if (existingProject) {
                return res.status(409).json({
                    status: 'error',
                    message: 'This project has already been imported.'
                });
            }
        }

        // Create project
        const newProject = await Project.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                project: newProject
            }
        });
    } catch (error) {
        console.error('Error in createProject:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update a project
 */
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found'
            });
        }

        // Check if user has permission to update this project
        if (
            req.user._id.toString() !== project.userId.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to update this project'
            });
        }

        // Fields that should not be updated directly
        const restrictedFields = ['userId', 'createdAt', 'updatedAt', 'imageUrl'];

        // Filter out restricted fields
        const filteredBody = Object.keys(req.body).reduce((obj, key) => {
            if (!restrictedFields.includes(key)) {
                obj[key] = req.body[key];
            }
            return obj;
        }, {});

        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            filteredBody,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                project: updatedProject
            }
        });
    } catch (error) {
        console.error('Error in updateProject:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Delete a project
 */
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found'
            });
        }

        // Check if user has permission to delete this project
        if (
            req.user._id.toString() !== project.userId.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to delete this project'
            });
        }

        // Delete project image if exists
        if (project.imageUrl) {
            const imagePath = path.join(__dirname, '..', project.imageUrl.replace('/api', ''));

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete project
        await Project.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('Error in deleteProject:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Upload project image
 */
exports.uploadProjectImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        const projectId = req.params.id;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found'
            });
        }

        // Check if user has permission to update this project
        if (
            req.user._id.toString() !== project.userId.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to update this project'
            });
        }

        // Delete old image if exists
        if (project.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', project.imageUrl.replace('/api', ''));

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update project with new image URL
        const imageUrl = `/api/uploads/projects/${req.file.filename}`;

        project.imageUrl = imageUrl;
        await project.save();

        res.status(200).json({
            status: 'success',
            data: {
                project
            }
        });
    } catch (error) {
        console.error('Error in uploadProjectImage:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Reorder projects
 */
exports.reorderProjects = async (req, res) => {
    try {
        const { projectOrders } = req.body;

        if (!projectOrders || !Array.isArray(projectOrders)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request. projectOrders array is required'
            });
        }

        // Update projects with new order
        const updatePromises = projectOrders.map(async (item) => {
            const project = await Project.findById(item.id);

            if (!project) {
                return Promise.reject(new Error(`Project with ID ${item.id} not found`));
            }

            if (project.userId.toString() !== req.user._id.toString()) {
                return Promise.reject(new Error(`Project with ID ${item.id} does not belong to you`));
            }

            return Project.findByIdAndUpdate(
                item.id,
                { order: item.order },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            status: 'success',
            message: 'Projects reordered successfully'
        });
    } catch (error) {
        console.error('Error in reorderProjects:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
