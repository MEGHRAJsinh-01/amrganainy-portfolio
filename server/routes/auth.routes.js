const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/logout', authController.logout);

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/me', authController.getCurrentUser);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
