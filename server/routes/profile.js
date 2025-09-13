const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const path = require('path');

const Profile = require('../models/Profile');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const fileStorageService = require('../services/fileStorageService');

// Configure multer for CV uploads using GridFS
const cvUpload = fileStorageService.createUploadMiddleware({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: /pdf|doc|docx/
});

// Configure multer for profile image uploads using GridFS
const imageUpload = fileStorageService.createUploadMiddleware({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /jpeg|jpg|png|gif|webp/
});

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET api/profile/me
// @desc    Get current user's profile (alternate endpoint)
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', [
    authMiddleware,
    body('name', 'Name is required').not().isEmpty(),
    body('title', 'Title is required').not().isEmpty(),
    body('bio', 'Bio is required').not().isEmpty()
], async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        name,
        title,
        bio,
        location,
        skills,
        github,
        linkedin,
        twitter,
        website,
        aboutMe,
        contactEmail,
        contactPhone
    } = req.body;

    // Build profile object
    const profileFields = {
        user: req.user.id,
        name,
        title,
        bio,
        location,
        skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
        socialLinks: {
            github,
            linkedin,
            twitter,
            website
        },
        aboutMe,
        contactEmail,
        contactPhone
    };

    try {
        // Check if profile exists
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error('Create/update profile error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/profile/upload-cv
// @desc    Upload CV file
// @access  Private
router.post('/upload-cv', [authMiddleware, cvUpload.single('cvFile')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get profile
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            // Delete uploaded file if profile doesn't exist
            await fileStorageService.deleteFile(req.file.id);
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Delete old CV file if exists
        if (profile.cvFileId) {
            try {
                await fileStorageService.deleteFile(profile.cvFileId);
            } catch (error) {
                console.log('Could not delete old CV file:', error.message);
            }
        }

        // Update profile with new CV file ID and URL
        profile.cvFileId = req.file.id;
        profile.cvFile = fileStorageService.generateFileUrl(req.file.id, req);
        await profile.save();

        res.json({
            message: 'CV uploaded successfully',
            cvFile: profile.cvFile,
            cvFileId: profile.cvFileId
        });
    } catch (err) {
        console.error('Upload CV error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   POST api/profile/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', [authMiddleware, imageUpload.single('profileImage')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get profile
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            // Delete uploaded file if profile doesn't exist
            await fileStorageService.deleteFile(req.file.id);
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Delete old profile image if exists
        if (profile.profileImageId) {
            try {
                await fileStorageService.deleteFile(profile.profileImageId);
            } catch (error) {
                console.log('Could not delete old profile image:', error.message);
            }
        }

        // Update profile with new image file ID and URL
        profile.profileImageId = req.file.id;
        profile.profileImage = fileStorageService.generateFileUrl(req.file.id, req);
        await profile.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: profile.profileImage,
            profileImageId: profile.profileImageId
        });
    } catch (err) {
        console.error('Upload profile image error:', err.message);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// @route   GET api/profile/user/:username
// @desc    Get profile by username
// @access  Public
router.get('/user/:username', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get profile
        const profile = await Profile.findOne({ user: user._id });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Get profile by username error:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/profile/cv/:username
// @desc    Get user's CV file
// @access  Public
router.get('/cv/:username', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get profile
        const profile = await Profile.findOne({ user: user._id });

        if (!profile || !profile.cvFile) {
            return res.status(404).json({ message: 'CV not found' });
        }

        // Return CV file path
        res.json({ cvFile: profile.cvFile });
    } catch (err) {
        console.error('Get CV error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
