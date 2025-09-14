const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/username/:username', profileController.getProfileByUsername);
// Use an explicit segment to avoid catching '/me'
router.get('/id/:userId', profileController.getProfileByUserId);

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/me', profileController.getCurrentUserProfile);
router.patch('/me', profileController.updateProfile);
router.post('/me/profile-image', profileController.uploadImage.single('image'), profileController.uploadProfileImage);
router.post('/me/cv', profileController.uploadCVFile.single('cv'), profileController.uploadCV);

module.exports = router;
