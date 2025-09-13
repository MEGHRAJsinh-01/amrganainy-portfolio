const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const config = require('../config');

/**
 * Generate JWT token
 */
const signToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

/**
 * Create and send JWT token
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Remove password from output
    user.password = undefined;

    res.status(statusCode)
        .cookie('jwt', token, cookieOptions)
        .json({
            status: 'success',
            token,
            // Let client handle redirection to avoid hash conflicts
            data: {
                user
            }
        });
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
    try {
        // Only accept identity credentials at registration; social links belong to Profile
        const { email, password } = req.body;

        // Check if user already exists by email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        // Generate random username
        const randomUsername = 'user_' + crypto.randomBytes(4).toString('hex');

        // Create new user
        const newUser = await User.create({
            username: randomUsername,
            email,
            password,
            role: 'user'
        });

        // Create profile for the user
        await Profile.create({
            userId: newUser._id,
            contactEmail: email
            // Note: Social links live on Profile (single source of truth).
        });

        // Generate verification token
        const verificationToken = newUser.createVerificationToken();
        await newUser.save({ validateBeforeSave: false });

        // TODO: Send verification email

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password is correct
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password'
            });
        }

        // Update last login time
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // Send token
        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Logout user
 */
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success' });
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res) => {
    try {
        // Get user based on email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'No user with that email address'
            });
        }

        // Generate random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: Send password reset email

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
    try {
        // Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // If token has expired or user doesn't exist
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Log the user in, send JWT
        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Verify email
 */
exports.verifyEmail = async (req, res) => {
    try {
        // Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken
        });

        // If token is invalid or user doesn't exist
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid verification token'
            });
        }

        // Verify email
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update password
 */
exports.updatePassword = async (req, res) => {
    try {
        // Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // Check if current password is correct
        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({
                status: 'error',
                message: 'Your current password is wrong'
            });
        }

        // Update password
        user.password = req.body.newPassword;
        await user.save();

        // Log user in, send JWT
        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
