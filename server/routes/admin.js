const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Admin middleware to check if user is an admin
const adminMiddleware = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        console.error('Admin middleware error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Get all users error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/users/:id
// @desc    Get user by ID
// @access  Admin
router.get('/users/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Get user by ID error:', err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', [
    authMiddleware,
    adminMiddleware,
    body('username', 'Username is required').optional(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('role', 'Role must be either user or admin').optional().isIn(['user', 'admin'])
], async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        const { username, email, role, isEmailVerified } = req.body;

        if (username) {
            // Check if username is taken by another user
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            user.username = username;
        }

        if (email) {
            // Check if email is taken by another user
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            user.email = email;
        }

        if (role) {
            user.role = role;
        }

        if (isEmailVerified !== undefined) {
            user.isEmailVerified = isEmailVerified;
        }

        await user.save();

        res.json(user);
    } catch (err) {
        console.error('Update user error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Delete user profile
        await Profile.findOneAndRemove({ user: req.params.id });

        // Delete user projects
        await Project.deleteMany({ user: req.params.id });

        // Delete user
        const user = await User.findByIdAndRemove(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments(),
            totalProfiles: await Profile.countDocuments(),
            totalProjects: await Project.countDocuments(),
            usersByRole: {
                admin: await User.countDocuments({ role: 'admin' }),
                user: await User.countDocuments({ role: 'user' })
            },
            recentUsers: await User.find().select('-password').sort({ createdAt: -1 }).limit(5),
            recentProjects: await Project.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username email')
        };

        res.json(stats);
    } catch (err) {
        console.error('Get stats error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
