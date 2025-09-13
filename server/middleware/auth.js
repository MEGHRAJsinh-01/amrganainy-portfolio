const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next) {
    // Get token from header (support both x-auth-token and Authorization header)
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        console.log('Auth middleware: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.auth.jwtSecret);

        // Add user from payload to request
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        res.status(401).json({
            message: 'Token is not valid',
            error: err.message
        });
    }
};
