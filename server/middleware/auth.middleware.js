const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const config = require('../config');

/**
 * Middleware to authenticate users based on JWT token
 */
exports.authenticate = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in. Please log in to get access.'
            });
        }

        // 2) Verify token
        const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

        // 3) Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // 4) Check if user is active
        if (!user.active) {
            return res.status(401).json({
                status: 'error',
                message: 'This user account has been deactivated.'
            });
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token. Please log in again.'
        });
    }
};

/**
 * Middleware to restrict access to specific roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

/**
 * Middleware to check if user is admin
 */
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'This route is restricted to administrators'
        });
    }
    next();
};

/**
 * Middleware to check if user is accessing their own resources
 */
exports.isOwnerOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.userId || (req.body && req.body.userId);

    if (req.user.role === 'admin' || (resourceUserId && resourceUserId.toString() === req.user._id.toString())) {
        return next();
    }

    res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource'
    });
};
